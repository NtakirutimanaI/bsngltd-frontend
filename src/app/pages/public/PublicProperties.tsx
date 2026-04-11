import { useState, useEffect } from 'react';
import { fetchApi } from '@/app/api/client';
import { getImageUrl } from '@/app/api/client';
import { Link } from 'react-router';

export function PublicProperties() {
    const [properties, setProperties] = useState<any[]>([]);

    useEffect(() => {
        fetchApi<any[]>('/properties').then(setProperties).catch(console.error);
    }, []);

    return (
        <div className="container-fluid py-5">
            <div className="container py-5">
                <h1 className="mb-5 text-center">Our <span className="text-uppercase text-primary bg-light px-2">Projects</span></h1>
                <div className="row g-4">
                    {properties.map((p) => (
                        <div key={p.id} className="col-lg-4 col-md-6">
                            <div className="project-item position-relative overflow-hidden">
                                <img className="img-fluid w-100" src={getImageUrl(p.images?.[0] || '/istudio/img/project-1.jpg')} alt="" style={{ height: '300px', objectFit: 'cover' }} />
                                <Link className="project-overlay text-decoration-none" to={`/properties/${p.id}`}>
                                    <h4 className="text-white">{p.title}</h4>
                                    <small className="text-white">{p.status}</small>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
