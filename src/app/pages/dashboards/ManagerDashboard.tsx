import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  DollarSign,
  Users,
  Calendar,
  Banknote,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { dashboardService } from "../../services/dashboardApi";

export default function ManagerDashboard() {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const statsRes = await dashboardService.getStats('manager');
      if (statsRes.success && statsRes.data) setStats(statsRes.data);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      setError("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <DashboardLayout title="Manager Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--success)' }} />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !stats) {
    return (
      <DashboardLayout title="Manager Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || "Failed to load dashboard"}</p>
            <Button onClick={loadDashboardData}>Retry</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const financialStats = [
    {
      title: "Revenue",
      value: `RWF ${(stats.totalRevenue / 1000000).toFixed(1)}M`,
      icon: TrendingUp,
      isPositive: true,
    },
    {
      title: "Expenses",
      value: `RWF ${(stats.totalExpenses / 1000000).toFixed(1)}M`,
      icon: TrendingDown,
      isPositive: false,
    },
    {
      title: "Net Profit",
      value: `RWF ${((stats.totalRevenue - stats.totalExpenses) / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      isPositive: true,
    },
  ];

  const managementStats = [
    { title: "Employees", value: stats.totalEmployees, subtitle: `${stats.activeEmployees} active`, color: "var(--success)" },
    { title: "Pending", value: stats.pendingTransactions, subtitle: "Transactions", color: "var(--warning)" },
    { title: "Taxes", value: stats.pendingTaxes, subtitle: "Due this quarter", color: "#8b5cf6" },
    { title: "Projects", value: stats.activeProjects, subtitle: "Active", color: "#ec4899" },
  ];

  return (
    <DashboardLayout title="Manager Dashboard">
      <div className="space-y-2">
        {/* Financial Overview */}
        <div className="grid md:grid-cols-3 gap-3">
          {financialStats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="pt-3 pb-3 px-3">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="size-4" style={{ color: stat.isPositive ? 'var(--success)' : 'var(--destructive)' }} />
                  <Badge
                    variant="secondary"
                    className="text-xs h-5 py-0"
                    style={{
                      backgroundColor: stat.isPositive ? '#d4efea' : '#fee2e2',
                      color: stat.isPositive ? 'var(--success)' : 'var(--destructive)'
                    }}
                  >
                    {stat.isPositive ? '+' : '-'}12%
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 mb-1">{stat.title}</p>
                <p className="text-base font-bold" style={{ color: 'var(--primary)' }}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Management Overview */}
        <div className="grid md:grid-cols-4 gap-3">
          {managementStats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="pt-3 pb-3 px-3">
                <p className="text-lg font-bold mb-1" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-xs font-medium" style={{ color: 'var(--primary)' }}>{stat.title}</p>
                <p className="text-xs text-slate-600 mt-0.5">{stat.subtitle}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions - 2 columns */}
        <div className="grid md:grid-cols-2 gap-3">
          {/* Quick Actions */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="grid grid-cols-2 gap-2">
                <Link to="/dashboard/finance">
                  <Button size="sm" className="w-full text-xs" style={{ background: '#16a085', border: 'none', color: '#fff' }}>
                    <DollarSign className="mr-1 size-3" />
                    Finances
                  </Button>
                </Link>
                <Link to="/dashboard/workforce">
                  <Button size="sm" className="w-full text-xs" style={{ background: '#16a085', border: 'none', color: '#fff' }}>
                    <Users className="mr-1 size-3" />
                    Employees
                  </Button>
                </Link>
                <Link to="/dashboard/finance">
                  <Button size="sm" className="w-full text-xs" style={{ background: '#16a085', border: 'none', color: '#fff' }}>
                    <Banknote className="mr-1 size-3" />
                    Salaries
                  </Button>
                </Link>
                <Link to="/dashboard/attendance">
                  <Button size="sm" className="w-full text-xs" style={{ background: '#16a085', border: 'none', color: '#fff' }}>
                    <Calendar className="mr-1 size-3" />
                    Attendance
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-2 border-b">
                  <p className="font-medium" style={{ color: 'var(--primary)' }}>Salary Processed</p>
                  <Badge className="h-4 py-0 text-xs" style={{ backgroundColor: '#10b981', color: 'white' }}>Done</Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <p className="font-medium" style={{ color: 'var(--primary)' }}>Employee Added</p>
                  <Badge className="h-4 py-0 text-xs" style={{ backgroundColor: '#10b981', color: 'white' }}>New</Badge>
                </div>
                <div className="flex items-center justify-between py-2">
                  <p className="font-medium" style={{ color: 'var(--primary)' }}>Tax Filed</p>
                  <Badge className="h-4 py-0 text-xs" style={{ backgroundColor: '#10b981', color: 'white' }}>Done</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
