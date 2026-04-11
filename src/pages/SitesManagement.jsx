import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from '../components/AdminLayout';

export default function SitesManagement() {
  const [sites, setSites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    siteManager: '',
    location: '',
    status: 'Planning',
    startDate: '',
    estimatedEndDate: '',
    notes: ''
  });

  const fetchSites = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/sites');
      const data = await response.json();
      setSites(data);
    } catch (error) {
      toast.error('Failed to fetch sites');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const openAddModal = () => {
    setEditingSite(null);
    setFormData({
      name: '', siteManager: '', location: '', status: 'Planning', startDate: '', estimatedEndDate: '', notes: ''
    });
    setShowModal(true);
  };

  const openEditModal = (site) => {
    setEditingSite(site);
    setFormData({
      name: site.name,
      siteManager: site.siteManager || '',
      location: site.location || '',
      status: site.status || 'Planning',
      startDate: site.startDate || '',
      estimatedEndDate: site.estimatedEndDate || '',
      notes: site.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingSite 
      ? `http://localhost:4000/api/sites/${editingSite.id}` 
      : 'http://localhost:4000/api/sites';
    const method = editingSite ? 'PATCH' : 'POST';

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
        toast.success(editingSite ? 'Site updated' : 'Site created');
        setShowModal(false);
        fetchSites();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Operation failed');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this site?')) return;
    try {
      const response = await fetch(`http://localhost:4000/api/sites/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        toast.success('Site deleted');
        fetchSites();
      } else {
        toast.error('Failed to delete site');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  return (
    <AdminLayout title="Sites Management">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button onClick={openAddModal} className="btn btn-primary btn-sm px-3 shadow-sm">
          <i className="fa fa-plus me-2"></i> Add New Site
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <div className="table-responsive">
          <table className="table table-hover">
            <thead style={{ background: 'rgba(0,0,0,0.02)' }}>
              <tr>
                <th style={{ color: '#4e73df', fontSize: '0.8rem', textTransform: 'uppercase' }}>Site Name</th>
                <th style={{ color: '#4e73df', fontSize: '0.8rem', textTransform: 'uppercase' }}>Site Manager</th>
                <th style={{ color: '#4e73df', fontSize: '0.8rem', textTransform: 'uppercase' }}>Location</th>
                <th style={{ color: '#4e73df', fontSize: '0.8rem', textTransform: 'uppercase' }}>Status</th>
                <th style={{ color: '#4e73df', fontSize: '0.8rem', textTransform: 'uppercase' }}>Est. Completion</th>
                <th style={{ color: '#4e73df', fontSize: '0.8rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" className="text-center py-4">Loading sites...</td></tr>
              ) : sites.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-4">No sites found.</td></tr>
              ) : (
                sites.map(site => (
                  <tr key={site.id} style={{ verticalAlign: 'middle' }}>
                    <td style={{ fontWeight: '600' }}>{site.name}</td>
                    <td>{site.siteManager || 'N/A'}</td>
                    <td>{site.location || 'N/A'}</td>
                    <td>
                      <span className={`badge ${site.status === 'Completed' ? 'bg-success' : site.status === 'In Progress' ? 'bg-primary' : 'bg-warning text-dark'}`}>
                        {site.status}
                      </span>
                    </td>
                    <td>{site.estimatedEndDate || 'N/A'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => openEditModal(site)} className="btn btn-sm btn-outline-primary me-2">
                        <i className="fa fa-edit"></i>
                      </button>
                      <button onClick={() => handleDelete(site.id)} className="btn btn-sm btn-outline-danger">
                        <i className="fa fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', width: '500px', borderRadius: '12px', padding: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h5 className="mb-4">{editingSite ? 'Edit Site' : 'Add New Site'}</h5>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label small fw-bold">Site Name *</label>
                  <input type="text" className="form-control form-control-sm" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Main Headquarters" required />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Site Manager</label>
                  <input type="text" className="form-control form-control-sm" value={formData.siteManager} onChange={(e) => setFormData({...formData, siteManager: e.target.value})} placeholder="e.g. Jane Smith" />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Location</label>
                  <input type="text" className="form-control form-control-sm" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="e.g. Kigali, Rwanda" />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold">Status</label>
                  <select className="form-select form-select-sm" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold">Start Date</label>
                  <input type="date" className="form-control form-control-sm" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold">Est. End Date</label>
                  <input type="date" className="form-control form-control-sm" value={formData.estimatedEndDate} onChange={(e) => setFormData({...formData, estimatedEndDate: e.target.value})} />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold">Notes</label>
                  <textarea className="form-control form-control-sm" rows="3" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Any additional site instructions..."></textarea>
                </div>
              </div>
              <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-light btn-sm px-4">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm px-4">
                  {editingSite ? 'Save Changes' : 'Create Site'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
