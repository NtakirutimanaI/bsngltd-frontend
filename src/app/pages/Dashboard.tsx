import {
  Building2, Users, Home, DollarSign, AlertCircle, CheckCircle,
  Clock, MessageSquare, Eye, Edit, Trash2,
  CalendarCheck, X
} from "lucide-react";

import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
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


// --------------- Interfaces ---------------
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

// --------------- Helpers ---------------
function avatarInitials(name: string) {
  return (name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Simple inline calendar for the widget
function MiniCalendar() {
  const today = new Date();
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const monthName = new Date(current.year, current.month).toLocaleString("en-US", { month: "long", year: "numeric" });

  const firstDay = new Date(current.year, current.month, 1).getDay();
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  const prev = () => setCurrent(c => c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 });
  const next = () => setCurrent(c => c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 });

  return (
    <div style={{ fontSize: '13px' }}>
      <div className="d-flex align-items-center justify-content-between mb-2">
        <button className="btn btn-sm btn-light border" onClick={prev}>&#8249;</button>
        <small className="fw-bold">{monthName}</small>
        <button className="btn btn-sm btn-light border" onClick={next}>&#8250;</button>
      </div>
      <table className="w-100 text-center" style={{ tableLayout: 'fixed' }}>
        <thead>
          <tr>
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
              <th key={d} style={{ fontSize: '11px', fontWeight: 600, padding: '2px 0', color: '#6c757d' }}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: Math.ceil(cells.length / 7) }, (_, wi) => (
            <tr key={wi}>
              {cells.slice(wi * 7, wi * 7 + 7).map((day, di) => {
                const isToday = day === today.getDate() && current.month === today.getMonth() && current.year === today.getFullYear();
                return (
                  <td key={di} style={{ padding: '3px 0' }}>
                    {day ? (
                      <span
                        className={`d-inline-flex align-items-center justify-content-center rounded-circle ${isToday ? 'bg-primary text-white' : ''}`}
                        style={{ width: '26px', height: '26px', fontSize: '12px', cursor: 'pointer', fontWeight: isToday ? 700 : 400 }}
                      >
                        {day}
                      </span>
                    ) : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --------------- Main Component ---------------
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

  // To-do widget state
  const [todoInput, setTodoInput] = useState("");
  const [todos, setTodos] = useState([
    { id: 1, text: "Review project proposals", done: false },
    { id: 2, text: "Update employee records", done: false },
    { id: 3, text: "Approve monthly budget", done: true },
    { id: 4, text: "Schedule site visits", done: false },
    { id: 5, text: "Prepare board report", done: false },
  ]);

  const isEmployee = roleName === 'employee';
  const isClient = roleName === 'client';
  const isContractor = roleName === 'contractor';
  const isAuditor = roleName === 'auditor';
  const isEditor = roleName === 'editor';
  const isAdminLike = ['super_admin', 'admin', 'manager', 'site_manager'].includes(roleName);

  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);

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
      loadMessages();
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

  const loadMessages = async () => {
    try {
      const data = await fetchApi<any[]>(`/messages/conversations?userId=${user?.id}`);
      setMessages(data.slice(0, 4));
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  // ---- Stats ----
  const adminStats = [
    { name: "Active Projects", value: statsData?.adminStats[0]?.value || "0", Icon: Building2 },
    { name: "Total Employees", value: statsData?.adminStats[1]?.value || "0", Icon: Users },
    { name: "Properties", value: statsData?.adminStats[2]?.value || "0", Icon: Home },
    { name: "Total Revenue", value: statsData?.adminStats[3]?.value || "RWF 0M", Icon: DollarSign },
  ];

  const employeeStats = [
    { name: "My Assignments", value: "4", Icon: Building2 },
    { name: "Hours Worked", value: "38h", Icon: Clock },
    { name: "Pending Tasks", value: "7", Icon: AlertCircle },
    { name: "Next Payday", value: "Feb 28", Icon: DollarSign },
  ];

  const clientStats = [
    { name: "My Properties", value: "1", Icon: Home },
    { name: "Payment Status", value: "Paid", Icon: CheckCircle },
    { name: "Next Rent Due", value: "Mar 01", Icon: Clock },
    { name: "Support Tickets", value: "0", Icon: MessageSquare },
  ];

  const contractorStats = [
    { name: "Active Contracts", value: "2", Icon: Building2 },
    { name: "Completed Work", value: "85%", Icon: CheckCircle },
    { name: "Pending Invoices", value: "1", Icon: DollarSign },
    { name: "Deadlines", value: "3", Icon: Clock },
  ];

  const getRoleStats = () => {
    if (isAdminLike || isAuditor || isEditor) return adminStats;
    if (isEmployee) return employeeStats;
    if (isClient) return clientStats;
    if (isContractor) return contractorStats;
    return adminStats;
  };

  const stats = getRoleStats();

  // ---- Chart Data ----
  // Worldwide Sales => Bar chart (project status counts by category, shown as grouped bars)
  const barYears = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const worldwideSalesData = (statsData?.revenueStats as any)?.chartData?.length > 0
    ? (statsData?.revenueStats as any).chartData.slice(0, 7).map((d: any, i: number) => ({
        label: d.month || barYears[i],
        projects: Math.round((d.revenue || 0) / 500000),
        employees: Math.round((d.expenses || 0) / 200000),
        properties: Math.round((d.revenue || 0) / 800000),
      }))
    : barYears.map((label, i) => ({
        label,
        projects: [15, 30, 55, 65, 60, 80, 95][i],
        employees: [8, 35, 40, 60, 70, 55, 75][i],
        properties: [12, 25, 45, 55, 65, 70, 60][i],
      }));

  // Sales & Revenue => Line chart
  const salesRevenueData = (statsData?.revenueStats as any)?.chartData?.length > 0
    ? (statsData?.revenueStats as any).chartData.slice(0, 7).map((d: any, i: number) => ({
        label: d.month || barYears[i],
        revenue: Math.round((d.revenue || 0) / 1000000),
        expenses: Math.round((d.expenses || 0) / 1000000),
      }))
    : barYears.map((label, i) => ({
        label,
        revenue: [15, 30, 55, 45, 70, 65, 85][i],
        expenses: [99, 135, 170, 130, 190, 180, 270][i] / 10,
      }));

  // Recent projects as "Recent Sales" table
  const recentProjects = statsData?.latestProjects?.map(p => ({
    id: p.id,
    name: p.name,
    status: p.status,
    progress: p.progress,
    budget: p.budget,
  })) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-success";
      case "planning": return "text-primary";
      case "on_hold": return "text-warning";
      case "completed": return "text-info";
      default: return "text-muted";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="text-success" size={14} />;
      case "planning": return <Clock className="text-primary" size={14} />;
      case "on_hold": return <AlertCircle className="text-warning" size={14} />;
      default: return null;
    }
  };

  // ---- To-Do helpers ----
  const addTodo = () => {
    if (!todoInput.trim()) return;
    setTodos(prev => [...prev, { id: Date.now(), text: todoInput.trim(), done: false }]);
    setTodoInput("");
  };
  const toggleTodo = (id: number) => setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const removeTodo = (id: number) => setTodos(prev => prev.filter(t => t.id !== id));

  const tooltipStyle = {
    backgroundColor: theme === 'dark' ? "#191c24" : "#fff",
    border: "1px solid #dee2e6",
    borderRadius: "4px",
    fontSize: '12px'
  };

  return (
    <div>
      {/* ========= STAT CARDS (Sale & Revenue) ========= */}
      <div className="container-fluid pt-4 px-4">
        <div className="row g-4">
          {loading
            ? [...Array(4)].map((_, i) => (
                <div key={i} className="col-sm-6 col-xl-3">
                  <div className="bg-light rounded d-flex align-items-center justify-content-between p-4">
                    <div className="placeholder-glow">
                      <span className="placeholder rounded-circle" style={{ width: '48px', height: '48px' }}></span>
                    </div>
                    <div className="ms-3 w-100">
                      <div className="placeholder-glow mb-2"><span className="placeholder col-7 rounded"></span></div>
                      <div className="placeholder-glow"><span className="placeholder col-4 rounded"></span></div>
                    </div>
                  </div>
                </div>
              ))
            : stats.map((stat: any, index: number) => (
                <div key={stat.name} className="col-sm-6 col-xl-3">
                  <ScrollReveal delay={index * 0.08}>
                    <div className="bg-light rounded d-flex align-items-center justify-content-between p-4 shadow-sm">
                      <stat.Icon size={48} className="text-primary" />
                      <div className="ms-3">
                        <p className="mb-2 text-muted small">{stat.name}</p>
                        <h6 className="mb-0 fw-bold">{stat.value}</h6>
                      </div>
                    </div>
                  </ScrollReveal>
                </div>
              ))
          }
        </div>
      </div>
      {/* ========= END STAT CARDS ========= */}


      {/* ========= SALES CHARTS ========= */}
      {(isAdminLike || isAuditor || isEditor) && (
        <div className="container-fluid pt-4 px-4">
          <div className="row g-4">
            {/* Worldwide Sales - Bar Chart */}
            <div className="col-sm-12 col-xl-6">
              <ScrollReveal delay={0.15}>
                <div className="bg-light text-center rounded p-4">
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <h6 className="mb-0">Worldwide Sales</h6>
                    <a href="" onClick={e => { e.preventDefault(); navigate('/dashboard/finance'); }}>Show All</a>
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={worldwideSalesData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? "#374151" : "#dee2e6"} />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="projects" name="Projects" fill="rgba(0,156,255,0.7)" radius={[3, 3, 0, 0]} barSize={12} />
                      <Bar dataKey="employees" name="Staff" fill="rgba(0,156,255,0.5)" radius={[3, 3, 0, 0]} barSize={12} />
                      <Bar dataKey="properties" name="Properties" fill="rgba(0,156,255,0.3)" radius={[3, 3, 0, 0]} barSize={12} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ScrollReveal>
            </div>

            {/* Sales & Revenue - Line Chart */}
            <div className="col-sm-12 col-xl-6">
              <ScrollReveal delay={0.2}>
                <div className="bg-light text-center rounded p-4">
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <h6 className="mb-0">Sales &amp; Revenue</h6>
                    <a href="" onClick={e => { e.preventDefault(); navigate('/dashboard/finance'); }}>Show All</a>
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={salesRevenueData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? "#374151" : "#dee2e6"} />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Line type="monotone" dataKey="revenue" name="Revenue" stroke="rgba(0,156,255,0.8)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} fill="rgba(0,156,255,0.5)" />
                      <Line type="monotone" dataKey="expenses" name="Expenses" stroke="rgba(0,156,255,0.5)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} fill="rgba(0,156,255,0.3)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      )}
      {/* ========= END SALES CHARTS ========= */}


      {/* ========= RECENT SALES TABLE ========= */}
      <div className="container-fluid pt-4 px-4">
        <ScrollReveal delay={0.25}>
          <div className="bg-light text-center rounded p-4">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h6 className="mb-0">
                {isEmployee || isContractor ? "My Assigned Projects" : isClient ? "My Active Projects" : "Recent Projects"}
              </h6>
              <a href="" onClick={e => { e.preventDefault(); navigate('/dashboard/portfolio'); }}>Show All</a>
            </div>
            <div className="table-responsive">
              <table className="table text-start align-middle table-bordered table-hover mb-0">
                <thead>
                  <tr className="text-dark">
                    <th scope="col"><input className="form-check-input" type="checkbox" /></th>
                    <th scope="col">Project</th>
                    <th scope="col">ID</th>
                    <th scope="col">Status</th>
                    <th scope="col">Progress</th>
                    {!isEmployee && <th scope="col">Budget</th>}
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? [...Array(5)].map((_, i) => (
                        <tr key={i}>
                          {[...Array(isEmployee ? 6 : 7)].map((_, j) => (
                            <td key={j}><span className="placeholder col-8 rounded"></span></td>
                          ))}
                        </tr>
                      ))
                    : recentProjects.length === 0
                      ? (
                        <tr>
                          <td colSpan={isEmployee ? 6 : 7} className="text-center text-muted py-4">No projects found</td>
                        </tr>
                      )
                      : recentProjects.map((project: any) => (
                          <tr key={project.id}>
                            <td><input className="form-check-input" type="checkbox" /></td>
                            <td className="fw-medium">{project.name}</td>
                            <td className="text-muted small">#{project.id?.slice(-6) || 'N/A'}</td>
                            <td>
                              {isAdminLike && statusChanging === project.id ? (
                                <select
                                  className="form-select form-select-sm"
                                  style={{ width: '120px' }}
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
                                <span
                                  className={`small fw-medium text-capitalize ${getStatusColor(project.status)}`}
                                  style={{ cursor: isAdminLike ? 'pointer' : 'default' }}
                                  onClick={() => isAdminLike && setStatusChanging(project.id)}
                                  title={isAdminLike ? 'Click to change status' : ''}
                                >
                                  {project.status?.replace("_", " ")}
                                </span>
                              )}
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <div className="progress flex-grow-1" style={{ height: '6px', minWidth: '80px' }}>
                                  <div
                                    className="progress-bar"
                                    style={{ backgroundColor: '#009CFF', width: `${project.progress || 0}%` }}
                                    role="progressbar"
                                    aria-valuenow={project.progress}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                  />
                                </div>
                                <small className="text-muted">{project.progress || 0}%</small>
                              </div>
                            </td>
                            {!isEmployee && <td className="small fw-medium">{project.budget}</td>}
                            <td>
                              <div className="d-flex gap-1">
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={() => navigate(`/dashboard/portfolio?id=${project.id}`)}
                                >Detail</button>
                                {isAdminLike && (
                                  <>
                                    <button
                                      className="btn btn-sm btn-outline-secondary"
                                      onClick={() => { setEditingProject(project); }}
                                    ><Edit size={12} /></button>
                                    <button
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={async () => {
                                        if (project.id && confirm(`Delete project "${project.name}"?`)) {
                                          try {
                                            await fetchApi(`/projects/${project.id}`, { method: 'DELETE' });
                                            setRefreshKey(prev => prev + 1);
                                          } catch (err) { console.error('Delete failed', err); }
                                        }
                                      }}
                                    ><Trash2 size={12} /></button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>
      </div>
      {/* ========= END RECENT SALES TABLE ========= */}


      {/* ========= WIDGETS (Messages, Calendar, To-Do) ========= */}
      <div className="container-fluid pt-4 px-4">
        <div className="row g-4">

          {/* Messages Widget */}
          <div className="col-sm-12 col-md-6 col-xl-4">
            <ScrollReveal delay={0.3}>
              <div className="h-100 bg-light rounded p-4">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h6 className="mb-0">Messages</h6>
                  <a href="" onClick={e => { e.preventDefault(); navigate('/dashboard/communications'); }}>Show All</a>
                </div>
                {messages.length === 0 ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="d-flex align-items-center border-bottom py-3">
                      <div className="rounded-circle bg-secondary flex-shrink-0" style={{ width: 40, height: 40 }}></div>
                      <div className="w-100 ms-3">
                        <div className="d-flex w-100 justify-content-between">
                          <h6 className="mb-0 placeholder col-4"></h6>
                          <small className="placeholder col-2"></small>
                        </div>
                        <span className="placeholder col-6 small"></span>
                      </div>
                    </div>
                  ))
                ) : (
                  messages.map((msg: any, i: number) => (
                    <div
                      key={msg.id || i}
                      className={`d-flex align-items-center py-3 ${i < messages.length - 1 ? 'border-bottom' : ''}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate('/dashboard/communications')}
                    >
                      <div
                        className="rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center bg-primary text-white fw-bold"
                        style={{ width: 40, height: 40, fontSize: '14px' }}
                      >
                        {avatarInitials(msg.name || msg.sender || "?")}
                      </div>
                      <div className="w-100 ms-3">
                        <div className="d-flex w-100 justify-content-between">
                          <h6 className="mb-0 small fw-bold">{msg.name || msg.sender}</h6>
                          <small className="text-muted">{msg.time || "just now"}</small>
                        </div>
                        <span className="small text-muted">{(msg.lastMessage || msg.content || "").slice(0, 40)}...</span>
                      </div>
                    </div>
                  ))
                )}
                {/* Pad if fewer than 4 */}
                {messages.length > 0 && messages.length < 4 && [...Array(4 - messages.length)].map((_, i) => (
                  <div key={`pad-${i}`} className={`d-flex align-items-center border-bottom py-3`}>
                    <div className="rounded-circle bg-secondary opacity-25 flex-shrink-0" style={{ width: 40, height: 40 }}></div>
                    <div className="w-100 ms-3">
                      <h6 className="mb-0 small text-muted">No more messages</h6>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>

          {/* Calendar Widget */}
          <div className="col-sm-12 col-md-6 col-xl-4">
            <ScrollReveal delay={0.35}>
              <div className="h-100 bg-light rounded p-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h6 className="mb-0">Calendar</h6>
                  <a href="" onClick={e => { e.preventDefault(); navigate('/dashboard/calendar'); }}>Show All</a>
                </div>
                <MiniCalendar />
              </div>
            </ScrollReveal>
          </div>

          {/* To-Do List Widget */}
          <div className="col-sm-12 col-md-6 col-xl-4">
            <ScrollReveal delay={0.4}>
              <div className="h-100 bg-light rounded p-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h6 className="mb-0">To Do List</h6>
                  <a href="">Show All</a>
                </div>
                <div className="d-flex mb-2">
                  <input
                    className="form-control bg-transparent"
                    type="text"
                    placeholder="Enter task"
                    value={todoInput}
                    onChange={e => setTodoInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addTodo()}
                  />
                  <button type="button" className="btn btn-primary ms-2" onClick={addTodo}>Add</button>
                </div>
                {todos.map((todo, i) => (
                  <div key={todo.id} className={`d-flex align-items-center py-2 ${i < todos.length - 1 ? 'border-bottom' : ''}`}>
                    <input
                      className="form-check-input m-0 flex-shrink-0"
                      type="checkbox"
                      checked={todo.done}
                      onChange={() => toggleTodo(todo.id)}
                    />
                    <div className="w-100 ms-3">
                      <div className="d-flex w-100 align-items-center justify-content-between">
                        <span className="small">{todo.done ? <del className="text-muted">{todo.text}</del> : todo.text}</span>
                        <button
                          className={`btn btn-sm ${todo.done ? 'text-primary' : ''}`}
                          style={{ padding: '0 4px', lineHeight: 1 }}
                          onClick={() => removeTodo(todo.id)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>

        </div>
      </div>
      {/* ========= END WIDGETS ========= */}


      {/* ========= ACTIVITY LOG (Admin only, collapsible) ========= */}
      {(isAdminLike || isAuditor) && activities.length > 0 && (
        <div className="container-fluid pt-4 px-4">
          <ScrollReveal delay={0.45}>
            <div className="bg-light rounded p-4">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h6 className="mb-0 fw-bold">Activity Log</h6>
                <a href="" onClick={e => { e.preventDefault(); navigate('/dashboard/admin'); }}>Show All</a>
              </div>
              <div className="activity-timeline">
                {activities.slice(0, 8).map((act) => (
                  <div key={act.id} className="d-flex gap-3 position-relative pb-2">
                    <div className="flex-shrink-0 mt-1">
                      <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', backgroundColor: 'rgba(0,156,255,0.1)', color: '#009CFF' }}>
                        {act.action.includes('Attendance') ? <CalendarCheck size={14} /> : (act.action.includes('Salary') ? <DollarSign size={14} /> : <Eye size={14} />)}
                      </div>
                    </div>
                    <div className="flex-grow-1 border-bottom border-light/50 pb-2">
                      <div className="d-flex justify-content-between align-items-start">
                        <span className="fw-bold text-dark" style={{ fontSize: '11px' }}>{act.action}</span>
                        <span className="text-muted" style={{ fontSize: '9px' }}>{new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-muted mb-0 mt-1" style={{ fontSize: '10px' }}>
                        <span className="fw-semibold" style={{ color: '#009CFF' }}>{act.userName}</span>: {act.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      )}
      {/* ========= END ACTIVITY LOG ========= */}


      {/* Spacer */}
      <div style={{ height: '24px' }} />

      {/* Modals */}
      <AddProjectModal
        isOpen={isAddProjectModalOpen || !!editingProject}
        onClose={() => { setIsAddProjectModalOpen(false); setEditingProject(null); }}
        initialData={editingProject}
        onSuccess={() => setRefreshKey(prev => prev + 1)}
      />
      <AddEmployeeModal
        isOpen={isAddEmployeeModalOpen}
        onClose={() => setIsAddEmployeeModalOpen(false)}
        onSuccess={() => setRefreshKey(prev => prev + 1)}
      />
    </div>
  );
}
