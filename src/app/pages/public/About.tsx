import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useLanguage } from '@/app/context/LanguageContext';
import { Check, Facebook, Twitter, Instagram, Linkedin, Calendar, HardHat, ShieldCheck, RefreshCcw } from 'lucide-react';
import { fetchApi, getImageUrl } from '@/app/api/client';

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
                  <img className="img-fluid" src={getImageUrl(settings.about_image_1) || '/img/about-1.jpg'} alt="About 1" />
                </div>
                <div className="col-6 wow fadeIn" data-wow-delay="0.3s">
                  <img className="img-fluid h-75" src={getImageUrl(settings.about_image_2) || '/img/about-2.jpg'} alt="About 2" />
                  <div className="h-25 d-flex align-items-center text-center bg-primary px-4" style={{ background: '#16a085' }}>
                    <h4 className="text-white lh-base mb-0">{t('buildingExcellenceSince2010')}</h4>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 wow fadeIn" data-wow-delay="0.5s">
              <h1 className="mb-5">
                <span className="text-uppercase text-primary bg-light px-2" style={{ color: '#16a085' }}>{aboutTitle.split(' ')[0]}</span> {aboutTitle.split(' ').slice(1).join(' ')}
              </h1>
              <div className="mb-4 text-muted " style={{ whiteSpace: 'pre-wrap' }}>
                {dt(settings.about_company_history) || t('aboutDesc')}
              </div>
              <p className="mb-5 fw-bold text-primary italic" style={{ color: '#16a085' }}>
                {dt(settings.about_vision)}
              </p>
              <div className="row g-3">
                <div className="col-sm-6">
                  <h6 className="mb-3 d-flex align-items-center"><Check className="text-primary me-2 w-5 h-5" style={{ color: '#16a085' }} />{t('awardWinning')}</h6>
                  <h6 className="mb-0 d-flex align-items-center"><Check className="text-primary me-2 w-5 h-5" style={{ color: '#16a085' }} />{t('professionalStaff')}</h6>
                </div>
                <div className="col-sm-6">
                  <h6 className="mb-3 d-flex align-items-center"><Check className="text-primary me-2 w-5 h-5" style={{ color: '#16a085' }} />{t('support24_7')}</h6>
                  <h6 className="mb-0 d-flex align-items-center"><Check className="text-primary me-2 w-5 h-5" style={{ color: '#16a085' }} />{t('fairPrices')}</h6>
                </div>
              </div>
              <div className="d-flex align-items-center mt-5">
                <a className="btn btn-outline-primary btn-square border-2 me-2" href="#!" style={{ borderColor: '#16a085', color: '#16a085' }}><Facebook className="w-5 h-5" /></a>
                <a className="btn btn-outline-primary btn-square border-2 me-2" href="#!" style={{ borderColor: '#16a085', color: '#16a085' }}><Twitter className="w-5 h-5" /></a>
                <a className="btn btn-outline-primary btn-square border-2 me-2" href="#!" style={{ borderColor: '#16a085', color: '#16a085' }}><Instagram className="w-5 h-5" /></a>
                <a className="btn btn-outline-primary btn-square border-2" href="#!" style={{ borderColor: '#16a085', color: '#16a085' }}><Linkedin className="w-5 h-5" /></a>
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
            <h1 className="mb-5">{t('whyPeople')} <span className="text-uppercase text-primary bg-light px-2" style={{ color: '#16a085' }}>{t('chooseUs')}</span></h1>
          </div>
          <div className="row g-5 align-items-center text-center">
            <div className="col-md-6 col-lg-4 wow fadeIn" data-wow-delay="0.1s">
              <Calendar className="text-primary w-25 h-25 mb-4 mx-auto" style={{ color: '#16a085' }} strokeWidth={1} />
              <h4>{t('yearsExperience15')}</h4>
              <p className="mb-0 text-muted">{t('yearsExperienceDesc')}</p>
            </div>
            <div className="col-md-6 col-lg-4 wow fadeIn" data-wow-delay="0.3s">
              <HardHat className="text-primary w-25 h-25 mb-4 mx-auto" style={{ color: '#16a085' }} strokeWidth={1} />
              <h4>{t('professionalConstruction')}</h4>
              <p className="mb-0 text-muted">{t('professionalConstructionDesc2')}</p>
            </div>
            <div className="col-md-6 col-lg-4 wow fadeIn" data-wow-delay="0.5s">
              <ShieldCheck className="text-primary w-25 h-25 mb-4 mx-auto" style={{ color: '#16a085' }} strokeWidth={1} />
              <h4>{t('guaranteedQuality')}</h4>
              <p className="mb-0 text-muted">{t('guaranteedQualityDesc')}</p>
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
              {t('ourProfessional')} <span className="text-uppercase text-primary bg-light px-2" style={{ color: '#16a085' }}>{t('team')}</span>
            </h1>
            <div className="row g-4">
              {[
                { name: 'N. Jean Pierre', role: 'Managing Director', img: getImageUrl(settings.about_team_1) || '/img/team-1.jpg' },
                { name: 'M. Claudine', role: 'Senior Architect', img: getImageUrl(settings.about_team_2) || '/img/team-2.jpg' },
                { name: 'K. Eric', role: 'Project Manager', img: getImageUrl(settings.about_team_3) || '/img/team-3.jpg' },
                { name: 'S. Alice', role: 'Site Engineer', img: getImageUrl(settings.about_team_4) || '/img/team-4.jpg' }
              ].map((member, idx) => (
                <div key={idx} className="col-md-6 col-lg-3 wow fadeIn" data-wow-delay={`${0.1 + idx * 0.2}s`}>
                  <div className="team-item position-relative overflow-hidden rounded shadow-sm">
                    <img className="img-fluid w-100" src={member.img} alt={member.name} />
                    <div className="team-overlay">
                      <small className="mb-2 text-uppercase fw-bold text-white" style={{ letterSpacing: '2px', color: '#16a085' }}>{member.role}</small>
                      <h4 className="lh-base text-white mb-3" style={{ color: '#16a085' }}>{member.name}</h4>
                      <div className="d-flex justify-content-center">
                        <a className="btn btn-outline-light btn-sm-square border-2 me-2" href="#!" style={{ borderColor: '#16a085', color: '#16a085' }}><Facebook className="w-4 h-4" /></a>
                        <a className="btn btn-outline-light btn-sm-square border-2 me-2" href="#!" style={{ borderColor: '#16a085', color: '#16a085' }}><Twitter className="w-4 h-4" /></a>
                        <a className="btn btn-outline-light btn-sm-square border-2" href="#!" style={{ borderColor: '#16a085', color: '#16a085' }}><Instagram className="w-4 h-4" /></a>
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
