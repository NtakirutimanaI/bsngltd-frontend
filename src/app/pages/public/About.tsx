import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useLanguage } from '@/app/context/LanguageContext';
import { Check, Facebook, Twitter, Instagram, Linkedin, Calendar, HardHat, ShieldCheck, RefreshCcw } from 'lucide-react';
import { fetchApi } from '@/app/api/client';

export function About() {
  const { t, dt } = useLanguage();
  const [settings, setSettings] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchApi<any[]>('/settings/public')
      .then(data => {
        const s: any = {};
        data.forEach(item => { s[item.key] = item.value; });
        setSettings(s);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="container-fluid bg-white py-5 min-vh-100 d-flex align-items-center justify-content-center">
        <RefreshCcw className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const aboutTitle = dt(settings.about_title) || t('about');

  return (
    <div className="container-fluid bg-white p-0">
      {/* Page Header Start */}
      <div className="container-fluid page-header py-3 wow fadeIn" data-wow-delay="0.1s">
        <div className="container pt-3 pb-0">
          <nav aria-label="breadcrumb animated slideInDown">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item"><Link to="/" className="text-body">{t('home')}</Link></li>
              <li className="breadcrumb-item active text-primary" aria-current="page">{aboutTitle}</li>
            </ol>
          </nav>
        </div>
      </div>
      {/* Page Header End */}

      {/* About Start */}
      <div className="container-fluid pt-3 pb-5">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-6">
              <div className="row">
                <div className="col-6 wow fadeIn" data-wow-delay="0.1s">
                  <img className="img-fluid" src="/img/about-1.jpg" alt="About" />
                </div>
                <div className="col-6 wow fadeIn" data-wow-delay="0.3s">
                  <img className="img-fluid h-75" src="/img/about-2.jpg" alt="About" />
                  <div className="h-25 d-flex align-items-center text-center bg-primary px-4">
                    <h4 className="text-white lh-base mb-0">Building Excellence Since 2010</h4>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 wow fadeIn" data-wow-delay="0.5s">
              <h1 className="mb-5">
                <span className="text-uppercase text-primary bg-light px-2">{aboutTitle.split(' ')[0]}</span> {aboutTitle.split(' ').slice(1).join(' ')}
              </h1>
              <div className="mb-4 text-muted " style={{ whiteSpace: 'pre-wrap' }}>
                {dt(settings.about_company_history) || t('aboutDesc')}
              </div>
              <p className="mb-5 fw-bold text-primary italic">
                {dt(settings.about_vision)}
              </p>
              <div className="row g-3">
                <div className="col-sm-6">
                  <h6 className="mb-3 d-flex align-items-center"><Check className="text-primary me-2 w-5 h-5" />Award Winning</h6>
                  <h6 className="mb-0 d-flex align-items-center"><Check className="text-primary me-2 w-5 h-5" />Professional Staff</h6>
                </div>
                <div className="col-sm-6">
                  <h6 className="mb-3 d-flex align-items-center"><Check className="text-primary me-2 w-5 h-5" />24/7 Support</h6>
                  <h6 className="mb-0 d-flex align-items-center"><Check className="text-primary me-2 w-5 h-5" />Fair Prices</h6>
                </div>
              </div>
              <div className="d-flex align-items-center mt-5">
                <a className="btn btn-outline-primary btn-square border-2 me-2" href="#!"><Facebook className="w-5 h-5" /></a>
                <a className="btn btn-outline-primary btn-square border-2 me-2" href="#!"><Twitter className="w-5 h-5" /></a>
                <a className="btn btn-outline-primary btn-square border-2 me-2" href="#!"><Instagram className="w-5 h-5" /></a>
                <a className="btn btn-outline-primary btn-square border-2" href="#!"><Linkedin className="w-5 h-5" /></a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* About End */}

      {/* Feature Start */}
      <div className="container-fluid py-5">
        <div className="container">
          <div className="text-center wow fadeIn" data-wow-delay="0.1s">
            <h1 className="mb-5">Why People <span className="text-uppercase text-primary bg-light px-2">Choose Us</span></h1>
          </div>
          <div className="row g-5 align-items-center text-center">
            <div className="col-md-6 col-lg-4 wow fadeIn" data-wow-delay="0.1s">
              <Calendar className="text-primary w-25 h-25 mb-4 mx-auto" strokeWidth={1} />
              <h4>15+ Years Experience</h4>
              <p className="mb-0 text-muted">Extensive experience in various construction projects across Rwanda and the region.</p>
            </div>
            <div className="col-md-6 col-lg-4 wow fadeIn" data-wow-delay="0.3s">
              <HardHat className="text-primary w-25 h-25 mb-4 mx-auto" strokeWidth={1} />
              <h4>Professional Construction</h4>
              <p className="mb-0 text-muted">Using the latest technologies and best practices to ensure structural integrity and beauty.</p>
            </div>
            <div className="col-md-6 col-lg-4 wow fadeIn" data-wow-delay="0.5s">
              <ShieldCheck className="text-primary w-25 h-25 mb-4 mx-auto" strokeWidth={1} />
              <h4>Guaranteed Quality</h4>
              <p className="mb-0 text-muted">We stand by our work and guarantee quality in every detail of the construction process.</p>
            </div>
          </div>
        </div>
      </div>
      {/* Feature End */}

      {/* Team Start */}
      {settings.about_team_visible === 'true' && (
        <div className="container-fluid bg-light py-5">
          <div className="container py-5">
            <h1 className="mb-5 text-center wow fadeIn" data-wow-delay="0.1s">
              Our Professional <span className="text-uppercase text-primary bg-light px-2">Team</span>
            </h1>
            <div className="row g-4">
              {[
                { name: 'N. Jean Pierre', role: 'Managing Director', img: '/img/team-1.jpg' },
                { name: 'M. Claudine', role: 'Senior Architect', img: '/img/team-2.jpg' },
                { name: 'K. Eric', role: 'Project Manager', img: '/img/team-3.jpg' },
                { name: 'S. Alice', role: 'Site Engineer', img: '/img/team-4.jpg' }
              ].map((member, idx) => (
                <div key={idx} className="col-md-6 col-lg-3 wow fadeIn" data-wow-delay={`${0.1 + idx * 0.2}s`}>
                  <div className="team-item position-relative overflow-hidden rounded shadow-sm">
                    <img className="img-fluid w-100" src={member.img} alt={member.name} />
                    <div className="team-overlay">
                      <small className="mb-2 text-uppercase fw-bold text-white" style={{ letterSpacing: '2px' }}>{member.role}</small>
                      <h4 className="lh-base text-white mb-3">{member.name}</h4>
                      <div className="d-flex justify-content-center">
                        <a className="btn btn-outline-light btn-sm-square border-2 me-2" href="#!"><Facebook className="w-4 h-4" /></a>
                        <a className="btn btn-outline-light btn-sm-square border-2 me-2" href="#!"><Twitter className="w-4 h-4" /></a>
                        <a className="btn btn-outline-light btn-sm-square border-2" href="#!"><Instagram className="w-4 h-4" /></a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Team End */}
    </div>
  );
}
