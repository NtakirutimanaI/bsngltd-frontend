import { useState, useEffect } from "react";
import {
  DollarSign,
  Search,
  Filter,
  Plus,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { AddPaymentModal } from "@/app/components/AddPaymentModal";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { fetchApi } from '../api/client';
import { PaginationSelector } from "@/app/components/ui/pagination-selector";
import { useAuth } from "@/app/context/AuthContext";
import { useDebounce } from "@/app/hooks/useDebounce";

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  lastPage: number;
}

interface Payment {
  id: string;
  code: string;
  amount: number;
  type: string;
  status: string;
  method: string;
  date: string;
  description: string;
  payer?: string;
  payee?: string;
}

export function Payments() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const roleName = ((typeof user?.role === 'object' && user.role !== null) ? user.role.name : user?.role || 'guest').toLowerCase();
  const isEmployee = roleName === 'employee';
  const isContractor = roleName === 'contractor';
  const isAdminOrManager = ['super_admin', 'admin', 'manager'].includes(roleName);

  const pageTitle = isEmployee ? 'My Salary History' : (isContractor ? 'My Invoices & Payments' : 'Payments');
  const pageSubtitle = isEmployee ? 'View your recent salary payments' : (isContractor ? 'Track your submitted invoices and payment status' : 'Track all financial transactions');

  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams({
      page: currentPage.toString(),
      limit: pageSize.toString(),
      search: debouncedSearchTerm,
      type: filterType,
      status: filterStatus
    }).toString();

    fetchApi<PaginatedResponse<Payment>>(`/payments?${query}`)
      .then(res => {
        setPayments(res.data || []);
        setTotalPages(res.lastPage || 1);
        setTotalItems(res.total || 0);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch payments", err);
        setLoading(false);
      });
  }, [currentPage, pageSize, debouncedSearchTerm, filterType, filterStatus, refreshKey]);

  useEffect(() => {
    if (isEmployee) {
      setFilterType('salary');
    } else if (isContractor) {
      setFilterType('contractor');
    }
  }, [isEmployee, isContractor]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "client_payment":
        return "bg-success-subtle text-success";
      case "salary":
        return "bg-primary-subtle text-primary";
      case "contractor":
        return "bg-info-subtle text-info";
      case "supplier":
        return "bg-warning-subtle text-warning";
      case "expense":
        return "bg-secondary-subtle text-secondary";
      default:
        return "bg-light text-dark";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="text-success w-4 h-4" />;
      case "processing":
        return <Clock className="text-primary w-4 h-4" />;
      case "pending":
        return <Clock className="text-warning w-4 h-4" />;
      case "failed":
        return <XCircle className="text-danger w-4 h-4" />;
      default:
        return null;
    }
  };

  const getPaymentIcon = (type: string) => {
    return type === "client_payment" ? (
      <ArrowDownLeft className="text-success w-4 h-4" />
    ) : (
      <ArrowUpRight className="text-danger w-4 h-4" />
    );
  };

  const formatAmount = (amount: number) => {
    return `RWF ${(amount / 1000000).toFixed(2)}M`;
  };

  const monthlyData = [
    { month: "Jan", income: 45, expenses: 28 },
    { month: "Feb", income: 52, expenses: 32 },
    { month: "Mar", income: 48, expenses: 30 },
    { month: "Apr", income: 58, expenses: 35 },
    { month: "May", income: 55, expenses: 33 },
    { month: "Jun", income: 62, expenses: 38 },
  ];


  const totalIncome = payments
    .filter((p) => p.type === "client_payment" && p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalExpenses = payments
    .filter(
      (p) =>
        (p.type === "salary" ||
          p.type === "contractor" ||
          p.type === "supplier" ||
          p.type === "expense") &&
        p.status === "completed"
    )
    .reduce((sum, p) => sum + p.amount, 0);

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
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 dark:shadow-none transition-all hover:scale-105 active:scale-95 d-flex align-items-center gap-2 border-0"
          >
            <Plus className="w-5 h-5" />
            New Payment
          </button>
        )}
      </ScrollReveal>

      {/* Stats Cards - Hidden for employees and contractors */}
      {isAdminOrManager && (
        <div className="row g-4 mb-4">
          <div className="col-md-6 col-lg-3">
            <ScrollReveal delay={0.1} className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <small className="text-muted text-uppercase fw-bold">Total Income</small>
                    <h4 className="fw-bold text-dark my-1">
                      {formatAmount(totalIncome)}
                    </h4>
                    <div className="d-flex align-items-center gap-1">
                      <TrendingUp className="text-success w-3 h-3" />
                      <span className="text-success small fw-medium">+12%</span>
                    </div>
                  </div>
                  <div className="bg-success-subtle p-2 rounded">
                    <ArrowDownLeft className="text-success w-5 h-5" />
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
                    <small className="text-muted text-uppercase fw-bold">Total Expenses</small>
                    <h4 className="fw-bold text-dark my-1">
                      {formatAmount(totalExpenses)}
                    </h4>
                    <div className="d-flex align-items-center gap-1">
                      <TrendingDown className="text-danger w-3 h-3" />
                      <span className="text-danger small fw-medium">+8%</span>
                    </div>
                  </div>
                  <div className="bg-danger-subtle p-2 rounded">
                    <ArrowUpRight className="text-danger w-5 h-5" />
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
                    <small className="text-muted text-uppercase fw-bold">Net Profit</small>
                    <h4 className="fw-bold text-dark my-1">
                      {formatAmount(totalIncome - totalExpenses)}
                    </h4>
                    <div className="d-flex align-items-center gap-1">
                      <TrendingUp className="text-primary w-3 h-3" />
                      <span className="text-primary small fw-medium">+15%</span>
                    </div>
                  </div>
                  <div className="bg-primary-subtle p-2 rounded">
                    <DollarSign className="text-primary w-5 h-5" />
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
                    <small className="text-muted text-uppercase fw-bold">Pending</small>
                    <h4 className="fw-bold text-dark my-1">
                      {payments.filter((p) => p.status === "pending" || p.status === "processing").length}
                    </h4>
                    <div className="d-flex align-items-center gap-1">
                      <Clock className="text-warning w-3 h-3" />
                      <span className="text-warning small fw-medium">Processing</span>
                    </div>
                  </div>
                  <div className="bg-warning-subtle p-2 rounded">
                    <Clock className="text-warning w-5 h-5" />
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      )}

      {/* Chart - Hidden for non-admins */}
      {isAdminOrManager && (
        <ScrollReveal delay={0.5} className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title fw-bold mb-4">Monthly Financial Overview</h5>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                  <XAxis dataKey="month" stroke="#6c757d" />
                  <YAxis stroke="#6c757d" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #dee2e6",
                      borderRadius: "0.375rem",
                      boxShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)"
                    }}
                  />
                  <Legend />
                  <Bar dataKey="income" fill="#198754" name="Income (M)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="#dc3545" name="Expenses (M)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Filters */}
      <ScrollReveal delay={0.6} className="card border-0 shadow-sm mb-4">
        <div className="card-body py-2">
          <div className="row g-2">
            <div className="col-md-6 col-lg-8 position-relative">
              <Search className="position-absolute top-50 translate-middle-y text-muted" style={{ right: '0', width: '20px', height: '20px' }} />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control form-control-sm border-0 border-bottom border-2 rounded-0 bg-transparent ps-4 focus:ring-0"
                style={{ paddingLeft: '3rem', borderColor: '#9ca3af', outline: 'none', boxShadow: 'none' }}
                onFocus={(e) => e.target.style.borderColor = '#16a085'}
                onBlur={(e) => e.target.style.borderColor = '#9ca3af'}
              />
            </div>
            <div className="col-md-6 col-lg-4 d-flex gap-2">
              {isAdminOrManager && (
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <Filter className="w-4 h-4 text-muted" />
                  </span>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="form-select form-select-sm border-start-0"
                  >
                    <option value="all">All Types</option>
                    <option value="client_payment">Client Payment</option>
                    <option value="salary">Salary</option>
                    <option value="contractor">Contractor</option>
                    <option value="supplier">Supplier</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
              )}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="form-select form-select-sm"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Payments List */}
      <ScrollReveal delay={0.7} className="card border-0 shadow-sm mb-4">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="border-0 text-muted small text-uppercase fw-bold ps-4">
                    Payment
                  </th>
                  <th className="border-0 text-muted small text-uppercase fw-bold">Type</th>
                  <th className="border-0 text-muted small text-uppercase fw-bold">
                    Amount
                  </th>
                  <th className="border-0 text-muted small text-uppercase fw-bold">
                    Method
                  </th>
                  <th className="border-0 text-muted small text-uppercase fw-bold">Date</th>
                  <th className="border-0 text-muted small text-uppercase fw-bold pe-4">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-start gap-3">
                        <div className="mt-1">{getPaymentIcon(payment.type)}</div>
                        <div>
                          <div className="fw-medium text-dark">{payment.code}</div>
                          <div className="small text-muted">{payment.description}</div>
                          {isEmployee ? (
                            <div className="small text-primary mt-1 fst-italic">
                              Paid to: Momo (+250 788 *** 456)
                            </div>
                          ) : (
                            <div className="small text-muted mt-1">
                              {payment.payer} → {payment.payee}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${getTypeColor(
                          payment.type
                        )}`}
                      >
                        {payment.type.replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className="fw-bold text-dark">
                        {formatAmount(payment.amount)}
                      </span>
                    </td>
                    <td>
                      <span className="small text-muted text-capitalize">
                        {payment.method.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <span className="small text-muted">{payment.date}</span>
                    </td>
                    <td className="pe-4">
                      <div className="d-flex align-items-center gap-2">
                        {getStatusIcon(payment.status)}
                        <span className="small text-muted text-capitalize">{payment.status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollReveal>

      {payments.length === 0 && !loading && (
        <ScrollReveal delay={0.8} className="text-center py-5">
          <DollarSign className="text-muted w-12 h-12 mx-auto mb-3" size={48} />
          <p className="text-muted">No payments found matching your criteria.</p>
        </ScrollReveal>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <ScrollReveal delay={0.9} className="py-4">
          <PaginationSelector
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1); // Reset to first page when changing page size
            }}
          />
        </ScrollReveal>
      )}

      {/* Add Payment Modal */}
      <AddPaymentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => setRefreshKey(prev => prev + 1)}
      />
    </div>
  );
}