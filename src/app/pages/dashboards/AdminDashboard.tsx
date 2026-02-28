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
      <div className="container-fluid px-2 px-md-4 pt-1 pb-2">
        <div className="space-y-2">

          {/* Stats Grid */}
          <div className="row g-2">
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
                className="col-6 col-md-3"
              >
                <div
                  className="card border-0 shadow-sm h-100"
                  style={{ border: 'none', borderBottom: `2px solid ${stat.color}` }}
                >
                  <div className="card-body p-2">
                    <div className="d-flex align-items-start gap-2">
                      {/* Plain icon — no background, no shadow, no container */}
                      <stat.Icon
                        width={20}
                        height={20}
                        strokeWidth={1.5}
                        style={{ color: stat.color, flexShrink: 0, marginTop: 1 }}
                      />
                      {/* Text block */}
                      <div className="flex-fill">
                        <p className="text-muted fw-medium mb-1" style={{ fontSize: '10px' }}>{stat.label}</p>
                        <p className="fw-bold mb-0" style={{ fontSize: '14px', color: stat.color }}>{stat.value}</p>
                        <p className="text-muted mb-0" style={{ fontSize: '9px' }}>{stat.sub}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Projects and Transactions */}
          <div className="row g-2">
            {/* Active Projects */}
            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100" style={{ border: 'none' }}>
                <div className="card-body p-2">
                  <div className="d-flex align-items-center justify-content-between mb-2" style={{ border: 'none', borderBottom: '2px solid #16a085' }}>
                    <h3 className="fw-bold mb-0" style={{ fontSize: '12px', color: '#16a085' }}>Active Projects</h3>
                    <Link to="/dashboard/portfolio">
                      <Button variant="brand" size="sm" className="px-2 py-1 fw-bold" style={{ fontSize: '11px', border: 'none' }}>
                        VIEW ALL <ArrowRight className="ms-1" size={10} />
                      </Button>
                    </Link>
                  </div>
                  <div className="p-2 space-y-2">
                    {projects.length === 0 ? (
                      <p className="text-muted text-center py-2" style={{ fontSize: '11px' }}>No projects found</p>
                    ) : (
                      projects.map((project) => (
                        <div key={project.id} className="py-2" style={{ border: 'none', borderBottom: '1px solid #f0faf8' }}>
                          <div className="d-flex align-items-start justify-content-between mb-1">
                            <div>
                              <h4 className="fw-semibold text-dark mb-0" style={{ fontSize: '11px' }}>{project.name}</h4>
                              <p className="text-muted mb-0" style={{ fontSize: '10px' }}>{project.type}</p>
                            </div>
                            <Badge
                              variant="secondary"
                              className="text-xs h-auto py-1 px-2"
                              style={{
                                background: project.status === 'in_progress' ? '#16a085' : '#f0faf8',
                                color: project.status === 'in_progress' ? 'white' : '#16a085',
                                border: 'none'
                              }}
                            >
                              {project.status?.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="d-flex align-items-center justify-content-between text-muted mb-1" style={{ fontSize: '10px' }}>
                            <span>Progress</span>
                            <span className="fw-bold" style={{ color: '#16a085' }}>{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-1" style={{ background: '#e8f8f5' }} />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="col-md-6">
                <div className="card border-0 shadow-sm h-100" style={{ border: 'none' }}>
                  <div className="card-body p-2">
                    <div className="d-flex align-items-center justify-content-between mb-2" style={{ border: 'none', borderBottom: '2px solid #16a085' }}>
                      <h3 className="fw-bold mb-0" style={{ fontSize: '12px', color: '#16a085' }}>Recent Transactions</h3>
                      <Link to="/dashboard/finance">
                        <Button variant="brand" size="sm" className="px-2 py-1 fw-bold" style={{ fontSize: '11px', border: 'none' }}>
                          VIEW ALL <ArrowRight className="ms-1" size={10} />
                        </Button>
                      </Link>
                    </div>
                    <div className="p-2 space-y-2">
                      {transactions.length === 0 ? (
                        <p className="text-muted text-center py-2" style={{ fontSize: '11px' }}>No transactions found</p>
                      ) : (
                        transactions.map((transaction) => (
                          <div key={transaction.id} className="d-flex align-items-center justify-content-between py-2" style={{ border: 'none', borderBottom: '1px solid #f0faf8' }}>
                            <div className="flex-fill">
                              <p className="fw-semibold text-dark mb-0 text-truncate" style={{ fontSize: '11px' }}>{transaction.description}</p>
                              <p className="text-muted mb-0" style={{ fontSize: '10px' }}>{transaction.category}</p>
                            </div>
                            <div className="text-end ms-2">
                              <p className={`fw-bold text-xs mb-1 ${transaction.type === 'income' ? 'text-success' : 'text-danger'}`}>
                                {transaction.type === 'income' ? '+' : '-'}RWF {(transaction.amount / 1000000).toFixed(1)}M
                              </p>
                              <Badge
                                variant="secondary"
                                className="text-xs h-auto py-1 px-1 mt-1"
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
              </div>
            </div>

            {/* Website Content Management Quick Links */}
            <div className="col-12">
              <div
                className="card border-0 shadow-sm"
                style={{ border: 'none' }}
              >
                <div className="card-body p-2">
                  <div className="d-flex align-items-center gap-2 mb-2" style={{ border: 'none', borderBottom: '2px solid #16a085' }}>
                    <div className="p-1 rounded" style={{ background: '#16a085' }}>
                      <Globe className="text-white" size={12} />
                    </div>
                    <div>
                      <h3 className="fw-bold mb-0" style={{ fontSize: '12px', color: '#16a085' }}>Website Content</h3>
                      <p className="text-muted mb-0" style={{ fontSize: '10px' }}>Manage public-facing pages</p>
                    </div>
                  </div>
                  <div className="p-2">
                    <div className="row g-2">
                      <div className="col-4">
                        <Link to="/dashboard/content">
                          <Button
                            variant="outline-brand"
                            className="w-auto h-auto fw-semibold rounded"
                            style={{ fontSize: '11px', borderBottom: '2px solid #16a085' }}
                          >
                            Pages
                          </Button>
                        </Link>
                      </div>
                      <div className="col-4">
                        <Link to="/dashboard/content">
                          <Button
                            variant="outline-brand"
                            className="w-auto h-auto fw-semibold rounded"
                            style={{ fontSize: '11px', borderBottom: '2px solid #16a085' }}
                          >
                            Media
                          </Button>
                        </Link>
                      </div>
                      <div className="col-4">
                        <Link to="/" target="_blank">
                          <Button
                            variant="brand"
                            className="w-auto h-auto fw-semibold rounded"
                            style={{ fontSize: '11px', border: 'none' }}
                          >
                            Preview Site
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </DashboardLayout>
  );
}
