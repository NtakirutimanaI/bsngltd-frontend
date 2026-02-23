import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  TrendingUp,
  TrendingDown,
  Home,
  HardHat,
  Users,
  DollarSign,
  ArrowRight,
  Globe,
  AlertCircle
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { Badge } from "../../components/ui/badge";
import { dashboardService, projectService, financialService } from "../../services/dashboardApi";


export default function AdminDashboard() {
  const [stats, setStats] = useState<any | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, projectsRes, transactionsRes] = await Promise.all([
        dashboardService.getStats('admin'),
        projectService.getAll(),
        financialService.getTransactions(),
      ]);

      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (projectsRes.success && projectsRes.data) setProjects(Array.isArray(projectsRes.data) ? projectsRes.data.slice(0, 3) : []);
      if (transactionsRes.success && transactionsRes.data) setTransactions(Array.isArray(transactionsRes.data) ? transactionsRes.data.slice(0, 3) : []);
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Admin Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--success)' }} />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !stats) {
    return (
      <DashboardLayout title="Admin Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-2 size-8" style={{ color: 'var(--destructive)' }} />
            <p className="mb-3 text-sm" style={{ color: 'var(--destructive)' }}>{error || "Failed to load dashboard"}</p>
            <Button onClick={loadDashboardData} variant="success" size="sm">
              Retry
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const netRevenue = stats.totalRevenue - stats.totalExpenses;
  const revenueGrowth = stats.totalRevenue > 0 ? ((netRevenue / stats.totalRevenue) * 100).toFixed(1) : "0";

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-2">

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {([
            { label: 'Total Revenue', value: `RWF ${(stats.totalRevenue / 1000000).toFixed(1)}M`, sub: `${revenueGrowth}% margin`, color: '#16a085', Icon: DollarSign },
            { label: 'Expenses', value: `RWF ${(stats.totalExpenses / 1000000).toFixed(1)}M`, sub: 'Salaries & ops', color: '#e74c3c', Icon: TrendingDown },
            { label: 'Active Projects', value: `${stats.activeProjects}`, sub: `${stats.completedProjects} completed`, color: '#16a085', Icon: HardHat },
            { label: 'Properties', value: `${stats.totalProperties}`, sub: `${stats.availableProperties} available`, color: '#16a085', Icon: Home },
            { label: 'Employees', value: `${stats.totalEmployees}`, sub: `${stats.activeEmployees} active`, color: '#16a085', Icon: Users },
            { label: 'Sold', value: `${stats.soldProperties}`, sub: 'Properties', color: '#3498db', Icon: Globe },
            { label: 'Rented', value: `${stats.rentedProperties}`, sub: 'Active rentals', color: '#9b59b6', Icon: TrendingUp },
            { label: 'Pending', value: `${stats.pendingTransactions + stats.pendingTaxes}`, sub: 'Action needed', color: '#f39c12', Icon: AlertCircle },
          ] as { label: string; value: string; sub: string; color: string; Icon: React.ComponentType<{ width?: number; height?: number; strokeWidth?: number; style?: React.CSSProperties }> }[]).map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-lg overflow-hidden"
              style={{ border: 'none', borderBottom: `2px solid ${stat.color}` }}
            >
              <div className="px-3 pt-3 pb-2 flex items-start gap-3">
                {/* Plain icon — no background, no shadow, no container */}
                <stat.Icon
                  width={26}
                  height={26}
                  strokeWidth={1.5}
                  style={{ color: stat.color, flexShrink: 0, marginTop: 1 }}
                />
                {/* Text block */}
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-500 leading-tight">{stat.label}</p>
                  <p className="text-base font-bold leading-snug mt-0.5" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{stat.sub}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Projects and Transactions */}
        <div className="grid md:grid-cols-2 gap-2">
          {/* Active Projects */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ border: 'none' }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ border: 'none', borderBottom: '2px solid #16a085' }}>
              <h3 className="text-sm font-bold" style={{ color: '#16a085' }}>Active Projects</h3>
              <Link to="/dashboard/portfolio">
                <Button variant="brand" size="sm" className="h-6 px-3 text-[10px] font-bold" style={{ border: 'none' }}>
                  VIEW ALL <ArrowRight className="ml-1 size-3" />
                </Button>
              </Link>
            </div>
            <div className="px-4 py-3 space-y-3">
              {projects.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No projects found</p>
              ) : (
                projects.map((project) => (
                  <div key={project.id} className="py-2" style={{ border: 'none', borderBottom: '1px solid #f0faf8' }}>
                    <div className="flex items-start justify-between mb-1.5">
                      <div>
                        <h4 className="font-semibold text-xs text-slate-800">{project.name}</h4>
                        <p className="text-[10px] text-slate-400">{project.type}</p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-[10px] h-5 py-0 px-2"
                        style={{
                          background: project.status === 'in_progress' ? '#16a085' : '#f0faf8',
                          color: project.status === 'in_progress' ? 'white' : '#16a085',
                          border: 'none'
                        }}
                      >
                        {project.status?.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span>Progress</span>
                      <span className="font-bold" style={{ color: '#16a085' }}>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-1.5" style={{ background: '#e8f8f5' }} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ border: 'none' }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ border: 'none', borderBottom: '2px solid #16a085' }}>
              <h3 className="text-sm font-bold" style={{ color: '#16a085' }}>Recent Transactions</h3>
              <Link to="/dashboard/finance">
                <Button variant="brand" size="sm" className="h-6 px-3 text-[10px] font-bold" style={{ border: 'none' }}>
                  VIEW ALL <ArrowRight className="ml-1 size-3" />
                </Button>
              </Link>
            </div>
            <div className="px-4 py-3 space-y-2">
              {transactions.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No transactions found</p>
              ) : (
                transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-2" style={{ border: 'none', borderBottom: '1px solid #f0faf8' }}>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs text-slate-800 truncate">{transaction.description}</p>
                      <p className="text-[10px] text-slate-400">{transaction.category}</p>
                    </div>
                    <div className="text-right ml-3">
                      <p className={`font-bold text-xs ${transaction.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                        {transaction.type === 'income' ? '+' : '-'}RWF {(transaction.amount / 1000000).toFixed(1)}M
                      </p>
                      <Badge
                        variant="secondary"
                        className="text-[10px] h-4 py-0 px-1.5 mt-0.5"
                        style={{
                          background: transaction.status === 'completed' ? '#16a085' : '#fef9e7',
                          color: transaction.status === 'completed' ? 'white' : '#f39c12',
                          border: 'none'
                        }}
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Website Content Management Quick Links */}
        <div
          className="bg-white rounded-lg shadow-sm overflow-hidden"
          style={{ border: 'none' }}
        >
          <div className="flex items-center gap-3 px-4 py-3" style={{ border: 'none', borderBottom: '2px solid #16a085' }}>
            <div className="p-2 rounded" style={{ background: '#16a085' }}>
              <Globe className="size-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: '#16a085' }}>Website Content</h3>
              <p className="text-xs text-slate-500">Manage public-facing pages</p>
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="grid grid-cols-3 gap-2">
              <Link to="/dashboard/admin">
                <Button
                  variant="outline-brand"
                  className="w-full h-9 text-xs font-semibold rounded-md"
                  style={{ border: 'none', borderBottom: '2px solid #16a085' }}
                >
                  Pages
                </Button>
              </Link>
              <Link to="/dashboard/admin">
                <Button
                  variant="outline-brand"
                  className="w-full h-9 text-xs font-semibold rounded-md"
                  style={{ border: 'none', borderBottom: '2px solid #16a085' }}
                >
                  Media
                </Button>
              </Link>
              <Link to="/" target="_blank">
                <Button
                  variant="brand"
                  className="w-full h-9 text-xs font-semibold rounded-md"
                  style={{ border: 'none' }}
                >
                  Preview Site
                </Button>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
