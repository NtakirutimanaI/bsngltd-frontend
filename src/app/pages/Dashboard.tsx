import { Building2, Users, Home, DollarSign, AlertCircle, CheckCircle, Clock, MessageSquare, Plus, Eye, Edit, Trash2, MoreVertical, ChevronDown, Settings, UserCog, ArrowRight, LineChart as LineChartIcon, PieChart as PieChartIcon, History, CalendarCheck } from "lucide-react";

import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ScrollReveal } from "@/app/components/ScrollReveal";

import { useAuth } from "@/app/context/AuthContext";
import { useTheme } from "@/app/context/ThemeContext";

import { fetchApi } from '../api/client';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { AddProjectModal } from '@/app/components/AddProjectModal';
import { AddEmployeeModal } from '@/app/components/AddEmployeeModal';
import { Button } from "@/app/components/ui/button";
import "@/styles/dashboard-premium.css";


// Define interfaces for the API response
interface DashboardStats {
  adminStats: { name: string; value: string; change: string; trend: string }[];
  revenueStats: { income: number; expenses: number };
  latestProjects: any[];
}

interface Activity {
  id: string;
  userName: string;
  action: string;
  target: string;
  description: string;
  createdAt: string;
}

export function Dashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const roleName = ((typeof user?.role === 'object' && user.role !== null) ? user.role.name : user?.role || 'guest').toLowerCase();
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [openProjectMenu, setOpenProjectMenu] = useState<string | null>(null);
  const [statusChanging, setStatusChanging] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const isEmployee = roleName === 'employee';
  const isClient = roleName === 'client';
  const isContractor = roleName === 'contractor';
  const isAuditor = roleName === 'auditor';
  const isEditor = roleName === 'editor';
  const isAdminLike = ['super_admin', 'admin', 'manager', 'site_manager'].includes(roleName);

  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await fetchApi<DashboardStats>(`/dashboard/stats?role=${roleName}`);
        setStatsData(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAdminLike || isAuditor || isEditor) {
      fetchStats();
      fetchActivities();
    } else {
      setLoading(false);
    }
  }, [isAdminLike, isAuditor, isEditor, refreshKey]);

  const fetchActivities = async () => {
    try {
      const res = await fetchApi<any>('/dashboard/recent-activity');
      setActivities(res.data || []);
    } catch (err) {
      console.error("Failed to fetch activities", err);
    }
  };

  const adminStats = [
    {
      name: "Active Projects",
      value: statsData?.adminStats[0]?.value || "0",
      change: statsData?.adminStats[0]?.change || "+0",
      icon: Building2,
      color: "bg-primary-subtle text-primary",
      trend: "up",
    },
    {
      name: "Total Employees",
      value: statsData?.adminStats[1]?.value || "0",
      change: statsData?.adminStats[1]?.change || "+0",
      icon: Users,
      color: "bg-success-subtle text-success",
      trend: "up",
    },
    {
      name: "Properties",
      value: statsData?.adminStats[2]?.value || "0",
      change: statsData?.adminStats[2]?.change || "+0",
      icon: Home,
      color: "bg-info-subtle text-info",
      trend: "up",
    },
    {
      name: "Total Revenue",
      value: statsData?.adminStats[3]?.value || "RWF 0M",
      change: statsData?.adminStats[3]?.change || "+0%",
      icon: DollarSign,
      color: "bg-warning-subtle text-warning",
      trend: "up",
    },
  ];

  const employeeStats = [
    { name: "My Assignments", value: "4", change: "Active", icon: Building2, color: "bg-primary-subtle text-primary", trend: "up" },
    { name: "Hours Worked", value: "38h", change: "This week", icon: Clock, color: "bg-success-subtle text-success", trend: "up" },
    { name: "Pending Tasks", value: "7", change: "Due soon", icon: AlertCircle, color: "bg-warning-subtle text-warning", trend: "down" },
    { name: "Next Payday", value: "Feb 28", change: "Confirmed", icon: DollarSign, color: "bg-info-subtle text-info", trend: "up" },
  ];

  const clientStats = [
    { name: "My Properties", value: "1", change: "Occupied", icon: Home, color: "bg-primary-subtle text-primary", trend: "up" },
    { name: "Payment Status", value: "Paid", change: "Feb 2026", icon: CheckCircle, color: "bg-success-subtle text-success", trend: "up" },
    { name: "Next Rent Due", value: "Mar 01", change: "In 21 days", icon: Clock, color: "bg-warning-subtle text-warning", trend: "up" },
    { name: "Support Tickets", value: "0", change: "All clear", icon: MessageSquare, color: "bg-info-subtle text-info", trend: "up" },
  ];

  const contractorStats = [
    { name: "Active Contracts", value: "2", change: "Running", icon: Building2, color: "bg-primary-subtle text-primary", trend: "up" },
    { name: "Completed Work", value: "85%", change: "Overall", icon: CheckCircle, color: "bg-success-subtle text-success", trend: "up" },
    { name: "Pending Invoices", value: "1", change: "Processing", icon: DollarSign, color: "bg-warning-subtle text-warning", trend: "up" },
    { name: "Deadlines", value: "3", change: "This month", icon: Clock, color: "bg-info-subtle text-info", trend: "down" },
  ];

  const getRoleStats = () => {
    if (isAdminLike || isAuditor || isEditor) return adminStats;
    if (isEmployee) {
      return (statsData as any)?.employeeStats?.map((s: any) => ({
        ...s,
        icon: s.name.includes('Assignment') ? Building2 : (s.name.includes('Hours') ? Clock : (s.name.includes('Pending') ? AlertCircle : DollarSign)),
        color: s.name.includes('Assignment') ? "bg-primary-subtle text-primary" : (s.name.includes('Hours') ? "bg-success-subtle text-success" : (s.name.includes('Pending') ? "bg-warning-subtle text-warning" : "bg-info-subtle text-info")),
      })) || employeeStats;
    }
    if (isClient) {
      return (statsData as any)?.clientStats?.map((s: any) => ({
        ...s,
        icon: s.name.includes('Property') ? Home : (s.name.includes('Payment') ? CheckCircle : (s.name.includes('Rent') ? Clock : MessageSquare)),
        color: s.name.includes('Property') ? "bg-primary-subtle text-primary" : (s.name.includes('Payment') ? "bg-success-subtle text-success" : (s.name.includes('Rent') ? "bg-warning-subtle text-warning" : "bg-info-subtle text-info")),
      })) || clientStats;
    }
    if (isContractor) {
      return (statsData as any)?.contractorStats?.map((s: any) => ({
        ...s,
        icon: s.name.includes('Contract') ? Building2 : (s.name.includes('Work') ? CheckCircle : (s.name.includes('Invoice') ? DollarSign : Clock)),
        color: s.name.includes('Contract') ? "bg-primary-subtle text-primary" : (s.name.includes('Work') ? "bg-success-subtle text-success" : (s.name.includes('Invoice') ? "bg-warning-subtle text-warning" : "bg-info-subtle text-info")),
      })) || contractorStats;
    }
    if (roleName === 'site_manager') {
      return (statsData as any)?.siteManagerStats?.map((s: any) => ({
        ...s,
        icon: s.name.includes('Personnel') ? Users : (s.name.includes('Progress') ? Building2 : (s.name.includes('Material') ? AlertCircle : CheckCircle)),
        color: s.name.includes('Personnel') ? "bg-primary-subtle text-primary" : (s.name.includes('Progress') ? "bg-success-subtle text-success" : (s.name.includes('Material') ? "bg-warning-subtle text-warning" : "bg-info-subtle text-info")),
      })) || [];
    }
    if (roleName === 'manager') {
      return (statsData as any)?.managerStats?.map((s: any) => ({
        ...s,
        icon: s.name.includes('Budget') ? DollarSign : (s.name.includes('Staff') ? Users : Building2),
        color: s.name.includes('Budget') ? "bg-primary-subtle text-primary" : (s.name.includes('Staff') ? "bg-success-subtle text-success" : "bg-info-subtle text-info"),
      })) || [];
    }
    return adminStats;
  };

  const stats = getRoleStats();
  // ... (rest of helper functions same as before)
  const revenueData = (statsData?.revenueStats as any)?.chartData?.length > 0
    ? (statsData?.revenueStats as any).chartData.map((d: any) => ({
      month: d.month,
      revenue: d.revenue / 1000000,
      expenses: d.expenses / 1000000
    }))
    : [
      { month: "Current", revenue: (statsData?.revenueStats?.income || 0) / 1000000, expenses: (statsData?.revenueStats?.expenses || 0) / 1000000 },
    ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "#10b981";
      case "planning": return "#6366f1";
      case "on_hold": return "#1abc9c";
      case "completed": return "#3b82f6";
      default: return "#9ca3af";
    }
  };

  const projectStatusData = (statsData as any)?.projectStatusCounts
    ? (statsData as any).projectStatusCounts.map((s: any) => ({
      name: s.status.charAt(0).toUpperCase() + s.status.slice(1).replace('_', ' '),
      value: s.count,
      color: getStatusColor(s.status)
    }))
    : [
      { name: "Planning", value: 0, color: "#6366f1" },
      { name: "Active", value: 0, color: "#10b981" },
      { name: "On Hold", value: 0, color: "#f59e0b" },
      { name: "Completed", value: 0, color: "#3b82f6" },
    ];

  const recentProjects = statsData?.latestProjects?.map(p => ({
    id: p.id,
    name: p.name,
    status: p.status,
    progress: p.progress,
    budget: p.budget
  })) || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="text-success w-4 h-4" />;
      case "planning": return <Clock className="text-primary w-4 h-4" />;
      case "on_hold": return <AlertCircle className="text-warning w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="container-fluid px-2 px-md-4 pt-1 pb-2">
      {/* Header */}
      <ScrollReveal>
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-2">
          <div>
            <h1 className="h5 fw-bold text-dark mb-0">Dashboard Overview</h1>
            <p className="text-muted mb-0" style={{ fontSize: '12px' }}>
              {`Welcome back, `}
              <span className="fw-bold" style={{ color: '#16a085' }}>{user?.fullName || user?.name || 'User'}</span>
              <span>! </span>
              {isEmployee && "Here's your task overview for today."}
              {isClient && "Manage your property and track your payments."}
              {isContractor && "Track your contracts and active task progress."}
              {isAuditor && "System health and financial audit overview."}
              {isEditor && "Manage website content and updates."}
              {isAdminLike && "Track project progress and financial performance at a glance."}
            </p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="text-end d-none d-lg-block">
              <div style={{ fontSize: '11px' }} className="text-muted mb-0 uppercase tracking-wider">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</div>
              <div className="fw-bold text-dark" style={{ fontSize: '14px' }}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
            </div>
            <div className="h-10 w-px bg-gray-200 dark:bg-gray-800 d-none d-lg-block mx-2"></div>
            {isAdminLike && (
              <div className="position-relative">
                <Button
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  className="action-button-premium rounded-xl px-4 py-2"
                  style={{ height: '38px', fontSize: '13px' }}
                >
                  <Plus size={16} strokeWidth={2.5} className="me-1" />
                  <span className="fw-bold">Actions</span>
                  <ChevronDown size={14} className={`ms-1 transition-transform ${showQuickActions ? 'rotate-180' : ''}`} />
                </Button>
                {showQuickActions && (
                  <div className="position-absolute end-0 mt-1 bg-white rounded-3 shadow-lg border border-gray-200 py-1 z-3" style={{ minWidth: '190px' }}>
                    <button onClick={() => { setIsAddProjectModalOpen(true); setShowQuickActions(false); }} className="d-flex align-items-center gap-2 px-3 py-1 w-100 border-0 bg-transparent text-dark hover:bg-light" style={{ fontSize: '12px' }}>
                      <Building2 size={12} style={{ color: '#16a085' }} /> New Project
                    </button>
                    <button onClick={() => { navigate('/dashboard/portfolio'); setShowQuickActions(false); }} className="d-flex align-items-center gap-2 px-3 py-1 w-100 border-0 bg-transparent text-dark hover:bg-light" style={{ fontSize: '12px' }}>
                      <Home size={12} style={{ color: '#16a085' }} /> New Property
                    </button>
                    <button onClick={() => { setIsAddEmployeeModalOpen(true); setShowQuickActions(false); }} className="d-flex align-items-center gap-2 px-3 py-1 w-100 border-0 bg-transparent text-dark hover:bg-light" style={{ fontSize: '12px' }}>
                      <Users size={12} style={{ color: '#16a085' }} /> Add Employee
                    </button>
                    <button onClick={() => { navigate('/dashboard/finance'); setShowQuickActions(false); }} className="d-flex align-items-center gap-2 px-3 py-1 w-100 border-0 bg-transparent text-dark hover:bg-light" style={{ fontSize: '12px' }}>
                      <DollarSign size={12} style={{ color: '#16a085' }} /> Record Payment
                    </button>
                    <hr className="my-1 opacity-10" />
                    <button onClick={() => { navigate('/dashboard/admin'); setShowQuickActions(false); }} className="d-flex align-items-center gap-2 px-3 py-1 w-100 border-0 bg-transparent text-dark hover:bg-light" style={{ fontSize: '12px' }}>
                      <UserCog size={12} style={{ color: '#16a085' }} /> Manage Users
                    </button>
                    <button onClick={() => { navigate('/dashboard/admin'); setShowQuickActions(false); }} className="d-flex align-items-center gap-2 px-3 py-1 w-100 border-0 bg-transparent text-dark hover:bg-light" style={{ fontSize: '12px' }}>
                      <MessageSquare size={12} style={{ color: '#16a085' }} /> Send Message
                    </button>
                    <button onClick={() => { navigate('/dashboard/admin'); setShowQuickActions(false); }} className="d-flex align-items-center gap-2 px-3 py-1 w-100 border-0 bg-transparent text-dark hover:bg-light" style={{ fontSize: '12px' }}>
                      <Settings size={12} style={{ color: '#16a085' }} /> System Settings
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </ScrollReveal>

      {/* Quick Actions for everyone */}
      <ScrollReveal delay={0.1}>
        <div className="row g-3 mb-4">
          <div className="col-12">
            <div className="quick-action-card border-0 shadow-lg text-white" style={{ borderRadius: '20px' }}>
              <div className="card-body p-3 p-md-4 position-relative z-1">
                <div className="row align-items-center">
                  <div className="col-lg-8">
                    <h6 className="fw-bold mb-1" style={{ fontSize: '14px' }}>
                      {isEmployee && "Keep up the great work!"}
                      {isContractor && "Track your contract milestones."}
                      {isClient && "Ready for a new project?"}
                      {roleName === 'site_manager' && "Ensure site safety and progress."}
                      {roleName === 'manager' && "Review strategic growth."}
                      {isAdminLike && !roleName.includes('manager') && "Welcome to System Control."}
                    </h6>
                    <p className="text-white opacity-75 mb-2" style={{ fontSize: '12px' }}>
                      {isEmployee && "Your dedication drives BSNG's vision forward. Update your tasks to stay on track."}
                      {isContractor && "Timely updates on work progress ensure faster invoice processing."}
                      {isClient && "Our professional team is here to help you build your dream project with quality and excellence."}
                      {roleName === 'site_manager' && "All daily reports must be submitted before 6:00 PM local time."}
                      {roleName === 'manager' && "Financial audits and staff performance reviews are ready for your oversight."}
                      {isAdminLike && !roleName.includes('manager') && "Manage system users, project defaults, and global configurations."}
                    </p>
                    <div className="d-flex flex-nowrap gap-2">
                      {isEmployee && (
                        <>
                          <Button
                            onClick={() => navigate('/dashboard/workforce')}
                            size="sm"
                            style={{ background: '#16a085', border: 'none', color: '#fff', fontWeight: 600, minWidth: '120px' }}
                          >Submit Hours</Button>
                          <Button
                            onClick={() => navigate('/dashboard/portfolio')}
                            size="sm"
                            style={{ background: 'transparent', border: '2px solid #fff', color: '#fff', fontWeight: 600, minWidth: '120px' }}
                          >My Tasks</Button>
                        </>
                      )}
                      {isContractor && (
                        <>
                          <Button
                            onClick={() => navigate('/dashboard/finance')}
                            size="sm"
                            style={{ background: '#16a085', border: 'none', color: '#fff', fontWeight: 600, minWidth: '120px' }}
                          >Submit Invoice</Button>
                          <Button
                            onClick={() => navigate('/dashboard/portfolio')}
                            size="sm"
                            style={{ background: 'transparent', border: '2px solid #fff', color: '#fff', fontWeight: 600, minWidth: '120px' }}
                          >Work Log</Button>
                        </>
                      )}
                      {roleName === 'site_manager' && (
                        <>
                          <Button
                            onClick={() => navigate('/dashboard/workforce')}
                            size="sm"
                            style={{ background: '#16a085', border: 'none', color: '#fff', fontWeight: 600, minWidth: '120px' }}
                          >Workforce</Button>
                          <Button
                            onClick={() => navigate('/dashboard/portfolio')}
                            size="sm"
                            style={{ background: 'transparent', border: '2px solid #fff', color: '#fff', fontWeight: 600, minWidth: '120px' }}
                          >Material Request</Button>
                        </>
                      )}
                      {roleName === 'manager' && (
                        <>
                          <Button
                            onClick={() => navigate('/dashboard/finance')}
                            size="sm"
                            style={{ background: '#16a085', border: 'none', color: '#fff', fontWeight: 600, minWidth: '120px' }}
                          >Financial Review</Button>
                          <Button
                            onClick={() => navigate('/dashboard/workforce')}
                            size="sm"
                            style={{ background: 'transparent', border: '2px solid #fff', color: '#fff', fontWeight: 600, minWidth: '120px' }}
                          >Staff Board</Button>
                        </>
                      )}
                      {isClient && (
                        <>
                          <Button
                            onClick={() => navigate('/dashboard/contact')}
                            size="sm"
                            style={{ background: '#16a085', border: 'none', color: '#fff', fontWeight: 600, minWidth: '120px' }}
                          >Contact Support</Button>
                          <Button
                            onClick={() => navigate('/dashboard/services')}
                            size="sm"
                            style={{ background: 'transparent', border: '2px solid #fff', color: '#fff', fontWeight: 600, minWidth: '120px' }}
                          >View Services</Button>
                        </>
                      )}
                      {isAdminLike && !['manager', 'site_manager'].includes(roleName) && (
                        <>
                          <Button
                            onClick={() => navigate('/dashboard/admin')}
                            size="sm"
                            style={{ background: '#16a085', border: 'none', color: '#fff', fontWeight: 700, minWidth: '130px', fontSize: '13px' }}
                          >Manage Users</Button>
                          <Button
                            onClick={() => navigate('/dashboard/admin')}
                            size="sm"
                            style={{ background: 'transparent', border: '2px solid #16a085', color: '#4ecdc4', fontWeight: 600, minWidth: '130px', fontSize: '13px' }}
                          >System Settings</Button>
                        </>
                      )}
                      {user?.email === 'innocentntakir@gmail.com' && (
                        <Button
                          onClick={() => navigate('/dashboard/admin')}
                          size="sm"
                          style={{ background: '#c0392b', border: 'none', color: '#fff', fontWeight: 700, minWidth: '130px' }}
                        >Developer Core</Button>
                      )}
                    </div>
                  </div>
                  <div className="col-lg-4 d-none d-lg-block text-end">
                    <Building2 size={70} className="opacity-10" style={{ transform: 'rotate(-15deg)' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Stats Grid */}
      {
        loading ? (
          <div className="row g-2 mb-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="col-md-6 col-lg-3">
                <div className="premium-card h-100">
                  <div className="card-body py-3 px-4">
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <div className="placeholder-glow mb-2">
                          <span className="placeholder col-6 rounded"></span>
                        </div>
                        <div className="placeholder-glow">
                          <span className="placeholder col-4 rounded h-6 w-full"></span>
                        </div>
                      </div>
                      <div className="placeholder-glow">
                        <span className="placeholder rounded-xl" style={{ width: '42px', height: '42px' }}></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="row g-2 mb-2">
            {stats.map((stat: any, index: number) => (
              <div key={stat.name} className="col-6 col-lg-3">
                <ScrollReveal delay={index * 0.1}>
                  <div className="premium-card h-100">
                    <div className="card-body py-3 px-4">
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <small className="text-muted text-uppercase fw-bold tracking-widest opacity-75 d-block text-truncate" style={{ fontSize: '9px' }}>{stat.name}</small>
                          <h4 className="fw-bold text-dark mt-1 mb-0 fs-6 fs-md-4">{stat.value}</h4>
                          <div className="d-flex align-items-center gap-1 mt-1">
                            <span className="status-grid-badge" style={{ backgroundColor: 'rgba(22, 160, 133, 0.15)', color: '#16a085', fontSize: '8px', padding: '1px 5px' }}>{stat.change}</span>
                          </div>
                        </div>
                        <div className={`stats-icon-container rounded-lg ${stat.color} shadow-sm d-none d-sm-flex`} style={{ width: '38px', height: '38px' }}>
                          <stat.icon size={16} strokeWidth={2.5} />
                        </div>
                        <div className={`stats-icon-container rounded-lg ${stat.color} shadow-sm d-flex d-sm-none`} style={{ width: '28px', height: '28px' }}>
                          <stat.icon size={12} strokeWidth={2.5} />
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            ))}
          </div>
        )
      }

      {/* Charts Row - Hidden for non-admin/auditor */}
      {
        (isAdminLike || isAuditor) && (
          <div className="row g-2 mb-2">
            {/* Revenue Chart */}
            <div className="col-lg-8">
              <ScrollReveal delay={0.2}>
                <div className="premium-card h-100">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center justify-content-between mb-4">
                      <h6 className="fw-bold mb-0 flex items-center gap-2">
                        <LineChartIcon size={16} className="text-brand" />
                        Financial Overview
                      </h6>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full" style={{ background: '#16a085' }}></div>
                          <span className="text-[10px] text-muted-foreground uppercase font-bold">Revenue</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full" style={{ background: '#e74c3c' }}></div>
                          <span className="text-[10px] text-muted-foreground uppercase font-bold">Expenses</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ height: window.innerWidth < 576 ? '180px' : '220px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? "#374151" : "#f1f5f9"} />
                          <XAxis
                            dataKey="month"
                            stroke={theme === 'dark' ? "#9ca3af" : "#64748b"}
                            tick={{ fontSize: 10, fontWeight: 600 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            stroke={theme === 'dark' ? "#9ca3af" : "#64748b"}
                            tick={{ fontSize: 10, fontWeight: 600 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: theme === 'dark' ? "#1f2937" : "#fff",
                              border: "none",
                              borderRadius: "12px",
                              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                              fontSize: '11px',
                              fontWeight: 600
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#16a085"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#16a085', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                            name="Revenue"
                          />
                          <Line
                            type="monotone"
                            dataKey="expenses"
                            stroke="#e74c3c"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#e74c3c', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                            name="Expenses"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Project Status Pie Chart */}
            <div className="col-lg-4">
              <ScrollReveal delay={0.3}>
                <div className="premium-card h-100">
                  <div className="card-body p-4">
                    <h6 className="fw-bold mb-4 flex items-center gap-2">
                      <PieChartIcon size={16} className="text-brand" />
                      Project Status
                    </h6>
                    <div style={{ height: window.innerWidth < 576 ? '180px' : '220px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={projectStatusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {projectStatusData.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: theme === 'dark' ? "#1f2937" : "#fff",
                              border: "none",
                              borderRadius: "12px",
                              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                              fontSize: '11px',
                              fontWeight: 600
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        )
      }

      {/* Recent / My Projects Row */}
      <div className="row mt-3 g-3">
        <div className="col-lg-8">
          <ScrollReveal delay={0.4}>
            <div className="premium-card h-100">
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div>
                    <h6 className="fw-bold mb-1" style={{ fontSize: '15px' }}>
                      {(isEmployee || isContractor) ? "My Assigned Projects" : isClient ? "My Active Projects" : "Recent Projects Performance"}
                    </h6>
                    <p className="text-muted mb-0" style={{ fontSize: '11px' }}>Tracking active construction and development cycles</p>
                  </div>
                  <Button
                    onClick={() => navigate('/dashboard/portfolio')}
                    className="action-button-premium rounded-xl px-3 py-1.5"
                    style={{ fontSize: '12px' }}
                  >
                    View Pipeline <ArrowRight size={14} className="ms-1" />
                  </Button>
                </div>
                <div className="table-responsive glass-table-container">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light/50">
                      <tr>
                        <th className="border-0 text-muted small text-uppercase fw-bold ps-4 py-3 text-nowrap">Project</th>
                        <th className="border-0 text-muted small text-uppercase fw-bold py-3 text-nowrap">Status</th>
                        <th className="border-0 text-muted small text-uppercase fw-bold py-3 text-nowrap">Health & Progress</th>
                        {!isEmployee && <th className="border-0 text-muted small text-uppercase fw-bold py-3">Budget Allocation</th>}
                        <th className="border-0 text-muted small text-uppercase fw-bold text-end pe-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="border-0">
                      {recentProjects.map((project: any) => (
                        <tr key={project.name} className="border-bottom border-light/10">
                          <td className="ps-4 py-3">
                            <span className="fw-bold text-dark d-block">{project.name}</span>
                            <span className="text-muted text-[10px] uppercase font-bold tracking-tighter">ID: #{project.id?.slice(-6) || 'N/A'}</span>
                          </td>
                          <td>
                            {isAdminLike && statusChanging === project.name ? (
                              <select
                                className="form-select form-select-sm" style={{ width: '130px' }}
                                defaultValue={project.status}
                                onChange={async (e) => {
                                  try {
                                    if (project.id) {
                                      await fetchApi(`/projects/${project.id}`, { method: 'PATCH', body: JSON.stringify({ status: e.target.value }) });
                                    }
                                    project.status = e.target.value;
                                    setStatusChanging(null);
                                  } catch (err) { console.error('Status update failed', err); }
                                }}
                                onBlur={() => setStatusChanging(null)}
                                autoFocus
                              >
                                <option value="planning">Planning</option>
                                <option value="active">Active</option>
                                <option value="on_hold">On Hold</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            ) : (
                              <div
                                className="d-flex align-items-center gap-2"
                                style={{ cursor: isAdminLike ? 'pointer' : 'default' }}
                                onClick={() => isAdminLike && setStatusChanging(project.name)}
                                title={isAdminLike ? 'Click to change status' : ''}
                              >
                                {getStatusIcon(project.status)}
                                <span className="small text-muted text-capitalize">
                                  {project.status.replace("_", " ")}
                                </span>
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2" style={{ maxWidth: '200px' }}>
                              <div className="progress flex-grow-1" style={{ height: '6px' }}>
                                <div
                                  className="progress-bar"
                                  style={{ backgroundColor: '#16a085', width: `${project.progress}%` }}
                                  role="progressbar"
                                  aria-valuenow={project.progress}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                />
                              </div>
                              <span className="small text-muted">{project.progress}%</span>
                            </div>
                          </td>
                          {!isEmployee && (
                            <td className="fw-medium text-dark small">{project.budget}</td>
                          )}
                          <td className="text-end pe-4">
                            <div className="position-relative d-inline-block">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setOpenProjectMenu(openProjectMenu === project.name ? null : project.name)}
                                className="text-slate-400 hover:text-slate-600"
                              >
                                <MoreVertical size={16} />
                              </Button>
                              {openProjectMenu === project.name && (
                                <div className="position-absolute end-0 mt-1 bg-white rounded-3 shadow-lg border py-1 z-3" style={{ minWidth: '150px' }}>
                                  <button
                                    onClick={() => { navigate(`/dashboard/portfolio?id=${project.id}`); setOpenProjectMenu(null); }}
                                    className="d-flex align-items-center gap-2 px-3 py-2 w-100 border-0 bg-transparent text-dark small hover-bg-light"
                                  >
                                    <Eye size={14} className="text-emerald-600" /> View Details
                                  </button>
                                  {isAdminLike && (
                                    <>
                                      <button
                                        onClick={() => { setEditingProject(project); setOpenProjectMenu(null); }}
                                        className="d-flex align-items-center gap-2 px-3 py-2 w-100 border-0 bg-transparent text-dark small"
                                      >
                                        <Edit size={14} className="text-warning" /> Edit Project
                                      </button>
                                      <button
                                        onClick={async () => {
                                          if (project.id && confirm(`Delete project "${project.name}"?`)) {
                                            try {
                                              await fetchApi(`/projects/${project.id}`, { method: 'DELETE' });
                                              setRefreshKey(prev => prev + 1);
                                            } catch (err) { console.error('Delete failed', err); }
                                          }
                                          setOpenProjectMenu(null);
                                        }}
                                        className="d-flex align-items-center gap-2 px-3 py-2 w-100 border-0 bg-transparent text-danger small"
                                      >
                                        <Trash2 size={14} /> Delete
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* RECENT ACTIVITY LOG SIDEBAR */}
        <div className="col-lg-4">
          <ScrollReveal delay={0.5}>
            <div className="premium-card h-100">
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h6 className="fw-bold mb-0 flex items-center gap-2">
                    <History size={16} className="text-[#16a085]" />
                    Activity Log
                  </h6>
                  <span className="badge rounded-pill bg-light text-muted uppercase font-bold" style={{ fontSize: '9px' }}>Real-time</span>
                </div>

                <div className="activity-timeline space-y-4">
                  {activities.length === 0 ? (
                    <div className="text-center py-5 text-muted small">No recent activity found</div>
                  ) : (
                    activities.map((act) => (
                      <div key={act.id} className="d-flex gap-3 position-relative pb-2">
                        <div className="flex-shrink-0 mt-1">
                          <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', backgroundColor: 'rgba(22, 160, 133, 0.1)', color: '#16a085' }}>
                            {act.action.includes('Attendance') ? <CalendarCheck size={14} /> : (act.action.includes('Salary') ? <DollarSign size={14} /> : <Eye size={14} />)}
                          </div>
                        </div>
                        <div className="flex-grow-1 border-bottom border-light/50 pb-2">
                          <div className="d-flex justify-content-between align-items-start">
                            <span className="fw-bold text-dark small" style={{ fontSize: '11px' }}>{act.action}</span>
                            <span className="text-muted smaller" style={{ fontSize: '9px' }}>{new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-muted mb-0 mt-1" style={{ fontSize: '10px' }}>
                            <span className="fw-semibold" style={{ color: '#1abc9c' }}>{act.userName}</span>: {act.description}
                          </p>
                          {act.target && (
                            <div className="mt-1 d-flex align-items-center gap-1">
                              <span className="badge rounded-pill bg-light text-dark font-medium" style={{ fontSize: '9px', border: '1px solid rgba(0,0,0,0.05)' }}>Target: {act.target}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <AddProjectModal
        isOpen={isAddProjectModalOpen || !!editingProject}
        onClose={() => {
          setIsAddProjectModalOpen(false);
          setEditingProject(null);
        }}
        initialData={editingProject}
        onSuccess={() => setRefreshKey(prev => prev + 1)}
      />

      <AddEmployeeModal
        isOpen={isAddEmployeeModalOpen}
        onClose={() => setIsAddEmployeeModalOpen(false)}
        onSuccess={() => setRefreshKey(prev => prev + 1)}
      />
    </div >
  );
}
