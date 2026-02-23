import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  HardHat,
  Home,
  Users,
  Calendar,
  FileText,
  TrendingUp,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { Badge } from "../../components/ui/badge";
import { dashboardService, projectService, propertyService } from "../../services/dashboardApi";
import { DashboardStats, ConstructionProject, Property } from "../../types";

export default function SiteManagerDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<ConstructionProject[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, projectsRes, propertiesRes] = await Promise.all([
        dashboardService.getStats(),
        projectService.getAll(),
        propertyService.getAll(),
      ]);

      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (projectsRes.success && projectsRes.data) setProjects(projectsRes.data);
      if (propertiesRes.success && propertiesRes.data) setProperties(propertiesRes.data.slice(0, 5));
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Site Manager Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !stats) {
    return (
      <DashboardLayout title="Site Manager Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || "Failed to load dashboard"}</p>
            <Button onClick={loadDashboardData}>Retry</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const siteStats = [
    {
      title: "Active Projects",
      value: stats.activeProjects,
      icon: HardHat,
      color: "blue",
      link: "/dashboard/projects",
    },
    {
      title: "Completed Projects",
      value: stats.completedProjects,
      icon: CheckCircle,
      color: "green",
      link: "/dashboard/projects",
    },
    {
      title: "Total Properties",
      value: stats.totalProperties,
      icon: Home,
      color: "purple",
      link: "/dashboard/properties",
    },
    {
      title: "Available Properties",
      value: stats.availableProperties,
      icon: TrendingUp,
      color: "amber",
      link: "/dashboard/properties",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress": return "bg-blue-100 text-blue-700";
      case "planning": return "bg-amber-100 text-amber-700";
      case "completed": return "bg-green-100 text-green-700";
      case "on_hold": return "bg-red-100 text-red-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <DashboardLayout title="Site Manager Dashboard">
      <div className="space-y-2">
        {/* Site Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {siteStats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="pt-3 pb-3 px-3">
                <p className="text-lg font-bold mb-1" style={{ color: 'var(--success)' }}>{stat.value}</p>
                <p className="text-xs font-medium" style={{ color: 'var(--primary)' }}>{stat.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Projects and Properties - 2 columns */}
        <div className="grid md:grid-cols-2 gap-3">
          {/* Active Projects */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>Active Projects</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              {projects.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-3">No active projects</p>
              ) : (
                <div className="space-y-2">
                  {projects.slice(0, 3).map((project) => (
                    <div key={project.id} className="border-b pb-2 last:border-b-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium" style={{ color: 'var(--primary)' }}>{project.name}</p>
                        <Badge className="h-4 py-0 text-xs" variant="success">
                          {project.progress}%
                        </Badge>
                      </div>
                      <Progress value={project.progress} className="h-1.5" />
                      <p className="text-xs text-slate-600 mt-1">Cost: RWF {(project.actualCost / 1000000).toFixed(1)}M</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Properties Overview */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>Properties</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="space-y-2">
                {properties.length > 0 ? (
                  properties.slice(0, 3).map((prop) => (
                    <div key={prop.id} className="flex items-center justify-between text-xs py-1 border-b last:border-b-0">
                      <span style={{ color: 'var(--primary)' }} className="font-medium">{prop.name}</span>
                      <Badge
                        className="h-4 py-0 text-xs"
                        style={{
                          backgroundColor: prop.status === 'available' ? '#10b981' : '#16a085',
                          color: 'white'
                        }}
                      >
                        {prop.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-3">No properties</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - 2 columns */}
        <div className="grid md:grid-cols-2 gap-3">
          {/* Site Operations */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>Operations</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="grid grid-cols-2 gap-2">
                <Link to="/dashboard/projects">
                  <Button size="sm" className="w-full text-xs" style={{ background: '#16a085', border: 'none', color: '#fff' }}>
                    <HardHat className="mr-1 size-3" />
                    Projects
                  </Button>
                </Link>
                <Link to="/dashboard/properties">
                  <Button size="sm" className="w-full text-xs" style={{ background: '#16a085', border: 'none', color: '#fff' }}>
                    <Home className="mr-1 size-3" />
                    Properties
                  </Button>
                </Link>
                <Link to="/dashboard/attendance">
                  <Button size="sm" className="w-full text-xs" style={{ background: '#16a085', border: 'none', color: '#fff' }}>
                    <Calendar className="mr-1 size-3" />
                    Attendance
                  </Button>
                </Link>
                <Link to="/dashboard/notifications">
                  <Button size="sm" className="w-full text-xs" style={{ background: '#16a085', border: 'none', color: '#fff' }}>
                    <FileText className="mr-1 size-3" />
                    Docs
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Status Summary */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>Summary</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b">
                  <span style={{ color: 'var(--primary)' }} className="font-medium">Projects in Progress</span>
                  <Badge className="h-4 py-0" variant="success">
                    {stats.activeProjects}
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b">
                  <span style={{ color: 'var(--primary)' }} className="font-medium">Available Properties</span>
                  <Badge className="h-4 py-0" variant="success">
                    {stats.availableProperties}
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span style={{ color: 'var(--primary)' }} className="font-medium">Completed</span>
                  <Badge className="h-4 py-0" style={{ backgroundColor: '#10b981', color: 'white' }}>
                    {stats.completedProjects}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
