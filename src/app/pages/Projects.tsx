import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import {
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  HardHat,
  Wrench,
  LandPlot,
  ClipboardList,
} from "lucide-react";
import { AddProjectModal } from "@/app/components/AddProjectModal";
import { fetchApi } from '../api/client';
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { PaginationSelector } from "@/app/components/ui/pagination-selector";
import { Modal } from '@/app/components/Modal';
import { useAuth } from "@/app/context/AuthContext";
import { useDebounce } from "@/app/hooks/useDebounce";

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  lastPage: number;
}

interface Project {
  id: string;
  code: string;
  name: string;
  type: string;
  status: string;
  location: string;
  startDate: string;
  endDate: string;
  budget: string;
  actualCost: string;
  manager: string;
  client: string;
  progress: number;
  description?: string;
}

export function Projects({ hideHeader = false, refreshKey: externalRefreshKey = 0 }: { hideHeader?: boolean, refreshKey?: number }) {
  const { user } = useAuth();
  const roleName = ((typeof user?.role === 'object' && user.role !== null) ? user.role.name : user?.role || 'guest').toLowerCase();

  const isEmployee = roleName === 'employee';
  const isContractor = roleName === 'contractor';
  const isSiteManager = roleName === 'site_manager';
  const isAdminOrManager = ['super_admin', 'admin', 'manager'].includes(roleName);

  const pageTitle = isEmployee || isContractor ? 'My Assigned Projects' : (isSiteManager ? 'Site Projects Oversight' : 'Projects');
  const pageSubtitle = isEmployee || isContractor ? 'Track and update your assigned construction tasks' : 'Manage and track construction projects and site progress';

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [filterStatus, setFilterStatus] = useState("all");

  // Sync URL search parameter to local state (for header search)
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    if (urlSearch !== searchTerm) {
      setSearchTerm(urlSearch);
    }
  }, [searchParams]);

  // Sync state changes to URL
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    if (term) {
      setSearchParams({ search: term });
    } else {
      setSearchParams({});
    }
  };
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [internalRefreshKey, setInternalRefreshKey] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Combine internal and external refresh triggers
  useEffect(() => {
    setRefreshKey(internalRefreshKey + externalRefreshKey);
  }, [internalRefreshKey, externalRefreshKey]);

  // Handle direct navigation to a project
  useEffect(() => {
    const projectId = searchParams.get('id');
    if (projectId && projects.length > 0) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        setSelectedProject(project);
      }
    }
  }, [searchParams, projects]);

  // Fetch projects
  useEffect(() => {
    setIsLoading(true);
    const query = new URLSearchParams({
      page: currentPage.toString(),
      limit: pageSize.toString(),
      search: debouncedSearchTerm,
      status: filterStatus
    }).toString();

    fetchApi<PaginatedResponse<Project>>(`/projects?${query}`)
      .then(res => {
        setProjects(res.data || []);
        setTotalPages(res.lastPage || 1);
        setTotalItems(res.total || 0);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch projects", err);
        setIsLoading(false);
      });
  }, [currentPage, pageSize, debouncedSearchTerm, filterStatus, refreshKey]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success-subtle text-success";
      case "planning": return "bg-primary-subtle text-primary";
      case "on_hold": return "bg-warning-subtle text-warning";
      case "completed": return "bg-secondary-subtle text-secondary";
      case "cancelled": return "bg-danger-subtle text-danger";
      default: return "bg-light text-dark";
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

  return (
    <div className="container-fluid py-0 mt-1 min-vh-100 px-2 px-md-4 pb-4" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
      {/* Header */}
      {!hideHeader && (
        <ScrollReveal className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-2">
          <div>
            <h1 className="h4 fw-bold text-dark mb-1">{pageTitle}</h1>
            <p className="text-muted small mb-0">{pageSubtitle}</p>
          </div>
          {isAdminOrManager && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn btn-sm d-flex align-items-center gap-2 text-white shadow-none border-0"
              style={{ background: '#009CFF', borderRadius: '8px', fontSize: '11px', fontWeight: 600, padding: '8px 16px', height: '32px' }}
            >
              <Plus size={14} /> New Project
            </button>
          )}
        </ScrollReveal>
      )}

      {/* Filters */}
      <ScrollReveal delay={0.1}>
        <div className="glass-card p-2 rounded-xl mb-2 border border-white shadow-sm" style={{ background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)' }}>
        <div className="p-1 px-2">
          <div className="row g-3 align-items-center">
            <div className="col-lg-8 position-relative">
              <Search className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" size={18} />
              <input
                type="text"
                placeholder="Search projects by name, code or location..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="form-control ps-5 bg-white border-0 shadow-sm transition-all"
                style={{ height: '38px', borderRadius: '8px', fontSize: '13px' }}
              />
            </div>
            <div className="col-lg-4 d-flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="form-select bg-white border-0 shadow-sm fw-semibold"
                style={{ height: '38px', borderRadius: '8px', fontSize: '12px' }}
              >
                <option value="all">All Status</option>
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
        </div>
      </ScrollReveal>

      {/* Projects Grid */}
      <div className="row g-2">
        {projects.map((project, index) => (
          <div key={project.id} className="col-lg-6">
            <ScrollReveal delay={index * 0.1}>
              <div className="glass-card rounded-xl p-2 px-3 border border-white shadow-sm h-100 transition-all" style={{ background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)' }}>
                <div className="d-flex align-items-start justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <div className="me-2 d-flex align-items-center justify-content-center bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700" style={{ width: '38px', height: '38px' }}>
                      {getTypeIcon(project.type, 18)}
                    </div>
                    <div>
                      <h6 className="fw-bold text-dark mb-0">{project.name}</h6>
                      <small className="text-muted" style={{ fontSize: '11px' }}>{project.code}</small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className={`badge rounded-pill ${getStatusColor(
                        project.status
                      )}`}
                    >
                      {project.status.replace("_", " ").toUpperCase()}
                    </span>
                    <button className="bg-transparent border-0 text-muted p-1 hover:text-blue-600 transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>

                <div className="d-flex flex-column gap-1 mb-2">
                  <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '13px' }}>
                    <MapPin size={14} />
                    <span>{project.location}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '13px' }}>
                    <Calendar size={14} />
                    <span>
                      {project.startDate} - {project.endDate}
                    </span>
                  </div>
                  <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '13px' }}>
                    <DollarSign size={14} />
                    <span>
                      Budget: {project.budget} | Spent: {project.actualCost}
                    </span>
                  </div>
                  <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '13px' }}>
                    <Users size={14} />
                    <span>
                      {project.manager} | {project.client}
                    </span>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="d-flex align-items-center justify-content-between mb-1" style={{ fontSize: '11px' }}>
                    <span className="fw-medium text-muted">Progress</span>
                    <span className="fw-bold text-dark">{project.progress}%</span>
                  </div>
                  <div className="progress" style={{ height: '6px' }}>
                    <div
                      className="progress-bar bg-primary"
                      role="progressbar"
                      style={{ width: `${project.progress}%` }}
                      aria-valuenow={project.progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                </div>

                <div className="d-flex gap-2">
                 <div className="d-flex gap-2 mt-1 w-100">
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                    style={{ borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', height: '32px', border: 'none' }}
                  >
                    Detail
                  </button>
                  {isAdminOrManager && (
                    <>
                      <button
                        onClick={() => setEditingProject(project)}
                        className="btn btn-outline-secondary d-flex align-items-center justify-content-center bg-white"
                        style={{ borderRadius: '6px', width: '32px', height: '32px', border: '1px solid #333', color: '#333', padding: '0' }}
                        title="Edit Project"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`Are you sure you want to delete project ${project.name}?`)) {
                            try {
                              await fetchApi(`/projects/${project.id}`, { method: 'DELETE' });
                              setInternalRefreshKey(prev => prev + 1);
                            } catch (err) {
                              console.error("Delete failed", err);
                              alert("Failed to delete project");
                            }
                          }
                        }}
                        className="btn btn-outline-danger d-flex align-items-center justify-content-center bg-white"
                        style={{ borderRadius: '6px', width: '32px', height: '32px', border: '1px solid #dc3545', color: '#dc3545', padding: '0' }}
                        title="Delete Project"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                 </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        ))}
      </div>

      {projects.length === 0 && !isLoading && (
        <ScrollReveal delay={0.2} className="text-center py-5">
          <Building2 className="text-muted w-12 h-12 mx-auto mb-3" size={48} />
          <p className="text-muted">No projects found matching your criteria.</p>
        </ScrollReveal>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <ScrollReveal delay={0.3} className="py-4">
          <PaginationSelector
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1); // Reset to first page when changing page size
            }}
          />
        </ScrollReveal>
      )}

      {/* Add/Edit Project Modal */}
      <AddProjectModal
        isOpen={isAddModalOpen || !!editingProject}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingProject(null);
        }}
        initialData={editingProject}
        onSuccess={() => setInternalRefreshKey(prev => prev + 1)}
      />

      {/* Project Details Modal */}
      <Modal isOpen={!!selectedProject} onClose={() => setSelectedProject(null)} title="Project Details" size="md" draggable={true}>
        {selectedProject && (
          <div className="flex flex-col gap-4">
            <div className="bg-primary p-3 rounded text-white flex justify-between items-center shrink-0" style={{ background: '#009CFF' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="bg-white/20 p-3 rounded-xl d-flex align-items-center justify-content-center">
                  {getTypeIcon(selectedProject.type, 28)}
                </div>
                <div>
                  <h4 className="fw-bold mb-0 text-white">{selectedProject.name}</h4>
                  <p className="opacity-75 mb-0 small text-white">{selectedProject.code}</p>
                </div>
              </div>
            </div>

            <div className="row g-2">
              <div className="col-md-6 border-end dark:border-gray-800 text-start">
                <h6 className="fw-bold mb-2 text-primary text-xs">Core Progress</h6>
                <div className="mb-4">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="small text-muted">Completion Progress</span>
                    <span className="fw-bold h4 mb-0 text-dark dark:text-gray-100">{selectedProject.progress}%</span>
                  </div>
                  <div className="progress" style={{ height: '12px' }}>
                    <div
                      className="progress-bar bg-primary progress-bar-striped progress-bar-animated"
                      role="progressbar"
                      style={{ width: `${selectedProject.progress}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="d-flex align-items-center gap-3 text-dark">
                    <MapPin className="text-muted" size={18} />
                    <div>
                      <div className="small text-muted">Site Location</div>
                      <div className="fw-medium text-dark dark:text-gray-200">{selectedProject.location}</div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3 text-dark">
                    <Calendar className="text-muted" size={18} />
                    <div>
                      <div className="small text-muted">Timeline</div>
                      <div className="fw-medium text-dark dark:text-gray-200">{selectedProject.startDate} to {selectedProject.endDate}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6 text-start">
                <h6 className="fw-bold mb-2 text-primary text-xs">Key Stakeholders</h6>
                <div className="space-y-4">
                  <div className="d-flex align-items-center gap-3 text-dark">
                    <Users className="text-muted" size={18} />
                    <div>
                      <div className="small text-muted">Project Manager</div>
                      <div className="fw-medium text-dark dark:text-gray-200">{selectedProject.manager}</div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3 text-dark">
                    <Building2 className="text-muted" size={18} />
                    <div>
                      <div className="small text-muted">Client / Owner</div>
                      <div className="fw-medium text-dark dark:text-gray-200">{selectedProject.client}</div>
                    </div>
                  </div>
                </div>
                <h6 className="fw-bold mt-2 mb-2 text-primary text-xs">Financial Summary</h6>
                <div className="p-3 bg-light dark:bg-gray-800 rounded-3">
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="text-muted small d-block">Budgeted</label>
                      <span className="fw-bold text-dark dark:text-gray-200">{selectedProject.budget}</span>
                    </div>
                    <div className="col-6">
                      <label className="text-muted small d-block">Actual Cost</label>
                      <span className="fw-bold text-danger">{selectedProject.actualCost}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {selectedProject.description && (
              <div className="text-start">
                <h6 className="fw-bold mb-1 text-primary text-xs">Description</h6>
                <p className="text-muted text-xs bg-light dark:bg-gray-800 p-2 rounded mb-0">
                  {selectedProject.description}
                </p>
              </div>
            )}

            <div className="alert alert-info border-0 bg-info-subtle d-flex align-items-center gap-3 mb-0">
              <div className="p-2 bg-white dark:bg-gray-700 rounded-circle"><Building2 size={16} className="text-info" /></div>
              <div className="small text-dark dark:text-gray-200">
                Project status is currently <strong>{selectedProject.status.toUpperCase()}</strong>.
                All site reports and material inspections are up to date.
              </div>
            </div>

            <div className="d-flex justify-content-end gap-3 pt-4 border-top mt-4">
              <button
                type="button"
                className="btn btn-light px-4 py-2 border fw-bold text-muted shadow-sm"
                style={{ borderRadius: '10px' }}
                onClick={() => setSelectedProject(null)}
              >
                Close
              </button>
              {isAdminOrManager && (
                <button
                  onClick={() => { setEditingProject(selectedProject); setSelectedProject(null); }}
                  className="btn btn-primary px-5 py-2 fw-bold shadow-sm d-flex align-items-center gap-2"
                  style={{ borderRadius: '10px' }}
                >
                  <Edit size={16} /> Edit Project
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
