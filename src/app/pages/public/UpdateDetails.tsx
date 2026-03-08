import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { fetchApi, getImageUrl } from '@/app/api/client';
import { Calendar, User, ArrowLeft, Tag } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import { ScrollReveal } from '@/app/components/ScrollReveal';

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

export function UpdateDetails() {
    const { id } = useParams();
    const { t, language, dt } = useLanguage();
    const [update, setUpdate] = useState<Update | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setIsLoading(true);
        fetchApi<Update>(`/updates/${id}`)
            .then(res => {
                setUpdate(res);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch update details", err);
                setError("Update not found");
                setIsLoading(false);
            });
    }, [id]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const localeMap: Record<string, string> = {
            'en': 'en-US',
            'fr': 'fr-FR',
            'rw': 'rw-RW',
            'sw': 'sw-TZ'
        };
        return date.toLocaleDateString(localeMap[language] || 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="container-fluid bg-white py-5 min-vh-100 d-flex align-items-center justify-content-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error || !update) {
        return (
            <div className="container-fluid bg-white py-5 min-vh-100 d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <h1 className="display-1 text-primary fw-bold">404</h1>
                    <h2 className="mb-4">{t('noUpdatesFound') || 'Update Not Found'}</h2>
                    <p className="text-muted mb-5">{t('notfoundDesc') || 'The update you are looking for does not exist or has been removed.'}</p>
                    <Link to="/updates" className="btn btn-primary px-5 py-3 rounded-pill">
                        <ArrowLeft className="w-4 h-4 me-2 mb-1" />
                        {t('backToUpdates') || 'Back to Updates'}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid bg-white p-0">
            {/* Page Header */}
            <div className="container-fluid page-header py-3 wow fadeIn" data-wow-delay="0.1s">
                <div className="container pt-3 pb-0">
                    <nav aria-label="breadcrumb animated slideInDown">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item"><Link to="/" className="text-body">{t('home')}</Link></li>
                            <li className="breadcrumb-item"><Link to="/updates" className="text-body">{t('updates')}</Link></li>
                            <li className="breadcrumb-item active text-primary text-truncate" style={{ maxWidth: '200px' }} aria-current="page">{dt(update.title)}</li>
                        </ol>
                    </nav>
                </div>
            </div>

            <div className="container py-5">
                <div className="row g-5">
                    <div className="col-lg-8">
                        <ScrollReveal>
                            <img
                                src={getImageUrl(update.image) || '/img/project-1.jpg'}
                                alt={dt(update.title)}
                                className="img-fluid rounded shadow-sm mb-4 w-100"
                                style={{ maxHeight: '500px', objectFit: 'cover' }}
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    if (!target.src.includes('/img/project-')) {
                                        target.src = '/img/project-1.jpg';
                                    }
                                }}
                            />

                            <div className="d-flex align-items-center mb-4 text-muted small">
                                <span className="me-4 d-flex align-items-center">
                                    <Calendar className="w-4 h-4 me-2" />
                                    {formatDate(update.date)}
                                </span>
                                <span className="me-4 d-flex align-items-center">
                                    <User className="w-4 h-4 me-2" />
                                    {update.author}
                                </span>
                                <span className="badge bg-light text-primary border px-3 py-2 text-uppercase">
                                    {t('category' + update.category)}
                                </span>
                            </div>

                            <h1 className="mb-4">{dt(update.title)}</h1>
                            <div className="content-area lead text-muted mb-5" style={{ whiteSpace: 'pre-wrap' }}>
                                {dt(update.content)}
                            </div>

                            {update.tags && update.tags.length > 0 && (
                                <div className="d-flex align-items-center gap-2 mt-5 pt-4 border-top">
                                    <Tag className="w-4 h-4 text-primary" />
                                    <span className="fw-bold me-2">{t('tags')}</span>
                                    {update.tags.map(tag => (
                                        <span key={tag} className="badge bg-light text-dark border px-3 py-2">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </ScrollReveal>
                    </div>

                    <div className="col-lg-4">
                        <div className="sticky-top" style={{ top: '100px', zIndex: 1 }}>
                            <div className="bg-light p-4 rounded mb-4">
                                <h4 className="mb-4">{t('quickSearch') || 'Quick Search'}</h4>
                                <div className="position-relative">
                                    <input type="text" className="form-control border-0 py-3" placeholder={t('searchUpdates') || 'Search updates...'} />
                                    <button className="btn btn-primary position-absolute top-0 end-0 h-100">{t('search')}</button>
                                </div>
                            </div>

                            <div className="bg-light p-4 rounded">
                                <h4 className="mb-4">{t('categories')}</h4>
                                <div className="d-flex flex-wrap gap-2">
                                    {['Projects', 'Awards', 'Events', 'News', 'Company'].map(cat => (
                                        <Link
                                            key={cat}
                                            to={`/updates?category=${cat}`}
                                            className="btn btn-white border btn-sm px-3 py-2 hover-bg-primary"
                                        >
                                            {t('category' + cat)}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4">
                                <Link to="/updates" className="btn btn-outline-primary px-4 py-2 rounded-pill d-inline-flex align-items-center">
                                    <ArrowLeft className="w-4 h-4 me-2" />
                                    {t('allUpdates') || 'All Updates'}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
