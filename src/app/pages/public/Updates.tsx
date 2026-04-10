import { useState, useEffect } from 'react';
import { fetchApi, getImageUrl } from '@/app/api/client';
import { Link } from 'react-router';
import Breadcrumb from '../../../components/Breadcrumb';

export function Updates() {
  const [updates, setUpdates] = useState<any[]>([]);
  useEffect(() => {
    fetchApi<any[]>('/updates').then(setUpdates).catch(console.error);
  }, []);

  return (
    <div className="bg-white">
      <Breadcrumb title="Updates" />
      
      <div className="container-fluid py-5">
        <div className="container py-5">
          <div className="text-center mx-auto mb-5 wow fadeInUp" data-wow-delay="0.1s" style={{ maxWidth: '600px' }}>
            <h1 className="display-5 mb-4">Latest <span className="text-uppercase text-primary bg-light px-2">Insights</span> & News</h1>
            <p className="mb-0">Stay informed with the latest developments, project milestones, and community announcements from BSNG.</p>
          </div>
          <div className="row g-4 justify-content-center">
            {updates.length > 0 ? (
              updates.map((u, index) => (
                <div key={u.id} className="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay={`${0.1 * (index + 1)}s`}>
                  <div className="service-item bg-light overflow-hidden h-100 shadow-sm border border-1 border-white rounded-3">
                    <img src={getImageUrl(u.image || '/istudio/img/project-1.jpg')} className="img-fluid w-100" alt={u.title} style={{height: '240px', objectFit: 'cover'}} />
                    <div className="p-4">
                      <h4 className="mb-3">{u.title}</h4>
                      <p className="text-muted small mb-4">{u.summary || u.content?.substring(0, 100) + '...'}</p>
                      <Link to={`/updates/${u.id}`} className="fw-bold text-primary text-uppercase text-decoration-none small">
                        Read Full Story <i className="fa fa-arrow-right ms-2"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
                <div className="col-12 text-center py-5">
                    <p className="text-muted">No updates available at the moment.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
