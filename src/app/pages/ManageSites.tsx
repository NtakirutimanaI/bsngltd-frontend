import { useState, useEffect } from "react";
import { fetchApi } from '../api/client';
import { 
    MapPin, 
    MoreVertical, 
    Edit2, 
    Trash2, 
    Search,
    Eye,
    Globe,
    HardHat,
    Wrench,
    LandPlot,
    ClipboardList,
    Calendar,
    Users,
    Building2,
    RefreshCw,
    Edit,
    PlusCircle,
    Briefcase,
    Image as ImageIcon
} from "lucide-react";
import { Modal } from "@/app/components/Modal";
import { toast } from "sonner";
import { useSite } from "@/app/context/SiteContext";
import { AddProjectModal } from "@/app/components/AddProjectModal";
import { AddSiteModal } from "@/app/components/AddSiteModal";
import { AddProjectImagesModal } from "@/app/components/AddProjectImagesModal";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { PaginationSelector } from "@/app/components/ui/pagination-selector";
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

export function ManageSites({ refreshKey = 0 }) {
    const { setSelectedSite, selectedSite } = useSite();
    const [sites, setSites] = useState<Site[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchTermProjects, setSearchTermProjects] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [siteToEdit, setSiteToEdit] = useState<Site | null>(null);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [selectedSiteForDetail, setSelectedSiteForDetail] = useState<Site | null>(null);
    const [projectToEdit, setProjectToEdit] = useState<any>(null);
    const [siteForProject, setSiteForProject] = useState<{siteId: string, location: string} | null>(null);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [projectForImages, setProjectForImages] = useState<any>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [isProjectsLoading, setIsProjectsLoading] = useState(true);
    const [internalRefreshKey, setInternalRefreshKey] = useState(0);
    const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<any>(null);
    const [filterStatus] = useState("all");

    // Local refresh triggers (for after deletes/edits)
    const localRefresh = () => setInternalRefreshKey(prev => prev + 1);

    // Site Pagination
    const [sitesPage, setSitesPage] = useState(1);
    const [sitesTotal, setSitesTotal] = useState(0);
    const [sitesPageSize, setSitesPageSize] = useState(10);

    // Project Pagination
    const [projectsPage, setProjectsPage] = useState(1);
    const [projectsTotal, setProjectsTotal] = useState(0);
    const [projectsPageSize, setProjectsPageSize] = useState(10);

    const loadSites = async () => {
        setIsLoading(true);
        try {
            const res = await fetchApi<any>(`/sites?page=${sitesPage}&limit=${sitesPageSize}&search=${searchTerm}`);
            setSites(Array.isArray(res) ? res : (res.data || []));
            setSitesTotal(res.total || (Array.isArray(res) ? res.length : 0));
        } catch (error) {
            console.error("Failed to load sites", error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadProjects = async () => {
        setIsProjectsLoading(true);
        try {
            const res = await fetchApi<any>(`/projects?page=${projectsPage}&limit=${projectsPageSize}&search=${searchTermProjects}&status=${filterStatus}`);
            setProjects(res.data || []);
            setProjectsTotal(res.total || 0);
        } catch (error) {
            console.error("Failed to load projects", error);
        } finally {
            setIsProjectsLoading(false);
        }
    };

    const handlePublishProject = async (project: any) => {
        try {
            await fetchApi(`/projects/${project.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ isPublished: !project.isPublished })
            });
            toast.success(`Project ${!project.isPublished ? 'published' : 'unpublished'}`);
            localRefresh();
        } catch (error) {
            const msg = error instanceof Error ? error.message : "Failed to update status";
            toast.error(msg);
        }
    };

    useEffect(() => {
        loadSites();
    }, [refreshKey, internalRefreshKey, sitesPage, sitesPageSize, searchTerm]);

    useEffect(() => {
        loadProjects();
    }, [refreshKey, internalRefreshKey, projectsPage, projectsPageSize, searchTermProjects, filterStatus]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this site? This may affect linked employees and transactions.")) return;
        try {
            await fetchApi(`/sites/${id}`, { method: 'DELETE' });
            toast.success("Site deleted successfully");
            localRefresh();
        } catch (error) {
            console.error("Failed to delete site", error);
            const msg = error instanceof Error ? error.message : "Failed to delete site";
            toast.error(msg);
        }
    };

    const filteredSites = sites.filter(site => 
        site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredProjects = projects.filter(project => 
        project.name.toLowerCase().includes(searchTermProjects.toLowerCase()) ||
        project.code.toLowerCase().includes(searchTermProjects.toLowerCase()) ||
        project.location.toLowerCase().includes(searchTermProjects.toLowerCase())
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

    const getTypeIcon = (type: string, size: number = 24) => {
        switch (type) {
            case "construction": return <HardHat size={size} className="text-primary" />;
            case "renovation": return <Wrench size={size} className="text-info" />;
            case "plot_sale": return <LandPlot size={size} className="text-warning" />;
            case "rental": return <Building2 size={size} className="text-danger" />;
            default: return <ClipboardList size={size} className="text-muted" />;
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
        <div className="container-fluid py-4 min-vh-100" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
            <ScrollReveal className="row mb-3 px-lg-4">
                <div className="col-12">
                   <div className="d-flex align-items-center gap-3">
                        {/* Stat Card 1: Sites */}
                        <div className="glass-card p-2 px-3 rounded-xl border border-white shadow-sm d-flex align-items-center gap-3" style={{ background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)', minWidth: '180px' }}>
                            <div className="bg-primary bg-gradient rounded-lg p-2 text-white shadow-sm">
                                <MapPin size={18} />
                            </div>
                            <div>
                                <div className="fw-bold text-dark h5 mb-0">{sitesTotal}</div>
                                <div className="smaller text-muted fw-bold" style={{ fontSize: '10px' }}>TOTAL SITES</div>
                            </div>
                        </div>

                        {/* Stat Card 2: Projects */}
                        <div className="glass-card p-2 px-3 rounded-xl border border-white shadow-sm d-flex align-items-center gap-3" style={{ background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)', minWidth: '180px' }}>
                            <div className="bg-orange-500 bg-gradient rounded-lg p-2 text-white shadow-sm">
                                <Briefcase size={18} />
                            </div>
                            <div>
                                <div className="fw-bold text-dark h5 mb-0">{projectsTotal}</div>
                                <div className="smaller text-muted fw-bold" style={{ fontSize: '10px' }}>ACTIVE PROJECTS</div>
                            </div>
                        </div>
                   </div>
                </div>
            </ScrollReveal>

            <div className="row g-4 pt-2">
                {/* Column 1: Sites (Narrower Segment) */}
                <div className="col-lg-3 px-lg-4">
                    <div className="glass-card p-2 rounded-xl mb-3 border border-white shadow-sm" style={{ background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)' }}>
                        <div className="d-flex justify-content-between align-items-center mb-0 pb-2 border-bottom border-gray-100">
                            <div className="d-flex align-items-center gap-2">
                                <div className="bg-blue-600 rounded-lg p-2 text-white shadow-sm">
                                    <MapPin size={16} />
                                </div>
                                <div>
                                    <h2 className="fw-bold mb-0" style={{ fontSize: '13px' }}>Working Sites</h2>
                                    <p className="smaller text-muted mb-0" style={{ fontSize: '11px' }}>Operational locations</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => { setSiteToEdit(null); setIsEditModalOpen(true); }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg font-bold shadow-sm transition-all hover:scale-105 active:scale-95 border-0"
                                style={{ fontSize: '11px' }}
                            >
                                <PlusCircle size={12} className="me-1" /> New Site
                            </button>
                        </div>
                    </div>

                    <div className="d-flex flex-column gap-2 mb-4">
                        <div className="position-relative">
                            <Search className="position-absolute start-3 top-50 translate-middle-y text-muted opacity-50" size={14} style={{ left: '12px' }} />
                            <input 
                                type="text"
                                className="form-control form-control-sm ps-5 bg-white border-0 shadow-sm rounded-xl py-2 search-input"
                                placeholder="Search working sites..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-column gap-2 d-flex">
                        {isLoading && sites.length === 0 ? (
                             <div className="text-center py-5 text-muted small">Loading sites...</div>
                        ) : filteredSites.length === 0 ? (
                            <div className="text-center py-5 bg-white rounded shadow-sm border border-dashed">
                                <MapPin className="text-muted mb-2 opacity-25" size={40} />
                                <h3 className="smaller fw-bold text-muted">No sites found</h3>
                            </div>
                        ) : (
                            <>
                                {filteredSites.map((site) => (
                                    <div key={site.id} className={`bg-white border-0 shadow-sm rounded-xl overflow-hidden site-row transition-all mb-1.5 border ${selectedSite?.id === site.id ? 'border-primary' : 'border-gray-100'} hover:shadow-md`}>
                                        <div className="p-1 px-3 d-flex align-items-center justify-content-between">
                                            <div className="d-flex align-items-center gap-2 overflow-hidden flex-grow-1">
                                                <div className="icon-box bg-blue-50 text-blue-600 rounded-lg p-2 flex-shrink-0">
                                                    <MapPin size={16} />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <div className="d-flex flex-column gap-0">
                                                        <h6 className="fw-bold mb-0 text-truncate" style={{ fontSize: '11px' }}>{site.name}</h6>
                                                        <Badge className={`${getStatusColor(site.status)} px-1 py-0 mt-1`} style={{ fontSize: '7px', width: 'fit-content' }}>{site.status.toUpperCase()}</Badge>
                                                    </div>
                                                    <div className="smaller text-muted text-truncate mt-1" style={{ fontSize: '9px' }}>
                                                        <span className="fw-bold text-dark">{site.code}</span>
                                                        <span className="mx-1">•</span>
                                                        <span>{site.location}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="d-flex align-items-center gap-1 flex-shrink-0 ms-2">
                                                <button 
                                                    className={`btn ${selectedSite?.id === site.id ? 'btn-success' : 'btn-outline-success'} rounded-lg py-1 px-2 fw-bold border shadow-sm`}
                                                    onClick={() => { setSelectedSite(site); toast.success(`${site.name} active`); }}
                                                    style={{ fontSize: '10px' }}
                                                >
                                                    <RefreshCw size={10} className="me-1" />
                                                    {selectedSite?.id === site.id ? 'Active' : 'Pick'}
                                                </button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger className="btn btn-link text-muted p-1 hover:bg-gray-100 rounded-circle">
                                                        <MoreVertical size={14} />
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="shadow border-0 rounded-lg">
                                                        <DropdownMenuItem onClick={() => { setSelectedSiteForDetail(site); }} className="text-xs">
                                                            <Eye size={12} className="me-2 text-info" /> View Site
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => { setSiteToEdit(site); setIsEditModalOpen(true); }} className="text-xs">
                                                            <Edit2 size={12} className="me-2 text-primary" /> Edit Site
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDelete(site.id)} className="text-danger text-xs">
                                                            <Trash2 size={12} className="me-2" /> Delete Site
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {sitesTotal > sitesPageSize && (
                                    <div className="mt-3">
                                        <PaginationSelector
                                            currentPage={sitesPage}
                                            totalPages={Math.ceil(sitesTotal / sitesPageSize)}
                                            pageSize={sitesPageSize}
                                            totalItems={sitesTotal}
                                            onPageChange={setSitesPage}
                                            onPageSizeChange={setSitesPageSize}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Column 2: Projects (Wider Repository) */}
                <div className="col-lg-9 px-lg-4 border-start border-gray-100">
                    <div className="glass-card p-2 rounded-xl mb-3 border border-white shadow-sm" style={{ background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)' }}>
                        <div className="d-flex justify-content-between align-items-center mb-0 pb-2 border-bottom border-gray-100">
                            <div className="d-flex align-items-center gap-2">
                                <div className="bg-orange-500 rounded-lg p-2 text-white shadow-sm">
                                    <Briefcase size={16} />
                                </div>
                                <div>
                                    <h2 className="fw-bold mb-0" style={{ fontSize: '13px' }}>Project Repository</h2>
                                    <p className="smaller text-muted mb-0" style={{ fontSize: '11px' }}>Track construction progress</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => { setSiteForProject(null); setProjectToEdit(null); setIsProjectModalOpen(true); }}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-2.5 py-1.5 rounded-lg font-bold shadow-sm transition-all hover:scale-105 active:scale-95 border-0"
                                style={{ fontSize: '11px' }}
                            >
                                <PlusCircle size={12} className="me-1" /> New Project
                            </button>
                        </div>
                    </div>

                    <div className="d-flex flex-column gap-2 mb-4">
                        <div className="position-relative">
                            <Search className="position-absolute start-3 top-50 translate-middle-y text-muted opacity-50" size={14} style={{ left: '12px' }} />
                            <input 
                                type="text"
                                className="form-control form-control-sm ps-5 bg-white border-0 shadow-sm rounded-xl py-2 search-input"
                                placeholder="Search project repository..." 
                                value={searchTermProjects}
                                onChange={(e) => setSearchTermProjects(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-column gap-2 d-flex">
                        {isProjectsLoading && projects.length === 0 ? (
                            <div className="text-center py-5 text-muted small">Loading project repository...</div>
                        ) : filteredProjects.length === 0 ? (
                            <div className="text-center py-5 bg-white rounded shadow-sm border border-dashed border-gray-200">
                                <Briefcase className="text-muted mb-2 opacity-25" size={40} />
                                <h3 className="smaller fw-bold text-muted">No projects linked</h3>
                                <p className="smaller text-muted">Create projects to track material & site progress.</p>
                            </div>
                        ) : (
                            <>
                                {filteredProjects.map((project) => (
                                    <div key={project.id} className="bg-white border-0 shadow-sm rounded-xl overflow-hidden site-row transition-all mb-1.5 border border-gray-100 hover:shadow-md">
                                        <div className="p-1 px-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                                            <div className="d-flex align-items-center gap-3 overflow-hidden flex-grow-1" style={{ minWidth: '180px' }}>
                                                <div className="bg-orange-50 text-orange-600 rounded-lg p-2 flex-shrink-0">
                                                    {getTypeIcon(project.type, 18)}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <h6 className="fw-bold mb-0 text-truncate" style={{ fontSize: '13px' }}>{project.name}</h6>
                                                        <Badge className="bg-light text-muted fw-bold p-0 px-2" style={{ fontSize: '8px' }}>{project.code}</Badge>
                                                    </div>
                                                    <div className="smaller text-muted d-flex align-items-center gap-1" style={{ fontSize: '10px' }}>
                                                        <span className="text-primary fw-bold text-uppercase" style={{ fontSize: '9px' }}>{project.type}</span>
                                                        <span>•</span>
                                                        <span className="text-truncate">{project.location}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status & Progress column */}
                                            <div className="d-flex align-items-center gap-4 px-3 d-none d-xl-flex border-start border-gray-50 ms-auto" style={{ minWidth: '180px' }}>
                                                <div className="text-center" style={{ minWidth: '60px' }}>
                                                    <div className="smaller text-muted fw-bold mb-0" style={{ fontSize: '8px' }}>BUDGET</div>
                                                    <div className="fw-bold text-dark small" style={{ fontSize: '11px' }}>{(parseFloat(project.budget) || 0).toLocaleString()} <span className="opacity-50" style={{ fontSize: '8px' }}>RWF</span></div>
                                                </div>
                                                <div className="text-center" style={{ minWidth: '60px' }}>
                                                    <div className="smaller text-muted fw-bold mb-0" style={{ fontSize: '8px' }}>PROGRESS</div>
                                                    <div className="fw-bold text-primary small" style={{ fontSize: '11px' }}>{project.progress}%</div>
                                                </div>
                                            </div>

                                            <div className="d-flex align-items-center gap-1 flex-shrink-0 ms-2">
                                                <button 
                                                    className={`btn ${project.isPublished ? 'btn-primary' : 'btn-light'} rounded-lg py-1 px-2 fw-bold border shadow-sm`}
                                                    onClick={() => handlePublishProject(project)}
                                                    style={{ fontSize: '10px' }}
                                                    title={project.isPublished ? "Unpublish from Landing" : "Publish to Landing"}
                                                >
                                                    <Globe size={12} className={`me-1 ${project.isPublished ? 'text-white' : 'text-primary'}`} />
                                                    {project.isPublished ? 'Live' : 'Publish'}
                                                </button>
                                                <button 
                                                    className="btn btn-light rounded-lg py-1 px-2 fw-bold border shadow-sm"
                                                    onClick={() => setSelectedProjectForDetail(project)}
                                                    style={{ fontSize: '10px' }}
                                                >
                                                    <Eye size={12} className="me-1 border-0" />
                                                    Preview
                                                </button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger className="btn btn-link text-muted p-1 hover:bg-gray-100 rounded-circle">
                                                        <MoreVertical size={14} />
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="shadow border-0 rounded-lg">
                                                        <DropdownMenuItem onClick={() => { setProjectToEdit(project); setIsProjectModalOpen(true); }} className="text-xs">
                                                            <Edit2 size={12} className="me-2 text-primary" /> Edit Project
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => { setProjectForImages(project); setIsImageModalOpen(true); }} className="text-xs">
                                                            <ImageIcon size={12} className="me-2 text-info" /> Add project images
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={async () => {
                                                            if (confirm(`Delete project ${project.name}?`)) {
                                                                try {
                                                                    await fetchApi(`/projects/${project.id}`, { method: 'DELETE' });
                                                                    localRefresh();
                                                                    toast.success("Project deleted successfully");
                                                                } catch (err) { 
                                                                    const msg = err instanceof Error ? err.message : "Failed to delete";
                                                                    toast.error(msg); 
                                                                }
                                                            }
                                                        }} className="text-danger text-xs">
                                                            <Trash2 size={12} className="me-2" /> Delete Project
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {projectsTotal > projectsPageSize && (
                                    <div className="mt-3">
                                        <PaginationSelector
                                            currentPage={projectsPage}
                                            totalPages={Math.ceil(projectsTotal / projectsPageSize)}
                                            pageSize={projectsPageSize}
                                            totalItems={projectsTotal}
                                            onPageChange={setProjectsPage}
                                            onPageSizeChange={setProjectsPageSize}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <AddSiteModal 
                isOpen={isEditModalOpen}
                onClose={() => { setIsEditModalOpen(false); setSiteToEdit(null); }}
                onSuccess={() => localRefresh()}
                initialData={siteToEdit}
            />

            <AddProjectModal
                isOpen={isProjectModalOpen}
                onClose={() => { setIsProjectModalOpen(false); setSiteForProject(null); setProjectToEdit(null); }}
                onSuccess={() => { localRefresh(); toast.success("Process successful"); }}
                initialData={projectToEdit || siteForProject}
                sites={sites}
            />

            <Modal isOpen={!!selectedProjectForDetail} onClose={() => setSelectedProjectForDetail(null)} title="Project Details" size="md" draggable={true}>
                {selectedProjectForDetail && (
                    <div className="flex flex-col gap-4">
                        <div className="bg-primary p-3 rounded text-white flex justify-between items-center shrink-0" style={{ background: '#009CFF' }}>
                            <div className="d-flex align-items-center gap-3">
                                <div className="bg-white/20 p-3 rounded-xl d-flex align-items-center justify-content-center">
                                    {getTypeIcon(selectedProjectForDetail.type, 28)}
                                </div>
                                <div>
                                    <h4 className="fw-bold mb-0 text-white">{selectedProjectForDetail.name}</h4>
                                    <p className="opacity-75 mb-0 small text-white">{selectedProjectForDetail.code}</p>
                                </div>
                            </div>
                        </div>

                        {selectedProjectForDetail.imageUrl && (
                            <div className="rounded-xl overflow-hidden border shadow-sm mx-2 mt-2" style={{ height: '240px' }}>
                                <img 
                                    src={selectedProjectForDetail.imageUrl} 
                                    alt={selectedProjectForDetail.name} 
                                    className="w-100 h-100 object-fit-cover"
                                />
                            </div>
                        )}

                        <div className="row g-2 p-2">
                            <div className="col-md-6 border-end text-start">
                                <h6 className="fw-bold mb-2 text-primary" style={{ fontSize: '10px' }}>CORE PROGRESS</h6>
                                <div className="mb-4">
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <span className="small text-muted">Completion</span>
                                        <span className="fw-bold h4 mb-0 text-dark">{selectedProjectForDetail.progress}%</span>
                                    </div>
                                    <div className="progress" style={{ height: '8px' }}>
                                        <div
                                            className="progress-bar bg-primary progress-bar-striped progress-bar-animated"
                                            role="progressbar"
                                            style={{ width: `${selectedProjectForDetail.progress}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="d-flex flex-column gap-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <MapPin className="text-muted" size={18} />
                                        <div>
                                            <div className="small text-muted">Site Location</div>
                                            <div className="fw-medium text-dark">{selectedProjectForDetail.location}</div>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center gap-3">
                                        <Calendar className="text-muted" size={18} />
                                        <div>
                                            <div className="small text-muted">Timeline</div>
                                            <div className="fw-medium text-dark">{selectedProjectForDetail.startDate?.split('T')[0]} to {selectedProjectForDetail.endDate?.split('T')[0]}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6 text-start ps-4">
                                <h6 className="fw-bold mb-2 text-primary" style={{ fontSize: '10px' }}>STAKEHOLDERS</h6>
                                <div className="d-flex flex-column gap-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <Users className="text-muted" size={18} />
                                        <div>
                                            <div className="small text-muted">Project Manager</div>
                                            <div className="fw-medium text-dark">{selectedProjectForDetail.manager}</div>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center gap-3 text-dark">
                                        <Building2 className="text-muted" size={18} />
                                        <div>
                                            <div className="small text-muted">Client / Owner</div>
                                            <div className="fw-medium text-dark">{selectedProjectForDetail.client}</div>
                                        </div>
                                    </div>
                                </div>
                                <h6 className="fw-bold mt-4 mb-2 text-primary" style={{ fontSize: '10px' }}>FINANCIALS</h6>
                                <div className="p-3 bg-light rounded-xl">
                                    <div className="row g-2">
                                        <div className="col-6">
                                            <label className="text-muted small d-block">Budgeted</label>
                                            <span className="fw-bold text-dark">{Number(selectedProjectForDetail.budget).toLocaleString()}</span>
                                        </div>
                                        <div className="col-6 border-start ps-2">
                                            <label className="text-muted small d-block">Spent</label>
                                            <span className="fw-bold text-danger">{Number(selectedProjectForDetail.actualCost).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {selectedProjectForDetail.description && (
                            <div className="text-start px-2 py-3 border-top mt-2">
                                <h6 className="fw-bold mb-1 text-primary" style={{ fontSize: '10px' }}>DESCRIPTION</h6>
                                <p className="text-muted small mb-0">
                                    {selectedProjectForDetail.description}
                                </p>
                            </div>
                        )}
                        {selectedProjectForDetail.gallery && selectedProjectForDetail.gallery.length > 0 && (
                            <div className="text-start px-2 py-3 border-top mt-2">
                                <h6 className="fw-bold mb-2 text-primary" style={{ fontSize: '10px' }}>SITUATIONAL GALLERY</h6>
                                <div className="row g-2">
                                    {selectedProjectForDetail.gallery.map((img: string, idx: number) => (
                                        <div key={idx} className="col-4">
                                            <div className="rounded-lg overflow-hidden border" style={{ height: '80px' }}>
                                                <img src={img} className="w-100 h-100 object-fit-cover shadow-sm transition-all hover:scale-110" alt="gallery" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="d-flex justify-content-end gap-2 pt-4 border-top mt-4 p-2">
                            <button
                                className="btn btn-light px-4 py-2 border fw-bold text-muted shadow-sm rounded-xl text-xs"
                                onClick={() => setSelectedProjectForDetail(null)}
                            >
                                Close Oversight
                            </button>
                            <button
                                onClick={() => { setProjectToEdit(selectedProjectForDetail); setSelectedProjectForDetail(null); setIsProjectModalOpen(true); }}
                                className="btn btn-primary px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2 rounded-xl text-xs"
                            >
                                <Edit size={14} /> Update Project
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Site Oversight Modal */}
            <Modal
                isOpen={!!selectedSiteForDetail}
                onClose={() => setSelectedSiteForDetail(null)}
                title="Site Detail Oversight"
                size="md"
            >
                {selectedSiteForDetail && (
                    <div className="p-1">
                        <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-blue-50 rounded-xl border-dashed border-blue-200 border">
                            <div className="bg-primary text-white p-3 rounded-xl shadow-sm">
                                <MapPin size={24} />
                            </div>
                            <div className="text-start">
                                <h4 className="fw-bold mb-0 text-dark">{selectedSiteForDetail.name}</h4>
                                <div className="d-flex align-items-center gap-2">
                                    <Badge className={`${getStatusColor(selectedSiteForDetail.status)} px-1 py-0`}>{selectedSiteForDetail.status.toUpperCase()}</Badge>
                                    <span className="smaller text-muted fw-bold">{selectedSiteForDetail.code}</span>
                                </div>
                            </div>
                        </div>

                        <div className="row g-3 px-1 text-start">
                            <div className="col-12 border-bottom pb-3">
                                <h6 className="fw-bold mb-2 text-primary" style={{ fontSize: '10px' }}>LOGISTICS & LOCATION</h6>
                                <div className="d-flex align-items-center gap-2 text-muted small">
                                    <MapPin size={14} className="text-primary" />
                                    <span>{selectedSiteForDetail.location}</span>
                                </div>
                            </div>

                            <div className="col-md-6 border-end">
                                <h6 className="fw-bold mb-2 text-primary" style={{ fontSize: '10px' }}>ESTABLISHMENT</h6>
                                <div className="d-flex align-items-center gap-2 text-muted small">
                                    <Calendar size={14} className="text-success" />
                                    <span>Created: {new Date(selectedSiteForDetail.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <h6 className="fw-bold mb-2 text-primary" style={{ fontSize: '10px' }}>SUPERVISION</h6>
                                <div className="d-flex align-items-center gap-2 text-muted small">
                                    <Users size={14} className="text-info" />
                                    <span>Manager ID: {selectedSiteForDetail.managerId || "Unassigned"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="d-flex justify-content-end gap-2 pt-4 border-top mt-4 p-2">
                            <button
                                className="btn btn-light px-4 py-2 border fw-bold text-muted shadow-sm rounded-xl text-xs"
                                onClick={() => setSelectedSiteForDetail(null)}
                            >
                                Close Oversight
                            </button>
                            <button
                                onClick={() => { setSelectedSite(selectedSiteForDetail); toast.success(`${selectedSiteForDetail.name} is now active`); setSelectedSiteForDetail(null); }}
                                className="btn btn-success px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2 rounded-xl text-xs"
                            >
                                <RefreshCw size={14} /> Pick Site
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            <AddProjectImagesModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                project={projectForImages}
                onSuccess={localRefresh}
            />

            <style>{`
                .site-row:hover { background-color: #f8fbff !important; border-color: #009CFF !important; }
                .rounded-xl { border-radius: 1rem !important; }
                .icon-box { transition: all 0.3s ease; }
                .smaller { font-size: 11px; }
                .search-input { padding-left: 35px !important; }
                .search-input::placeholder { text-indent: 5px; }
            `}</style>
        </div>
    );
}
