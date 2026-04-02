import { useState, useEffect } from "react";
import { fetchApi } from '../api/client';
import { 
    MapPin, 
    MoreVertical, 
    Edit2, 
    Trash2, 
    Search,
    RefreshCw,
    Users,
    DollarSign,
    ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { AddSiteModal } from "@/app/components/AddSiteModal";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Badge } from "@/app/components/ui/badge";

interface Site {
    id: string;
    code: string;
    name: string;
    location: string;
    status: string;
    managerId: string;
    employeesCount?: number;
    totalExpenses?: number;
    createdAt: string;
}

export function ManageSites({ hideHeader = false, refreshKey = 0 }) {
    const [sites, setSites] = useState<Site[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSite, setSelectedSite] = useState<Site | null>(null);
    const [localRefresh, setLocalRefresh] = useState(0);

    useEffect(() => {
        loadSites();
    }, [refreshKey, localRefresh]);

    const loadSites = async () => {
        setIsLoading(true);
        try {
            const data = await fetchApi<Site[]>('/sites');
            setSites(data);
        } catch (error) {
            console.error("Failed to load sites", error);
            toast.error("Failed to load sites");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this site? This may affect linked employees and transactions.")) return;
        try {
            await fetchApi(`/sites/${id}`, { method: 'DELETE' });
            toast.success("Site deleted successfully");
            setLocalRefresh(prev => prev + 1);
        } catch (error) {
            console.error("Failed to delete site", error);
            toast.error("Failed to delete site");
        }
    };

    const filteredSites = sites.filter(site => 
        site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch(status.toLowerCase()) {
            case 'active': return 'bg-success';
            case 'inactive': return 'bg-secondary';
            case 'completed': return 'bg-primary';
            case 'on_hold': return 'bg-warning';
            default: return 'bg-info';
        }
    };

    if (isLoading && sites.length === 0) {
        return (
            <div className="d-flex justify-content-center align-items-center py-5">
                <RefreshCw className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="sites-container p-1 pt-0">
            {!hideHeader && (
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="h4 fw-bold mb-0">Working Sites</h2>
                </div>
            )}

            <div className="d-flex flex-column flex-md-row gap-3 mb-4">
                <div className="flex-fill position-relative">
                    <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
                    <input 
                        type="text" 
                        className="form-control ps-5 rounded-xl border-0 shadow-sm py-2.5"
                        placeholder="Search sites by name, code or location..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="row g-4">
                {filteredSites.length === 0 ? (
                    <div className="col-12 text-center py-5 bg-white rounded shadow-sm">
                        <MapPin className="text-muted mb-3" size={48} />
                        <h3 className="h6 fw-bold">No sites found</h3>
                        <p className="text-muted small">Try adjusting your search or add a new site.</p>
                    </div>
                ) : (
                    filteredSites.map((site) => (
                        <div key={site.id} className="col-12 col-md-6 col-lg-4">
                            <div className="card border-0 shadow-sm rounded-xl overflow-hidden h-100 site-card transition-all">
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="icon-box bg-light text-primary rounded-lg p-2.5">
                                            <MapPin size={24} />
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger className="btn btn-link text-muted p-0">
                                                <MoreVertical size={20} />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="shadow border-0 rounded-lg">
                                                <DropdownMenuItem onClick={() => { setSelectedSite(site); setIsEditModalOpen(true); }} className="d-flex align-items-center gap-2 cursor-pointer">
                                                    <Edit2 size={14} /> Edit Site
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(site.id)} className="d-flex align-items-center gap-2 text-danger cursor-pointer">
                                                    <Trash2 size={14} /> Delete Site
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div className="mb-3">
                                        <div className="d-flex align-items-center gap-2 mb-1">
                                            <h5 className="card-title fw-bold mb-0 text-truncate" style={{ maxWidth: '80%' }}>{site.name}</h5>
                                            <Badge className={getStatusColor(site.status)}>{site.status.toUpperCase()}</Badge>
                                        </div>
                                        <p className="text-muted small fw-medium mb-0">{site.code}</p>
                                    </div>

                                    <div className="d-flex align-items-center gap-2 text-muted small mb-4">
                                        <MapPin size={14} className="flex-shrink-0" />
                                        <span className="text-truncate">{site.location}</span>
                                    </div>

                                    <div className="row g-2 pt-3 border-top mt-3">
                                        <div className="col-6">
                                            <div className="p-2.5 bg-light rounded-lg">
                                                <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                                                    <Users size={14} />
                                                    <span>Workers</span>
                                                </div>
                                                <p className="fw-bold mb-0">{site.employeesCount || 0}</p>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="p-2.5 bg-light rounded-lg">
                                                <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                                                    <DollarSign size={14} />
                                                    <span>Expenses</span>
                                                </div>
                                                <p className="fw-bold mb-0 text-danger">{site.totalExpenses || 0} RWF</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        className="btn btn-primary w-100 mt-4 rounded-xl py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 border-0 shadow-sm"
                                        onClick={() => toast.info(`Viewing details for ${site.name}`)}
                                    >
                                        <ExternalLink size={16} /> Site Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <AddSiteModal 
                isOpen={isEditModalOpen}
                onClose={() => { setIsEditModalOpen(false); setSelectedSite(null); }}
                onSuccess={() => setLocalRefresh(prev => prev + 1)}
                initialData={selectedSite}
            />

            <style>{`
                .site-card:hover { transform: translateY(-5px); border: 1px solid var(--bs-primary) !important; }
                .rounded-xl { border-radius: 1rem !important; }
                .icon-box { transition: all 0.3s ease; }
                .site-card:hover .icon-box { background: var(--bs-primary) !important; color: white !important; }
            `}</style>
        </div>
    );
}
