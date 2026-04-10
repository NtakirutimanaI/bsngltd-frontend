import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Calendar,
  Clock,
  DollarSign,
  HardHat,
  User,
  FileText,
  Bell,
  ArrowRight
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { useAuth } from "../../context/AuthContext";
import { projectService, salaryService, notificationService } from "../../services/dashboardApi";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [salary, setSalary] = useState<any | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [projectsRes, salaryRes, notificationsRes] = await Promise.all([
        projectService.getAll(),
        salaryService.getAll(),
        notificationService.getAll(),
      ]);

      if (projectsRes.success) setProjects(projectsRes.data || []);
      if (salaryRes.success && salaryRes.data) setSalary(salaryRes.data[0]);
      if (notificationsRes.success) setNotifications(notificationsRes.data?.slice(0, 5) || []);
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Employee Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Employee Dashboard">
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
    <DashboardLayout title="Employee Dashboard">
      <div className="space-y-2">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-3 pb-3 px-3">
              <p className="text-lg font-bold mb-1" style={{ color: 'var(--success)' }}>
                {salary ? (salary.netSalary / 1000).toFixed(0) : "0"}K
              </p>
              <p className="text-xs font-medium" style={{ color: 'var(--primary)' }}>Salary</p>
              <Badge className="h-4 py-0 mt-1 text-xs" style={{ backgroundColor: salary?.status === 'paid' ? '#10b981' : '#009CFF', color: 'white' }}>
                {salary?.status || "Pending"}
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-3 pb-3 px-3">
              <p className="text-lg font-bold mb-1" style={{ color: 'var(--success)' }}>{projects.length}</p>
              <p className="text-xs font-medium" style={{ color: 'var(--primary)' }}>Projects</p>
              <p className="text-xs text-slate-600 mt-1">Assigned</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-3 pb-3 px-3">
              <p className="text-lg font-bold mb-1" style={{ color: 'var(--success)' }}>95%</p>
              <p className="text-xs font-medium" style={{ color: 'var(--primary)' }}>Attendance</p>
              <p className="text-xs text-slate-600 mt-1">This month</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-3 pb-3 px-3">
              <p className="text-lg font-bold mb-1" style={{ color: 'var(--success)' }}>{notifications.filter(n => !n.isRead).length}</p>
              <p className="text-xs font-medium" style={{ color: 'var(--primary)' }}>Unread</p>
              <p className="text-xs text-slate-600 mt-1">Notifications</p>
            </CardContent>
          </Card>
        </div>

        {/* Profile and Salary - 2 columns */}
        <div className="grid md:grid-cols-2 gap-3">
          {/* Profile */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>Profile</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-600">Name:</span>
                  <span style={{ color: 'var(--primary)' }} className="font-medium">{user?.fullName}</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-600">Email:</span>
                  <span style={{ color: 'var(--primary)' }} className="font-medium text-xs">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-600">Role:</span>
                  <Badge className="h-4 py-0 text-xs" variant="success">
                    {user?.role}
                  </Badge>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <Link to="/dashboard/settings" className="w-full">
                    <Button variant="success" size="sm" className="w-full text-xs">
                      <User className="mr-1 size-3" />
                      Edit Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Salary Details */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>Salary Details</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              {salary ? (
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-600">Base:</span>
                    <span style={{ color: 'var(--primary)' }} className="font-medium">RWF {(salary.baseSalary / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-600">Bonuses:</span>
                    <span className="font-medium text-green-600">+{(salary.bonuses / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b">
                    <span className="text-slate-600">Deductions:</span>
                    <span className="font-medium text-red-600">-{(salary.deductions / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="font-medium">Net:</span>
                    <span style={{ color: 'var(--success)' }} className="font-bold">RWF {(salary.netSalary / 1000).toFixed(0)}K</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-600 text-center py-4">No salary info</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Projects and Notifications - 2 columns */}
        <div className="grid md:grid-cols-2 gap-3">
          {/* My Projects */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>My Projects</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              {projects.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-3">No projects</p>
              ) : (
                <div className="space-y-2">
                  {projects.slice(0, 3).map((project: any) => (
                    <div key={project.id} className="text-xs py-1.5 border-b last:border-b-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p style={{ color: 'var(--primary)' }} className="font-medium truncate">{project.name}</p>
                        <Badge className="h-4 py-0 text-xs" variant="success">
                          {project.progress}%
                        </Badge>
                      </div>
                      <Progress value={project.progress} className="h-1" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              {notifications.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-3">No notifications</p>
              ) : (
                <div className="space-y-1.5">
                  {notifications.slice(0, 3).map((notification: any) => (
                    <div key={notification.id} className="text-xs py-1.5 border-b last:border-b-0 flex items-start gap-2">
                      {!notification.isRead && (
                        <div className="size-1.5 bg-blue-600 rounded-full mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p style={{ color: 'var(--primary)' }} className="font-medium">{notification.title}</p>
                        <p className="text-xs text-slate-600">{notification.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <Link to="/dashboard/attendance">
                <Button size="sm" className="w-full text-xs" style={{ background: '#009CFF', border: 'none', color: '#fff' }}>
                  <Calendar className="mr-1 size-3" />
                  Attendance
                </Button>
              </Link>
              <Link to="/dashboard/salary">
                <Button size="sm" className="w-full text-xs" style={{ background: '#009CFF', border: 'none', color: '#fff' }}>
                  <DollarSign className="mr-1 size-3" />
                  Salary
                </Button>
              </Link>
              <Link to="/dashboard/documents">
                <Button size="sm" className="w-full text-xs" style={{ background: '#009CFF', border: 'none', color: '#fff' }}>
                  <FileText className="mr-1 size-3" />
                  Documents
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
