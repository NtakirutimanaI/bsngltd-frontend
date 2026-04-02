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
    CreditCard,
    MapPin
} from "lucide-react";
import { AddPaymentModal } from "@/app/components/AddPaymentModal";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { PaginationSelector } from "@/app/components/ui/pagination-selector";
import { fetchApi } from '../api/client';
import { useAuth } from "@/app/context/AuthContext";
import { useCurrency } from "@/app/context/CurrencyContext";
import { toast } from "sonner";
import { ExportReportModal } from "@/app/components/ExportReportModal";

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

import { useSearchParams } from "react-router";

export function Finance() {
    const { user } = useAuth();
    const { currency } = useCurrency();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = (searchParams.get('tab') as 'ledger' | 'payroll_history') || 'ledger';

    const setActiveTab = (tab: any) => {
        setSearchParams({ tab });
    };

    
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
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
            <ExportReportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} onExport={(format) => { toast.success(`Downloading ${format.toUpperCase()} report...`); }} />

            {/* Loading Overlay */}
            {isLoading && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white/50 z-50">
                    <div className="spinner-border text-blue-600" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <ScrollReveal className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-4 px-2 px-md-4 pt-1">
                <div>
                    <h1 className="h5 fw-bold text-dark mb-0">Finance Hub</h1>
                    <p className="text-muted mb-0" style={{ fontSize: '12px' }}>Unified view of all company transactions and payroll history</p>
                </div>
                <div className="d-flex gap-2">
                    {activeTab === 'ledger' && isAdminOrManager && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="btn btn-primary px-4 py-2 rounded-xl text-xs font-bold shadow-lg d-flex align-items-center gap-2 border-0"
                        >
                            <Plus size={14} /> <span>New Transaction</span>
                        </button>
                    )}
                    <button className="btn btn-light p-2 border rounded-xl text-gray-500 transition-all hover:scale-110 active:scale-95 bg-white shadow-sm" onClick={() => setIsExportModalOpen(true)}>
                        <Download size={16} />
                    </button>
                </div>
            </ScrollReveal>

            {/* Quick Stats */}
            <div className="row g-4 mb-4 mx-2 mx-md-4">
                <div className="col-sm-6 col-xl-4">
                    <ScrollReveal delay={0.1}>
                        <div className="bg-light rounded d-flex align-items-center justify-content-between p-4 shadow-sm border-0 border-bottom border-success border-3">
                            <TrendingUp size={32} strokeWidth={2.5} className="text-success" />
                            <div className="ms-3 text-end">
                                <p className="mb-1 text-muted small text-uppercase fw-bold opacity-75">Total Cash In</p>
                                <h4 className="mb-0 fw-bold text-dark">{formatAmount(totalIncome)}</h4>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
                <div className="col-sm-6 col-xl-4">
                    <ScrollReveal delay={0.2}>
                        <div className="bg-light rounded d-flex align-items-center justify-content-between p-4 shadow-sm border-0 border-bottom border-danger border-3">
                            <TrendingDown size={32} strokeWidth={2.5} className="text-danger" />
                            <div className="ms-3 text-end">
                                <p className="mb-1 text-muted small text-uppercase fw-bold opacity-75">Total Cash Out</p>
                                <h4 className="mb-0 fw-bold text-dark">{formatAmount(totalExpenses)}</h4>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
                <div className="col-sm-6 col-xl-4">
                    <ScrollReveal delay={0.3}>
                        <div className="bg-light rounded d-flex align-items-center justify-content-between p-4 shadow-sm border-0 border-bottom border-primary border-3">
                            <DollarSign size={32} strokeWidth={2.5} className="text-primary" />
                            <div className="ms-3 text-end">
                                <p className="mb-1 text-muted small text-uppercase fw-bold opacity-75">Net Balance</p>
                                <h4 className={`mb-0 fw-bold ${totalIncome - totalExpenses >= 0 ? 'text-dark' : 'text-danger'}`}>
                                    {formatAmount(totalIncome - totalExpenses)}
                                </h4>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </div>

            {/* Hub Tabs */}
            <div className="bg-light rounded mb-4 shadow-sm mx-2 mx-md-4 p-2">
                <div className="nav nav-pills p-1.5 gap-2 bg-white rounded-xl">
                    <button
                        onClick={() => setActiveTab('ledger')}
                        className={`nav-link flex-fill d-flex align-items-center justify-content-center gap-2 py-2.5 transition-all ${activeTab === 'ledger' ? 'active' : 'text-gray-500 hover:text-primary hover:bg-light'}`}
                        style={{
                            borderRadius: '10px',
                            fontWeight: 700,
                            fontSize: '12px',
                            letterSpacing: '0.5px'
                        }}
                    >
                        <Receipt size={16} /> General Ledger
                    </button>
                    <button
                        onClick={() => setActiveTab('payroll_history')}
                        className={`nav-link flex-fill d-flex align-items-center justify-content-center gap-2 py-2.5 transition-all ${activeTab === 'payroll_history' ? 'active' : 'text-gray-500 hover:text-primary hover:bg-light'}`}
                        style={{
                            borderRadius: '10px',
                            fontWeight: 700,
                            fontSize: '12px',
                            letterSpacing: '0.5px'
                        }}
                    >
                        <History size={16} /> Payroll History
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <ScrollReveal className="mb-4">
                <div className="bg-light rounded p-4 shadow-sm mx-2 mx-md-4 border">
                    <div className="row g-2 align-items-center">
                        <div className="col-md-4">
                            <div className="position-relative">
                                <Search className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted" size={14} />
                                <input
                                    type="text"
                                    className="form-control ps-3 pe-5 bg-white"
                                    placeholder="Search transactions..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ borderRadius: '5px', fontSize: '13px' }}
                                />
                            </div>
                        </div>
                        <div className="col-md-8 d-flex justify-content-md-end gap-2">
                            {activeTab === 'payroll_history' && (
                                <>
                                    <select className="form-select border-1 bg-white w-auto" value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} style={{ borderRadius: '5px', fontSize: '13px' }}>
                                        {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                                    </select>
                                    <select className="form-select border-1 bg-white w-auto" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} style={{ borderRadius: '5px', fontSize: '13px' }}>
                                        {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </>
                            )}
                            <select className="form-select border-1 bg-white w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ borderRadius: '5px', fontSize: '13px' }}>
                                <option value="all">All Status</option>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                            </select>
                            <button className="btn btn-primary d-flex align-items-center justify-content-center p-2" style={{ borderRadius: '5px' }}>
                                <Filter size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </ScrollReveal>

            {/* Content Table */}
            <ScrollReveal delay={0.4}>
                <div className="bg-light rounded p-4 shadow-sm mx-2 mx-md-4">
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <h6 className="mb-0 fw-bold">{activeTab === 'ledger' ? 'General Ledger' : 'Payroll History'}</h6>
                        <span className="text-muted small">Showing {activeTab === 'ledger' ? transactions.length : salaryHistory.length} records</span>
                    </div>
                    <div className="table-responsive">
                        <table className="table text-start align-middle table-bordered table-hover mb-0">
                            <thead className="bg-white">
                                <tr className="text-dark">
                                    <th className="ps-4">Reference</th>
                                    <th>{activeTab === 'ledger' ? 'Description' : 'Employee'}</th>
                                    <th>Site</th>
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
                                            <td className="py-2">
                                                <div className="d-flex align-items-center gap-1">
                                                    <MapPin size={10} className="text-muted" />
                                                    <span className="small text-muted" style={{ fontSize: '10px' }}>{(t as any).site?.name || 'General'}</span>
                                                </div>
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
