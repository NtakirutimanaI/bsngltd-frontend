import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from '../components/AdminLayout';

export default function AttendanceManagement() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [users, setUsers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const usersResp = await fetch(`${apiUrl}/users`);
      const usersData = await usersResp.json();
      setUsers(Array.isArray(usersData) ? usersData : []);

      const attResp = await fetch(`${apiUrl}/attendance?date=${selectedDate}`);
      const attData = await attResp.json();
      setAttendance(Array.isArray(attData) ? attData : []);
    } catch (error) {
      toast.error('Failed to fetch attendance data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const combinedData = users.map(user => {
    const record = attendance.find(a => a.user && a.user.id === user.id);
    return {
      user,
      attendanceId: record ? record.id : null,
      status: record ? record.status : 'Not Recorded',
      checkInTime: record?.checkInTime || '',
      checkOutTime: record?.checkOutTime || '',
      notes: record?.notes || ''
    };
  });

  const openEditModal = (record) => {
    setEditingRecord({ ...record });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      date: selectedDate,
      userId: editingRecord.user.id,
      status: editingRecord.status === 'Not Recorded' ? 'Present' : editingRecord.status,
      checkInTime: editingRecord.checkInTime,
      checkOutTime: editingRecord.checkOutTime,
      notes: editingRecord.notes
    };

    const method = editingRecord.attendanceId ? 'PATCH' : 'POST';
    const url = editingRecord.attendanceId
      ? `${apiUrl}/attendance/${editingRecord.attendanceId}`
      : `${apiUrl}/attendance`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        toast.success(editingRecord.attendanceId ? 'Attendance updated' : 'Attendance recorded');
        setShowModal(false);
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save attendance');
      }
    } catch (error) {
      toast.error('Network error while saving attendance');
    }
  };

  const markAllPresent = async () => {
    const unrecorded = combinedData.filter(d => d.status === 'Not Recorded');
    if (unrecorded.length === 0) {
      toast.info('All users already have attendance records for this date.');
      return;
    }

    if (!window.confirm(`Are you sure you want to mark ${unrecorded.length} users as Present?`)) return;

    setIsLoading(true);
    let successCount = 0;
    
    for (const item of unrecorded) {
      try {
        const payload = {
          date: selectedDate,
          userId: item.user.id,
          status: 'Present',
          checkInTime: '08:00 AM', // Default Checkin
          checkOutTime: '05:00 PM', // Default Checkout
          notes: ''
        };
        const response = await fetch(`${apiUrl}/attendance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (response.ok) successCount++;
      } catch (e) {
        console.error(e);
      }
    }

    toast.success(`Marked ${successCount} users as Present!`);
    fetchData();
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Present': return { bg: 'rgba(28, 200, 138, 0.1)', color: '#1cc88a' };
      case 'Late': return { bg: 'rgba(246, 194, 62, 0.1)', color: '#f6c23e' };
      case 'Absent':
      case 'Sick': return { bg: 'rgba(231, 74, 59, 0.1)', color: '#e74a3b' };
      default: return { bg: 'rgba(133, 135, 150, 0.1)', color: '#858796' };
    }
  };

  return (
    <AdminLayout title="Staff Attendance">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontWeight: 'bold', color: '#5a5c69' }}>Select Date:</label>
          <input 
            type="date" 
            className="form-control form-control-sm border-1 shadow-sm" 
            style={{ width: '150px' }}
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)} 
          />
        </div>
        <button onClick={markAllPresent} className="btn btn-primary btn-sm px-3 shadow-sm" disabled={isLoading}>
          <i className="fa fa-users me-2"></i> Mark All Present
        </button>
      </div>

      <div style={{ background: 'var(--card-bg, #fff)', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
         <div className="table-responsive">
           <table className="table table-hover">
             <thead style={{ background: 'rgba(0,0,0,0.02)' }}>
               <tr>
                 <th style={{ border: 'none', color: '#4e73df', fontSize: '0.8rem', textTransform: 'uppercase' }}>Employee</th>
                 <th style={{ border: 'none', color: '#4e73df', fontSize: '0.8rem', textTransform: 'uppercase' }}>Status</th>
                 <th style={{ border: 'none', color: '#4e73df', fontSize: '0.8rem', textTransform: 'uppercase' }}>Check In</th>
                 <th style={{ border: 'none', color: '#4e73df', fontSize: '0.8rem', textTransform: 'uppercase' }}>Check Out</th>
                 <th style={{ border: 'none', color: '#4e73df', fontSize: '0.8rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
               </tr>
             </thead>
             <tbody>
               {isLoading ? (
                 <tr><td colSpan="5" className="text-center py-4">Loading attendance...</td></tr>
               ) : combinedData.length === 0 ? (
                 <tr><td colSpan="5" className="text-center py-4">No employees found.</td></tr>
               ) : (
                 combinedData.map(item => {
                   const { bg, color } = getStatusStyle(item.status);
                   return (
                     <tr key={item.user.id} style={{ verticalAlign: 'middle' }}>
                       <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '35px', height: '35px', background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#4e73df' }}>
                              {item.user.firstName?.[0] || '?'}{item.user.lastName?.[0] || '?'}
                            </div>
                            <span style={{ fontWeight: '600' }}>{item.user.firstName} {item.user.lastName}</span>
                          </div>
                        </td>
                       <td>
                         <span style={{ 
                           padding: '5px 12px', 
                           borderRadius: '20px', 
                           fontSize: '0.75rem', 
                           fontWeight: 'bold',
                           background: bg,
                           color: color
                         }}>
                           {item.status.toUpperCase()}
                         </span>
                       </td>
                       <td style={{ color: item.checkInTime ? '#333' : '#aaa' }}>{item.checkInTime || '-'}</td>
                       <td style={{ color: item.checkOutTime ? '#333' : '#aaa' }}>{item.checkOutTime || '-'}</td>
                       <td className="text-end">
                         <button onClick={() => openEditModal(item)} className="btn btn-sm btn-outline-primary" title={item.attendanceId ? "Edit Attendance" : "Register Attendance"}>
                           <i className={item.attendanceId ? "fa fa-edit" : "fa fa-plus"}></i>
                         </button>
                       </td>
                     </tr>
                   );
                 })
               )}
             </tbody>
           </table>
         </div>
      </div>

      {showModal && editingRecord && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', width: '400px', borderRadius: '12px', padding: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', color: '#333' }}>
            <h5 className="mb-4">
              Attendance for <span style={{ color: '#4e73df' }}>{editingRecord.user.firstName} {editingRecord.user.lastName}</span>
            </h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-bold">Status</label>
                <select 
                  className="form-select form-select-sm" 
                  value={editingRecord.status === 'Not Recorded' ? 'Present' : editingRecord.status} 
                  onChange={(e) => setEditingRecord({...editingRecord, status: e.target.value})}
                >
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Absent">Absent</option>
                  <option value="Sick">Sick</option>
                </select>
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Check In (e.g. 08:00 AM)</label>
                  <input 
                    type="text" 
                    className="form-control form-control-sm" 
                    placeholder="HH:MM AM/PM"
                    value={editingRecord.checkInTime} 
                    onChange={(e) => setEditingRecord({...editingRecord, checkInTime: e.target.value})} 
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Check Out (e.g. 05:00 PM)</label>
                  <input 
                    type="text" 
                    className="form-control form-control-sm" 
                    placeholder="HH:MM AM/PM"
                    value={editingRecord.checkOutTime} 
                    onChange={(e) => setEditingRecord({...editingRecord, checkOutTime: e.target.value})} 
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label small fw-bold">Notes (Optional)</label>
                <textarea 
                  className="form-control form-control-sm" 
                  rows="2"
                  value={editingRecord.notes} 
                  onChange={(e) => setEditingRecord({...editingRecord, notes: e.target.value})} 
                ></textarea>
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-light btn-sm px-4">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm px-4">
                  {editingRecord.attendanceId ? 'Save Changes' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
