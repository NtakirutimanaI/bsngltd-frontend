import { useState, useEffect } from 'react';
import { fetchApi, getImageUrl } from '@/app/api/client';
import { useParams, useNavigate, Link } from 'react-router';
import { MapPin, Bed, Bath, Square, Calendar, Check, ArrowLeft, CreditCard, Coins, Phone, Eye } from 'lucide-react';
import { PaymentFloatingForm } from '@/app/components/PaymentFloatingForm';
import { BookingFloatingForm } from '@/app/components/BookingFloatingForm';
import { useAuth } from '@/app/context/AuthContext';
import { useLanguage } from '@/app/context/LanguageContext';
import { useCurrency } from '@/app/context/CurrencyContext';

interface Property {
  id: string;
  title: string;
  type: 'sale' | 'rent';
  price: string;
  priceValue: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  sqft: string;
  description: string;
  features: string[];
  images: string[];
  yearBuilt?: number;
  parking?: string;
}


export function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t, dt, language } = useLanguage();
  const { formatPrice, currency, setCurrency } = useCurrency();

  const [property, setProperty] = useState<Property | null>(null);
  const [isPaymentFloatingOpen, setIsPaymentFloatingOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // State handles

  useEffect(() => {
    if (!id) return;
    setCurrency('RWF'); // Default to RWF as usually returned from DB

    interface ApiProperty {
      id: string;
      title: string;
      type: string;
      location: string;
      size: number;
      price: number;
      monthlyRent?: number;
      isForSale: boolean;
      isForRent: boolean;
      bedrooms?: number;
      bathrooms?: number;
      image: string;
      image2?: string;
      image3?: string;
      description?: string;
    }

    fetchApi<ApiProperty>(`/properties/${id}`)
      .then(p => {
        const mappedProperty: Property = {
          id: p.id,
          title: dt(p.title),
          type: p.isForSale ? 'sale' : 'rent',
          price: (language === 'en' ? 'RWF ' : '') + new Intl.NumberFormat(language === 'fr' ? 'fr-FR' : (language === 'rw' ? 'rw-RW' : 'en-US'), { style: 'decimal', maximumFractionDigits: 0 }).format(p.isForSale ? Number(p.price) : Number(p.monthlyRent || 0)) + (p.isForSale ? '' : t('perMonth')),
          priceValue: Number(p.isForSale ? p.price : (p.monthlyRent || 0)),
          location: dt(p.location),
          bedrooms: p.bedrooms || 0,
          bathrooms: p.bathrooms || 0,
          sqft: p.size?.toString() || '0',
          description: dt(p.description) || `${dt(p.title)} located in ${dt(p.location)}.`,
          features: [t('modernAmenities'), t('secureLocation'), t('parkingAvailable')],
          images: [
            getImageUrl(p.image) || '/img/project-1.jpg',
            getImageUrl(p.image2) || getImageUrl(p.image) || '/img/project-2.jpg',
            getImageUrl(p.image3) || getImageUrl(p.image) || '/img/project-3.jpg'
          ],
          yearBuilt: 2024,
          parking: 'Available'
        };
        setProperty(mappedProperty);
      })
      .catch(err => {
        console.error("Failed to fetch property details", err);
        setProperty(null);
      });
  }, [id, language]);

  const handleProceedToPayment = () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      navigate('/login', { state: { returnUrl: `/properties/${id}` } });
      return;
    }
    setIsPaymentFloatingOpen(true);
  };

  if (!property) {
    return (
      <div className="container-xxl bg-white p-0">
        <div className="container-fluid py-5 text-center">
          <div className="container py-5">
            <h1 className="display-1">{t('noPropertiesFound')}</h1>
            <button onClick={() => navigate('/properties')} className="btn btn-primary px-5 py-3 mt-4">
              <ArrowLeft className="w-5 h-5 me-2" />
              {t('backToProperties')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid bg-white p-0">
      {/* Page Header Start */}
      <div className="container-fluid page-header py-3 wow fadeIn" data-wow-delay="0.1s">
        <div className="container py-3">
          <nav aria-label="breadcrumb animated slideInDown">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item"><Link to="/" className="text-body">{t('home')}</Link></li>
              <li className="breadcrumb-item"><Link to="/properties" className="text-body">{t('properties')}</Link></li>
              <li className="breadcrumb-item active text-primary" aria-current="page">{property.title}</li>
            </ol>
          </nav>
        </div>
      </div>
      {/* Page Header End */}

      <div className="container-fluid py-5">
        <div className="container py-5">
          <div className="row g-5">
            <div className="col-lg-8">
              {/* Property Image Gallery */}
              <div className="row g-3 mb-5">
                <div className="col-12 wow fadeIn" data-wow-delay="0.1s">
                  <img className="img-fluid w-100 rounded" src={property.images[0]} alt={property.title} style={{ height: '450px', objectFit: 'cover' }} />
                </div>
                {property.images.slice(1, 3).map((img, idx) => (
                  <div key={idx} className="col-6 wow fadeIn" data-wow-delay={`${0.1 * (idx + 2)}s`}>
                    <img className="img-fluid w-100 rounded" src={img} alt={`${property.title} ${idx + 2}`} style={{ height: '220px', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>

              {/* Property Info */}
              <div className="wow fadeIn" data-wow-delay="0.1s">
                <div className="d-flex align-items-center mb-4">
                  <span className={`badge ${property.type === 'sale' ? 'bg-success' : 'bg-primary'} px-3 py-2 text-uppercase me-3`}>
                    {property.type === 'sale' ? t('forSale') : t('forRent')}
                  </span>
                  <div className="d-flex align-items-center text-muted">
                    <MapPin className="text-primary w-5 h-5 me-2" />
                    <span>{property.location}</span>
                  </div>
                </div>
                <h1 className="mb-4">{property.title}</h1>
                <h2 className="text-primary mb-5">
                  {formatPrice(property.priceValue)}
                  {property.type === 'rent' && <span className="text-muted fs-5 fw-normal">{t('perMonth')}</span>}
                </h2>

                {/* Stats Grid */}
                <div className="row g-4 mb-5 p-4 bg-light rounded">
                  {property.bedrooms > 0 && (
                    <div className="col-6 col-md-3 text-center border-end">
                      <Bed className="text-primary w-8 h-8 mb-2" />
                      <h4 className="mb-0">{property.bedrooms}</h4>
                      <small className="text-muted text-uppercase">{t('bedrooms')}</small>
                    </div>
                  )}
                  <div className="col-6 col-md-3 text-center border-end">
                    <Bath className="text-primary w-8 h-8 mb-2" />
                    <h4 className="mb-0">{property.bathrooms}</h4>
                    <small className="text-muted text-uppercase">{t('bathrooms')}</small>
                  </div>
                  <div className="col-6 col-md-3 text-center border-end">
                    <Square className="text-primary w-8 h-8 mb-2" />
                    <h4 className="mb-0">{property.sqft}</h4>
                    <small className="text-muted text-uppercase">{t('sqft')}</small>
                  </div>
                  <div className="col-6 col-md-3 text-center">
                    <Calendar className="text-primary w-8 h-8 mb-2" />
                    <h4 className="mb-0">{property.yearBuilt}</h4>
                    <small className="text-muted text-uppercase">{t('yearBuilt')}</small>
                  </div>
                </div>

                <div className="mb-5">
                  <h3 className="mb-4">{t('description')}</h3>
                  <p className="text-muted mb-0 lh-lg">{property.description}</p>
                </div>

                <div className="mb-5">
                  <h3 className="mb-4">{t('featuresAmenities')}</h3>
                  <div className="row g-3">
                    {property.features.map((feature, idx) => (
                      <div key={idx} className="col-md-6 col-lg-4">
                        <div className="d-flex align-items-center p-3 border rounded h-100">
                          <Check className="text-primary w-5 h-5 me-3" />
                          <span className="fw-medium">{feature}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-lg-4">
              <div className="sticky-top" style={{ top: '100px' }}>
                <div className="bg-light p-4 rounded mb-4 wow fadeIn" data-wow-delay="0.1s">
                  <h4 className="mb-4">{property.type === 'sale' ? t('purchaseThisProperty') : t('rentThisProperty')}</h4>
                  <div className="p-4 bg-white rounded mb-4 text-center shadow-sm">
                    <div className="text-muted small mb-1">{property.type === 'sale' ? t('totalPrice') : t('monthlyRent')}</div>
                    <h4 className="text-primary mb-3 fw-bold">
                      {formatPrice(property.priceValue)}
                      {property.type === 'rent' && <span className="text-muted fs-6 fw-normal ms-1">{t('perMonth')}</span>}
                    </h4>
                    <button onClick={() => setCurrency(currency === 'USD' ? 'RWF' : 'USD')} className="btn btn-outline-primary btn-sm rounded-pill px-3 py-1" style={{ fontSize: '11px' }}>
                      <Coins size={12} className="me-1" /> {t('switchCurrency')}
                    </button>
                  </div>
                  <button onClick={handleProceedToPayment} className="btn btn-primary w-100 py-3 mb-3 d-flex align-items-center justify-content-center">
                    <CreditCard className="w-5 h-5 me-2" />
                    {isAuthenticated ? t('payNow') : t('loginToPay')}
                  </button>
                  {!isAuthenticated && <p className="text-muted small text-center mb-0">{t('loginToPayMessage')}</p>}
                </div>

                <div className="bg-light p-4 rounded wow fadeIn" data-wow-delay="0.3s">
                  <h4 className="mb-4">{t('contactAgent')}</h4>
                  <div className="d-flex align-items-center mb-3">
                    <div className="btn-square bg-primary flex-shrink-0" style={{ width: '50px', height: '50px' }}>
                      <Phone className="text-white w-5 h-5" />
                    </div>
                    <div className="ms-3">
                      <h5 className="mb-1">+250 737 213 060</h5>
                      <p className="mb-0 small text-muted">{t('consultation24_7')}</p>
                    </div>
                  </div>
                  <Link to="/contact" className="btn btn-outline-primary w-100 py-3 mt-3">{t('getInTouch')}</Link>
                  <button onClick={() => setIsBookingOpen(true)} className="btn btn-outline-success w-100 py-3 mt-2 d-flex align-items-center justify-content-center gap-2">
                    <Eye size={18} />
                    {t('bookViewing') || 'Book Viewing'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Floating Form */}
      {isPaymentFloatingOpen && property && (
        <PaymentFloatingForm
          propertyId={property.id}
          propertyTitle={property.title}
          propertyType={property.type}
          amount={property.priceValue}
          onClose={() => setIsPaymentFloatingOpen(false)}
        />
      )}

      {/* Booking Floating Form */}
      {isBookingOpen && property && (
        <BookingFloatingForm
          propertyId={property.id}
          propertyTitle={property.title}
          onClose={() => setIsBookingOpen(false)}
        />
      )}
    </div>
  );
}
