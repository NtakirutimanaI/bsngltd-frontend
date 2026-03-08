import { useState, useEffect } from 'react';
import { Calendar, User, Search } from 'lucide-react';
import { fetchApi, getImageUrl } from '@/app/api/client';
import { useLanguage } from '@/app/context/LanguageContext';
import { Link } from 'react-router';
import { useDebounce } from "@/app/hooks/useDebounce";

interface Update {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  date: string;
  image: string;
  tags: string[];
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  lastPage: number;
}

export function Updates() {
  const { t, language, dt } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [updates, setUpdates] = useState<Update[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const categories = ['all', 'Projects', 'Awards', 'Events', 'News', 'Company'];

  useEffect(() => {
    setIsLoading(true);
    const params: any = {
      page: currentPage.toString(),
      limit: '9',
      search: debouncedSearchTerm,
    };
    if (selectedCategory !== 'all') {
      params.category = selectedCategory;
    }
    const query = new URLSearchParams(params).toString();

    fetchApi<PaginatedResponse<Update>>(`/updates?${query}&t=${Date.now()}`)
      .then(res => {
        const rawData = Array.isArray(res) ? res : (res.data || []);
        setUpdates(rawData);
        setTotalPages(Array.isArray(res) ? 1 : (res.lastPage || 1));
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch public updates", err);
        setIsLoading(false);
      });
  }, [currentPage, debouncedSearchTerm, selectedCategory, language]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const localeMap: Record<string, string> = {
      'en': 'en-US',
      'fr': 'fr-FR',
      'rw': 'rw-RW',
      'sw': 'sw-TZ'
    };
    return date.toLocaleDateString(localeMap[language] || 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="container-fluid bg-white p-0">
      {/* Page Header Start */}
      <div className="container-fluid page-header py-3 wow fadeIn" data-wow-delay="0.1s">
        <div className="container pt-3 pb-0">
          <nav aria-label="breadcrumb animated slideInDown">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item"><Link to="/" className="text-body">{t('home')}</Link></li>
              <li className="breadcrumb-item active text-primary" aria-current="page">{t('updates')}</li>
            </ol>
          </nav>
        </div>
      </div>
      {/* Page Header End */}

      {/* Updates Start */}
      <div className="container-fluid pt-3 pb-5">
        <div className="container">
          <div className="row g-4 align-items-center mb-5">
            <div className="col-lg-6 wow fadeIn" data-wow-delay="0.1s">
              <h1 className="mb-0">{t('latestUpdatesNews').split(' ').slice(0, 1).join(' ')} <span className="text-uppercase text-primary bg-light px-2">{t('latestUpdatesNews').split(' ').slice(1).join(' ')}</span></h1>
            </div>
            <div className="col-lg-6 wow fadeIn" data-wow-delay="0.3s">
              <div className="d-flex gap-2 justify-content-lg-end overflow-auto pb-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => { setSelectedCategory(category); setCurrentPage(1); }}
                    className={`btn ${selectedCategory === category ? 'btn-primary' : 'btn-outline-primary'} text-nowrap`}
                  >
                    {category === 'all' ? t('allUpdates') : t('category' + category)}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-12 wow fadeIn" data-wow-delay="0.5s">
              <div className="position-relative w-100">
                <input
                  className="form-control border-0 w-100 ps-4 pe-5"
                  type="text"
                  placeholder={t('searchUpdates')}
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

          <div className="row g-4">
            {updates.map((update, index) => (
              <div key={update.id} className="col-lg-4 col-md-6 wow fadeIn" data-wow-delay={`${0.1 * (index + 1)}s`}>
                <div className="project-item position-relative overflow-hidden mb-4 rounded">
                  <img
                    className="img-fluid w-100"
                    src={getImageUrl(update.image) || `/img/project-${(index % 6) + 1}.jpg`}
                    alt={dt(update.title)}
                    style={{ height: '240px', objectFit: 'cover' }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes('/img/project-')) {
                        target.src = `/img/project-${(index % 6) + 1}.jpg`;
                      }
                    }}
                  />
                  <Link to={`/updates/${update.id}`} className="project-overlay text-decoration-none">
                    <h4 className="text-white mb-1">{dt(update.title)}</h4>
                    <small className="text-white">{t('category' + update.category)}</small>
                  </Link>
                  <div className="position-absolute top-0 start-0 m-3">
                    <span className="badge bg-primary px-3 py-2 text-uppercase">{t('category' + update.category)}</span>
                  </div>
                </div>
                <div className="p-3 border border-top-0 rounded-bottom">
                  <div className="d-flex align-items-center mb-3 small text-muted">
                    <span className="me-3"><Calendar className="w-4 h-4 me-1 mb-1" />{formatDate(update.date)}</span>
                    <span><User className="w-4 h-4 me-1 mb-1" />{update.author}</span>
                  </div>
                  <h5 className="mb-3 line-clamp-2">{dt(update.title)}</h5>
                  <p className="text-muted small line-clamp-3 mb-4">{dt(update.excerpt)}</p>
                  <Link to={`/updates/${update.id}`} className="btn btn-outline-primary btn-sm">{t('readMore')}</Link>
                </div>
              </div>
            ))}

            {updates.length === 0 && !isLoading && (
              <div className="col-12 text-center py-5 wow fadeIn" data-wow-delay="0.1s">
                <div className="mb-3">
                  <Search className="text-muted" size={48} />
                </div>
                <h4>{t('noUpdatesFound')}</h4>
                <p className="text-muted">{t('adjustFiltersOrSearch')}</p>
                <button
                  className="btn btn-primary px-4 mt-3 rounded-pill"
                  onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                >
                  {t('clearAllFilters')}
                </button>
              </div>
            )}
          </div>

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
      {/* Updates End */}
    </div>
  );
}
