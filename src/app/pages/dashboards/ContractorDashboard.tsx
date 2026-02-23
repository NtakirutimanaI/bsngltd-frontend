import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  HardHat,
  FileText,
  Calendar,
  DollarSign,
  ArrowRight,
  Clock,
  CheckCircle
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { Badge } from "../../components/ui/badge";
import { projectService } from "../../services/dashboardApi";
import { ConstructionProject } from "../../types";

export default function ContractorDashboard() {
  const [projects, setProjects] = useState<ConstructionProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const projectsRes = await projectService.getAll();
      if (projectsRes.success && projectsRes.data) setProjects(projectsRes.data);
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Contractor Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Contractor Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadDashboardData}>Retry</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const activeProjects = projects.filter(p => p.status === 'in_progress');
  const completedProjects = projects.filter(p => p.status === 'completed');
  const plannedProjects = projects.filter(p => p.status === 'planning');

  const contractorStats = [
    {
      title: "Active Contracts",
      value: activeProjects.length,
      icon: HardHat,
      color: "blue",
    },
    {
      title: "Completed Projects",
      value: completedProjects.length,
      icon: CheckCircle,
      color: "green",
    },
    {
      title: "Upcoming Projects",
      value: plannedProjects.length,
      icon: Clock,
      color: "amber",
    },
    {
      title: "Total Projects",
      value: projects.length,
      icon: FileText,
      color: "purple",
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
    <DashboardLayout title="Contractor Dashboard">
      <div className="space-y-2">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {contractorStats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="pt-3 pb-3 px-3">
                <p className="text-lg font-bold mb-1" style={{ color: 'var(--success)' }}>{stat.value}</p>
                <p className="text-xs font-medium" style={{ color: 'var(--primary)' }}>{stat.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* My Projects */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>My Projects</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            {projects.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No projects assigned</p>
            ) : (
              <div className="space-y-2">
                {projects.map((project) => (
                  <div key={project.id} className="text-xs border-b pb-2 last:border-b-0">
                    <div className="flex items-center justify-between mb-1">
                      <p style={{ color: 'var(--primary)' }} className="font-medium truncate">{project.name}</p>
                      <Badge className="h-4 py-0 text-xs" variant="success">
                        {project.progress}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                      <span>{project.type}</span>
                      <span>{project.status.replace('_', ' ')}</span>
                    </div>
                    <Progress value={project.progress} className="h-1 mb-1.5" />
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Budget: RWF {(project.estimatedCost / 1000000).toFixed(1)}M</span>
                      <span>Spent: RWF {(project.actualCost / 1000000).toFixed(1)}M</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project Summary - 2 columns */}
        <div className="grid md:grid-cols-2 gap-3">
          {/* Status Breakdown */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>Status</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b">
                  <span className="text-slate-600">Active Contracts</span>
                  <Badge className="h-4 py-0" variant="success">
                    {activeProjects.length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b">
                  <span className="text-slate-600">Completed</span>
                  <Badge className="h-4 py-0" style={{ backgroundColor: '#10b981', color: 'white' }}>
                    {completedProjects.length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-600">Upcoming</span>
                  <Badge className="h-4 py-0" style={{ backgroundColor: 'var(--warning)', color: 'white' }}>
                    {plannedProjects.length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="grid grid-cols-2 gap-2">
                <Link to="/dashboard/projects">
                  <Button size="sm" className="w-full text-xs" style={{ background: '#16a085', border: 'none', color: '#fff' }}>
                    <HardHat className="mr-1 size-3" />
                    Projects
                  </Button>
                </Link>
                <Link to="/dashboard/documents">
                  <Button size="sm" className="w-full text-xs" style={{ background: '#16a085', border: 'none', color: '#fff' }}>
                    <FileText className="mr-1 size-3" />
                    Documents
                  </Button>
                </Link>
                <Link to="/dashboard/calendar">
                  <Button size="sm" className="w-full text-xs" style={{ background: '#16a085', border: 'none', color: '#fff' }}>
                    <Calendar className="mr-1 size-3" />
                    Timeline
                  </Button>
                </Link>
                <Link to="/dashboard/notifications">
                  <Button size="sm" className="w-full text-xs" style={{ background: '#16a085', border: 'none', color: '#fff' }}>
                    <Clock className="mr-1 size-3" />
                    Updates
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
