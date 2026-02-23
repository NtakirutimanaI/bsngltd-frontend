import { useState, useEffect } from 'react';
import { Phone, ArrowRight, RefreshCcw } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import { Link } from 'react-router';
import { fetchApi } from '@/app/api/client';

export function Services() {
  const { t, dt } = useLanguage();
  const [settings, setSettings] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  const [dynamicServices, setDynamicServices] = useState<any[]>([]);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    // Fetch settings
    fetchApi<any[]>('/settings/public')
      .then(data => {
        const s: any = {};
        data.forEach(item => { s[item.key] = item.value; });
        setSettings(s);
      })
      .catch(err => console.error('Failed to fetch settings', err));

    // Fetch services
    fetchApi<any[]>('/services/public')
      .then(data => {
        if (data && data.length > 0) {
          setDynamicServices(data);
        } else {
          setUseFallback(true);
        }
      })
      .catch(err => {
        console.error('Failed to fetch services', err);
        setUseFallback(true);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const fallbackServices = [
    {
      title: t('residentialConstruction'),
      description: t('residentialConstructionDesc'),
      img: '/img/service-1.jpg',
      delay: '0.1s',
      dark: true
    },
    {
      title: t('commercialConstruction'),
      description: t('commercialConstructionDesc'),
      img: '/img/service-2.jpg',
      delay: '0.2s',
      dark: false
    },
    {
      title: t('propertyDevelopment'),
      description: t('propertyDevelopmentDesc'),
      img: '/img/service-3.jpg',
      delay: '0.3s',
      dark: false
    },
    {
      title: t('renovationRemodeling'),
      description: t('renovationRemodelingDesc'),
      img: '/img/service-4.jpg',
      delay: '0.4s',
      dark: true
    }
  ];

  const displayServices = useFallback ? fallbackServices : dynamicServices.map(s => ({
    title: t(s.name) !== s.name ? t(s.name) : (s.title || s.name),
    description: t(s.name + 'Desc') !== (s.name + 'Desc') ? t(s.name + 'Desc') : s.description,
    img: s.image || '/img/service-1.jpg',
    delay: s.delay || '0.1s',
    dark: s.isDark
  }));

  if (isLoading) {
    return (
      <div className="container-fluid bg-white py-5 min-vh-100 d-flex align-items-center justify-content-center">
        <RefreshCcw className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const servicesTitle = dt(settings.services_title) || t('services');

  return (
    <div className="container-fluid bg-white p-0">
      {/* Page Header Start */}
      <div className="container-fluid page-header py-3 wow fadeIn" data-wow-delay="0.1s">
        <div className="container pt-3 pb-0">
          <nav aria-label="breadcrumb animated slideInDown">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item"><Link to="/" className="text-body">{t('home')}</Link></li>
              <li className="breadcrumb-item active text-primary" aria-current="page">{t('services')}</li>
            </ol>
          </nav>
        </div>
      </div>
      {/* Page Header End */}

      {/* Service Start */}
      <div className="container-fluid pt-3 pb-5">
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-5 wow fadeIn" data-wow-delay="0.1s">
              <h1 className="mb-5">{servicesTitle.split(' ').slice(0, 2).join(' ')} <span className="text-uppercase text-primary bg-light px-2">{servicesTitle.split(' ').slice(2).join(' ') || t('services')}</span></h1>
              <p className="mb-4">
                We provide a wide range of services to meet your development needs, from initial planning to final construction and property management.
              </p>
              <p className="mb-5">
                Our team of experts is dedicated to delivering excellence and innovation in every project, ensuring that your vision becomes a reality.
              </p>
              <div className="d-flex align-items-center bg-light rounded overflow-hidden">
                <div className="btn-square flex-shrink-0 bg-primary" style={{ width: '100px', height: '100px' }}>
                  <Phone className="text-white w-50 h-50" />
                </div>
                <div className="px-4">
                  <h3 className="mb-1">{dt(settings.services_contact_phone) || '+250 737 213 060'}</h3>
                  <span className="text-muted small text-nowrap">Call us direct 24/7 for a free consultation</span>
                </div>
              </div>
            </div>
            <div className="col-lg-7">
              <div className="row g-0">
                {displayServices.map((service, idx) => (
                  <div key={idx} className="col-md-6 wow fadeIn" data-wow-delay={service.delay}>
                    <div className={`service-item h-100 d-flex flex-column justify-content-center p-4 ${service.dark ? 'bg-primary text-white' : 'bg-light'}`}>
                      <div className="service-img position-relative mb-4">
                        <img className="img-fluid w-100 rounded shadow-sm" src={service.img} alt={service.title} />
                        <h3 className={`p-2 position-absolute top-0 start-0 ${service.dark ? 'bg-primary text-white' : 'bg-light text-dark'}`}>{service.title}</h3>
                      </div>
                      <p className={`mb-4 ${service.dark ? 'text-white' : 'text-muted'}`}>{service.description}</p>
                      <Link to="/contact" className={`mt-auto text-uppercase fw-bold text-decoration-none d-flex align-items-center gap-2 ${service.dark ? 'text-white' : 'text-primary'}`}>
                        {t('learnMore')} <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Service End */}

      {/* Newsletter Start */}
      <div className="container-fluid bg-primary newsletter p-0 my-5 wow fadeIn" data-wow-delay="0.1s">
        <div className="container p-0">
          <div className="row g-0 align-items-center">
            <div className="col-md-5 ps-lg-0 text-start">
              <img className="img-fluid w-100" src="/img/newsletter.jpg" alt="Newsletter" style={{ maxHeight: '400px', objectFit: 'cover' }} />
            </div>
            <div className="col-md-7 py-5 newsletter-text">
              <div className="p-5">
                <h1 className="mb-4 text-white">Ready to <span className="text-uppercase text-primary bg-white px-2">Build?</span></h1>
                <p className="text-white mb-5 fs-4 fw-bold">Contact us today to discuss your next project and get a free estimate.</p>
                <div className="d-flex flex-column flex-sm-row gap-3">
                  <Link to="/contact" className="btn btn-dark py-3 px-5">{t('getInTouch')}</Link>
                  <Link to="/properties" className="btn btn-outline-light py-3 px-5">{t('viewProperties')}</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Newsletter End */}
    </div>
  );
}
