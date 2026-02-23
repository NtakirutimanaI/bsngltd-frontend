import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  Briefcase,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { AddEmployeeModal } from "@/app/components/AddEmployeeModal";
import { useCurrency } from "@/app/context/CurrencyContext";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { fetchApi } from '../api/client';
import { Modal } from '@/app/components/Modal';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/app/components/ui/pagination";
import { useDebounce } from "@/app/hooks/useDebounce";

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  lastPage: number;
}

interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  hireDate: string;
  salaryType: string;
  baseSalary: number;
  status: "active" | "inactive";
  attendance: number;
}

import { useAuth } from "@/app/context/AuthContext";
import { toast } from "sonner";

export function Employees() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { currency } = useCurrency();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const roleName = ((typeof user?.role === 'object' && user.role !== null) ? user.role.name : user?.role || 'guest').toLowerCase();
  const isEmployee = roleName === 'employee';
  const isSiteManager = roleName === 'site_manager';
  const isAdminOrManager = ['super_admin', 'admin', 'manager', 'site_manager', 'client'].includes(roleName);

  const pageTitle = isEmployee ? 'My Workspace' : (isSiteManager ? 'Site Staff Management' : 'Employees');
  const pageSubtitle = isEmployee ? 'Manage your employment details, attendance, and requests' : 'Manage employee records, site staff, and payroll';

  const leaveRequests = [
    { id: 1, type: "Annual Leave", startDate: "2025-02-10", endDate: "2025-02-15", status: "approved", approvedBy: "Manager" },
    { id: 2, type: "Sick Leave", startDate: "2024-12-05", endDate: "2024-12-06", status: "approved", approvedBy: "Admin" },
    { id: 3, type: "Personal", startDate: "2025-03-01", endDate: "2025-03-02", status: "pending", approvedBy: "-" },
  ];

  // Fetch employees
  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams({
      page: currentPage.toString(),
      limit: '10',
      search: debouncedSearchTerm,
      department: filterDepartment
    }).toString();

    fetchApi<PaginatedResponse<Employee>>(`/employees?${query}`)
      .then(res => {
        setEmployees(res.data || []);
        setTotalPages(res.lastPage || 1);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch employees", err);
        setLoading(false);
      });
  }, [currentPage, debouncedSearchTerm, filterDepartment, refreshKey]);

  const getDepartmentColor = (department: string) => {
    switch (department) {
      case "Engineering": return "bg-primary-subtle text-primary";
      case "Management": return "bg-info-subtle text-info";
      case "Operations": return "bg-success-subtle text-success";
      case "Finance": return "bg-warning-subtle text-warning";
      case "Human Resources": return "bg-danger-subtle text-danger";
      case "Procurement": return "bg-secondary-subtle text-secondary";
      default: return "bg-light text-dark";
    }
  };

  const getAttendanceStatus = (attendance: number) => {
    if (attendance >= 95) return { icon: CheckCircle, color: "text-success", label: "Excellent" };
    if (attendance >= 90) return { icon: Clock, color: "text-primary", label: "Good" };
    return { icon: XCircle, color: "text-warning", label: "Needs Improvement" };
  };

  const formatSalary = (salary: number, type: string) => {
    let amount = salary;
    let formatOptions: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: 'RWF',
      maximumFractionDigits: 0
    };

    if (currency === 'USD') {
      amount = salary / 1300;
      formatOptions.currency = 'USD';
    }

    const formatted = new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'rw-RW', formatOptions).format(amount);

    if (type === "daily") {
      return `${formatted}/day`;
    }
    return `${formatted}/mo`;
  };


  const departments = [...new Set(employees.map((e) => e.department))];

  if (isEmployee) {
    const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);

    useEffect(() => {
      if (user?.email) {
        fetchApi<any[]>(`/employees/attendance/me?email=${user.email}`)
          .then(data => setAttendanceHistory(data))
          .catch(err => console.error(err));
      }
    }, [user]);

    // Mock if empty (for demo until seeded)
    const displayHistory = attendanceHistory.length > 0 ? attendanceHistory : [
      { date: "2025-01-29", status: "Present", reason: "-" }, // Kept as fallback/demo
    ];

    return (
      <div className="container-fluid p-4">
        <ScrollReveal>
          <div className="mb-4">
            <h1 className="h3 fw-bold text-dark">My Workspace</h1>
            <p className="text-muted mt-1">Manage your employment details, attendance, and requests</p>
          </div>
        </ScrollReveal>

        <div className="row g-4">
          {/* Left Column: Profile & Attendance Summary */}
          <div className="col-lg-6">
            <div className="d-flex flex-column gap-4">
              <ScrollReveal delay={0.1} className="card border-0 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title fw-bold text-dark mb-3">My Employment Details</h5>
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex justify-content-between border-bottom pb-2">
                      <span className="small text-muted">Position</span>
                      <span className="small fw-medium">Software Engineer</span>
                    </div>
                    <div className="d-flex justify-content-between border-bottom pb-2">
                      <span className="small text-muted">Department</span>
                      <span className="small fw-medium">Engineering</span>
                    </div>
                    <div className="d-flex justify-content-between border-bottom pb-2">
                      <span className="small text-muted">Join Date</span>
                      <span className="small fw-medium">Jan 15, 2024</span>
                    </div>
                    <div className="d-flex justify-content-between pt-1">
                      <span className="small text-muted">Current Salary</span>
                      <span className="small fw-bold text-success">{formatSalary(1200000, 'monthly')}</span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.2} className="card border-0 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title fw-bold text-dark mb-3">Attendance Summary</h5>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="rounded-circle bg-success-subtle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                      <CheckCircle className="text-success w-6 h-6" />
                    </div>
                    <div>
                      <div className="h4 fw-bold text-dark mb-0">
                        {displayHistory.length > 0
                          ? Math.round((displayHistory.filter(h => h.status === 'Present').length / displayHistory.length) * 100)
                          : 0}%
                      </div>
                      <div className="small text-success">Overall Attendance</div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>

          {/* Right Column: Leave Requests */}
          <div className="col-lg-6">
            <ScrollReveal delay={0.3} className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="card-title fw-bold text-dark mb-0">Leave Requests</h5>
                  <button
                    onClick={() => toast.info("Leave request system is being updated. Please contact HR.")}
                    className="btn btn-link text-orange-600 text-decoration-none fw-medium btn-sm"
                  >
                    Request Leave
                  </button>
                </div>
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr className="text-muted small text-uppercase fw-bold border-bottom">
                        <th className="pb-2 border-0">Type</th>
                        <th className="pb-2 border-0">Dates</th>
                        <th className="pb-2 border-0">Status</th>
                        <th className="pb-2 border-0">Approved By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaveRequests.map(req => (
                        <tr key={req.id}>
                          <td className="py-3 small fw-medium text-dark border-bottom-0">{req.type}</td>
                          <td className="py-3 small text-muted border-bottom-0">{req.startDate} - {req.endDate}</td>
                          <td className="py-3 border-bottom-0">
                            <span className={`badge ${req.status === 'approved' ? 'bg-success-subtle text-success' :
                              req.status === 'rejected' ? 'bg-danger-subtle text-danger' :
                                'bg-warning-subtle text-warning'
                              }`}>
                              {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 small text-muted border-bottom-0">{req.approvedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Attendance History (Full Table) */}
        <ScrollReveal delay={0.4} className="card border-0 shadow-sm mt-4">
          <div className="card-body">
            <h5 className="card-title fw-bold text-dark mb-4">My Attendance History</h5>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr className="text-muted small text-uppercase fw-bold border-bottom">
                    <th className="pb-3 border-0">Date</th>
                    <th className="pb-3 border-0">Status</th>
                    <th className="pb-3 border-0">Reason / Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {displayHistory.map((entry, idx) => (
                    <tr key={idx}>
                      <td className="py-3 small fw-medium text-dark border-bottom-0">{entry.date}</td>
                      <td className="py-3 border-bottom-0">
                        <span className={`badge ${entry.status === 'Present' ? 'bg-success-subtle text-success' :
                          entry.status === 'Late' ? 'bg-warning-subtle text-warning' :
                            'bg-danger-subtle text-danger'
                          }`}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="py-3 small text-muted border-bottom-0">{entry.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <ScrollReveal className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4 mb-4">
        <div>
          <h1 className="h3 fw-bold text-dark">{pageTitle}</h1>
          <p className="text-muted mt-1">{pageSubtitle}</p>
        </div>
        {isAdminOrManager && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn px-4 py-2 text-white border-0 shadow-lg hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all duration-300 d-flex align-items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              borderRadius: '12px',
              fontWeight: '600',
              letterSpacing: '0.3px',
              boxShadow: '0 10px 15px -3px rgba(234, 88, 12, 0.3)'
            }}
          >
            <div className="bg-white/20 rounded-md p-1 d-flex align-items-center justify-content-center">
              <Plus className="w-4 h-4" strokeWidth={3} />
            </div>
            <span>{isSiteManager ? 'Add Site Staff' : 'Add Employee'}</span>
          </button>
        )}
      </ScrollReveal>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-6 col-lg-3">
          <ScrollReveal delay={0.1} className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <small className="text-muted text-uppercase fw-bold">Total Employees</small>
                  <h4 className="fw-bold text-dark my-1">{employees.length}</h4>
                </div>
                <div className="bg-primary-subtle p-2 rounded">
                  <Users className="text-primary w-5 h-5" />
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
        <div className="col-md-6 col-lg-3">
          <ScrollReveal delay={0.2} className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <small className="text-muted text-uppercase fw-bold">Active</small>
                  <h4 className="fw-bold text-dark my-1">
                    {employees.filter((e) => e.status === "active").length}
                  </h4>
                </div>
                <div className="bg-success-subtle p-2 rounded">
                  <CheckCircle className="text-success w-5 h-5" />
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
        <div className="col-md-6 col-lg-3">
          <ScrollReveal delay={0.3} className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <small className="text-muted text-uppercase fw-bold">Departments</small>
                  <h4 className="fw-bold text-dark my-1">{departments.length}</h4>
                </div>
                <div className="bg-info-subtle p-2 rounded">
                  <Briefcase className="text-info w-5 h-5" />
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
        <div className="col-md-6 col-lg-3">
          <ScrollReveal delay={0.4} className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <small className="text-muted text-uppercase fw-bold">Avg Attendance</small>
                  <h4 className="fw-bold text-dark my-1">
                    {Math.round(
                      employees.reduce((sum, e) => sum + e.attendance, 0) / (employees.length || 1)
                    )}
                    %
                  </h4>
                </div>
                <div className="bg-warning-subtle p-2 rounded">
                  <Calendar className="text-warning w-5 h-5" />
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Filters */}
      <ScrollReveal delay={0.2} className="card border-0 shadow-sm mb-4">
        <div className="card-body py-2">
          <div className="row g-2">
            <div className="col-md-8 position-relative">
              <Search className="position-absolute top-50 translate-middle-y text-muted" style={{ left: '0', width: '20px', height: '20px' }} />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control form-control-sm border-0 border-bottom border-2 rounded-0 bg-transparent ps-4 focus:ring-0"
                style={{ paddingLeft: '3rem', borderColor: '#9ca3af', outline: 'none', boxShadow: 'none' }}
                onFocus={(e) => e.target.style.borderColor = '#f97316'}
                onBlur={(e) => e.target.style.borderColor = '#9ca3af'}
              />
            </div>
            <div className="col-md-4 d-flex gap-2">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <Filter className="w-4 h-4 text-muted" />
                </span>
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="form-select form-select-sm border-start-0"
                >
                  <option value="all">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Employees Table */}
      <ScrollReveal delay={0.3} className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="border-0 text-muted small text-uppercase fw-bold ps-4">
                    Employee
                  </th>
                  <th className="border-0 text-muted small text-uppercase fw-bold">
                    Contact
                  </th>
                  <th className="border-0 text-muted small text-uppercase fw-bold">
                    Department
                  </th>
                  <th className="border-0 text-muted small text-uppercase fw-bold">
                    Position
                  </th>
                  <th className="border-0 text-muted small text-uppercase fw-bold">
                    Salary
                  </th>
                  <th className="border-0 text-muted small text-uppercase fw-bold">
                    Attendance
                  </th>
                  <th className="border-0 text-muted small text-uppercase fw-bold">
                    Status
                  </th>
                  <th className="border-0 text-muted small text-uppercase fw-bold pe-4 text-end">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => {
                  const attendanceStatus = getAttendanceStatus(employee.attendance);
                  return (
                    <tr key={employee.id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded-circle bg-warning-subtle text-warning d-flex align-items-center justify-content-center fw-bold small" style={{ width: '32px', height: '32px' }}>
                            {employee.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <div className="small fw-medium text-dark">{employee.name}</div>
                            <div className="text-muted" style={{ fontSize: '10px' }}>{employee.employeeId}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex flex-column gap-1">
                          <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '10px' }}>
                            <Mail className="w-3 h-3" />
                            <span>{employee.email}</span>
                          </div>
                          <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '10px' }}>
                            <Phone className="w-3 h-3" />
                            <span>{employee.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${getDepartmentColor(
                            employee.department
                          )}`}
                        >
                          {employee.department}
                        </span>
                      </td>
                      <td>
                        <span className="small text-dark">{employee.position}</span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <DollarSign className="w-3 h-3 text-muted" />
                          <span className="small fw-medium text-dark">
                            {formatSalary(employee.baseSalary, employee.salaryType)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <attendanceStatus.icon
                            className={`w-4 h-4 ${attendanceStatus.color}`}
                          />
                          <span className="small text-dark">{employee.attendance}%</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${employee.status === "active"
                            ? "bg-success-subtle text-success"
                            : "bg-secondary-subtle text-secondary"
                            }`}
                        >
                          {employee.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="pe-4 text-end text-nowrap">
                        <div className="d-flex align-items-center justify-content-end gap-1">
                          <button
                            onClick={() => setSelectedEmployee(employee)}
                            className="btn btn-link text-primary p-1"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          {isAdminOrManager && (
                            <>
                              <button
                                onClick={() => setEditingEmployee(employee)}
                                className="btn btn-link text-warning p-1"
                                title="Edit Employee"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm(`Are you sure you want to delete employee ${employee.name}?`)) {
                                    try {
                                      await fetchApi(`/employees/${employee.id}`, { method: 'DELETE' });
                                      setRefreshKey(prev => prev + 1);
                                    } catch (err) {
                                      console.error("Delete failed", err);
                                      alert("Failed to delete employee");
                                    }
                                  }
                                }}
                                className="btn btn-link text-danger p-1"
                                title="Delete Employee"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollReveal>

      {employees.length === 0 && !loading && (
        <ScrollReveal delay={0.4} className="text-center py-5">
          <Users className="text-muted w-12 h-12 mx-auto mb-3" size={48} />
          <p className="text-muted">No employees found matching your criteria.</p>
        </ScrollReveal>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <ScrollReveal delay={0.5} className="py-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className={currentPage === 1 ? "disabled opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={currentPage === page}
                    onClick={() => setCurrentPage(page)}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className={currentPage === totalPages ? "disabled opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </ScrollReveal>
      )}

      {/* Add/Edit Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddModalOpen || !!editingEmployee}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingEmployee(null);
        }}
        initialData={editingEmployee}
        onSuccess={() => setRefreshKey(prev => prev + 1)}
      />

      {/* Employee Details Modal */}
      <Modal isOpen={!!selectedEmployee} onClose={() => setSelectedEmployee(null)} title="Employee Full Profile" size="md" draggable={true}>
        {selectedEmployee && (
          <div className="row g-4">
            <div className="col-md-4 text-center border-end">
              <div className="rounded-circle bg-warning-subtle text-warning d-flex align-items-center justify-content-center fw-bold mx-auto mb-3" style={{ width: '120px', height: '120px', fontSize: '40px' }}>
                {selectedEmployee.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <h4 className="fw-bold mb-1 text-dark">{selectedEmployee.name}</h4>
              <p className="text-muted small">{selectedEmployee.employeeId}</p>
              <span className={`badge ${selectedEmployee.status === 'active' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                {selectedEmployee.status.toUpperCase()}
              </span>
            </div>
            <div className="col-md-8">
              <div className="row g-3">
                <div className="col-sm-6 text-start">
                  <label className="text-muted small d-block mb-1">Department</label>
                  <span className="fw-medium text-dark">{selectedEmployee.department}</span>
                </div>
                <div className="col-sm-6 text-start">
                  <label className="text-muted small d-block mb-1">Position</label>
                  <span className="fw-medium text-dark">{selectedEmployee.position}</span>
                </div>
                <div className="col-sm-6 text-start">
                  <label className="text-muted small d-block mb-1">Email</label>
                  <span className="fw-medium text-dark">{selectedEmployee.email}</span>
                </div>
                <div className="col-sm-6 text-start">
                  <label className="text-muted small d-block mb-1">Phone</label>
                  <span className="fw-medium text-dark">{selectedEmployee.phone}</span>
                </div>
                <div className="col-sm-6 text-start">
                  <label className="text-muted small d-block mb-1">Hire Date</label>
                  <span className="fw-medium text-dark">{selectedEmployee.hireDate}</span>
                </div>
                <div className="col-sm-6 text-start">
                  <label className="text-muted small d-block mb-1">Salary</label>
                  <span className="fw-medium text-success">{formatSalary(selectedEmployee.baseSalary, selectedEmployee.salaryType)}</span>
                </div>
                <div className="col-12 text-start">
                  <label className="text-muted small d-block mb-2">Performance & Attendance</label>
                  <div className="p-3 bg-light dark:bg-gray-800 rounded-3 d-flex align-items-center gap-4">
                    <div>
                      <div className="h3 fw-bold mb-0 text-dark dark:text-gray-100">{selectedEmployee.attendance}%</div>
                      <div className="small text-muted">Attendance Record</div>
                    </div>
                    <div className="vr h-100 mx-2"></div>
                    <div>
                      <div className={`h6 fw-bold mb-0 ${getAttendanceStatus(selectedEmployee.attendance).color}`}>
                        {getAttendanceStatus(selectedEmployee.attendance).label}
                      </div>
                      <div className="small text-muted">Status</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 d-flex justify-content-end gap-2 pt-3 border-top">
              <button type="button" className="btn btn-light btn-sm" onClick={() => setSelectedEmployee(null)}>Close</button>
              {isAdminOrManager && (
                <button onClick={() => { setEditingEmployee(selectedEmployee); setSelectedEmployee(null); }} className="btn btn-warning btn-sm">Edit Profile</button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}