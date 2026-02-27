import { useState, useEffect } from "react";
import { fetchApi } from "@/app/api/client";
import { Plus, Edit2, Trash2, MapPin } from "lucide-react";
import { ScrollReveal } from "@/app/components/ScrollReveal";

interface Site {
    id: string;
    code: string;
    name: string;
    location: string;
    status: string;
}

export function SitesTab() {
    const [sites, setSites] = useState<Site[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadSites();
    }, []);

    const loadSites = async () => {
        try {
            const res = await fetchApi<Site[]>('/sites');
            setSites(res || []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="text-center p-4">Loading sites...</div>;

    return (
        <ScrollReveal>
            <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                <div className="card-header bg-white border-0 px-4 py-3 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">Construction Sites</h5>
                    <button className="btn btn-sm text-white" style={{ background: '#16a085', borderRadius: '8px' }}>
                        <Plus size={14} className="me-1" /> Add Site
                    </button>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr className="text-muted small text-uppercase">
                                <th className="ps-4">Site Name</th>
                                <th>Location</th>
                                <th>Status</th>
                                <th className="text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sites.map(site => (
                                <tr key={site.id}>
                                    <td className="ps-4">
                                        <div className="fw-bold">{site.name}</div>
                                        <div className="small text-muted">{site.code}</div>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center text-muted small"><MapPin size={14} className="me-1" /> {site.location}</div>
                                    </td>
                                    <td>
                                        <span className={`badge px-2 py-1 bg-light text-dark text-capitalize`}>{site.status}</span>
                                    </td>
                                    <td className="text-end pe-4">
                                        <button className="btn btn-icon text-muted p-0 me-2"><Edit2 size={14} /></button>
                                        <button className="btn btn-icon text-danger p-0"><Trash2 size={14} /></button>
                                    </td>
                                </tr>
                            ))}
                            {sites.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-4 text-muted">No sites found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </ScrollReveal>
    );
}
