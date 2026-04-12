import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../components/AdminLayout';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// ── Image slot definitions ────────────────────────────────────────────────────
// Each entry = { section, key, label }
const IMAGE_SLOTS = [
  // Hero carousel
  { section: 'hero', key: 'slider_1', label: 'Hero Slide 1', defaultSrc: 'img/hero-slider-1.jpg' },
  { section: 'hero', key: 'slider_2', label: 'Hero Slide 2', defaultSrc: 'img/hero-slider-2.jpg' },
  { section: 'hero', key: 'slider_3', label: 'Hero Slide 3', defaultSrc: 'img/hero-slider-3.jpg' },
  // About
  { section: 'about', key: 'image_1', label: 'About Image 1', defaultSrc: 'img/about-1.jpg' },
  { section: 'about', key: 'image_2', label: 'About Image 2', defaultSrc: 'img/about-2.jpg' },
  // Newsletter
  { section: 'newsletter', key: 'bg_image', label: 'Newsletter Background', defaultSrc: 'img/newsletter.jpg' },
];

export default function HomeManagement() {
  // Persisted text/image-URL data from the backend
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Local image state: { "section-key": { file: File, previewUrl: string } }
  const [localImages, setLocalImages] = useState({});

  // Which slot is being uploaded during Save & Publish
  const [uploadingSlot, setUploadingSlot] = useState(null);

  // Refs for hidden file inputs keyed by "section-key"
  const fileRefs = useRef({});

  useEffect(() => {
    fetchHomeData();
  }, []);

  // Clean up object URLs when component unmounts to avoid memory leaks
  useEffect(() => {
    return () => {
      Object.values(localImages).forEach(({ previewUrl }) => {
        if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
      });
    };
  }, [localImages]);

  const fetchHomeData = async () => {
    try {
      const res = await fetch(`${API_URL}/cms/home`);
      const json = await res.json();
      const initialState = {
        hero: {
          title: 'We Build Your Dream Home',
          subtitle: 'Build Strong For Next Generations',
          slider_1: 'img/hero-slider-1.jpg',
          slider_2: 'img/hero-slider-2.jpg',
          slider_3: 'img/hero-slider-3.jpg',
          ...(json.hero || {}),
        },
        about: {
          title: 'History of Our Creation',
          history: 'Build Strong For Next Generations (BSNG) was founded...',
          mission: 'Our team of skilled architects, engineers...',
          image_1: 'img/about-1.jpg',
          image_2: 'img/about-2.jpg',
          ...(json.about || {}),
        },
        why_choose_us: {
          title: 'Why People Choose Us',
          item_1_title: 'Years of Experience', item_1_desc: 'With years of hands-on experience...',
          item_2_title: 'Best House Construction', item_2_desc: 'We design and build modern...',
          item_3_title: 'Expert Renovation', item_3_desc: 'We breathe new life...',
          item_4_title: 'Client Satisfaction', item_4_desc: 'Every project we undertake...',
          item_5_title: 'Property Rental', item_5_desc: 'Looking for a property...',
          item_6_title: 'Plot Sales', item_6_desc: 'We offer verified...',
          ...(json.why_choose_us || {}),
        },
        services_header: {
          title: 'Our Professional Services',
          desc1: 'At BSNG Construction, we offer a...',
          desc2: 'From the first consultation to project handover...',
          phone: '+250 737 213 060',
          ...(json.services_header || {}),
        },
        newsletter: {
          bg_image: 'img/newsletter.jpg',
          title: 'Subscribe to Our Newsletter',
          desc: 'Stay updated with our latest projects, property listings, and construction tips.',
          ...(json.newsletter || {}),
        },
        footer: {
          tagline: 'Build Strong For Next Generations (BSNG) — Your trusted partner...',
          address: 'Kibagabaga, Kigali, Rwanda',
          phone: '+250 737 213 060',
          email: 'info.buildstronggenerations@gmail.com',
          ...(json.footer || {}),
        },
      };
      setData(initialState);
    } catch (err) {
      toast.error('Failed to load home content');
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (section, key, value) => {
    setData(prev => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
  };

  // ── Local image selection: preview immediately, no upload yet ───────────────
  const handleFileSelect = (section, key, file) => {
    if (!file) return;
    const slotKey = `${section}-${key}`;

    // Revoke previous blob if any
    if (localImages[slotKey]?.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(localImages[slotKey].previewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setLocalImages(prev => ({ ...prev, [slotKey]: { file, previewUrl } }));
  };

  // Returns the URL to display for an image slot (local preview takes priority)
  const displaySrc = (section, key, defaultSrc) => {
    const slotKey = `${section}-${key}`;
    if (localImages[slotKey]) return localImages[slotKey].previewUrl;
    return data[section]?.[key] || defaultSrc;
  };

  // ── Save & Publish: convert images to base64 then bulk-update ──────────────
  const handleSaveAndPublish = async () => {
    setIsSaving(true);
    const token = localStorage.getItem('token');
    let finalData = { ...data };

    try {
      // 1. Convert any locally selected images to base64 data URLs (no Cloudinary needed)
      for (const [slotKey, { file }] of Object.entries(localImages)) {
        setUploadingSlot(slotKey);

        const base64Url = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
          reader.readAsDataURL(file);
        });

        // Parse section and key back from slotKey (section may not contain dashes, key might)
        const dashIdx = slotKey.indexOf('-');
        const section = slotKey.slice(0, dashIdx);
        const key = slotKey.slice(dashIdx + 1);

        finalData = {
          ...finalData,
          [section]: { ...finalData[section], [key]: base64Url },
        };
      }

      setUploadingSlot(null);

      // 2. Bulk-update all content (texts + base64 image data) at once
      const bulkRes = await fetch(`${API_URL}/cms/home/bulk-update`, {
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

  // ── Reusable Image Card renderer (not a sub-component to avoid hook issues) ──
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

          {/* Hover overlay */}
          <div
            className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center"
            style={{ background: 'rgba(0,0,0,0.45)', opacity: 0, transition: 'opacity 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = 1)}
            onMouseLeave={e => (e.currentTarget.style.opacity = 0)}
          >
            <i className="fa fa-camera text-white mb-1" style={{ fontSize: '1.4rem' }}></i>
            <span className="text-white" style={{ fontSize: '0.72rem' }}>Click to change</span>
          </div>

          {/* Upload spinner overlay */}
          {isUploading && (
            <div className="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-80 d-flex flex-column align-items-center justify-content-center">
              <div className="spinner-border spinner-border-sm text-primary mb-1"></div>
              <small className="text-muted" style={{ fontSize: '0.7rem' }}>Uploading…</small>
            </div>
          )}

          {/* Hidden file input */}
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

  if (loading) return <AdminLayout title="Home CMS"><div className="p-4">Loading…</div></AdminLayout>;

  const pendingCount = Object.keys(localImages).length;

  return (
    <AdminLayout title="Home Page Content Management">

      {/* ── Header ── */}
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

          {/* HERO */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3 border-0">
              <h5 className="mb-0 text-primary fw-bold"><i className="fa fa-home me-2"></i>Hero Slider Section</h5>
            </div>
            <div className="card-body pt-0">
              <div className="mb-3">
                <label className="form-label small fw-bold">Main Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={data.hero?.title || ''}
                  onChange={e => handleTextChange('hero', 'title', e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="form-label small fw-bold">Subtitle</label>
                <input
                  type="text"
                  className="form-control"
                  value={data.hero?.subtitle || ''}
                  onChange={e => handleTextChange('hero', 'subtitle', e.target.value)}
                />
              </div>
              <div className="row g-3">
                {['slider_1', 'slider_2', 'slider_3'].map((key, i) => (
                  <div className="col-4" key={key}>
                    {renderImageCard('hero', key, `Slide ${i + 1}`, `img/hero-slider-${i + 1}.jpg`, 90)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ABOUT */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3 border-0">
              <h5 className="mb-0 text-primary fw-bold"><i className="fa fa-info-circle me-2"></i>About Us Section</h5>
            </div>
            <div className="card-body pt-0">
              <div className="mb-3">
                <label className="form-label small fw-bold">Header Text (After 'History')</label>
                <input
                  type="text"
                  className="form-control"
                  value={data.about?.title || ''}
                  onChange={e => handleTextChange('about', 'title', e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Our History Description</label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={data.about?.history || ''}
                  onChange={e => handleTextChange('about', 'history', e.target.value)}
                ></textarea>
              </div>
              <div className="mb-4">
                <label className="form-label small fw-bold">Our Mission Description</label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={data.about?.mission || ''}
                  onChange={e => handleTextChange('about', 'mission', e.target.value)}
                ></textarea>
              </div>
              <div className="row g-3">
                {['image_1', 'image_2'].map((key, i) => (
                  <div className="col-6" key={key}>
                    {renderImageCard('about', key, `About Image ${i + 1}`, `img/about-${i + 1}.jpg`, 130)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3 border-0">
              <h5 className="mb-0 text-primary fw-bold"><i className="fa fa-map-marker-alt me-2"></i>Contact &amp; Footer Info</h5>
            </div>
            <div className="card-body pt-0">
              <div className="mb-3">
                <label className="form-label small fw-bold">Company Tagline</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={data.footer?.tagline || ''}
                  onChange={e => handleTextChange('footer', 'tagline', e.target.value)}
                ></textarea>
              </div>
              <div className="row g-3">
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-bold">Address</label>
                  <input type="text" className="form-control" value={data.footer?.address || ''} onChange={e => handleTextChange('footer', 'address', e.target.value)} />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-bold">Phone Number</label>
                  <input type="text" className="form-control" value={data.footer?.phone || ''} onChange={e => handleTextChange('footer', 'phone', e.target.value)} />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold">Email Address</label>
                  <input type="email" className="form-control" value={data.footer?.email || ''} onChange={e => handleTextChange('footer', 'email', e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="col-12 col-xl-6">

          {/* WHY CHOOSE US */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3 border-0">
              <h5 className="mb-0 text-primary fw-bold"><i className="fa fa-thumbs-up me-2"></i>Why Choose Us Section</h5>
            </div>
            <div className="card-body pt-0">
              <div className="mb-4">
                <label className="form-label small fw-bold">Section Header</label>
                <input
                  type="text"
                  className="form-control"
                  value={data.why_choose_us?.title || ''}
                  onChange={e => handleTextChange('why_choose_us', 'title', e.target.value)}
                />
              </div>
              <div className="row g-3 overflow-auto" style={{ maxHeight: '500px' }}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="col-12 bg-light p-3 rounded mb-2">
                    <div className="mb-2">
                      <label className="form-label extra-small fw-bold">Feature {i} Title</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={data.why_choose_us?.[`item_${i}_title`] || ''}
                        onChange={e => handleTextChange('why_choose_us', `item_${i}_title`, e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="form-label extra-small fw-bold">Feature {i} Description</label>
                      <textarea
                        className="form-control form-control-sm"
                        rows="2"
                        value={data.why_choose_us?.[`item_${i}_desc`] || ''}
                        onChange={e => handleTextChange('why_choose_us', `item_${i}_desc`, e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SERVICES HEADER */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3 border-0">
              <h5 className="mb-0 text-primary fw-bold"><i className="fa fa-concierge-bell me-2"></i>Services Introduction</h5>
            </div>
            <div className="card-body pt-0">
              <div className="mb-3">
                <label className="form-label small fw-bold">Main Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={data.services_header?.title || ''}
                  onChange={e => handleTextChange('services_header', 'title', e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Primary Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={data.services_header?.desc1 || ''}
                  onChange={e => handleTextChange('services_header', 'desc1', e.target.value)}
                ></textarea>
              </div>
              <div className="mb-4">
                <label className="form-label small fw-bold">Secondary Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={data.services_header?.desc2 || ''}
                  onChange={e => handleTextChange('services_header', 'desc2', e.target.value)}
                ></textarea>
              </div>
              <div className="bg-light p-3 rounded">
                <label className="form-label small fw-bold">Consultation Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={data.services_header?.phone || ''}
                  onChange={e => handleTextChange('services_header', 'phone', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* NEWSLETTER */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3 border-0">
              <h5 className="mb-0 text-primary fw-bold"><i className="fa fa-paper-plane me-2"></i>Newsletter Background</h5>
            </div>
            <div className="card-body pt-0">
              {renderImageCard('newsletter', 'bg_image', 'Newsletter Background Image', 'img/newsletter.jpg', 160)}
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom Save & Publish ── */}
      <div className="d-flex justify-content-end mt-2 mb-5">
        <button
          className="btn btn-primary px-5 py-2 fw-bold"
          onClick={handleSaveAndPublish}
          disabled={isSaving}
          style={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(246,139,31,0.3)' }}
        >
          {isSaving ? (
            <><span className="spinner-border spinner-border-sm me-2"></span>Publishing…</>
          ) : (
            <><i className="fa fa-paper-plane me-2"></i>Save &amp; Publish</>
          )}
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
