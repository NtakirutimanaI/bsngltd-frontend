import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { fetchApi, getImageUrl } from '@/app/api/client';

export function UpdateDetails() {
  const { id } = useParams();
  const [update, setUpdate] = useState<any>(null);

  useEffect(() => {
    fetchApi<any>(`/updates/${id}`).then(setUpdate).catch(console.error);
  }, [id]);

  if (!update) return <div className="p-5 text-center">Loading...</div>;

  return (
    <div className="container-fluid py-5">
      <div className="container py-5">
        <div className="row justify-content-center">
            <div className="col-lg-8">
                <img src={getImageUrl(update.image || '/istudio/img/project-1.jpg')} className="img-fluid rounded mb-4 w-100" alt="" />
                <h1>{update.title}</h1>
                <div className="mt-4 text-muted" dangerouslySetInnerHTML={{ __html: update.content }} />
            </div>
        </div>
      </div>
    </div>
  );
}
