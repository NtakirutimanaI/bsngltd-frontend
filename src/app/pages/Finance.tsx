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
    const roleName = ((typeof user?.role === 'object' && user.role !== null) ? user.role.name : user?.role || 'guest').toLowerCase();
    const isAdminOrManager = ['super_admin', 'admin', 'manager'].includes(roleName);

    // Hub State
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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
    }, [activeTab, filterStatus, selectedMonth, selectedYear]);

    const loadTransactions = async () => {
        setIsLoading(true);
        try {
            const query = new URLSearchParams({
                search: searchTerm,
                status: filterStatus,
                limit: '100'
            }).toString();
            const res = await fetchApi<any>(`/payments?${query}`);
            setTransactions(res.data || []);
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
        <div className="container-fluid p-4">
            {/* Loading Overlay */}
            {isLoading && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white/50 z-50">
                    <div className="spinner-border text-emerald-600" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <ScrollReveal className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4 mb-4">
                <div>
                    <h1 className="h3 fw-bold text-dark">Finance Hub</h1>
                    <p className="text-muted mt-1">Unified view of all company transactions and payroll history</p>
                </div>
                <div className="d-flex gap-2">
                    {activeTab === 'ledger' && isAdminOrManager && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="btn px-4 py-2 text-white border-0 shadow-lg d-flex align-items-center gap-2"
                            style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', borderRadius: '12px', fontWeight: '600' }}
                        >
                            <Plus size={18} /> New Transaction
                        </button>
                    )}
                    <button className="btn btn-outline-secondary px-3" style={{ borderRadius: '12px' }}>
                        <Download size={18} /> Export
                    </button>
                </div>
            </ScrollReveal>

            {/* Quick Stats */}
            <div className="row g-4 mb-4">
                <div className="col-md-4">
                    <ScrollReveal delay={0.1}>
                        <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: '16px' }}>
                            <div className="card-body position-relative">
                                <div className="text-muted small fw-bold text-uppercase mb-1">Total Cash In</div>
                                <h3 className="fw-bold text-success mb-0">{formatAmount(totalIncome)}</h3>
                                <div className="position-absolute end-0 top-50 translate-middle-y me-3 opacity-10">
                                    <TrendingUp size={48} className="text-success" />
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
                <div className="col-md-4">
                    <ScrollReveal delay={0.2}>
                        <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: '16px' }}>
                            <div className="card-body position-relative">
                                <div className="text-muted small fw-bold text-uppercase mb-1">Total Cash Out</div>
                                <h3 className="fw-bold text-danger mb-0">{formatAmount(totalExpenses)}</h3>
                                <div className="position-absolute end-0 top-50 translate-middle-y me-3 opacity-10">
                                    <TrendingDown size={48} className="text-danger" />
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
                <div className="col-md-4">
                    <ScrollReveal delay={0.3}>
                        <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: '16px' }}>
                            <div className="card-body position-relative">
                                <div className="text-muted small fw-bold text-uppercase mb-1">Net Balance</div>
                                <h3 className={`fw-bold mb-0 ${totalIncome - totalExpenses >= 0 ? 'text-primary' : 'text-danger'}`}>
                                    {formatAmount(totalIncome - totalExpenses)}
                                </h3>
                                <div className="position-absolute end-0 top-50 translate-middle-y me-3 opacity-10">
                                    <DollarSign size={48} className="text-primary" />
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </div>

            {/* Hub Tabs */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <div className="card-header bg-white border-0 p-0">
                    <div className="nav nav-pills p-2 gap-2">
                        <button
                            onClick={() => setActiveTab('ledger')}
                            className={`nav-link flex-fill d-flex align-items-center justify-content-center gap-2 py-3 transition-all ${activeTab === 'ledger' ? 'bg-emerald-600 text-white shadow-md' : 'text-muted hover:bg-light'}`}
                            style={{ borderRadius: '12px', border: 'none' }}
                        >
                            <Receipt size={20} /> General Ledger
                        </button>
                        <button
                            onClick={() => setActiveTab('payroll_history')}
                            className={`nav-link flex-fill d-flex align-items-center justify-content-center gap-2 py-3 transition-all ${activeTab === 'payroll_history' ? 'bg-emerald-600 text-white shadow-md' : 'text-muted hover:bg-light'}`}
                            style={{ borderRadius: '12px', border: 'none' }}
                        >
                            <History size={20} /> Payroll History
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <ScrollReveal className="mb-4">
                <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                    <div className="card-body py-3">
                        <div className="row g-3 align-items-center">
                            <div className="col-md-4">
                                <div className="position-relative">
                                    <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                                    <input
                                        type="text"
                                        className="form-control form-control-sm ps-5 bg-light border-0 py-2"
                                        placeholder="Search transactions..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ borderRadius: '10px' }}
                                    />
                                </div>
                            </div>
                            <div className="col-md-8 d-flex justify-content-md-end gap-2">
                                {activeTab === 'payroll_history' && (
                                    <>
                                        <select className="form-select form-select-sm border-0 bg-light w-auto" value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} style={{ borderRadius: '10px' }}>
                                            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                                        </select>
                                        <select className="form-select form-select-sm border-0 bg-light w-auto" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} style={{ borderRadius: '10px' }}>
                                            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </>
                                )}
                                <select className="form-select form-select-sm border-0 bg-light w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ borderRadius: '10px' }}>
                                    <option value="all">All Status</option>
                                    <option value="completed">Completed</option>
                                    <option value="pending">Pending</option>
                                </select>
                                <button className="btn btn-light btn-sm p-2" style={{ borderRadius: '10px' }}>
                                    <Filter size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollReveal>

            {/* Content Table */}
            <ScrollReveal delay={0.4}>
                <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light">
                                <tr className="text-muted small text-uppercase">
                                    <th className="ps-4">Reference</th>
                                    <th>{activeTab === 'ledger' ? 'Description' : 'Employee'}</th>
                                    <th>Type / Period</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th className="pe-4 text-end">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeTab === 'ledger' ? (
                                    transactions.map(t => (
                                        <tr key={t.id}>
                                            <td className="ps-4 py-3">
                                                <div className="d-flex align-items-center gap-2">
                                                    {t.type === 'client_payment' ? <ArrowDownLeft className="text-success" size={16} /> : <ArrowUpRight className="text-danger" size={16} />}
                                                    <span className="fw-bold text-dark">{t.code}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="text-dark small fw-medium">{t.description}</div>
                                                <div className="smaller text-muted">{t.payer} → {t.payee}</div>
                                            </td>
                                            <td><span className={`badge px-2 py-1 ${getTypeColor(t.type)}`}>{t.type.replace('_', ' ').toUpperCase()}</span></td>
                                            <td className="fw-bold">{formatAmount(t.amount)}</td>
                                            <td className="text-muted small text-capitalize">{t.method.replace('_', ' ')}</td>
                                            <td className="pe-4 text-end">
                                                <span className={`badge rounded-pill px-3 py-1 ${t.status === 'completed' ? 'bg-success text-white' : 'bg-warning text-dark'}`}>
                                                    {t.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    salaryHistory.map(h => (
                                        <tr key={h.id}>
                                            <td className="ps-4 py-3">
                                                <div className="d-flex align-items-center gap-2">
                                                    <CreditCard className="text-primary" size={16} />
                                                    <span className="fw-bold text-dark">{h.transactionId || 'SAL-REF'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="text-dark small fw-bold">{h.employee?.name}</div>
                                                <div className="smaller text-muted">ID: {h.employee?.employeeId}</div>
                                            </td>
                                            <td><span className="badge bg-light text-dark">{MONTHS[h.salaryMonth - 1]} {h.salaryYear}</span></td>
                                            <td className="fw-bold text-primary">{formatAmount(h.amount)}</td>
                                            <td className="text-muted small text-capitalize">{h.paymentMethod?.replace('_', ' ')}</td>
                                            <td className="pe-4 text-end">
                                                <span className="badge bg-success-subtle text-success px-3 py-1 rounded-pill">Paid</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                {(activeTab === 'ledger' ? transactions.length : salaryHistory.length) === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-5 text-muted">
                                            <Receipt size={40} className="mb-3 opacity-25" />
                                            <div>No records found for the selected criteria</div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </ScrollReveal>

            {/* Modals */}
            <AddPaymentModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => loadTransactions()}
            />
        </div>
    );
}
