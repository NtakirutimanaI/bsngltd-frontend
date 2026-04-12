import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export default function ServicesManagement() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/cms/services`);
      const json = await res.json();
      const initialState = {
        services_header: {
          title: 'Our Complete Construction Services',
          desc1: 'At BSNG Construction, we offer a full spectrum of construction and real estate services tailored to meet the needs of individuals, businesses, and investors across Rwanda. Our services are built on a foundation of quality, reliability, and genuine care for our clients.',
          desc2: 'Whether you\\'re looking to build your dream home, renovate an existing property, purchase a plot of land, or find tenants for your property, BSNG has the expertise and dedication to deliver exceptional results from start to finish.',
          phone: '+250 737 213 060',
          ...(json.services_header || {}),
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
      const bulkRes = await fetch(`${API_URL}/cms/services/bulk-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (bulkRes.ok) {
        try { localStorage.setItem('bsng_cms_services', JSON.stringify(data)); } catch {}
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

  if (loading) return <AdminLayout title="Services CMS"><div className="p-4">Loading…</div></AdminLayout>;

  return (
    <AdminLayout title="Services Page Content Management">
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div>
          <h2 className="h4 mb-1">Dynamic Content Editor</h2>
          <p className="text-muted small mb-0">Edit texts for the services page header.</p>
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
          <h5 className="mb-0 text-primary fw-bold">Services Header Section</h5>
        </div>
        <div className="card-body pt-0">
          <div className="mb-3">
            <label className="form-label small fw-bold">Title</label>
            <input type="text" className="form-control" value={data.services_header?.title || ''} onChange={e => handleTextChange('services_header', 'title', e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-bold">Description 1</label>
            <textarea className="form-control" rows="3" value={data.services_header?.desc1 || ''} onChange={e => handleTextChange('services_header', 'desc1', e.target.value)}></textarea>
          </div>
          <div className="mb-3">
            <label className="form-label small fw-bold">Description 2</label>
            <textarea className="form-control" rows="3" value={data.services_header?.desc2 || ''} onChange={e => handleTextChange('services_header', 'desc2', e.target.value)}></textarea>
          </div>
          <div className="mb-3">
            <label className="form-label small fw-bold">Phone Number</label>
            <input type="text" className="form-control" value={data.services_header?.phone || ''} onChange={e => handleTextChange('services_header', 'phone', e.target.value)} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
