import { useEffect, useState } from "react";
import { Link } from "react-router";
import { 
  Home, 
  HardHat, 
  DollarSign, 
  FileText, 
  ArrowRight, 
  MapPin,
  Briefcase
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { projectService, propertyService } from "../../services/dashboardApi";

export default function ClientDashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [projectsRes, propertiesRes] = await Promise.all([
        projectService.getAll(1, 4),
        propertyService.getAll(1, 4),
      ]);

      if (projectsRes.success) setProjects(Array.isArray(projectsRes.data) ? projectsRes.data : []);
      if (propertiesRes.success) setProperties(Array.isArray(propertiesRes.data) ? propertiesRes.data : []);
    } catch (err) {
      console.error("Error loading dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalInvestment = projects.reduce((sum, p) => sum + (Number(p.actualCost) || 0), 0) + 
                         properties.reduce((sum, p) => sum + (Number(p.price) || 0), 0);

  const stats = [
    { label: 'MY PROPERTIES', value: `${properties.length}`, sub: 'Owned & Rented', color: 'bg-blue-100 text-blue-600', Icon: Home },
    { label: 'ACTIVE PROJECTS', value: `${projects.length}`, sub: 'In Progress', color: 'bg-emerald-100 text-emerald-600', Icon: HardHat },
    { label: 'TOTAL PAYMENT', value: `RWF ${(totalInvestment / 1000000).toFixed(1)}M`, sub: 'Settled records', color: 'bg-amber-100 text-amber-600', Icon: DollarSign },
    { label: 'SUPPORT', value: '24', sub: 'Messages & Help', color: 'bg-purple-100 text-purple-600', Icon: FileText },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#009CFF' }} />
      </div>
    );
  }

  return (
    <div className="container-fluid py-0 mt-1 min-vh-100" style={{ background: 'transparent' }}>
      {/* Stats Grid */}
      <div className="px-lg-0 mb-4">
        <div className="row g-2">
          {stats.map((stat, i) => (
            <div key={i} className="col-sm-6 col-md-3">
              <div className="glass-card p-3 rounded-xl border border-white shadow-sm d-flex align-items-center gap-3" style={{ background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)', minHeight: '80px' }}>
                <div className={`${stat.color} rounded-lg p-2 shadow-sm d-flex justify-content-center align-items-center`} style={{ width: '42px', height: '42px' }}>
                   <stat.Icon size={20} />
                </div>
                <div className="overflow-hidden">
                  <div className="fw-bold text-dark h5 mb-0 truncate">{stat.value}</div>
                  <div className="smaller text-muted fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="row g-3">
        {/* Active Projects Hub */}
        <div className="col-lg-6">
          <div className="glass-card p-3 rounded-xl border border-white shadow-sm h-100" style={{ background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)' }}>
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-gray-100">
               <div>
                  <h6 className="fw-bold text-dark mb-0">Active Projects Oversight</h6>
                  <p className="text-muted mb-0" style={{ fontSize: '10px' }}>Ongoing construction and site tasks</p>
               </div>
               <Link to="/dashboard/projects" className="btn btn-sm btn-link text-primary fw-bold text-decoration-none p-0" style={{ fontSize: '11px' }}>
                  SHOW ALL <ArrowRight size={12} className="ms-1" />
               </Link>
            </div>
            
            <div className="space-y-3">
              {projects.length === 0 ? (
                <div className="text-center py-5">
                  <Briefcase className="text-muted mx-auto mb-2 opacity-50" size={32} />
                  <p className="text-muted small">No active projects found</p>
                </div>
              ) : (
                projects.map((project) => (
                  <div key={project.id} className="p-2 rounded-xl bg-white/40 border border-white/60 mb-2">
                    <div className="d-flex align-items-start justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <div className="bg-blue-50 p-2 rounded-lg text-blue-600 shadow-xs">
                          <HardHat size={16} />
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="fw-bold text-dark mb-0 truncate" style={{ fontSize: '12px' }}>{project.name}</h4>
                          <span className="text-muted" style={{ fontSize: '10px' }}>{project.type}</span>
                        </div>
                      </div>
                      <Badge className="bg-blue-500 text-white border-0 py-0 px-2 fw-bold" style={{ fontSize: '9px' }}>
                        {project.status?.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="d-flex align-items-center justify-content-between text-muted mb-1 px-1" style={{ fontSize: '10px' }}>
                      <span className="fw-bold">Completion Rate</span>
                      <span className="fw-bold text-primary">{project.progress}%</span>
                    </div>
                    <div className="progress-container mx-1" style={{ height: '6px', borderRadius: '10px', background: '#eef2ff', overflow: 'hidden' }}>
                      <div className="progress-bar-inner bg-primary" style={{ width: `${project.progress}%`, height: '100%', borderRadius: '10px' }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Property Inventory Hub */}
        <div className="col-lg-6">
          <div className="glass-card p-3 rounded-xl border border-white shadow-sm h-100" style={{ background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)' }}>
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-gray-100">
               <div>
                  <h6 className="fw-bold text-dark mb-0">Property Inventory</h6>
                  <p className="text-muted mb-0" style={{ fontSize: '10px' }}>Owned, rented and reserved assets</p>
               </div>
               <Link to="/dashboard/projects?tab=properties" className="btn btn-sm btn-link text-success fw-bold text-decoration-none p-0" style={{ fontSize: '11px' }}>
                  SHOW ALL <ArrowRight size={12} className="ms-1" />
               </Link>
            </div>

            <div className="space-y-3">
              {properties.length === 0 ? (
                <div className="text-center py-5">
                  <Home className="text-muted mx-auto mb-2 opacity-50" size={32} />
                  <p className="text-muted small">No property records found</p>
                </div>
              ) : (
                properties.map((property) => (
                  <div key={property.id} className="p-2 rounded-xl bg-white/40 border border-white/60 mb-2 d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-3 overflow-hidden">
                      <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600 shadow-xs flex-shrink-0">
                        <Home size={16} />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="fw-bold text-dark mb-0 truncate" style={{ fontSize: '12px' }}>{property.title}</h4>
                        <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '9px' }}>
                          <MapPin size={10} /> {property.location}
                        </div>
                      </div>
                    </div>
                    <div className="text-end shrink-0 ps-2">
                       <p className="fw-bold text-emerald-600 mb-0" style={{ fontSize: '12px' }}>
                         RWF {(property.price / 1000000).toFixed(1)}M
                       </p>
                       <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 py-0 px-1 fw-bold" style={{ fontSize: '8px' }}>
                         {property.status?.toUpperCase()}
                       </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .glass-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .glass-card:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
        .shadow-xs { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        .smaller { font-size: 11px; }
      `}</style>
    </div>
  );
}
