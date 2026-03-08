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
    Receipt,
    History,
    Download,
    CreditCard
} from "lucide-react";
import { AddPaymentModal } from "@/app/components/AddPaymentModal";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { PaginationSelector } from "@/app/components/ui/pagination-selector";
import { fetchApi } from '../api/client';
import { useAuth } from "@/app/context/AuthContext";
import { useCurrency } from "@/app/context/CurrencyContext";
import { toast } from "sonner";

// Types
interface Transaction {
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

interface SalaryHistoryRecord {
    id: string;
    employeeId: string;
    employee?: { name: string; employeeId: string };
    amount: number;
    paymentMethod: string;
    transactionId: string;
    status: string;
    salaryMonth: number;
    salaryYear: number;
    createdAt: string;
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export function Finance() {
    const { user } = useAuth();
    const { currency } = useCurrency();
    const [activeTab, setActiveTab] = useState<'ledger' | 'payroll_history'>('ledger');

    // Auth
    const roleName = ((typeof user?.role === 'object' && user.role !== null) ? user.role.name : user?.role || 'guest').toLowerCase().replace(/\s+/g, '_');
    const isAdminOrManager = ['super_admin', 'admin', 'manager', 'site_manager'].includes(roleName);

    // Hub State
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Ledger State
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState("all");

    // Salary History State
    const [salaryHistory, setSalaryHistory] = useState<SalaryHistoryRecord[]>([]);

    useEffect(() => {
        if (activeTab === 'ledger') {
            loadTransactions();
        } else {
            loadSalaryHistory();
        }
    }, [activeTab, filterStatus, selectedMonth, selectedYear, currentPage, pageSize]);

    const loadTransactions = async () => {
        setIsLoading(true);
        try {
            const query = new URLSearchParams({
                search: searchTerm,
                status: filterStatus,
                page: currentPage.toString(),
                limit: pageSize.toString()
            }).toString();
            const res = await fetchApi<any>(`/payments?${query}`);
            setTransactions(res.data || []);
            setTotalPages(res.lastPage || 1);
            setTotalItems(res.total || 0);
        } catch (err) {
            toast.error("Failed to load transactions");
        } finally {
            setIsLoading(false);
        }
    };

    const loadSalaryHistory = async () => {
        setIsLoading(true);
        try {
            const res = await fetchApi<any>(`/employees/salary/history?month=${selectedMonth}&year=${selectedYear}&status=${filterStatus}`);
            setSalaryHistory(res.data || []);
        } catch (err) {
            toast.error("Failed to load salary history");
        } finally {
            setIsLoading(false);
        }
    };

    const formatAmount = (amount: number) => {
        let finalAmount = amount;
        let label = 'RWF';
        if (currency === 'USD') {
            finalAmount = amount / 1300;
            label = 'USD';
        }
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: label,
            maximumFractionDigits: 0
        }).format(finalAmount);
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "client_payment": return "bg-success-subtle text-success";
            case "salary": return "bg-primary-subtle text-primary";
            case "contractor": return "bg-info-subtle text-info";
            case "supplier": return "bg-warning-subtle text-warning";
            case "expense": return "bg-secondary-subtle text-secondary";
            default: return "bg-light text-dark";
        }
    };

    const totalIncome = transactions
        .filter(t => t.type === 'client_payment' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter(t => t.type !== 'client_payment' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="container-fluid px-2 px-md-4 pt-1 pb-2">
            {/* Loading Overlay */}
            {isLoading && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white/50 z-50">
                    <div className="spinner-border text-emerald-600" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <ScrollReveal className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-2 px-2 px-md-4 pt-1">
                <div>
                    <h1 className="h5 fw-bold text-dark mb-0">Finance Hub</h1>
                    <p className="text-muted mb-0" style={{ fontSize: '12px' }}>Unified view of all company transactions and payroll history</p>
                </div>
                <div className="d-flex gap-2">
                    {activeTab === 'ledger' && isAdminOrManager && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-emerald-200 dark:shadow-none transition-all hover:scale-105 active:scale-95 d-flex align-items-center gap-2 border-0"
                        >
                            <Plus size={14} /> <span>New Transaction</span>
                        </button>
                    )}
                    <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 hover:text-emerald-600 hover:border-emerald-600 transition-all hover:scale-110 active:scale-95 bg-white dark:bg-gray-800">
                        <Download size={16} />
                    </button>
                </div>
            </ScrollReveal>

            {/* Quick Stats */}
            <div className="row g-2 mb-2 mx-2 mx-md-4">
                <div className="col-md-4">
                    <ScrollReveal delay={0.1}>
                        <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: '12px' }}>
                            <div className="card-body position-relative py-2">
                                <div className="text-muted small fw-bold text-uppercase mb-1" style={{ fontSize: '10px' }}>Total Cash In</div>
                                <h4 className="fw-bold text-success mb-0" style={{ fontSize: '16px' }}>{formatAmount(totalIncome)}</h4>
                                <div className="position-absolute end-0 top-50 translate-middle-y me-2 opacity-10">
                                    <TrendingUp size={32} className="text-success" />
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
                <div className="col-md-4">
                    <ScrollReveal delay={0.2}>
                        <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: '12px' }}>
                            <div className="card-body position-relative py-2">
                                <div className="text-muted small fw-bold text-uppercase mb-1" style={{ fontSize: '10px' }}>Total Cash Out</div>
                                <h4 className="fw-bold text-danger mb-0" style={{ fontSize: '16px' }}>{formatAmount(totalExpenses)}</h4>
                                <div className="position-absolute end-0 top-50 translate-middle-y me-2 opacity-10">
                                    <TrendingDown size={32} className="text-danger" />
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
                <div className="col-md-4">
                    <ScrollReveal delay={0.3}>
                        <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: '12px' }}>
                            <div className="card-body position-relative py-2">
                                <div className="text-muted small fw-bold text-uppercase mb-1" style={{ fontSize: '10px' }}>Net Balance</div>
                                <h4 className={`fw-bold mb-0 ${totalIncome - totalExpenses >= 0 ? 'text-primary' : 'text-danger'}`} style={{ fontSize: '16px' }}>
                                    {formatAmount(totalIncome - totalExpenses)}
                                </h4>
                                <div className="position-absolute end-0 top-50 translate-middle-y me-2 opacity-10">
                                    <DollarSign size={32} className="text-primary" />
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </div>

            {/* Hub Tabs */}
            <div className="card border-0 shadow-sm mb-2 mx-2 mx-md-4" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                <div className="card-header bg-white border-0 p-0">
                    <div className="nav nav-pills p-1.5 gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-2xl mx-1 my-1">
                        <button
                            onClick={() => setActiveTab('ledger')}
                            className={`nav-link flex-fill d-flex align-items-center justify-content-center gap-2 py-2.5 transition-all ${activeTab === 'ledger' ? 'text-white shadow-lg scale-100' : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'}`}
                            style={{
                                borderRadius: '14px',
                                border: 'none',
                                background: activeTab === 'ledger' ? 'linear-gradient(135deg, #16a085 0%, #1abc9c 100%)' : 'transparent',
                                fontWeight: 700,
                                fontSize: '12px',
                                letterSpacing: '0.5px'
                            }}
                        >
                            <Receipt size={16} /> General Ledger
                        </button>
                        <button
                            onClick={() => setActiveTab('payroll_history')}
                            className={`nav-link flex-fill d-flex align-items-center justify-content-center gap-2 py-2.5 transition-all ${activeTab === 'payroll_history' ? 'text-white shadow-lg scale-100' : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'}`}
                            style={{
                                borderRadius: '14px',
                                border: 'none',
                                background: activeTab === 'payroll_history' ? 'linear-gradient(135deg, #16a085 0%, #1abc9c 100%)' : 'transparent',
                                fontWeight: 700,
                                fontSize: '12px',
                                letterSpacing: '0.5px'
                            }}
                        >
                            <History size={16} /> Payroll History
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <ScrollReveal className="mb-2">
                <div className="card border-0 shadow-sm mx-2 mx-md-4" style={{ borderRadius: '12px' }}>
                    <div className="card-body py-2">
                        <div className="row g-2 align-items-center">
                            <div className="col-md-4">
                                <div className="position-relative">
                                    <Search className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted" size={14} />
                                    <input
                                        type="text"
                                        className="form-control form-control-sm ps-3 pe-5 bg-light border-0"
                                        placeholder="Search transactions..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ borderRadius: '8px', fontSize: '12px' }}
                                    />
                                </div>
                            </div>
                            <div className="col-md-8 d-flex justify-content-md-end gap-2">
                                {activeTab === 'payroll_history' && (
                                    <>
                                        <select className="form-select form-select-sm border-0 bg-light w-auto" value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} style={{ borderRadius: '8px', fontSize: '12px' }}>
                                            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                                        </select>
                                        <select className="form-select form-select-sm border-0 bg-light w-auto" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} style={{ borderRadius: '8px', fontSize: '12px' }}>
                                            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </>
                                )}
                                <select className="form-select form-select-sm border-0 bg-light w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ borderRadius: '8px', fontSize: '12px' }}>
                                    <option value="all">All Status</option>
                                    <option value="completed">Completed</option>
                                    <option value="pending">Pending</option>
                                </select>
                                <button className="btn btn-light btn-sm p-1" style={{ borderRadius: '6px' }}>
                                    <Filter size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollReveal>

            {/* Content Table */}
            <ScrollReveal delay={0.4}>
                <div className="card border-0 shadow-sm mx-2 mx-md-4" style={{ borderRadius: '12px' }}>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0" style={{ fontSize: '12px' }}>
                            <thead className="bg-light">
                                <tr className="text-muted small text-uppercase">
                                    <th className="ps-4" style={{ fontSize: '11px', padding: '8px 16px' }}>Reference</th>
                                    <th style={{ fontSize: '11px', padding: '8px 16px' }}>{activeTab === 'ledger' ? 'Description' : 'Employee'}</th>
                                    <th style={{ fontSize: '11px', padding: '8px 16px' }}>Type / Period</th>
                                    <th style={{ fontSize: '11px', padding: '8px 16px' }}>Amount</th>
                                    <th style={{ fontSize: '11px', padding: '8px 16px' }}>Method</th>
                                    <th className="pe-4 text-end" style={{ fontSize: '11px', padding: '8px 16px' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeTab === 'ledger' ? (
                                    transactions.map(t => (
                                        <tr key={t.id}>
                                            <td className="ps-4 py-2">
                                                <div className="d-flex align-items-center gap-2">
                                                    {t.type === 'client_payment' ? <ArrowDownLeft className="text-success" size={12} /> : <ArrowUpRight className="text-danger" size={12} />}
                                                    <span className="fw-bold text-dark" style={{ fontSize: '12px' }}>{t.code}</span>
                                                </div>
                                            </td>
                                            <td className="py-2">
                                                <div className="text-dark small fw-medium" style={{ fontSize: '11px' }}>{t.description}</div>
                                                <div className="smaller text-muted" style={{ fontSize: '10px' }}>{t.payer} → {t.payee}</div>
                                            </td>
                                            <td className="py-2"><span className={`badge px-2 py-1 ${getTypeColor(t.type)}`} style={{ fontSize: '10px' }}>{t.type.replace('_', ' ').toUpperCase()}</span></td>
                                            <td className="fw-bold py-2" style={{ fontSize: '12px' }}>{formatAmount(t.amount)}</td>
                                            <td className="text-muted small text-capitalize py-2" style={{ fontSize: '10px' }}>{t.method.replace('_', ' ')}</td>
                                            <td className="pe-4 text-end py-2">
                                                <span className={`badge rounded-pill px-2 py-1 ${t.status === 'completed' ? 'bg-success text-white' : 'bg-warning text-dark'}`} style={{ fontSize: '10px' }}>
                                                    {t.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    salaryHistory.map(h => (
                                        <tr key={h.id}>
                                            <td className="ps-4 py-2">
                                                <div className="d-flex align-items-center gap-2">
                                                    <CreditCard className="text-primary" size={12} />
                                                    <span className="fw-bold text-dark" style={{ fontSize: '12px' }}>{h.transactionId || 'SAL-REF'}</span>
                                                </div>
                                            </td>
                                            <td className="py-2">
                                                <div className="text-dark small fw-bold" style={{ fontSize: '11px' }}>{h.employee?.name}</div>
                                                <div className="smaller text-muted" style={{ fontSize: '10px' }}>ID: {h.employee?.employeeId}</div>
                                            </td>
                                            <td className="py-2"><span className="badge bg-light text-dark" style={{ fontSize: '10px' }}>{MONTHS[h.salaryMonth - 1]} {h.salaryYear}</span></td>
                                            <td className="fw-bold text-primary py-2" style={{ fontSize: '12px' }}>{formatAmount(h.amount)}</td>
                                            <td className="text-muted small text-capitalize py-2" style={{ fontSize: '10px' }}>{h.paymentMethod?.replace('_', ' ')}</td>
                                            <td className="pe-4 text-end py-2">
                                                <span className="badge bg-success-subtle text-success px-2 py-1 rounded-pill" style={{ fontSize: '10px' }}>Paid</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                {(activeTab === 'ledger' ? transactions.length : salaryHistory.length) === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-4 text-muted">
                                            <Receipt size={32} className="mb-2 opacity-25" />
                                            <div style={{ fontSize: '12px' }}>No records found for selected criteria</div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </ScrollReveal>

            {/* Pagination for Transactions */}
            {activeTab === 'ledger' && totalPages > 1 && (
                <div className="px-2 px-md-4 py-3">
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
                </div>
            )}

            {/* Modals */}
            <AddPaymentModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => loadTransactions()}
            />
        </div>
    );
}
