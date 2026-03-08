import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Clock, Send, RefreshCcw, Users, MessageCircle } from 'lucide-react';
import { fetchApi } from '@/app/api/client';
import { useLanguage } from '@/app/context/LanguageContext';
import { Link, useLocation } from 'react-router';

export function Contact() {
  const { t, dt } = useLanguage();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const [settings, setSettings] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchApi<any[]>('/settings/public')
      .then(data => {
        const s: any = {};
        data.forEach(item => { s[item.key] = item.value; });
        setSettings(s);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    fetchApi('/messages/contact', {
      method: 'POST',
      body: JSON.stringify(formData),
    })
      .then(() => {
        setIsSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => {
          setIsSubmitted(false);
        }, 3000);
      })
      .catch(err => {
        console.error("Failed to send message", err);
        alert("Failed to send message. Please try again later.");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (isLoading) {
    return (
      <div className="container-fluid bg-white py-5 min-vh-100 d-flex align-items-center justify-content-center">
        <RefreshCcw className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="container-fluid bg-white p-0">
      {/* Page Header Start */}
      {!isDashboard && (
        <div className="container-fluid page-header py-3 wow fadeIn" data-wow-delay="0.1s">
          <div className="container pt-3 pb-0">
            <nav aria-label="breadcrumb animated slideInDown">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><Link to="/" className="text-body">{t('home')}</Link></li>
                <li className="breadcrumb-item active text-primary" aria-current="page">{t('contact')}</li>
              </ol>
            </nav>
          </div>
        </div>
      )}
      {/* Page Header End */}

      {/* Contact Start */}
      <div className="container-fluid pt-3 pb-5">
        <div className="container">
          <div className="text-center wow fadeIn" data-wow-delay="0.1s">
            <h1 className="mb-5">{t('haveAnyQuery')} <span className="text-uppercase text-primary bg-light px-2">{t('contactUs')}</span></h1>
          </div>
          <div className="row g-5">
            <div className="col-lg-5 wow fadeIn" data-wow-delay="0.1s">
              <p className="mb-5 lead">
                {t('contactUsMessage')}
              </p>
              <div className="d-flex align-items-center mb-4 p-3 p-md-4 bg-light rounded wow fadeIn" data-wow-delay="0.2s">
                <div className="btn-square bg-primary flex-shrink-0" style={{ width: '60px', height: '60px' }}>
                  <Phone className="text-white w-6 h-6" />
                </div>
                <div className="ms-4">
                  <h5 className="mb-1">{t('phone')}</h5>
                  <p className="mb-0 fw-bold">{dt(settings.contact_phone) || '+250 737 213 060'}</p>
                </div>
              </div>
              <div className="d-flex align-items-center mb-4 p-3 p-md-4 bg-light rounded wow fadeIn" data-wow-delay="0.3s">
                <div className="btn-square bg-primary flex-shrink-0" style={{ width: '60px', height: '60px', background: '#16a085' }}>
                  <Mail className="text-white w-6 h-6" />
                </div>
                <div className="ms-4">
                  <h5 className="mb-1">{t('email')}</h5>
                  <p className="mb-0 fw-bold">{dt(settings.contact_email) || 'info@bsng.rw'}</p>
                </div>
              </div>
              <div className="d-flex align-items-center mb-4 p-3 p-md-4 bg-light rounded wow fadeIn" data-wow-delay="0.4s">
                <div className="btn-square bg-primary flex-shrink-0" style={{ width: '60px', height: '60px' }}>
                  <MapPin className="text-white w-6 h-6" />
                </div>
                <div className="ms-4">
                  <h5 className="mb-1">{t('visitOurOffice')}</h5>
                  <p className="mb-0 fw-bold">{dt(settings.contact_address) || 'Rwanda / Kigali / Kibagabaga'}</p>
                </div>
              </div>
              <div className="d-flex align-items-center p-3 p-md-4 bg-light rounded wow fadeIn" data-wow-delay="0.5s">
                <div className="btn-square bg-primary flex-shrink-0" style={{ width: '60px', height: '60px', background: '#25D366' }}>
                  <MessageCircle className="text-white w-6 h-6" />
                </div>
                <div className="ms-4">
                  <h5 className="mb-1">WhatsApp Chat</h5>
                  <p className="mb-0 fw-bold">
                    <a href={`https://wa.me/${(dt(settings.contact_phone) || '+250737213060').replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', textDecoration: 'none' }}>
                      {t('chatWithUs')}
                    </a>
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-7 wow fadeIn" data-wow-delay="0.3s">
              {isSubmitted && (
                <div className="alert alert-success border-0 shadow-sm mb-4 wow fadeIn">
                  <div className="d-flex align-items-center">
                    <Send className="w-5 h-5 me-2" />
                    <span>{t('contactSuccess')}</span>
                  </div>
                </div>
              )}
              <div className="bg-white p-4 p-md-5 rounded shadow-sm wow fadeIn">
                <form onSubmit={handleSubmit}>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '11px' }}>{t('fullName')}</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0"><Users size={16} className="text-primary" style={{ color: '#16a085' }} /></span>
                        <input
                          type="text"
                          className="form-control border-start-0 ps-0"
                          id="name"
                          name="name"
                          placeholder={t('yourName')}
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '11px' }}>{t('emailAddress')}</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0"><Mail size={16} className="text-primary" /></span>
                        <input
                          type="email"
                          className="form-control border-start-0 ps-0"
                          id="email"
                          name="email"
                          placeholder={t('yourEmail')}
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '11px' }}>{t('subject')}</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0"><Send size={16} className="text-primary" /></span>
                        <input
                          type="text"
                          className="form-control border-start-0 ps-0"
                          id="subject"
                          name="subject"
                          placeholder={t('whatIsThisAbout')}
                          value={formData.subject}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '11px' }}>{t('message')}</label>
                      <textarea
                        className="form-control"
                        placeholder={t('detailYourInquiry')}
                        id="message"
                        name="message"
                        style={{ height: '150px' }}
                        value={formData.message}
                        onChange={handleChange}
                        required
                      ></textarea>
                    </div>
                    <div className="col-12 mt-4">
                      <button
                        className="btn btn-primary w-100 py-3 d-flex align-items-center justify-content-center gap-2 fw-bold text-uppercase shadow-sm"
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <><span className="spinner-border spinner-border-sm"></span> {t('loading')}...</>
                        ) : (
                          <><Send className="w-5 h-5" /> {t('submitRequest')}</>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Contact End */}

      {/* Map Section */}
      <div className="container-fluid bg-light overflow-hidden px-0 wow fadeIn" data-wow-delay="0.1s">
        <div className="row g-0">
          <div className="col-lg-12">
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(settings.contact_address || "Kibagabaga, Kigali, Rwanda")}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
              width="100%"
              height="500"
              style={{ border: 0, filter: 'grayscale(100%) contrast(1.2) opacity(0.8)' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}





