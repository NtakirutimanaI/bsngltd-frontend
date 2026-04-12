import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../components/AdminLayout';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export default function AboutManagement() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [localImages, setLocalImages] = useState({});
  const [uploadingSlot, setUploadingSlot] = useState(null);
  const fileRefs = useRef({});

  useEffect(() => {
    fetchAboutData();
  }, []);

  useEffect(() => {
    return () => {
      Object.values(localImages).forEach(({ previewUrl }) => {
        if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
      });
    };
  }, [localImages]);

  const fetchAboutData = async () => {
    try {
      const res = await fetch(`${API_URL}/cms/about`);
      const json = await res.json();
      const initialState = {
        who_we_are: {
          title: 'Who We Are',
          desc1: 'Build Strong For Next Generations (BSNG) is a Kigali-based construction and real estate company dedicated to delivering excellence across all aspects of construction, property sales, and management. We are located in Kibagabaga, Kigali, Rwanda, and serve clients across the entire country.',
          desc2: 'Our company was established with a bold mission: to provide construction services that are not only structurally superior, but also built with integrity and long-term value in mind. Every project we take on carries our promise — to build strong, build right, and build for the generations that follow.',
          image_1: 'img/about-1.jpg',
          image_2: 'img/about-2.jpg',
          feature_1: 'Quality Craftsmanship',
          feature_2: 'Expert Professional Team',
          feature_3: '24/7 Client Support',
          feature_4: 'Competitive Pricing',
          ...(json.who_we_are || {}),
        },
        mission_vision: {
          title: 'Our Mission & Vision',
          mission: 'To provide reliable, high-quality construction and real estate services to our clients in Rwanda, helping individuals, families, and businesses achieve their property goals through transparent, professional, and client-focused service delivery.',
          vision: 'To become Rwanda\'s leading construction and property management company, known for building durable, innovative, and affordable structures that stand as a legacy for future generations.',
          values: 'Integrity, quality, and excellence guide every project we undertake. We believe in honest communication, skilled workmanship, and sustainable building practices that benefit our clients and Rwanda\'s development.',
          commitment: 'We are committed to delivering every project on time, within budget, and beyond expectation. Your satisfaction is our success, and we back every project with our full professional commitment and after-service support.',
          ...(json.mission_vision || {}),
        }
      };
      setData(initialState);
    } catch (err) {
      toast.error('Failed to load about content');
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (section, key, value) => {
    setData(prev => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
  };

  const handleFileSelect = (section, key, file) => {
    if (!file) return;
    const slotKey = `${section}-${key}`;
    if (localImages[slotKey]?.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(localImages[slotKey].previewUrl);
    }
    const previewUrl = URL.createObjectURL(file);
    setLocalImages(prev => ({ ...prev, [slotKey]: { file, previewUrl } }));
  };

  const displaySrc = (section, key, defaultSrc) => {
    const slotKey = `${section}-${key}`;
    if (localImages[slotKey]) return localImages[slotKey].previewUrl;
    return data[section]?.[key] || defaultSrc;
  };

  const handleSaveAndPublish = async () => {
    setIsSaving(true);
    const token = localStorage.getItem('token');
    let finalData = { ...data };

    try {
      for (const [slotKey, { file }] of Object.entries(localImages)) {
        setUploadingSlot(slotKey);
        const base64Url = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
          reader.readAsDataURL(file);
        });

        const dashIdx = slotKey.indexOf('-');
        const section = slotKey.slice(0, dashIdx);
        const key = slotKey.slice(dashIdx + 1);

        finalData = {
          ...finalData,
          [section]: { ...finalData[section], [key]: base64Url },
        };
      }
      setUploadingSlot(null);

      const bulkRes = await fetch(`${API_URL}/cms/about/bulk-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(finalData),
      });

      if (bulkRes.ok) {
        setData(finalData);
        setLocalImages({});
        try { localStorage.setItem('bsng_cms_about', JSON.stringify(finalData)); } catch {}
        toast.success('✅ Successfully Saved and Published to Website!');
      } else {
        const err = await bulkRes.json().catch(() => ({}));
        toast.error(err.message || 'Failed to publish changes');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error while publishing');
    } finally {
      setIsSaving(false);
      setUploadingSlot(null);
    }
  };

  const renderImageCard = (section, imageKey, label, defaultSrc, height = 120) => {
    const slotKey = `${section}-${imageKey}`;
    const isUploading = uploadingSlot === slotKey;
    const isLocallyChanged = !!localImages[slotKey];

    return (
      <div key={slotKey}>
        <div className="d-flex justify-content-between align-items-center mb-1">
          <label className="form-label extra-small fw-bold mb-0">{label}</label>
          {isLocallyChanged && (
            <span className="badge bg-warning text-dark" style={{ fontSize: '0.65rem' }}>
              <i className="fa fa-clock me-1"></i>Pending
            </span>
          )}
        </div>
        <div
          className="position-relative overflow-hidden rounded border bg-light"
          style={{ height, cursor: 'pointer' }}
          onClick={() => fileRefs.current[slotKey]?.click()}
          title="Click to change image"
        >
          <img
            src={displaySrc(section, imageKey, defaultSrc)}
            alt={label}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.3s' }}
          />
          <div
            className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center"
            style={{ background: 'rgba(0,0,0,0.45)', opacity: 0, transition: 'opacity 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = 1)}
            onMouseLeave={e => (e.currentTarget.style.opacity = 0)}
          >
            <i className="fa fa-camera text-white mb-1" style={{ fontSize: '1.4rem' }}></i>
            <span className="text-white" style={{ fontSize: '0.72rem' }}>Click to change</span>
          </div>
          {isUploading && (
            <div className="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-80 d-flex flex-column align-items-center justify-content-center">
              <div className="spinner-border spinner-border-sm text-primary mb-1"></div>
              <small className="text-muted" style={{ fontSize: '0.7rem' }}>Uploading…</small>
            </div>
          )}
          <input
            ref={el => (fileRefs.current[slotKey] = el)}
            type="file"
            accept="image/*"
            className="d-none"
            onChange={e => handleFileSelect(section, imageKey, e.target.files[0])}
          />
        </div>
      </div>
    );
  };

  if (loading) return <AdminLayout title="About CMS"><div className="p-4">Loading…</div></AdminLayout>;
  const pendingCount = Object.keys(localImages).length;

  return (
    <AdminLayout title="About Page Content Management">
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div>
          <h2 className="h4 mb-1">Dynamic Content Editor</h2>
          <p className="text-muted small mb-0">
            Edit texts and upload images. Images preview <strong>instantly</strong> — click
            <strong> Save &amp; Publish</strong> to push everything live.
          </p>
          {pendingCount > 0 && (
            <div className="alert alert-warning py-2 px-3 mt-2 mb-0 d-flex align-items-center gap-2" style={{ fontSize: '0.82rem' }}>
              <i className="fa fa-exclamation-triangle"></i>
              <span>
                {pendingCount} image{pendingCount > 1 ? 's' : ''} selected but <strong>not yet published</strong>.
                Click "Save &amp; Publish" to go live.
              </span>
            </div>
          )}
        </div>
        <button
          className="btn btn-primary px-4 py-2 fw-bold"
          onClick={handleSaveAndPublish}
          disabled={isSaving}
          style={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(246,139,31,0.3)', whiteSpace: 'nowrap' }}
        >
          {isSaving ? (
            <><span className="spinner-border spinner-border-sm me-2"></span>Publishing…</>
          ) : (
            <><i className="fa fa-paper-plane me-2"></i>Save &amp; Publish</>
          )}
        </button>
      </div>

      <div className="row g-4">
        {/* ── LEFT COLUMN ── */}
        <div className="col-12 col-xl-6">
          {/* WHO WE ARE */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3 border-0">
              <h5 className="mb-0 text-primary fw-bold"><i className="fa fa-info-circle me-2"></i>Who We Are Section</h5>
            </div>
            <div className="card-body pt-0">
              <div className="mb-3">
                <label className="form-label small fw-bold">Section Title</label>
                <input type="text" className="form-control" value={data.who_we_are?.title || ''} onChange={e => handleTextChange('who_we_are', 'title', e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Description 1</label>
                <textarea className="form-control" rows="4" value={data.who_we_are?.desc1 || ''} onChange={e => handleTextChange('who_we_are', 'desc1', e.target.value)}></textarea>
              </div>
              <div className="mb-4">
                <label className="form-label small fw-bold">Description 2</label>
                <textarea className="form-control" rows="4" value={data.who_we_are?.desc2 || ''} onChange={e => handleTextChange('who_we_are', 'desc2', e.target.value)}></textarea>
              </div>
              <div className="row g-3 mb-4">
                {['image_1', 'image_2'].map((key, i) => (
                  <div className="col-6" key={key}>
                    {renderImageCard('who_we_are', key, `Image ${i + 1}`, `img/about-${i + 1}.jpg`, 130)}
                  </div>
                ))}
              </div>
              <div className="row g-2">
                {[1, 2, 3, 4].map(i => (
                  <div className="col-6" key={i}>
                    <label className="form-label extra-small fw-bold">Feature {i}</label>
                    <input type="text" className="form-control form-control-sm" value={data.who_we_are?.[`feature_${i}`] || ''} onChange={e => handleTextChange('who_we_are', `feature_${i}`, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="col-12 col-xl-6">
          {/* MISSION & VISION */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3 border-0">
              <h5 className="mb-0 text-primary fw-bold"><i className="fa fa-bullseye me-2"></i>Mission & Vision Section</h5>
            </div>
            <div className="card-body pt-0">
              <div className="mb-4">
                <label className="form-label small fw-bold">Section Title</label>
                <input type="text" className="form-control" value={data.mission_vision?.title || ''} onChange={e => handleTextChange('mission_vision', 'title', e.target.value)} />
              </div>
              <div className="row g-3 overflow-auto" style={{ maxHeight: '500px' }}>
                <div className="col-12 bg-light p-3 rounded mb-2">
                    <label className="form-label extra-small fw-bold">Our Mission</label>
                    <textarea className="form-control form-control-sm" rows="3" value={data.mission_vision?.mission || ''} onChange={e => handleTextChange('mission_vision', 'mission', e.target.value)}></textarea>
                </div>
                <div className="col-12 bg-light p-3 rounded mb-2">
                    <label className="form-label extra-small fw-bold">Our Vision</label>
                    <textarea className="form-control form-control-sm" rows="3" value={data.mission_vision?.vision || ''} onChange={e => handleTextChange('mission_vision', 'vision', e.target.value)}></textarea>
                </div>
                <div className="col-12 bg-light p-3 rounded mb-2">
                    <label className="form-label extra-small fw-bold">Our Values</label>
                    <textarea className="form-control form-control-sm" rows="3" value={data.mission_vision?.values || ''} onChange={e => handleTextChange('mission_vision', 'values', e.target.value)}></textarea>
                </div>
                <div className="col-12 bg-light p-3 rounded mb-2">
                    <label className="form-label extra-small fw-bold">Our Commitment</label>
                    <textarea className="form-control form-control-sm" rows="3" value={data.mission_vision?.commitment || ''} onChange={e => handleTextChange('mission_vision', 'commitment', e.target.value)}></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-end mt-2 mb-5">
        <button className="btn btn-primary px-5 py-2 fw-bold" onClick={handleSaveAndPublish} disabled={isSaving} style={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(246,139,31,0.3)' }}>
          {isSaving ? <><span className="spinner-border spinner-border-sm me-2"></span>Publishing…</> : <><i className="fa fa-paper-plane me-2"></i>Save &amp; Publish</>}
        </button>
      </div>

      <style>{`
        .extra-small { font-size: 0.75rem; }
        .cursor-pointer { cursor: pointer; }
        .card { transition: transform 0.2s; }
        .card:hover { transform: translateY(-2px); }
        .form-control:focus { border-color: #f68b1f; box-shadow: 0 0 0 0.2rem rgba(246,139,31,0.15); }
      `}</style>
    </AdminLayout>
  );
}
