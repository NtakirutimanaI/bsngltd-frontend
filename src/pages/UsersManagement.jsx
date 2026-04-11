import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from '../components/AdminLayout';

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', role: 'user', phone: ''
  });
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingUser 
      ? `http://localhost:4000/api/users/${editingUser.id}` 
      : 'http://localhost:4000/api/users';
    
    const method = editingUser ? 'PATCH' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        toast.success(editingUser ? 'User updated' : 'User created');
        setShowModal(false);
        setEditingUser(null);
        setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'user', phone: '' });
        fetchUsers();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Action failed');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await fetch(`http://localhost:4000/api/users/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        toast.success('User deleted');
        fetchUsers();
      }
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({ 
      firstName: user.firstName, 
      lastName: user.lastName, 
      email: user.email, 
      role: user.role, 
      phone: user.phone || '',
      password: '' // Don't show password
    });
    setShowModal(true);
  };

  return (
    <AdminLayout title="User Management">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
         <button onClick={() => { setEditingUser(null); setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'user', phone: '' }); setShowModal(true); }} className="btn btn-primary btn-sm px-3">
           <i className="fa fa-plus me-2"></i> Add New User
         </button>
      </div>

      <div style={{ background: 'var(--card-bg, #fff)', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <div className="table-responsive">
          <table className="table table-hover">
            <thead style={{ background: 'rgba(0,0,0,0.02)' }}>
              <tr>
                <th style={{ border: 'none', color: '#4e73df', fontSize: '0.8rem', textTransform: 'uppercase' }}>User</th>
                <th style={{ border: 'none', color: '#4e73df', fontSize: '0.8rem', textTransform: 'uppercase' }}>Email</th>
                <th style={{ border: 'none', color: '#4e73df', fontSize: '0.8rem', textTransform: 'uppercase' }}>Role</th>
                <th style={{ border: 'none', color: '#4e73df', fontSize: '0.8rem', textTransform: 'uppercase' }}>Phone</th>
                <th style={{ border: 'none', color: '#4e73df', fontSize: '0.8rem', textTransform: 'uppercase' }}>Created At</th>
                <th style={{ border: 'none', color: '#4e73df', fontSize: '0.8rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" className="text-center py-4">Loading users...</td></tr>
              ) : !Array.isArray(users) || users.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-4">{!Array.isArray(users) ? 'Error loading users' : 'No users found.'}</td></tr>
              ) : (
                (() => {
                  const startIndex = (currentPage - 1) * (itemsPerPage === 'all' ? 0 : itemsPerPage);
                  const validUsers = Array.isArray(users) ? users : [];
                  const paginatedUsers = itemsPerPage === 'all' 
                    ? validUsers 
                    : validUsers.slice(startIndex, startIndex + itemsPerPage);
                  
                  return paginatedUsers.map(user => (
                    <tr key={user.id} style={{ verticalAlign: 'middle' }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '35px', height: '35px', background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#4e73df' }}>
                            {user.firstName?.[0] || '?'}{user.lastName?.[0] || '?'}
                          </div>
                          <span style={{ fontWeight: '600' }}>{user.firstName || 'Unknown'} {user.lastName || ''}</span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span style={{ 
                          padding: '3px 10px', 
                          borderRadius: '20px', 
                          fontSize: '0.7rem', 
                          fontWeight: 'bold',
                          background: user.role === 'admin' ? 'rgba(78, 115, 223, 0.1)' : 'rgba(28, 200, 138, 0.1)',
                          color: user.role === 'admin' ? '#4e73df' : '#1cc88a'
                        }}>
                          {user.role?.toUpperCase() || 'USER'}
                        </span>
                      </td>
                      <td>{user.phone || 'N/A'}</td>
                      <td style={{ fontSize: '0.85rem', color: '#718096' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => openEditModal(user)} className="btn btn-sm btn-outline-primary me-2" title="Edit">
                          <i className="fa fa-edit"></i>
                        </button>
                        <button onClick={() => handleDelete(user.id)} className="btn btn-sm btn-outline-danger" title="Delete" disabled={user.email === 'admin@gmail.com'}>
                          <i className="fa fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ));
                })()
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!isLoading && users.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderTop: '1px solid #edf2f7', marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#718096' }}>
              <span>Show</span>
              <select 
                className="form-select form-select-sm" 
                style={{ width: '80px' }}
                value={itemsPerPage}
                onChange={(e) => {
                  const val = e.target.value;
                  setItemsPerPage(val === 'all' ? 'all' : parseInt(val));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value="all">All</option>
              </select>
              <span>entries</span>
            </div>
            
            {itemsPerPage !== 'all' && (
              <nav>
                <ul className="pagination pagination-sm m-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(prev => prev - 1)}>Previous</button>
                  </li>
                  {Array.from({ length: Math.ceil(users.length / itemsPerPage) }, (_, i) => (
                    <li key={i+1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === Math.ceil(users.length / itemsPerPage) ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        )}
      </div>

      {/* CRUD Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', width: '500px', borderRadius: '12px', padding: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', color: '#333' }}>
            <h5 className="mb-4">{editingUser ? 'Edit User' : 'Add New User'}</h5>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small">First Name</label>
                  <input type="text" className="form-control form-control-sm" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label small">Last Name</label>
                  <input type="text" className="form-control form-control-sm" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required />
                </div>
                <div className="col-12">
                  <label className="form-label small">Email Address</label>
                  <input type="email" className="form-control form-control-sm" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required disabled={editingUser} />
                </div>
                <div className="col-12">
                  <label className="form-label small">Phone (Optional)</label>
                  <input type="tel" className="form-control form-control-sm" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small">Role</label>
                  <select className="form-select form-select-sm" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small">{editingUser ? 'New Password (Optional)' : 'Password'}</label>
                  <input type="password" className="form-control form-control-sm" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required={!editingUser} minLength={6} />
                </div>
              </div>
              <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-light btn-sm px-4">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm px-4">
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
