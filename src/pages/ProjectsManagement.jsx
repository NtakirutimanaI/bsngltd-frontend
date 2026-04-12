import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from '../components/AdminLayout';

export default function ProjectsManagement() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    title: '', description: '', client: '', location: '', status: 'Planning', completionDate: '', siteId: ''
  });
  
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const [projectsRes, sitesRes] = await Promise.all([
        fetch(`${apiUrl}/projects`),
        fetch(`${apiUrl}/sites`)
      ]);
      const projectsData = await projectsRes.json();
      const sitesData = await sitesRes.json();
      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setSites(Array.isArray(sitesData) ? sitesData : []);
    } catch (error) {
      toast.error('Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingProject 
      ? `${apiUrl}/projects/${editingProject.id}` 
      : `${apiUrl}/projects`;
    
    const method = editingProject ? 'PATCH' : 'POST';

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
        toast.success(editingProject ? 'Project updated' : 'Project created');
        setShowModal(false);
        setEditingProject(null);
        setFormData({ title: '', description: '', client: '', location: '', status: 'Planning', completionDate: '', siteId: '' });
        fetchProjects();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Action failed');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    
    try {
      const response = await fetch(`${apiUrl}/projects/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        toast.success('Project deleted');
        fetchProjects();
      }
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setFormData({ 
      title: project.title, 
      description: project.description, 
      client: project.client || '', 
      location: project.location || '', 
      status: project.status || 'Planning',
      completionDate: project.completionDate || '',
      siteId: project.site?.id || ''
    });
    setShowModal(true);
  };

  return (
    <AdminLayout title="Site & Projects Management">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
         <button onClick={() => { setEditingProject(null); setFormData({ title: '', description: '', client: '', location: '', status: 'Planning', completionDate: '', siteId: '' }); setShowModal(true); }} className="btn btn-primary btn-sm px-3">
           <i className="fa fa-plus me-2"></i> Add New Project
         </button>
      </div>

      <div style={{ background: 'var(--card-bg, #fff)', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <div className="table-responsive">
          <table className="table table-hover">
            <thead style={{ background: 'rgba(0,0,0,0.02)' }}>
              <tr>
                <th style={{ border: 'none', color: '#4e73df', fontSize: '0.8rem', textTransform: 'uppercase' }}>Project Title</th>
                <th style={{ border: 'none', color: '#4e73df', fontSize: '0.8rem', textTransform: 'uppercase' }}>Client</th>
                <th style={{ border: 'none', color: '#4e73df', fontSize: '0.8rem', textTransform: 'uppercase' }}>Location</th>
                <th style={{ border: 'none', color: '#4e73df', fontSize: '0.8rem', textTransform: 'uppercase' }}>Status</th>
                <th style={{ border: 'none', color: '#4e73df', fontSize: '0.8rem', textTransform: 'uppercase' }}>Deadline</th>
                <th style={{ border: 'none', color: '#4e73df', fontSize: '0.8rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" className="text-center py-4">Loading projects...</td></tr>
              ) : projects.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-4">No projects found.</td></tr>
              ) : (
                (() => {
                  const startIndex = (currentPage - 1) * (itemsPerPage === 'all' ? 0 : itemsPerPage);
                  const paginatedProjects = itemsPerPage === 'all' 
                    ? projects 
                    : projects.slice(startIndex, startIndex + itemsPerPage);
                  
                  return paginatedProjects.map(project => (
                    <tr key={project.id} style={{ verticalAlign: 'middle' }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '40px', height: '40px', background: '#e2e8f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fa fa-building text-primary"></i>
                          </div>
                          <div>
                            <div style={{ fontWeight: '600' }}>{project.title}</div>
                            {project.site && <div style={{ fontSize: '0.75rem', color: '#4e73df', fontWeight: '500' }}><i className="fa fa-map-marked-alt"></i> {project.site.name}</div>}
                            <div style={{ fontSize: '0.7rem', color: '#a0aec0', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.description}</div>
                          </div>
                        </div>
                      </td>
                      <td>{project.client || 'N/A'}</td>
                      <td><i className="fa fa-map-marker-alt me-1 small opacity-50"></i> {project.location || 'N/A'}</td>
                      <td>
                        <span style={{ 
                          padding: '3px 10px', 
                          borderRadius: '20px', 
                          fontSize: '0.7rem', 
                          fontWeight: 'bold',
                          background: getStatusColor(project.status, true),
                          color: getStatusColor(project.status, false)
                        }}>
                          {project.status?.toUpperCase() || 'PLANNING'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: '#718096' }}>{project.completionDate ? new Date(project.completionDate).toLocaleDateString() : 'TBD'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => openEditModal(project)} className="btn btn-sm btn-outline-primary me-2" title="Edit">
                          <i className="fa fa-edit"></i>
                        </button>
                        <button onClick={() => handleDelete(project.id)} className="btn btn-sm btn-outline-danger" title="Delete">
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

        {/* Pagination */}
        {!isLoading && projects.length > 0 && (
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
                <option value="all">All</option>
              </select>
            </div>
            
            {itemsPerPage !== 'all' && (
              <nav>
                <ul className="pagination pagination-sm m-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(prev => prev - 1)}>Previous</button>
                  </li>
                  {Array.from({ length: Math.ceil(projects.length / itemsPerPage) }, (_, i) => (
                    <li key={i+1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === Math.ceil(projects.length / itemsPerPage) ? 'disabled' : ''}`}>
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
          <div style={{ background: '#fff', width: '600px', borderRadius: '12px', padding: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', color: '#333' }}>
            <h5 className="mb-4">{editingProject ? 'Edit Project' : 'Add New Project'}</h5>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label small">Project Title</label>
                  <input type="text" className="form-control form-control-sm" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g. Kibagabaga Bridge Construction" required />
                </div>
                <div className="col-12">
                  <label className="form-label small">Description</label>
                  <textarea className="form-control form-control-sm" rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Brief overview of the project scope and goals..." required></textarea>
                </div>
                <div className="col-12">
                  <label className="form-label small">Link to Site</label>
                  <select 
                    className="form-select form-select-sm" 
                    value={formData.siteId} 
                    onChange={(e) => {
                      const selectedSite = sites.find(s => s.id === e.target.value);
                      setFormData({
                        ...formData, 
                        siteId: e.target.value,
                        ...(selectedSite && { 
                          location: selectedSite.location || formData.location 
                        })
                      });
                    }}
                  >
                    <option value="">-- No Site Linked --</option>
                    {sites.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.location || 'No location'})</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small">Client Name</label>
                  <input type="text" className="form-control form-control-sm" value={formData.client} onChange={(e) => setFormData({...formData, client: e.target.value})} placeholder="e.g. John Doe or Ministry of Transport" />
                </div>
                <div className="col-md-6">
                  <label className="form-label small">Location</label>
                  <input type="text" className="form-control form-control-sm" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="e.g. Kigali, Rwanda" />
                </div>
                <div className="col-md-6">
                  <label className="form-label small">Status</label>
                  <select className="form-select form-select-sm" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                    <option value="Planning">Planning</option>
                    <option value="Just Started">Just Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Track">On Track</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small">Completion Date</label>
                  <input type="date" className="form-control form-control-sm" value={formData.completionDate} onChange={(e) => setFormData({...formData, completionDate: e.target.value})} />
                </div>
              </div>
              <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-light btn-sm px-4">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm px-4">
                  {editingProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function getStatusColor(status, isBg) {
  const s = status?.toLowerCase() || '';
  if (s.includes('completed')) return isBg ? 'rgba(78, 115, 223, 0.1)' : '#4e73df';
  if (s.includes('on track') || s.includes('started')) return isBg ? 'rgba(28, 200, 138, 0.1)' : '#1cc88a';
  if (s.includes('delayed')) return isBg ? 'rgba(246, 194, 62, 0.1)' : '#f6c23e';
  return isBg ? 'rgba(113, 128, 150, 0.1)' : '#718096';
}
