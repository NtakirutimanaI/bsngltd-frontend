import { useState, useEffect } from 'react';
import { fetchApi } from '@/app/api/client';
import { Link } from 'react-router';
import { Search, Bed, Bath, Square } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import { BookingFloatingForm } from '@/app/components/BookingFloatingForm';
import { useDebounce } from '@/app/hooks/useDebounce';

interface Property {
  id: string;
  title: string;
  type: 'sale' | 'rent';
  price: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  sqft: string;
  description: string;
  features: string[];
  image: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  lastPage: number;
}

export function PublicProperties() {
  const { t, dt, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [filterType, setFilterType] = useState<'all' | 'sale' | 'rent'>('all');
  const [properties, setProperties] = useState<Property[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isBookingFloatingOpen, setIsBookingFloatingOpen] = useState(false);

  const formatPrice = (price?: number) => {
    if (!price) return '';
    const locale = language === 'fr' ? 'fr-FR' : (language === 'rw' ? 'rw-RW' : 'en-US');
    return new Intl.NumberFormat(locale, { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(price);
  };

  useEffect(() => {
    setIsLoading(true);
    const params: any = {
      page: currentPage.toString(),
      limit: '9',
      search: debouncedSearchTerm,
    };

    if (filterType === 'sale') params.isForSale = 'true';
    if (filterType === 'rent') params.isForRent = 'true';

    const query = new URLSearchParams(params).toString();

    fetchApi<PaginatedResponse<any>>(`/properties?${query}`)
      .then(res => {
        const mappedProperties: Property[] = res.data.map(p => ({
          id: p.id,
          title: dt(p.title),
          type: filterType === 'rent' ? 'rent' : (filterType === 'sale' ? 'sale' : (p.isForSale ? 'sale' : 'rent')),
          price: p.isForSale
            ? formatPrice(p.price)
            : formatPrice(p.monthlyRent || 0) + t('perMonth'),
          location: dt(p.location),
          bedrooms: p.bedrooms || 0,
          bathrooms: p.bathrooms || 0,
          sqft: p.size.toString(),
          description: dt(p.description) || `${dt(p.title)} located in ${dt(p.location)}.`,
          features: [t('modernAmenities'), t('secureLocation'), t('parkingAvailable')],
          image: p.image || '/img/project-1.jpg'
        }));
        setProperties(mappedProperties);
        setTotalPages(res.lastPage);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch public properties", err);
        setIsLoading(false);
      });
  }, [currentPage, debouncedSearchTerm, filterType, language]);

  const handleBooking = (property: Property) => {
    setSelectedProperty(property);
    setIsBookingFloatingOpen(true);
  };


  return (
    <div className="container-fluid bg-white p-0">
      {/* Page Header Start */}
      <div className="container-fluid page-header py-3 wow fadeIn" data-wow-delay="0.1s">
        <div className="container pt-3 pb-0">
          <nav aria-label="breadcrumb animated slideInDown">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item"><Link to="/" className="text-body">{t('home')}</Link></li>
              <li className="breadcrumb-item active text-primary" aria-current="page">{t('properties')}</li>
            </ol>
          </nav>
        </div>
      </div>
      {/* Page Header End */}

      {/* Search & Filter Start */}
      <div className="container-fluid pt-3 pb-5">
        <div className="container">
          <div className="row g-4 align-items-center mb-5">
            <div className="col-lg-6 wow fadeIn" data-wow-delay="0.1s">
              <h1 className="mb-0">{t('findYourDreamProperty').split(' ').slice(0, 2).join(' ')} <span className="text-uppercase text-primary bg-light px-2">{t('dreamProperty')}</span></h1>
            </div>
            <div className="col-lg-6 wow fadeIn" data-wow-delay="0.3s">
              <div className="nav nav-pills justify-content-lg-end">
                <button
                  onClick={() => { setFilterType('all'); setCurrentPage(1); }}
                  className={`nav-link rounded-pill px-4 me-2 ${filterType === 'all' ? 'active bg-primary' : 'bg-light text-dark'}`}
                  style={{ transition: 'all 0.3s ease' }}
                >
                  {t('all')}
                </button>
                <button
                  onClick={() => { setFilterType('sale'); setCurrentPage(1); }}
                  className={`nav-link rounded-pill px-4 me-2 ${filterType === 'sale' ? 'active bg-primary' : 'bg-light text-dark'}`}
                  style={{ transition: 'all 0.3s ease' }}
                >
                  {t('forSale')}
                </button>
                <button
                  onClick={() => { setFilterType('rent'); setCurrentPage(1); }}
                  className={`nav-link rounded-pill px-4 ${filterType === 'rent' ? 'active bg-primary' : 'bg-light text-dark'}`}
                  style={{ transition: 'all 0.3s ease' }}
                >
                  {t('forRent')}
                </button>
              </div>
            </div>
            <div className="col-12 wow fadeIn" data-wow-delay="0.5s">
              <div className="position-relative w-100">
                <input
                  className="form-control border-0 w-100 ps-4 pe-5"
                  type="text"
                  placeholder={t('searchByLocation')}
                  style={{ height: '60px', background: '#f8f9fa' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="button" className="btn shadow-none position-absolute top-0 end-0 mt-2 me-2">
                  <Search className="text-primary fs-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="row g-4 mb-5 wow fadeIn" data-wow-delay="0.1s">
            <div className="col-12 d-flex align-items-center justify-content-between border-bottom pb-3">
              <div>
                <h3 className="mb-0 text-primary">
                  {filterType === 'all' && t('availableProperties')}
                  {filterType === 'sale' && t('forSale')}
                  {filterType === 'rent' && t('forRent')}
                </h3>
                <p className="text-muted small mb-0 mt-1">
                  {isLoading ? t('loading') : `${properties.length} ${t('propertiesFound')}`}
                </p>
              </div>
              <div className="d-none d-md-block">
                <span className="badge bg-light text-primary border px-3 py-2">
                  {t('availableCollection')}
                </span>
              </div>
            </div>
          </div>

          {/* Property Grid Start */}
          <div className="row g-4 position-relative">
            {isLoading && (
              <div className="position-absolute top-50 start-50 translate-middle" style={{ zIndex: 10 }}>
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}
            {properties.map((property, index) => (
              <div key={property.id} className="col-md-6 col-lg-4 wow fadeIn" data-wow-delay={`${0.1 * (index + 1)}s`}>
                <div className="project-item position-relative overflow-hidden mb-4">
                  <img className="img-fluid w-100" src={property.image} alt={property.title} style={{ height: '250px', objectFit: 'cover' }} />
                  <div className="project-overlay text-decoration-none">
                    <h4 className="text-white mb-1">{property.title}</h4>
                    <small className="text-white">{property.location}</small>
                    <div className="mt-3">
                      <Link to={`/properties/${property.id}`} className="btn btn-light btn-sm me-2">{t('viewDetails')}</Link>
                      <button onClick={() => handleBooking(property)} className="btn btn-primary btn-sm">{t('bookViewing')}</button>
                    </div>
                  </div>
                  <div className="position-absolute top-0 start-0 m-3 pulse">
                    <span className={`badge ${property.type === 'sale' ? 'bg-success' : 'bg-primary'} px-3 py-2`}>
                      {property.type === 'sale' ? t('forSale') : t('forRent')}
                    </span>
                  </div>
                </div>
                <div className="p-3 border border-top-0">
                  <h5 className="text-primary mb-2">{property.price}</h5>
                  <div className="d-flex text-muted small">
                    <span className="me-3"><Bed className="w-4 h-4 me-1 mb-1" />{property.bedrooms} {t('beds')}</span>
                    <span className="me-3"><Bath className="w-4 h-4 me-1 mb-1" />{property.bathrooms} {t('baths')}</span>
                    <span><Square className="w-4 h-4 me-1 mb-1" />{property.sqft} sqft</span>
                  </div>
                </div>
              </div>
            ))}
            {!isLoading && properties.length === 0 && (
              <div className="col-12 text-center py-5 wow fadeIn" data-wow-delay="0.1s">
                <div className="mb-3">
                  <Search className="text-muted" size={48} />
                </div>
                <h4>{t('noPropertiesFound')}</h4>
                <p className="text-muted">{t('adjustFiltersOrSearch')}</p>
                <button
                  className="btn btn-primary px-4 mt-3 rounded-pill"
                  onClick={() => { setSearchTerm(''); setFilterType('all'); }}
                >
                  {t('clearAllFilters')}
                </button>
              </div>
            )}
          </div>
          {/* Property Grid End */}

          {/* Pagination Start */}
          {totalPages > 1 && (
            <div className="row mt-5">
              <div className="col-12 wow fadeIn" data-wow-delay="0.1s">
                <nav aria-label="Page navigation">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}>{t('previous')}</button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => setCurrentPage(page)}>{page}</button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}>{t('next')}</button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          )}
          {/* Pagination End */}
        </div>
      </div>
      {/* Search & Filter End */}

      {/* Booking Floating Form */}
      {isBookingFloatingOpen && selectedProperty && (
        <BookingFloatingForm
          propertyId={selectedProperty.id}
          propertyTitle={selectedProperty.title}
          onClose={() => setIsBookingFloatingOpen(false)}
        />
      )}
    </div>
  );
}