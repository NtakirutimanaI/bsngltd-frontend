import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export default function ContactManagement() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/cms/contact`);
      const json = await res.json();
      const initialState = {
        contact_info: {
          title: 'Get In Touch',
          desc: 'We are always ready to hear from you. Whether you have a project in mind, need a consultation, or want to rent or buy a property, our team is here to help.',
          address: 'Kibagabaga, Kigali, Rwanda',
          phone: '+250 737 213 060',
          email: 'info.buildstronggenerations@gmail.com',
          hours: 'Monday – Saturday: 7:00 AM – 6:00 PM',
          form_title: 'Have Any Query? Contact Us',
          ...(json.contact_info || {}),
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
      const bulkRes = await fetch(`${API_URL}/cms/contact/bulk-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (bulkRes.ok) {
        try { localStorage.setItem('bsng_cms_contact', JSON.stringify(data)); } catch {}
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

  if (loading) return <AdminLayout title="Contact CMS"><div className="p-4">Loading…</div></AdminLayout>;

  return (
    <AdminLayout title="Contact Page Content Management">
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div>
          <h2 className="h4 mb-1">Dynamic Content Editor</h2>
          <p className="text-muted small mb-0">Edit contact details and descriptions.</p>
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
          <h5 className="mb-0 text-primary fw-bold">Contact Info Section</h5>
        </div>
        <div className="card-body pt-0">
          <div className="row g-3">
              <div className="col-12">
                <label className="form-label small fw-bold">Contact Intro Title</label>
                <input type="text" className="form-control" value={data.contact_info?.title || ''} onChange={e => handleTextChange('contact_info', 'title', e.target.value)} />
              </div>
              <div className="col-12">
                <label className="form-label small fw-bold">Contact Intro Description</label>
                <textarea className="form-control" rows="3" value={data.contact_info?.desc || ''} onChange={e => handleTextChange('contact_info', 'desc', e.target.value)}></textarea>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold">Office Location (Address)</label>
                <input type="text" className="form-control" value={data.contact_info?.address || ''} onChange={e => handleTextChange('contact_info', 'address', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold">Phone Number</label>
                <input type="text" className="form-control" value={data.contact_info?.phone || ''} onChange={e => handleTextChange('contact_info', 'phone', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold">Email Address</label>
                <input type="email" className="form-control" value={data.contact_info?.email || ''} onChange={e => handleTextChange('contact_info', 'email', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold">Working Hours</label>
                <input type="text" className="form-control" value={data.contact_info?.hours || ''} onChange={e => handleTextChange('contact_info', 'hours', e.target.value)} />
              </div>
              <div className="col-12">
                <label className="form-label small fw-bold">Contact Form Header</label>
                <input type="text" className="form-control" value={data.contact_info?.form_title || ''} onChange={e => handleTextChange('contact_info', 'form_title', e.target.value)} />
              </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
