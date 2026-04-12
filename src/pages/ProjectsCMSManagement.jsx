import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export default function ProjectsCMSManagement() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/cms/projects`);
      const json = await res.json();
      const initialState = {
        projects_header: {
          title: 'Our Latest Projects',
          subtitle: 'of our latest projects',
          ...(json.projects_header || {}),
        }
      };
      setData(initialState);
    } catch (err) {
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (section, key, value) => {
    setData(prev => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
  };

  const handleSaveAndPublish = async () => {
    setIsSaving(true);
    const token = localStorage.getItem('token');
    try {
      const bulkRes = await fetch(`${API_URL}/cms/projects/bulk-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (bulkRes.ok) {
        try { localStorage.setItem('bsng_cms_projects', JSON.stringify(data)); } catch {}
        toast.success('✅ Successfully Saved and Published to Website!');
      } else {
        toast.error('Failed to publish changes');
      }
    } catch (err) {
      toast.error('Error while publishing');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <AdminLayout title="Projects CMS"><div className="p-4">Loading…</div></AdminLayout>;

  return (
    <AdminLayout title="Projects Page Content Management">
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div>
          <h2 className="h4 mb-1">Dynamic Content Editor</h2>
          <p className="text-muted small mb-0">Edit header texts for the projects page.</p>
        </div>
        <button
          className="btn btn-primary px-4 py-2 fw-bold"
          onClick={handleSaveAndPublish}
          disabled={isSaving}
          style={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(246,139,31,0.3)', whiteSpace: 'nowrap' }}
        >
          {isSaving ? 'Publishing...' : 'Save & Publish'}
        </button>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3 border-0">
          <h5 className="mb-0 text-primary fw-bold">Projects Header Section</h5>
        </div>
        <div className="card-body pt-0">
          <div className="mb-3">
            <label className="form-label small fw-bold">Title</label>
            <input type="text" className="form-control" value={data.projects_header?.title || ''} onChange={e => handleTextChange('projects_header', 'title', e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-bold">Subtitle</label>
            <input type="text" className="form-control" value={data.projects_header?.subtitle || ''} onChange={e => handleTextChange('projects_header', 'subtitle', e.target.value)} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
