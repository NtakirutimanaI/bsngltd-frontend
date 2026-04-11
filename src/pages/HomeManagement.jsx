import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { toast } from 'react-toastify';

export default function HomeManagement() {
  const [data, setData] = useState({}); // This will be our form state
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(null);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/cms/home');
      const json = await res.json();
      // Initialize state with default values if backend is empty
      const initialState = {
        hero: {
          title: 'We Build Your Dream Home',
          subtitle: 'Build Strong For Next Generations',
          slider_1: 'img/hero-slider-1.jpg',
          slider_2: 'img/hero-slider-2.jpg',
          slider_3: 'img/hero-slider-3.jpg',
          ...json.hero
        },
        about: {
          title: 'History of Our Creation',
          history: 'Build Strong For Next Generations (BSNG) was founded...',
          mission: 'Our team of skilled architects, engineers...',
          image_1: 'img/about-1.jpg',
          image_2: 'img/about-2.jpg',
          ...json.about
        },
        why_choose_us: {
          title: 'Why People Choose Us',
          item_1_title: 'Years of Experience',
          item_1_desc: 'With years of hands-on experience...',
          item_2_title: 'Best House Construction',
          item_2_desc: 'We design and build modern...',
          item_3_title: 'Expert Renovation',
          item_3_desc: 'We breathe new life...',
          item_4_title: 'Client Satisfaction',
          item_4_desc: 'Every project we undertake...',
          item_5_title: 'Property Rental',
          item_5_desc: 'Looking for a property...',
          item_6_title: 'Plot Sales',
          item_6_desc: 'We offer verified...',
          ...json.why_choose_us
        },
        services_header: {
          title: 'Our Professional Services',
          desc1: 'At BSNG Construction, we offer a...',
          desc2: 'From the first consultation to project handover...',
          phone: '+250 737 213 060',
          ...json.services_header
        },
        newsletter: {
          bg_image: 'img/newsletter.jpg',
          title: 'Subscribe to Our Newsletter',
          desc: 'Stay updated with our latest projects, property listings, and construction tips.',
          ...json.newsletter
        },
        footer: {
          tagline: 'Build Strong For Next Generations (BSNG) — Your trusted partner...',
          address: 'Kibagabaga, Kigali, Rwanda',
          phone: '+250 737 213 060',
          email: 'info.buildstronggenerations@gmail.com',
          ...json.footer
        }
      };
      setData(initialState);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load home content');
      setLoading(false);
    }
  };

  const handleInputChange = (section, key, value) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleImageUpload = async (section, key, file) => {
    if (!file) return;
    setUploading(`${section}-${key}`);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('section', section);
    formData.append('key', key);

    try {
      const res = await fetch('http://localhost:4000/api/cms/home/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      if (res.ok) {
        const result = await res.json();
        // Update local state with the new Cloudinary URL
        handleInputChange(section, key, result.value);
        toast.info(`Image staged: ${key}`);
      }
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const handleSaveAndPublish = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('http://localhost:4000/api/cms/home/bulk-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        toast.success('Successfully Saved and Published to Website!');
      } else {
        toast.error('Failed to publish changes');
      }
    } catch (err) {
      toast.error('Network error while publishing');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <AdminLayout title="Home CMS"><div>Loading...</div></AdminLayout>;

  return (
    <AdminLayout title="Home Page Content Management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h4 mb-0">Dynamic Content Editor</h2>
          <p className="text-muted small">Edit texts and upload images. Click "Save and Publish" to update the live website.</p>
        </div>
        <button 
          className="btn btn-primary px-4 py-2 fw-bold" 
          onClick={handleSaveAndPublish}
          disabled={isSaving}
          style={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(246, 139, 31, 0.3)' }}
        >
          {isSaving ? (
            <><span className="spinner-border spinner-border-sm me-2"></span> Publishing...</>
          ) : (
            <><i className="fa fa-paper-plane me-2"></i> Save and Publish</>
          )}
        </button>
      </div>

      <div className="row g-4">
        {/* LEFT COLUMN */}
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
                  onChange={(e) => handleInputChange('hero', 'title', e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="form-label small fw-bold">Subtitle</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={data.hero?.subtitle || ''}
                  onChange={(e) => handleInputChange('hero', 'subtitle', e.target.value)}
                />
              </div>
              <div className="row g-3">
                {['slider_1', 'slider_2', 'slider_3'].map((key, i) => (
                  <div className="col-4" key={key}>
                    <label className="form-label extra-small fw-bold">Slide {i+1}</label>
                    <div className="position-relative overflow-hidden rounded border bg-light" style={{ height: '90px' }}>
                      <img 
                        src={data.hero?.[key]} 
                        alt={key} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                      <div className="position-absolute bottom-0 start-0 w-100 bg-dark bg-opacity-50 text-center py-1">
                        <label className="text-white extra-small m-0 cursor-pointer">
                          <i className="fa fa-camera me-1"></i> Change
                          <input type="file" className="d-none" onChange={(e) => handleImageUpload('hero', key, e.target.files[0])} />
                        </label>
                      </div>
                      {uploading === `hero-${key}` && <div className="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex align-items-center justify-content-center"><div className="spinner-border spinner-border-sm text-primary"></div></div>}
                    </div>
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
                  onChange={(e) => handleInputChange('about', 'title', e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Our History Description</label>
                <textarea 
                  className="form-control" 
                  rows="4"
                  value={data.about?.history || ''}
                  onChange={(e) => handleInputChange('about', 'history', e.target.value)}
                ></textarea>
              </div>
              <div className="mb-4">
                <label className="form-label small fw-bold">Our Mission Description</label>
                <textarea 
                  className="form-control" 
                  rows="4"
                  value={data.about?.mission || ''}
                  onChange={(e) => handleInputChange('about', 'mission', e.target.value)}
                ></textarea>
              </div>
              <div className="row g-3">
                {['image_1', 'image_2'].map((key, i) => (
                  <div className="col-6" key={key}>
                     <label className="form-label extra-small fw-bold">Image {i+1}</label>
                     <div className="position-relative overflow-hidden rounded border bg-light" style={{ height: '130px' }}>
                      <img 
                        src={data.about?.[key]} 
                        alt={key} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                      <label className="btn btn-sm btn-light position-absolute bottom-0 end-0 m-2 shadow-sm">
                        <i className="fa fa-camera"></i>
                        <input type="file" className="d-none" onChange={(e) => handleImageUpload('about', key, e.target.files[0])} />
                      </label>
                      {uploading === `about-${key}` && <div className="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex align-items-center justify-content-center"><div className="spinner-border spinner-border-sm text-primary"></div></div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3 border-0">
              <h5 className="mb-0 text-primary fw-bold"><i className="fa fa-map-marker-alt me-2"></i>Contact & Footer Info</h5>
            </div>
            <div className="card-body pt-0">
              <div className="mb-3">
                <label className="form-label small fw-bold">Company Tagline</label>
                <textarea 
                  className="form-control" 
                  rows="2"
                  value={data.footer?.tagline || ''}
                  onChange={(e) => handleInputChange('footer', 'tagline', e.target.value)}
                ></textarea>
              </div>
              <div className="row g-3">
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-bold">Address</label>
                  <input type="text" className="form-control" value={data.footer?.address || ''} onChange={(e) => handleInputChange('footer', 'address', e.target.value)} />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-bold">Phone Number</label>
                  <input type="text" className="form-control" value={data.footer?.phone || ''} onChange={(e) => handleInputChange('footer', 'phone', e.target.value)} />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold">Email Address</label>
                  <input type="email" className="form-control" value={data.footer?.email || ''} onChange={(e) => handleInputChange('footer', 'email', e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
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
                  onChange={(e) => handleInputChange('why_choose_us', 'title', e.target.value)}
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
                        onChange={(e) => handleInputChange('why_choose_us', `item_${i}_title`, e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="form-label extra-small fw-bold">Feature {i} Description</label>
                      <textarea 
                        className="form-control form-control-sm" 
                        rows="2"
                        value={data.why_choose_us?.[`item_${i}_desc`] || ''}
                        onChange={(e) => handleInputChange('why_choose_us', `item_${i}_desc`, e.target.value)}
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
                  onChange={(e) => handleInputChange('services_header', 'title', e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Primary Description</label>
                <textarea 
                  className="form-control" 
                  rows="3"
                  value={data.services_header?.desc1 || ''}
                  onChange={(e) => handleInputChange('services_header', 'desc1', e.target.value)}
                ></textarea>
              </div>
              <div className="mb-4">
                <label className="form-label small fw-bold">Secondary Description</label>
                <textarea 
                  className="form-control" 
                  rows="3"
                  value={data.services_header?.desc2 || ''}
                  onChange={(e) => handleInputChange('services_header', 'desc2', e.target.value)}
                ></textarea>
              </div>
              <div className="bg-light p-3 rounded">
                <label className="form-label small fw-bold">Consultation Number</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={data.services_header?.phone || ''}
                  onChange={(e) => handleInputChange('services_header', 'phone', e.target.value)}
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
               <div className="position-relative overflow-hidden rounded border bg-light" style={{ height: '160px' }}>
                  <img 
                    src={data.newsletter?.bg_image} 
                    alt="Newsletter" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-25">
                    <label className="btn btn-light">
                      <i className="fa fa-camera me-2"></i> Choose Background Image
                      <input type="file" className="d-none" onChange={(e) => handleImageUpload('newsletter', 'bg_image', e.target.files[0])} />
                    </label>
                  </div>
                  {uploading === 'newsletter-bg_image' && <div className="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex align-items-center justify-content-center"><div className="spinner-border text-primary"></div></div>}
                </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .extra-small { font-size: 0.75rem; }
        .hover-opacity-100:hover { opacity: 1 !important; }
        .cursor-pointer { cursor: pointer; }
        .card { transition: transform 0.2s; }
        .card:hover { transform: translateY(-2px); }
        .form-control:focus { border-color: #f68b1f; box-shadow: 0 0 0 0.2rem rgba(246, 139, 31, 0.15); }
      `}</style>
    </AdminLayout>
  );
}
