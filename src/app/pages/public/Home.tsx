import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/app/api/client';
import { useLanguage } from '@/app/context/LanguageContext';
import { MapPin, Building2, HardHat, Wallet, Check, Phone, Facebook, Twitter, Instagram } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  monthlyRent?: number;
  size: number;
  bedrooms?: number;
  bathrooms?: number;
  image: string;
  upi?: string;
  type: string;
  isForSale: boolean;
  isForRent: boolean;
  code: string;
  status: string;
}

export function Home() {
  const heroImages = [
    { src: '/img/hero-slider-1.jpg', alt: 'Modern Kitchen' },
    { src: '/img/hero-slider-2.jpg', alt: 'Luxury Living Room' },
    { src: '/img/hero-slider-3.jpg', alt: 'Elegant Bedroom' },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const { t, dt, language } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propRes, settingsRes] = await Promise.all([
          fetchApi<any>(`/properties?limit=6`),
          fetchApi<any[]>('/settings/public')
        ]);

        setAllProperties(propRes.data || []);

        const s: any = {};
        settingsRes.forEach(item => { s[item.key] = item.value; });
        setSettings(s);
      } catch (error) {
        console.error("Failed to fetch home data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatPrice = (price?: number) => {
    if (!price) return '';
    const locale = language === 'fr' ? 'fr-FR' : (language === 'rw' ? 'rw-RW' : 'en-US');
    return new Intl.NumberFormat(locale, { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(price);
  };

  const heroTitle = dt(settings.home_hero_title) || 'Building Your Future With Excellence';
  const heroSubtitle = dt(settings.home_hero_subtitle) || 'Build Strong For The Next Generations';
  const homeAboutTitle = dt(settings.home_about_title) || 'Building Strong Generations';

  return (
    <div className="container-fluid bg-white p-0">
      {/* Hero Start */}
      <div className="container-fluid hero-header ps-0 pe-0 mb-5" style={{
        backgroundImage: 'url(/img/hero-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '75vh',
        position: 'relative'
      }}>
        <div className="container-fluid h-100 d-flex flex-column justify-content-center" style={{ padding: '150px 50px 80px 50px' }}>
          <div className="row g-5 align-items-center flex-grow-1">
            <div className="col-lg-6 animated fadeIn" style={{ zIndex: 1 }}>
              <h1 className="display-1 mb-4 animated slideInRight">
                {heroTitle.split(' ').slice(0, 3).join(' ')} <br />
                <span className="text-primary">{heroTitle.split(' ').slice(3).join(' ')}</span>
              </h1>
              <h5 className="d-inline-block border border-2 border-white py-3 px-5 mb-5 animated slideInRight uppercase">
                {heroSubtitle}
              </h5>
            </div>
            <div className="col-lg-6">
              <div className="position-relative d-flex align-items-center justify-content-end animated fadeIn">
                {/* Background Teal Block */}
                <div
                  className="bg-primary position-absolute"
                  style={{
                    width: '65%',
                    height: 'calc(100% + 80px)', // Height covers image plus 40px top and 40px bottom
                    right: '-30px',
                    top: '-40px', // Shifted up 40px to appear at the top of the image
                    zIndex: 0,
                    borderRadius: '2px'
                  }}
                />

                {/* Image Container with Slider */}
                <div className="position-relative z-index-1 w-100" style={{ paddingRight: '12%', left: '-60px' }}>
                  <div className="overflow-hidden rounded shadow-lg" style={{ minHeight: '350px' }}>
                    {heroImages.map((image, index) => (
                      <img
                        key={index}
                        className={`img-fluid w-100 position-absolute top-0 start-0 h-100 transition-all duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                        src={image.src}
                        alt={image.alt}
                        style={{ objectFit: 'cover' }}
                      />
                    ))}
                    {/* Placeholder to maintain height */}
                    <img
                      className="img-fluid w-100 opacity-0"
                      src={heroImages[0].src}
                      alt="placeholder"
                      style={{ minHeight: '350px', objectFit: 'cover' }}
                    />
                  </div>
                </div>

                {/* Slider Indicators */}
                <div className="position-absolute d-flex flex-column gap-3" style={{ right: '6%', zIndex: 2 }}>
                  {heroImages.map((_, index) => (
                    <div
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className="cursor-pointer transition-all duration-300"
                      style={{
                        width: '12px',
                        height: index === currentSlide ? '30px' : '12px',
                        borderRadius: '1px',
                        backgroundColor: index === currentSlide ? 'white' : 'transparent',
                        border: '1px solid white'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Features Row - Restored as requested ("Keep everything") */}
          <div className="row g-4 mt-5 animated fadeIn" style={{ zIndex: 1 }}>
            <div className="col-md-6 col-lg-3">
              <div className="d-flex align-items-center bg-white p-3 rounded shadow-sm border-bottom border-primary border-3 h-100">
                <div className="flex-shrink-0 btn-square bg-primary me-3 rounded-circle">
                  <Building2 className="text-white w-5 h-5" />
                </div>
                <h5 className="mb-0 lh-base">{t('residentialConstruction')}</h5>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="d-flex align-items-center bg-white p-3 rounded shadow-sm border-bottom border-primary border-3 h-100">
                <div className="flex-shrink-0 btn-square bg-primary me-3 rounded-circle">
                  <Building2 className="text-white w-5 h-5" />
                </div>
                <h5 className="mb-0 lh-base">{t('commercialConstruction')}</h5>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="d-flex align-items-center bg-white p-3 rounded shadow-sm border-bottom border-primary border-3 h-100">
                <div className="flex-shrink-0 btn-square bg-primary me-3 rounded-circle">
                  <HardHat className="text-white w-5 h-5" />
                </div>
                <h5 className="mb-0 lh-base">{t('projectManagement')}</h5>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="d-flex align-items-center bg-white p-3 rounded shadow-sm border-bottom border-primary border-3 h-100">
                <div className="flex-shrink-0 btn-square bg-primary me-3 rounded-circle">
                  <Wallet className="text-white w-5 h-5" />
                </div>
                <h5 className="mb-0 lh-base">{t('fairPrices')}</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Hero End */}

      {/* About Start */}
      <div className="container-fluid py-5">
        <div className="container-fluid px-4 px-md-5">
          <div className="row g-5">
            <div className="col-lg-6">
              <div className="row">
                <div className="col-6 wow fadeIn" data-wow-delay="0.1s">
                  <img className="img-fluid rounded shadow" src="/img/about-1.jpg" alt="About 1" />
                </div>
                <div className="col-6 wow fadeIn" data-wow-delay="0.3s">
                  <img className="img-fluid h-75 rounded shadow mb-3" src="/img/about-2.jpg" alt="About 2" />
                  <div className="h-25 d-flex align-items-center text-center bg-primary px-4 rounded shadow">
                    <h4 className="text-white lh-base mb-0 fw-bold">Building Excellence Since 2010</h4>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 wow fadeIn" data-wow-delay="0.5s">
              <h1 className="mb-5"><span className="text-uppercase text-primary bg-light px-2">{homeAboutTitle.split(' ').slice(0, 1).join(' ')}</span> {homeAboutTitle.split(' ').slice(1).join(' ')}</h1>
              <p className="mb-4 text-muted fs-5">{t('ourStoryP1')}</p>
              <p className="mb-5 text-muted">{t('ourStoryP2')}</p>
              <div className="row g-3">
                <div className="col-sm-6">
                  <h6 className="mb-3 fw-bold d-flex align-items-center"><Check className="text-primary me-2 w-5 h-5" strokeWidth={3} />{t('categoryAwards')}</h6>
                  <h6 className="mb-0 fw-bold d-flex align-items-center"><Check className="text-primary me-2 w-5 h-5" strokeWidth={3} />{t('expertTeam')}</h6>
                </div>
                <div className="col-sm-6">
                  <h6 className="mb-3 fw-bold d-flex align-items-center"><Check className="text-primary me-2 w-5 h-5" strokeWidth={3} />{t('supportStaff')}</h6>
                  <h6 className="mb-0 fw-bold d-flex align-items-center"><Check className="text-primary me-2 w-5 h-5" strokeWidth={3} />{t('fairPrices')}</h6>
                </div>
              </div>
              <div className="d-flex align-items-center mt-5">
                <Link className="btn btn-primary px-5 py-3 rounded-pill shadow-lg me-4 fw-bold text-uppercase" to="/about" style={{ letterSpacing: '1px' }}>{t('readMore')}</Link>
                <div className="d-flex gap-3">
                  <a className="btn btn-outline-primary btn-square border-2 rounded-circle" href="#!"><Facebook size={18} /></a>
                  <a className="btn btn-outline-primary btn-square border-2 rounded-circle" href="#!"><Twitter size={18} /></a>
                  <a className="btn btn-outline-primary btn-square border-2 rounded-circle" href="#!"><Instagram size={18} /></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* About End */}

      {/* CTA Section Start */}
      <div className="container-fluid bg-primary py-5 mb-5 wow fadeInUp" data-wow-delay="0.1s">
        <div className="container py-5">
          <div className="row g-4 align-items-center">
            <div className="col-lg-8">
              <h2 className="display-5 text-white mb-2 fw-bold">{t('contactUsMessage')}</h2>
              <p className="text-white opacity-75 mb-0 fs-5">Expert solutions tailored to your specific construction and real estate needs.</p>
            </div>
            <div className="col-lg-4 text-center text-lg-end">
              <Link to="/contact" className="btn btn-light py-3 px-5 rounded-pill shadow-lg fw-bold text-uppercase me-3 mb-3">{t('getInTouch')}</Link>
              <a href={`tel:${dt(settings.contact_phone) || '+250737213060'}`} className="btn btn-outline-light py-3 px-5 rounded-pill fw-bold text-uppercase mb-3 d-inline-flex align-items-center justify-content-center border-2 gap-2">
                <Phone size={18} />
                {t('giveUsACall')}
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* CTA Section End */}

      {/* Properties Start */}
      <div className="container-fluid mt-5">
        <div className="container-fluid px-4 px-md-5 mt-5">
          <div className="row g-0">
            <div className="col-lg-5 wow fadeIn" data-wow-delay="0.1s">
              <div className="d-flex flex-column justify-content-center bg-primary h-100 p-5">
                <h1 className="text-white mb-5">{t('latestUpdates')} <span className="text-uppercase text-primary bg-light px-2">{t('properties')}</span></h1>
                <h4 className="text-white mb-0"><span className="display-1">{allProperties.length || 6}</span> {t('propertiesFound')}</h4>
              </div>
            </div>
            <div className="col-lg-7">
              <div className="row g-0 position-relative">
                {isLoading && (
                  <div className="p-5 text-center w-100 bg-light">{t('loading')}</div>
                )}
                {!isLoading && allProperties.length === 0 && (
                  // Fallback items with translations
                  [
                    { name: 'constructionProjects', count: '72 Projects', img: '/img/project-1.jpg' },
                    { name: 'propertyDevelopment', count: '67 Projects', img: '/img/project-2.jpg' },
                    { name: 'realEstateSales', count: '53 Projects', img: '/img/project-3.jpg' },
                    { name: 'propertyRentals', count: '33 Projects', img: '/img/project-4.jpg' },
                    { name: 'consultationServices', count: '87 Projects', img: '/img/project-5.jpg' },
                    { name: 'projectManagement', count: '69 Projects', img: '/img/project-6.jpg' }
                  ].map((item, index) => (
                    <div key={index} className="col-md-6 col-lg-4 wow fadeIn" data-wow-delay={`${0.1 * index}s`}>
                      <div className="project-item position-relative overflow-hidden" style={{ height: '300px' }}>
                        <img className="img-fluid w-100 h-100" src={item.img} alt={t(item.name)} style={{ objectFit: 'cover' }} />
                        <div className="project-overlay d-flex flex-column justify-content-end p-4 text-decoration-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                          <h4 className="text-white mb-1 fw-bold">{t(item.name)}</h4>
                          <small className="text-white-50">{item.count}</small>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {allProperties.map((property, index) => (
                  <div key={property.id} className="col-md-6 col-lg-4 wow fadeIn" data-wow-delay={`${0.2 + index * 0.1}s`}>
                    <div className="project-item position-relative overflow-hidden" style={{ height: '300px' }}>
                      <img className="img-fluid w-100 h-100" src={property.image || `/img/project-${(index % 6) + 1}.jpg`} alt={dt(property.title)} style={{ objectFit: 'cover' }} />
                      <Link className="project-overlay d-flex flex-column justify-content-end p-4 text-decoration-none" to={`/properties/${property.id}`} style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                        <h4 className="text-white mb-1 fw-bold">{dt(property.title)}</h4>
                        <small className="text-white-50 d-flex align-items-center gap-1">
                          <MapPin className="w-3 h-3" /> {dt(property.location)}
                        </small>
                        <div className="text-primary mt-2 fw-bold">
                          {property.isForRent ? `${formatPrice(property.monthlyRent)}/mo` : formatPrice(property.price)}
                        </div>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Properties End */}

      {/* Service Start */}
      {settings.home_services_visible !== 'false' && (
        <div className="container-fluid py-5">
          <div className="container-fluid px-4 px-md-5 py-5">
            <div className="row g-5 align-items-center">
              <div className="col-lg-5 wow fadeIn" data-wow-delay="0.1s">
                <h1 className="mb-5">{t('ourStory').split(' ')[0]} <span className="text-uppercase text-primary bg-light px-2">{t('services')}</span></h1>
                <p className="text-muted">{t('whyChooseUsSubtitle')}</p>
                <p className="mb-5 text-muted">{t('heroSubtitle')}</p>
                <div className="d-flex align-items-center bg-light">
                  <div className="btn-square flex-shrink-0 bg-primary" style={{ width: '100px', height: '100px' }}>
                    <Phone className="text-white" size={40} />
                  </div>
                  <div className="px-3">
                    <h3 className="mb-1">{dt(settings.contact_phone) || '+250 737 213 060'}</h3>
                    <span>{t('giveUsACall')}</span>
                  </div>
                </div>
              </div>
              <div className="col-lg-7">
                <div className="row g-4">
                  <div className="col-md-6 wow fadeIn" data-wow-delay="0.2s">
                    <div className="service-item h-100 d-flex flex-column justify-content-center bg-primary p-4 rounded shadow">
                      <div className="service-img position-relative mb-4 overflow-hidden rounded">
                        <img className="img-fluid w-100 transition-transform duration-500 hover:scale-110" src="/img/service-1.jpg" alt="Service 1" />
                        <div className="position-absolute bottom-0 start-0 p-3 bg-primary bg-opacity-75">
                          <h4 className="text-white mb-0">{t('residentialConstruction')}</h4>
                        </div>
                      </div>
                      <p className="text-white-50 mb-0">{t('residentialConstructionDesc')}</p>
                    </div>
                  </div>
                  <div className="col-md-6 wow fadeIn" data-wow-delay="0.4s">
                    <div className="service-item h-100 d-flex flex-column justify-content-center bg-light p-4 rounded shadow-sm border">
                      <div className="service-img position-relative mb-4 overflow-hidden rounded">
                        <img className="img-fluid w-100 transition-transform duration-500 hover:scale-110" src="/img/service-2.jpg" alt="Service 2" />
                        <div className="position-absolute bottom-0 start-0 p-3 bg-light bg-opacity-75 border">
                          <h4 className="text-dark mb-0">{t('commercialConstruction')}</h4>
                        </div>
                      </div>
                      <p className="text-muted mb-0">{t('commercialConstructionDesc')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Service End */}

      {/* Newsletter (CTA) Start */}
      <div className="container-fluid bg-primary newsletter p-0 mt-5">
        <div className="container p-0">
          <div className="row g-0 align-items-center">
            <div className="col-md-5 ps-lg-0 text-start wow fadeIn" data-wow-delay="0.2s">
              <img className="img-fluid w-100" src="/img/newsletter.jpg" alt="Newsletter" />
            </div>
            <div className="col-md-7 py-5 newsletter-text wow fadeIn" data-wow-delay="0.5s">
              <div className="p-5">
                <h1 className="mb-5 text-white">{t('readyToStart').split(' ').slice(0, 2).join(' ')} <span className="text-uppercase text-primary bg-white px-2">{t('readyToStart').split(' ').slice(2).join(' ')}</span></h1>
                <p className="text-white mb-5 fs-4 fw-bold">{t('contactUsMessage')}</p>
                <div className="d-flex gap-3">
                  <Link to="/contact" className="btn btn-light py-3 px-5 rounded-pill shadow-lg hover:animate-bounce uppercase fw-bold">{t('getInTouch')}</Link>
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
