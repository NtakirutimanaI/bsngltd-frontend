import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { fetchApi, getImageUrl } from '@/app/api/client';

export function PropertyDetails() {
    const { id } = useParams();
    const [property, setProperty] = useState<any>(null);

    useEffect(() => {
        fetchApi<any>(`/properties/${id}`).then(setProperty).catch(console.error);
    }, [id]);

    if (!property) return <div className="p-5 text-center">Loading...</div>;

    return (
        <div className="container-fluid py-5">
            <div className="container py-5">
                <div className="row g-5">
                    <div className="col-lg-7">
                        <img className="img-fluid w-100 rounded" src={getImageUrl(property.images?.[0] || '/istudio/img/project-1.jpg')} alt="" />
                    </div>
                    <div className="col-lg-5">
                        <h1 className="mb-4">{property.title}</h1>
                        <p className="mb-4">{property.description}</p>
                        <h5 className="text-primary mb-3">Status: {property.status}</h5>
                    </div>
                </div>
            </div>
        </div>
    );
}
