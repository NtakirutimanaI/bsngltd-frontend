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
    // Mock export functionality
    alert(`Exporting ${type} report...`);
  };

  return (
    <div className="space-y-6">
      <ExportReportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} onExport={(format) => { toast.success(`Downloading ${format.toUpperCase()} report...`); }} />

      {/* Header */}
      {!hideHeader && (
        <ScrollReveal className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="h3 fw-bold text-gray-900 mb-1">Reports & Analytics</h1>
            <p className="text-gray-600 mt-1">Comprehensive business insights and performance metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 hover:text-blue-600 hover:border-blue-600 transition-all hover:scale-110 active:scale-95 bg-white dark:bg-gray-800"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={() => exportReport("PDF")}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:scale-105 active:scale-95"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </button>
            <button
              onClick={() => exportReport("Excel")}
              className="flex items-center gap-2 px-5 py-2 bg-[#009CFF] text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:scale-105 active:scale-95"
            >
              <FileText className="h-4 w-4" />
              Export Excel
            </button>
          </div>
        </ScrollReveal>
      )}

      {/* KPI Cards */}
      <div className="row g-4 mb-4">
        <ScrollReveal delay={0.1} className="col-sm-6 col-xl-3">
          <div className="bg-light rounded d-flex align-items-center justify-content-between p-4">
            <DollarSign className="h-10 w-10 text-primary" />
            <div className="ms-3 text-end">
              <p className="mb-2 text-xs text-muted">Revenue (2024)</p>
              <h6 className="mb-0 font-bold">RWF 445M</h6>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2} className="col-sm-6 col-xl-3">
          <div className="bg-light rounded d-flex align-items-center justify-content-between p-4">
            <Building2 className="h-10 w-10 text-primary" />
            <div className="ms-3 text-end">
              <p className="mb-2 text-xs text-muted">Fixed Projects</p>
              <h6 className="mb-0 font-bold">15</h6>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3} className="col-sm-6 col-xl-3">
          <div className="bg-light rounded d-flex align-items-center justify-content-between p-4">
            <Users className="h-10 w-10 text-primary" />
            <div className="ms-3 text-end">
              <p className="mb-2 text-xs text-muted">Productivity</p>
              <h6 className="mb-0 font-bold">94%</h6>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.4} className="col-sm-6 col-xl-3">
          <div className="bg-light rounded d-flex align-items-center justify-content-between p-4">
            <BarChart3 className="h-10 w-10 text-primary" />
            <div className="ms-3 text-end">
              <p className="mb-2 text-xs text-muted">Margin</p>
              <h6 className="mb-0 font-bold">42.5%</h6>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Revenue Trends */}
      <ScrollReveal delay={0.5} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Quarterly Performance</h3>
            <p className="text-xs text-gray-600 mt-0.5">Revenue, expenses, and profit trends</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
              6 Months
            </button>
            <button className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-lg text-xs font-medium">
              1 Year
            </button>
            <button className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-lg text-xs font-medium">
              All Time
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={quarterlyRevenue}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#009CFF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#009CFF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#009CFF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#009CFF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "#374151" : "#e5e7eb"} />
            <XAxis dataKey="quarter" stroke={theme === 'dark' ? "#9ca3af" : "#6b7280"} />
            <YAxis stroke={theme === 'dark' ? "#9ca3af" : "#6b7280"} />
            <Tooltip
              contentStyle={{
                backgroundColor: theme === 'dark' ? "#1f2937" : "#fff",
                border: theme === 'dark' ? "1px solid #374151" : "1px solid #e5e7eb",
                borderRadius: "8px",
                color: theme === 'dark' ? "#fff" : "#000"
              }}
              itemStyle={{ color: theme === 'dark' ? "#e5e7eb" : undefined }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#009CFF"
              fillOpacity={1}
              fill="url(#colorRevenue)"
              name="Revenue (M)"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="#009CFF"
              fillOpacity={1}
              fill="url(#colorExpenses)"
              name="Expenses (M)"
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorProfit)"
              name="Profit (M)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ScrollReveal>

      {/* Two Column Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Project Types Distribution */}
        <ScrollReveal delay={0.6} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Project Distribution by Type</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={projectTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {projectTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? "#1f2937" : "#fff",
                  border: theme === 'dark' ? "1px solid #374151" : "1px solid #e5e7eb",
                  color: theme === 'dark' ? "#fff" : "#000"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ScrollReveal>

        {/* Department Expenses */}
        <ScrollReveal delay={0.7} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Department Expenses</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={departmentExpenses}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "#374151" : "#e5e7eb"} />
              <XAxis dataKey="department" stroke={theme === 'dark' ? "#9ca3af" : "#6b7280"} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke={theme === 'dark' ? "#9ca3af" : "#6b7280"} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? "#1f2937" : "#fff",
                  border: theme === 'dark' ? "1px solid #374151" : "1px solid #e5e7eb",
                  borderRadius: "8px",
                  color: theme === 'dark' ? "#fff" : "#000"
                }}
                itemStyle={{ color: theme === 'dark' ? "#e5e7eb" : undefined }}
              />
              <Bar dataKey="amount" fill="#009CFF" radius={[8, 8, 0, 0]} name="Amount (M)" />
            </BarChart>
          </ResponsiveContainer>
        </ScrollReveal>
      </div>

      {/* Project Status Timeline */}
      <ScrollReveal delay={0.8} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Monthly Project Status Timeline
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyProjects}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "#374151" : "#e5e7eb"} />
            <XAxis dataKey="month" stroke={theme === 'dark' ? "#9ca3af" : "#6b7280"} />
            <YAxis stroke={theme === 'dark' ? "#9ca3af" : "#6b7280"} />
            <Tooltip
              contentStyle={{
                backgroundColor: theme === 'dark' ? "#1f2937" : "#fff",
                border: theme === 'dark' ? "1px solid #374151" : "1px solid #e5e7eb",
                borderRadius: "8px",
                color: theme === 'dark' ? "#fff" : "#000"
              }}
              itemStyle={{ color: theme === 'dark' ? "#e5e7eb" : undefined }}
            />
            <Legend />
            <Bar dataKey="completed" stackId="a" fill="#009CFF" name="Completed" radius={[8, 8, 0, 0]} />
            <Bar dataKey="active" stackId="a" fill="#3b82f6" name="Active" />
            <Bar dataKey="planning" stackId="a" fill="#10b981" name="Planning" />
          </BarChart>
        </ResponsiveContainer>
      </ScrollReveal>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ScrollReveal delay={0.9} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Client Satisfaction</p>
              <p className="text-xl font-bold text-gray-900">4.8/5.0</p>
            </div>
          </div>
          <p className="text-xs text-gray-600">Based on 156 project reviews</p>
        </ScrollReveal>

        <ScrollReveal delay={1.0} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Avg Project Duration</p>
              <p className="text-xl font-bold text-gray-900">8.5 months</p>
            </div>
          </div>
          <p className="text-xs text-gray-600">15% faster than industry average</p>
        </ScrollReveal>

        <ScrollReveal delay={1.1} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Budget Adherence</p>
              <p className="text-xl font-bold text-gray-900">96%</p>
            </div>
          </div>
          <p className="text-xs text-gray-600">Projects completed within budget</p>
        </ScrollReveal>
      </div>
    </div>
  );
}
