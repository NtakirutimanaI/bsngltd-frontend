import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import {
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
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

export function Projects({ hideHeader = false }: { hideHeader?: boolean }) {
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
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "construction": return "🏗️";
      case "renovation": return "🔧";
      case "plot_sale": return "🏞️";
      case "rental": return "🏠";
      default: return "📋";
    }
  };

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      {!hideHeader && (
        <ScrollReveal className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4 mb-4">
          <div>
            <h1 className="h3 fw-bold text-dark">{pageTitle}</h1>
            <p className="text-muted mt-1">{pageSubtitle}</p>
          </div>
          {isAdminOrManager && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 dark:shadow-none transition-all hover:scale-105 active:scale-95 d-flex align-items-center gap-2 border-0"
            >
              <Plus className="h-4 w-4" />
              New Project
            </button>
          )}
        </ScrollReveal>
      )}

      {/* Filters */}
      <ScrollReveal delay={0.1} className="card border-0 shadow-sm mb-4">
        <div className="card-body py-2">
          <div className="row g-2">
            <div className="col-md-8 position-relative">
              <Search className="position-absolute top-50 translate-middle-y text-muted" style={{ left: '12px', width: '18px', height: '18px' }} />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="form-control form-control-sm border-0 border-bottom border-2 rounded-0 bg-transparent focus:ring-0"
                style={{ paddingLeft: '40px', paddingBottom: '0.5rem', borderColor: '#9ca3af', outline: 'none', boxShadow: 'none' }}
                onFocus={(e) => e.target.style.borderColor = '#f97316'}
                onBlur={(e) => e.target.style.borderColor = '#9ca3af'}
              />
            </div>
            <div className="col-md-4 d-flex gap-2">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <Filter className="w-4 h-4 text-muted" />
                </span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="form-select form-select-sm border-start-0"
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
      <div className="row g-4">
        {projects.map((project, index) => (
          <div key={project.id} className="col-lg-6">
            <ScrollReveal
              delay={index * 0.1}
              className="card border-0 shadow-sm h-100 hover-shadow transition-all"
            >
              <div className="card-body">
                <div className="d-flex align-items-start justify-content-between mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <div className="display-6 me-2">{getTypeIcon(project.type)}</div>
                    <div>
                      <h5 className="card-title fw-bold text-dark mb-0">{project.name}</h5>
                      <small className="text-muted">{project.code}</small>
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
                    <button className="bg-transparent border-0 text-muted p-2 hover:text-emerald-600 transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="d-flex flex-column gap-2 mb-3">
                  <div className="d-flex align-items-center gap-2 text-muted small">
                    <MapPin className="w-4 h-4" />
                    <span>{project.location}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 text-muted small">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {project.startDate} - {project.endDate}
                    </span>
                  </div>
                  <div className="d-flex align-items-center gap-2 text-muted small">
                    <DollarSign className="w-4 h-4" />
                    <span>
                      Budget: {project.budget} | Spent: {project.actualCost}
                    </span>
                  </div>
                  <div className="d-flex align-items-center gap-2 text-muted small">
                    <Users className="w-4 h-4" />
                    <span>
                      {project.manager} | {project.client}
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <span className="small fw-medium text-muted">Progress</span>
                    <span className="small fw-bold text-dark">{project.progress}%</span>
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
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="flex-fill bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-[1.02] active:scale-95 d-flex align-items-center justify-content-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  {isAdminOrManager && (
                    <>
                      <button
                        onClick={() => setEditingProject(project)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl transition-all hover:scale-110 active:scale-90 border-0 shadow-sm"
                        title="Edit Project"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`Are you sure you want to delete project ${project.name}?`)) {
                            try {
                              await fetchApi(`/projects/${project.id}`, { method: 'DELETE' });
                              setRefreshKey(prev => prev + 1);
                            } catch (err) {
                              console.error("Delete failed", err);
                              alert("Failed to delete project");
                            }
                          }
                        }}
                        className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-xl transition-all hover:scale-110 active:scale-90 border-0"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
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
        onSuccess={() => setRefreshKey(prev => prev + 1)}
      />

      {/* Project Details Modal */}
      <Modal isOpen={!!selectedProject} onClose={() => setSelectedProject(null)} title="Project Details" size="md" draggable={true}>
        {selectedProject && (
          <div className="flex flex-col gap-4">
            <div className="bg-primary p-2 rounded text-white flex justify-between items-center shrink-0">
              <div className="d-flex align-items-center gap-3">
                <div className="text-3xl bg-white/20 p-2 rounded-xl">{getTypeIcon(selectedProject.type)}</div>
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

            <div className="d-flex justify-content-end gap-3 pt-3 border-top border-gray-100 dark:border-gray-800">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:scale-105 active:scale-95 bg-white dark:bg-gray-800"
                onClick={() => setSelectedProject(null)}
              >
                Close
              </button>
              {isAdminOrManager && (
                <button
                  onClick={() => { setEditingProject(selectedProject); setSelectedProject(null); }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 dark:shadow-none transition-all hover:scale-105 active:scale-95 d-flex align-items-center gap-2 border-0"
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