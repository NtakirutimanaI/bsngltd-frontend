import { useState } from "react";
import { toast } from "sonner";
import {
  TrendingUp,
  DollarSign,
  Users,
  Building2,
  Calendar,
  Download,
  FileText,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { useTheme } from "@/app/context/ThemeContext";
import { ExportReportModal } from "@/app/components/ExportReportModal";

export function Reports({ hideHeader = false }: { hideHeader?: boolean }) {
  const { theme } = useTheme();

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const quarterlyRevenue = [
    { quarter: "Q1 2023", revenue: 120, expenses: 85, profit: 35 },
    { quarter: "Q2 2023", revenue: 145, expenses: 95, profit: 50 },
    { quarter: "Q3 2023", revenue: 160, expenses: 105, profit: 55 },
    { quarter: "Q4 2023", revenue: 185, expenses: 115, profit: 70 },
    { quarter: "Q1 2024", revenue: 210, expenses: 125, profit: 85 },
    { quarter: "Q2 2024", revenue: 235, expenses: 135, profit: 100 },
  ];

  const projectTypeData = [
    { name: "Construction", value: 45, color: "#009CFF" },
    { name: "Renovation", value: 25, color: "#3b82f6" },
    { name: "Plot Sale", value: 20, color: "#10b981" },
    { name: "Rental", value: 10, color: "#6366f1" },
  ];

  const departmentExpenses = [
    { department: "Engineering", amount: 45 },
    { department: "Operations", amount: 38 },
    { department: "Management", amount: 25 },
    { department: "Finance", amount: 15 },
    { department: "HR", amount: 12 },
    { department: "Procurement", amount: 18 },
  ];

  const monthlyProjects = [
    { month: "Jan", completed: 2, active: 8, planning: 3 },
    { month: "Feb", completed: 3, active: 9, planning: 2 },
    { month: "Mar", completed: 1, active: 10, planning: 4 },
    { month: "Apr", completed: 4, active: 8, planning: 3 },
    { month: "May", completed: 2, active: 9, planning: 5 },
    { month: "Jun", completed: 3, active: 11, planning: 2 },
  ];

  const exportReport = (type: string) => {
    toast.success(`Exporting ${type} report...`);
  };

  return (
    <div className="space-y-4">
      <ExportReportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} onExport={(format) => { toast.success(`Downloading ${format.toUpperCase()} report...`); }} />

      {/* KPI Cards - High Density */}
      <div className="row g-3 mb-2">
        {[
          { label: "Revenue (2024)", value: "RWF 445M", icon: DollarSign, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Fixed Projects", value: "15", icon: Building2, color: "text-indigo-500", bg: "bg-indigo-50" },
          { label: "Productivity", value: "94%", icon: Users, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Margin", value: "42.5%", icon: BarChart3, color: "text-violet-500", bg: "bg-violet-50" },
        ].map((kpi, i) => (
          <ScrollReveal key={i} delay={i * 0.05} className="col-sm-6 col-xl-3">
            <div className="glass-card p-2 rounded-xl border border-white shadow-sm d-flex align-items-center gap-3" style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)' }}>
              <div className={`${kpi.bg} rounded-lg d-flex align-items-center justify-content-center shadow-xs`} style={{ width: '36px', height: '36px', minWidth: '36px' }}>
                <kpi.icon size={16} className={kpi.color} />
              </div>
              <div className="overflow-hidden">
                <p className="text-muted mb-0 font-medium" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{kpi.label}</p>
                <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '14px' }}>{kpi.value}</h6>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Revenue Trends - Compact */}
      <ScrollReveal delay={0.3} className="glass-card rounded-xl shadow-sm border border-white p-3" style={{ background: 'rgba(255, 255, 255, 0.6)' }}>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h3 className="fw-bold text-dark mb-0" style={{ fontSize: '13px' }}>Quarterly Performance</h3>
            <p className="text-muted mb-0" style={{ fontSize: '11px' }}>Revenue, expenses, and profit trends</p>
          </div>
          <div className="d-flex gap-1">
            <button className="btn btn-sm py-0 px-2" style={{ fontSize: '10px', height: '24px', background: '#009CFF', color: '#fff', borderRadius: '6px' }}>All Time</button>
            <button className="btn btn-sm py-0 px-2 border" style={{ fontSize: '10px', height: '24px', borderRadius: '6px' }}>6 Months</button>
          </div>
        </div>
        <div style={{ height: '180px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={quarterlyRevenue}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#009CFF" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#009CFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="quarter" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#999' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#999' }} />
              <Tooltip 
                 contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '11px' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#009CFF" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
              <Area type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} fill="transparent" name="Profit" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ScrollReveal>

      {/* Grid for smaller charts */}
      <div className="row g-3">
        <ScrollReveal delay={0.4} className="col-lg-6">
          <div className="glass-card rounded-xl shadow-sm border border-white p-3 h-100" style={{ background: 'rgba(255, 255, 255, 0.6)' }}>
            <h3 className="fw-bold text-dark mb-3" style={{ fontSize: '13px' }}>Project Type Distribution</h3>
            <div style={{ height: '160px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={projectTypeData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                    {projectTypeData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 d-flex flex-wrap gap-3 justify-content-center">
               {projectTypeData.map((d, i) => (
                 <div key={i} className="d-flex align-items-center gap-1">
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: d.color }}></div>
                    <span style={{ fontSize: '10px' }} className="text-muted">{d.name}</span>
                 </div>
               ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.5} className="col-lg-6">
          <div className="glass-card rounded-xl shadow-sm border border-white p-3 h-100" style={{ background: 'rgba(255, 255, 255, 0.6)' }}>
            <h3 className="fw-bold text-dark mb-3" style={{ fontSize: '13px' }}>Monthly Project Status</h3>
            <div style={{ height: '160px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyProjects}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#999' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#999' }} />
                  <Tooltip contentStyle={{ borderRadius: '10px', fontSize: '11px' }} />
                  <Bar dataKey="active" fill="#009CFF" radius={[4, 4, 0, 0]} barSize={12} />
                  <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-center">
               <span style={{ fontSize: '10px' }} className="text-muted">Total active projects: 10</span>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Summary Row - High Density */}
      <div className="row g-3">
        {[
          { icon: TrendingUp, label: "Client Satisfaction", value: "4.8/5.0", footer: "Based on 156 reviews" },
          { icon: Calendar, label: "Avg Duration", value: "8.5 months", footer: "15% faster than avg" },
          { icon: DollarSign, label: "Budget Adherence", value: "96%", footer: "On-budget completion" }
        ].map((item, i) => (
          <ScrollReveal key={i} delay={0.6 + (i*0.1)} className="col-md-4">
            <div className="glass-card p-3 rounded-xl border border-white shadow-sm" style={{ background: 'rgba(255, 255, 255, 0.5)' }}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <div className="bg-blue-50 rounded-lg p-1.5 text-blue-600 d-flex align-items-center justify-content-center">
                  <item.icon size={12} />
                </div>
                <span className="text-muted fw-medium" style={{ fontSize: '10px', textTransform: 'uppercase' }}>{item.label}</span>
              </div>
              <h4 className="fw-bold mb-1 text-dark" style={{ fontSize: '16px' }}>{item.value}</h4>
              <p className="text-muted mb-0" style={{ fontSize: '10px' }}>{item.footer}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
