import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { fetchApi, getImageUrl } from '@/app/api/client';
import { useLanguage } from '@/app/context/LanguageContext';
import { MapPin, Building2, HardHat, Wallet, Check, Phone, Facebook, Twitter, Instagram, ArrowRight, Calendar, Clock } from 'lucide-react';

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

interface LatestUpdate {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
}

interface UpcomingEvent {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  location?: string;
  description: string;
  project?: string;
}

export function Home() {
  const defaultHeroImages = [
    { src: '/img/hero-slider-1.jpg', alt: 'Modern Kitchen' },
    { src: '/img/hero-slider-2.jpg', alt: 'Luxury Living Room' },
    { src: '/img/hero-slider-3.jpg', alt: 'Elegant Bedroom' },
  ];

  const [heroImages, setHeroImages] = useState(defaultHeroImages);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [latestUpdates, setLatestUpdates] = useState<LatestUpdate[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const { t, dt, language } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cacheBuster = `t=${Date.now()}`;
        const [propRes, settingsRes, contentRes, updatesRes, eventsRes] = await Promise.all([
          fetchApi<any>(`/properties?limit=6&${cacheBuster}`),
          fetchApi<any[]>(`/settings/public?${cacheBuster}`),
          fetchApi<any[]>(`/content/public?section=hero&${cacheBuster}`),
          fetchApi<any>(`/updates?limit=3&${cacheBuster}`),
          fetchApi<any[]>(`/events?public=true&${cacheBuster}`)
        ]);

        setAllProperties(Array.isArray(propRes) ? propRes : (propRes.data || []));
        setLatestUpdates(Array.isArray(updatesRes) ? updatesRes : (updatesRes.data || []));
        setUpcomingEvents(eventsRes || []);

        const s: any = {};
        settingsRes.forEach(item => { s[item.key] = item.value; });
        setSettings(s);

        // Set hero images from content management
        if (contentRes && contentRes.length > 0) {
          const heroContent = contentRes.find(item => item.section === 'hero');
          if (heroContent && heroContent.images && heroContent.images.length > 0) {
            // Convert content images to hero images format
            const heroImagesFromContent = heroContent.images.map((img: string, index: number) => ({
              src: img,
              alt: heroContent.title || `Hero Image ${index + 1}`
            }));
            // Use content images if available, otherwise fallback to default
            setHeroImages(heroImagesFromContent.length > 0 ? heroImagesFromContent : heroImages);
          }
        }
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

  // Get hero content from settings or use defaults
  const heroContent = settings.hero_content ? JSON.parse(settings.hero_content) : null;
  const heroTitle = heroContent?.title || dt(settings.home_hero_title) || 'Building Your Future With Excellence';
  const heroSubtitle = heroContent?.subtitle || dt(settings.home_hero_subtitle) || 'Build Strong For The Next Generations';
  const homeAboutTitle = dt(settings.home_about_title) || 'Building Strong For The Next Generations';

  return (
    <div className="container-fluid bg-white p-0">
      {/* Hero Start */}
      <div className="container-fluid hero-header ps-0 pe-0 mb-5" style={{
        backgroundImage: `url(${getImageUrl(settings.home_hero_bg) || '/img/hero-bg.jpg'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '75vh',
        position: 'relative'
      }}>
        <div className="container-fluid h-100 d-flex flex-column justify-content-center hero-content-container" style={{ padding: '150px 50px 80px 50px' }}>
          <div className="row g-5 align-items-center flex-grow-1">
            <div className="col-lg-6 animated fadeIn" style={{ zIndex: 1 }}>
              <h1 className="display-1 mb-4 animated slideInRight">
                {heroTitle.split(' ').slice(0, 3).join(' ')} <br />
                <span className="text-primary" style={{ color: '#16a085' }}>{heroTitle.split(' ').slice(3).join(' ')}</span>
              </h1>
              <h5 className="d-inline-block border border-2 border-white py-3 px-5 mb-5 animated slideInRight uppercase">
                {heroSubtitle}
              </h5>
            </div>
            <div className="col-lg-6">
              <div className="position-relative d-flex align-items-center justify-content-end animated fadeIn">
                {/* Background Teal Block */}
                <div
                  className="bg-primary position-absolute d-none d-md-block"
                  style={{
                    width: '65%',
                    height: 'calc(100% + 80px)', // Height covers image plus 40px top and 40px bottom
                    right: '-30px',
                    top: '-40px', // Shifted up 40px to appear at the top of the image
                    zIndex: 0,
                    borderRadius: '2px',
                    background: '#16a085'
                  }}
                />

                {/* Mobile Teal Block (Subtle) */}
                <div
                  className="bg-primary position-absolute d-md-none"
                  style={{
                    width: '100%',
                    height: '100%',
                    right: '0',
                    top: '0',
                    zIndex: 0,
                    borderRadius: '2px',
                    background: '#16a085',
                    opacity: 0.05
                  }}
                />

                {/* Image Container with Slider */}
                <div className="position-relative z-index-1 w-100 hero-image-slider-wrapper">
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

      {/* Latest Updates Start - Container with clear spacing */}
      <div className="container-fluid py-5 bg-white shadow-sm" style={{ clear: 'both', position: 'relative', zIndex: 5 }}>
        <div className="container-fluid px-4 px-md-5">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <h1 className="mb-2">{t('latestUpdates').split(' ')[0]} <span className="text-uppercase text-primary bg-light px-2">{t('latestUpdates').split(' ')[1]}</span></h1>
              <p className="text-muted mb-0">{t('stayInformed')}</p>
            </div>
            <Link to="/updates" className="btn btn-outline-primary rounded-pill px-4 py-2 d-none d-md-flex align-items-center gap-2 font-bold text-xs uppercase transition-all hover:scale-105 active:scale-95">
              {t('viewAll')} <ArrowRight size={14} />
            </Link>
          </div>

          <div className="row g-4">
            {latestUpdates.map((update, index) => (
              <div key={update.id} className="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay={`${0.1 * (index + 1)}s`}>
                <div className="project-item position-relative overflow-hidden" style={{ height: '350px' }}>
                  <img
                    key={`update-${update.id}-${index}`}
                    className="img-fluid w-100 h-100 transition-transform duration-500 transform hover:scale-110"
                    src={getImageUrl(update.image) || `/img/project-${(index % 6) + 1}.jpg`}
                    alt={dt(update.title)}
                    style={{ objectFit: 'cover' }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes('/img/project-')) {
                        console.log(`Update image fail: ${update.title}`);
                        target.src = `/img/project-${(index % 6) + 1}.jpg`;
                        target.onerror = null;
                      }
                    }}
                  />
                  <Link to={`/updates/${update.id}`} className="project-overlay d-flex flex-column justify-content-end p-4 text-decoration-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
                    <div className="d-flex align-items-center gap-2 text-white-50 mb-2" style={{ fontSize: '11px' }}>
                      <Calendar size={12} className="text-primary" />
                      <span className="font-bold uppercase tracking-tight">
                        {new Date(update.date).toLocaleDateString(language === 'fr' ? 'fr-FR' : (language === 'rw' ? 'rw-RW' : 'en-US'), { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="badge bg-primary text-white text-[8px] px-2 py-0.5 rounded-pill uppercase ms-auto">
                        {update.category}
                      </span>
                    </div>
                    <h4 className="text-white mb-2 fw-bold line-clamp-2">{dt(update.title)}</h4>
                    <p className="text-white-50 small mb-0 line-clamp-2">
                      {dt(update.excerpt)}
                    </p>
                  </Link>
                </div>
              </div>
            ))}
            {latestUpdates.length === 0 && !isLoading && (
              <div className="col-12 text-center py-5 text-muted border rounded bg-light">
                {t('noUpdatesFound')}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Latest Updates End */}

      {/* Upcoming Events Start */}
      {upcomingEvents.length > 0 && (
        <div className="container-fluid py-5 bg-light">
          <div className="container-fluid px-4 px-md-5">
            <div className="d-flex justify-content-between align-items-end mb-4">
              <div>
                <h1 className="mb-2"><span className="text-uppercase text-primary bg-white px-2">{t('upcomingEvents').split(' ')[0]}</span> {t('upcomingEvents').split(' ').slice(1).join(' ')}</h1>
                <p className="text-muted mb-0">{t('joinOurEvents')}</p>
              </div>
            </div>
            <div className="row g-4 overflow-auto pb-4 flex-nowrap flex-md-wrap">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="col-11 col-md-6 col-lg-4 flex-shrink-0 flex-md-shrink-1">
                  <div className="bg-white p-4 rounded-xl shadow-sm border-start border-primary border-4 h-100 transition-all hover:shadow-lg hover:-translate-y-1">
                    <div className="d-flex gap-4">
                      <div className="bg-primary text-white p-3 rounded-xl text-center flex-shrink-0" style={{ minWidth: '70px', height: 'fit-content' }}>
                        <div className="h4 mb-0 fw-bold">{new Date(event.date).getDate()}</div>
                        <div className="text-[10px] text-uppercase font-bold opacity-80">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</div>
                      </div>
                      <div className="flex-fill">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <span className={`badge ${event.type === 'meeting' ? 'bg-blue-100 text-blue-600' :
                            event.type === 'inspection' ? 'bg-emerald-100 text-emerald-600' :
                              event.type === 'delivery' ? 'bg-green-100 text-green-600' :
                                'bg-red-100 text-red-600'
                            } text-[10px] uppercase font-bold px-2 py-1`}>
                            {event.type}
                          </span>
                          <span className="text-muted text-[10px] fw-bold d-flex align-items-center gap-1">
                            <Clock size={10} /> {event.time}
                          </span>
                        </div>
                        <h5 className="fw-bold mb-2 text-dark">{event.title}</h5>
                        <p className="text-muted small line-clamp-2 mb-3">{event.description}</p>
                        {event.location && (
                          <div className="d-flex align-items-center gap-2 text-muted text-[11px] mb-2">
                            <MapPin size={12} className="text-primary" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        {event.project && (
                          <div className="d-flex align-items-center gap-2 text-muted text-[11px]">
                            <Building2 size={12} className="text-primary" />
                            <span>{event.project}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Upcoming Events End */}
      {/* About Start */}
      <div className="container-fluid py-5">
        <div className="container-fluid px-4 px-md-5">
          <div className="row g-5">
            <div className="col-lg-6">
              <div className="row">
                <div className="col-6 wow fadeIn" data-wow-delay="0.1s">
                  <img className="img-fluid rounded shadow" src={getImageUrl(settings.about_image_1) || '/img/about-1.jpg'} alt="About 1" />
                </div>
                <div className="col-6 wow fadeIn" data-wow-delay="0.3s">
                  <img className="img-fluid h-75 rounded shadow mb-3" src={getImageUrl(settings.about_image_2) || '/img/about-2.jpg'} alt="About 2" />
                  <div className="h-25 d-flex align-items-center text-center bg-primary px-4 rounded shadow">
                    <h4 className="text-white lh-base mb-0 fw-bold">{t('buildingExcellenceSince2010')}</h4>
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
              <p className="text-white opacity-75 mb-0 fs-5">{t('expertSolutionsTailored')}</p>
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
                <h1 className="text-white mb-5">{t('featuredProperties').split(' ')[0]} <span className="text-uppercase text-primary bg-light px-2">{t('featuredProperties').split(' ')[1]}</span></h1>
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
                    { name: 'constructionProjects', count: '72 Projects', img: getImageUrl(settings.home_project_card_1) || '/img/project-1.jpg' },
                    { name: 'propertyDevelopment', count: '67 Projects', img: getImageUrl(settings.home_project_card_2) || '/img/project-2.jpg' },
                    { name: 'realEstateSales', count: '53 Projects', img: getImageUrl(settings.home_project_card_3) || '/img/project-3.jpg' },
                    { name: 'propertyRentals', count: '33 Projects', img: getImageUrl(settings.home_project_card_4) || '/img/project-4.jpg' },
                    { name: 'consultationServices', count: '87 Projects', img: getImageUrl(settings.home_project_card_5) || '/img/project-5.jpg' },
                    { name: 'projectManagement', count: '69 Projects', img: getImageUrl(settings.home_project_card_6) || '/img/project-6.jpg' }
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
                      <img
                        className="img-fluid w-100 h-100"
                        src={getImageUrl(property.image) || `/img/project-${(index % 6) + 1}.jpg`}
                        alt={dt(property.title)}
                        style={{ objectFit: 'cover' }}
                        onError={(e) => { (e.target as HTMLImageElement).src = `/img/project-${(index % 6) + 1}.jpg`; }}
                      />
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
                        <img className="img-fluid w-100 transition-transform duration-500 hover:scale-110" src={getImageUrl(settings.service_image_1) || '/img/service-1.jpg'} alt="Service 1" />
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
                        <img className="img-fluid w-100 transition-transform duration-500 hover:scale-110" src={getImageUrl(settings.service_image_2) || '/img/service-2.jpg'} alt="Service 2" />
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
              <img className="img-fluid w-100" src={getImageUrl(settings.global_newsletter_bg) || '/img/newsletter.jpg'} alt="Newsletter" />
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
