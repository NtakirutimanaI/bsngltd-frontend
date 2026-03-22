import { useEffect, useState } from "react";
import { Home, HardHat, DollarSign, FileText } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { Button } from "../../components/ui/button";
import { projectService, propertyService } from "../../services/dashboardApi";

export default function ClientDashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [projectsRes, propertiesRes] = await Promise.all([
        projectService.getAll(),
        propertyService.getAll(),
      ]);

      if (projectsRes.success) setProjects(projectsRes.data || []);
      if (propertiesRes.success) setProperties(propertiesRes.data || []);
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Client Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Client Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadDashboardData}>Retry</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Client Dashboard">
      <div className="space-y-2">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-3 pb-3 px-3">
              <p className="text-lg font-bold mb-1" style={{ color: 'var(--success)' }}>{properties.length}</p>
              <p className="text-xs font-medium" style={{ color: 'var(--primary)' }}>Properties</p>
              <p className="text-xs text-slate-600 mt-1">Owned & Rented</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-3 pb-3 px-3">
              <p className="text-lg font-bold mb-1" style={{ color: 'var(--success)' }}>{projects.length}</p>
              <p className="text-xs font-medium" style={{ color: 'var(--primary)' }}>Projects</p>
              <p className="text-xs text-slate-600 mt-1">In Progress</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-3 pb-3 px-3">
              <p className="text-lg font-bold mb-1" style={{ color: 'var(--success)' }}>180M</p>
              <p className="text-xs font-medium" style={{ color: 'var(--primary)' }}>Investment</p>
              <p className="text-xs text-slate-600 mt-1">Total RWF</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-3 pb-3 px-3">
              <p className="text-lg font-bold mb-1" style={{ color: 'var(--success)' }}>24</p>
              <p className="text-xs font-medium" style={{ color: 'var(--primary)' }}>Documents</p>
              <p className="text-xs text-slate-600 mt-1">Contracts</p>
            </CardContent>
          </Card>
        </div>

        {/* Projects and Properties - 2 columns */}
        <div className="grid md:grid-cols-2 gap-3">
          {/* My Projects */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>My Projects</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              {projects.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-3">No active projects</p>
              ) : (
                <div className="space-y-2">
                  {projects.slice(0, 3).map((project) => (
                    <div key={project.id} className="text-xs py-1.5 border-b last:border-b-0">
                      <div className="flex items-center justify-between mb-1">
                        <p style={{ color: 'var(--primary)' }} className="font-medium truncate">{project.name}</p>
                        <Badge className="h-4 py-0 text-xs" variant="success">
                          {project.progress}%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-600 mb-0.5">
                        <span>{project.type}</span>
                        <span>{project.status.replace('_', ' ')}</span>
                      </div>
                      <Progress value={project.progress} className="h-1" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Properties */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>My Properties</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              {properties.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-3">No properties</p>
              ) : (
                <div className="space-y-2">
                  {properties.slice(0, 3).map((property) => (
                    <div key={property.id} className="text-xs py-1.5 border-b last:border-b-0">
                      <div className="flex items-center justify-between mb-1">
                        <p style={{ color: 'var(--primary)' }} className="font-medium truncate">{property.title}</p>
                        <Badge
                          className="h-4 py-0 text-xs"
                          style={{
                            backgroundColor: property.status === 'available' ? '#10b981' : '#009CFF',
                            color: 'white'
                          }}
                        >
                          {property.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>{property.location}</span>
                        <span className="font-medium text-green-600">RWF {(property.price / 1000000).toFixed(1)}M</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Financial Summary */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>Project Costs</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            {projects.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-3">No cost data</p>
            ) : (
              <div className="space-y-2">
                {projects.slice(0, 3).map((project) => (
                  <div key={project.id} className="text-xs py-1.5 border-b last:border-b-0">
                    <p style={{ color: 'var(--primary)' }} className="font-medium mb-1">{project.name}</p>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Budget: RWF {(project.estimatedCost / 1000000).toFixed(1)}M</span>
                      <span className="font-medium">Spent: RWF {(project.actualCost / 1000000).toFixed(1)}M</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
