import { useState, useEffect } from "react";
import {
    DollarSign,
    Users,
    CheckCircle,
    XCircle,
    AlertCircle,
    Smartphone,
    Building2,
    Wifi,
    Send,
    Clock,
    RefreshCcw,
    Receipt,
    BadgeCheck,
    Banknote,
    CalendarDays,
    Loader2,
    Check,
    Search,
} from "lucide-react";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { Modal } from "@/app/components/Modal";
import { fetchApi } from '../api/client';
import { useAuth } from "@/app/context/AuthContext";
import { useCurrency } from "@/app/context/CurrencyContext";
import { toast } from "sonner";

interface Employee {
    id: string;
    employeeId: string;
    name: string;
    email: string;
    phone: string;
    department: string;
    position: string;
    salaryType: string;
    baseSalary: number;
    status: string;
}

interface PayrollItem {
    employee: Employee;
    daysAttended: number;
    totalHours: number;
    calculatedSalary: number;
    currency: string;
    isPaid: boolean;
    paymentId: string | null;
}

interface SalaryPaymentRecord {
    id: string;
    employeeId: string;
    employee?: Employee;
    amount: number;
    paymentMethod: string;
    recipientAccount: string;
    transactionId: string;
    status: string;
    salaryMonth: number;
    salaryYear: number;
    daysAttended: number;
    totalHours: number;
    description: string;
    createdAt: string;
}

type PaymentChannel = 'airtel_money' | 'mobile_money' | 'bank_transfer';

const PAYMENT_CHANNELS: { id: PaymentChannel; name: string; icon: any; color: string; bgColor: string; borderColor: string; description: string }[] = [
    {
        id: 'airtel_money',
        name: 'Airtel Money',
        icon: Smartphone,
        color: 'text-red-600',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        description: 'Pay via Airtel Money mobile wallet',
    },
    {
        id: 'mobile_money',
        name: 'MTN Mobile Money',
        icon: Wifi,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        description: 'Pay via MTN MoMo mobile wallet',
    },
    {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        icon: Building2,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
        description: 'Pay via bank wire transfer',
    },
];

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export function SalaryPayments() {
    const { user } = useAuth();
    const { currency } = useCurrency();
    const [activeTab, setActiveTab] = useState<'payroll' | 'pay' | 'history'>('payroll');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [payrollData, setPayrollData] = useState<PayrollItem[]>([]);
    const [salaryHistory, setSalaryHistory] = useState<SalaryPaymentRecord[]>([]);
    const [historyTotal, setHistoryTotal] = useState(0);
    const [historyPage,] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Payment modal
    const [showPayModal, setShowPayModal] = useState(false);
    const [payTarget, setPayTarget] = useState<PayrollItem | null>(null);
    const [selectedChannel, setSelectedChannel] = useState<PaymentChannel>('mobile_money');
    const [recipientAccount, setRecipientAccount] = useState('');
    const [isPaying, setIsPaying] = useState(false);
    const [paymentResult, setPaymentResult] = useState<any>(null);

    // Batch pay
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
    const [batchChannel, setBatchChannel] = useState<PaymentChannel>('mobile_money');
    const [isBatchPaying, setIsBatchPaying] = useState(false);
    const [batchResult, setBatchResult] = useState<any>(null);
    const [customAmounts, setCustomAmounts] = useState<Record<string, number>>({});

    // History filter
    const [historyStatusFilter, setHistoryStatusFilter] = useState('all');
    const [employeeSearch, setEmployeeSearch] = useState('');

    // Role-based access is handled by route guards; kept for potential future use
    const _roleName = ((typeof user?.role === 'object' && user.role !== null) ? user.role.name : user?.role || 'guest').toLowerCase();
    void _roleName;

    useEffect(() => {
        if (activeTab === 'payroll' || activeTab === 'pay') {
            loadPayrollData();
        }
    }, [selectedMonth, selectedYear, activeTab]);

    useEffect(() => {
        if (activeTab === 'history') {
            loadSalaryHistory();
        }
    }, [activeTab, historyPage, historyStatusFilter, selectedMonth, selectedYear]);

    const loadPayrollData = async () => {
        setIsLoading(true);
        try {
            const data = await fetchApi<PayrollItem[]>(`/employees/payroll/calculate?month=${selectedMonth}&year=${selectedYear}`);
            setPayrollData(data);

            // Initialize custom amounts
            const amounts: Record<string, number> = {};
            data.forEach(item => {
                amounts[item.employee.id] = item.calculatedSalary;
            });
            setCustomAmounts(amounts);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load payroll data");
        } finally {
            setIsLoading(false);
        }
    };

    const loadSalaryHistory = async () => {
        setIsLoading(true);
        try {
            const data = await fetchApi<any>(`/employees/salary/history?page=${historyPage}&limit=15&month=${selectedMonth}&year=${selectedYear}&status=${historyStatusFilter}`);
            setSalaryHistory(data.data || []);
            setHistoryTotal(data.total || 0);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        let finalAmount = amount;
        let label = 'RWF';
        if (currency === 'USD') {
            finalAmount = amount / 1300;
            label = 'USD';
        }
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: label }).format(finalAmount);
    };

    // ==============================
    // INDIVIDUAL PAY
    // ==============================
    const openPayModal = (item: PayrollItem) => {
        setPayTarget(item);
        setRecipientAccount(item.employee.phone || '');
        setSelectedChannel('mobile_money');
        setPaymentResult(null);
        setShowPayModal(true);
    };

    const handlePay = async () => {
        if (!payTarget) return;
        setIsPaying(true);
        try {
            const amountToPay = customAmounts[payTarget.employee.id] || payTarget.calculatedSalary;
            const result = await fetchApi<any>('/employees/salary/disburse', {
                method: 'POST',
                body: JSON.stringify({
                    employeeId: payTarget.employee.id,
                    amount: amountToPay,
                    baseSalary: payTarget.employee.baseSalary,
                    daysAttended: payTarget.daysAttended,
                    totalHours: payTarget.totalHours,
                    paymentMethod: selectedChannel,
                    recipientAccount,
                    salaryMonth: selectedMonth,
                    salaryYear: selectedYear,
                    initiatedBy: user?.fullName || user?.name || 'Admin',
                    currency: 'RWF',
                }),
            });
            setPaymentResult(result);
            toast.success(`Salary sent to ${payTarget.employee.name} ✓`);
            loadPayrollData();
        } catch (err: any) {
            toast.error(err.message || 'Payment failed');
            setPaymentResult({ status: 'failed', error: err.message });
        } finally {
            setIsPaying(false);
        }
    };

    // ==============================
    // BATCH PAY
    // ==============================
    const toggleEmployeeSelection = (empId: string) => {
        const newSet = new Set(selectedEmployees);
        if (newSet.has(empId)) {
            newSet.delete(empId);
        } else {
            newSet.add(empId);
        }
        setSelectedEmployees(newSet);
    };

    const filteredPayroll = payrollData.filter(item =>
        item.employee.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        item.employee.employeeId.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        item.employee.department.toLowerCase().includes(employeeSearch.toLowerCase())
    );

    const selectAllFiltered = () => {
        const unpaidIds = filteredPayroll.filter(p => !p.isPaid).map(p => p.employee.id);
        setSelectedEmployees(new Set(unpaidIds));
    };

    const deselectAll = () => setSelectedEmployees(new Set());

    const openBatchModal = () => {
        setBatchChannel('mobile_money');
        setBatchResult(null);
        setShowBatchModal(true);
    };

    const handleBatchPay = async () => {
        setIsBatchPaying(true);
        try {
            const employees = payrollData
                .filter(p => selectedEmployees.has(p.employee.id))
                .map(p => ({
                    employeeId: p.employee.id,
                    amount: customAmounts[p.employee.id] || p.calculatedSalary,
                    baseSalary: p.employee.baseSalary,
                    daysAttended: p.daysAttended,
                    totalHours: p.totalHours,
                    recipientAccount: p.employee.phone || '',
                }));

            const result = await fetchApi<any>('/employees/salary/disburse-batch', {
                method: 'POST',
                body: JSON.stringify({
                    employees,
                    paymentMethod: batchChannel,
                    salaryMonth: selectedMonth,
                    salaryYear: selectedYear,
                    initiatedBy: user?.fullName || user?.name || 'Admin',
                    currency: 'RWF',
                }),
            });
            setBatchResult(result);
            toast.success(`Batch payment complete: ${result.successful}/${result.total} succeeded`);
            loadPayrollData();
            setSelectedEmployees(new Set());
        } catch (err: any) {
            toast.error(err.message || 'Batch payment failed');
        } finally {
            setIsBatchPaying(false);
        }
    };

    const getChannelInfo = (method: string) => PAYMENT_CHANNELS.find(c => c.id === method) || PAYMENT_CHANNELS[1];
    const totalPayroll = payrollData.reduce((sum, p) => sum + p.calculatedSalary, 0);
    const paidCount = payrollData.filter(p => p.isPaid).length;
    const unpaidCount = payrollData.filter(p => !p.isPaid).length;
    const selectedTotal = payrollData
        .filter(p => selectedEmployees.has(p.employee.id))
        .reduce((sum, p) => sum + (customAmounts[p.employee.id] || p.calculatedSalary), 0);

    return (
        <div className="container-fluid p-0">
            {/* Header */}
            <ScrollReveal>
                <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-4 gap-3">
                    <div>
                        <h1 className="h3 fw-bold text-dark dark:text-white d-flex align-items-center gap-2">
                            <Banknote className="text-emerald-500" size={28} />
                            Salary Payments
                        </h1>
                        <p className="text-muted mb-0">
                            Disburse employee salaries via <span className="fw-semibold text-danger">Airtel Money</span>,{' '}
                            <span className="fw-semibold text-warning">Mobile Money</span>, or{' '}
                            <span className="fw-semibold text-primary">Bank Transfer</span> powered by{' '}
                            <span className="fw-bold" style={{ color: '#ff6600' }}>AfricasTalking</span>
                        </p>
                    </div>
                </div>
            </ScrollReveal>

            {/* Stats Cards */}
            <ScrollReveal delay={0.05}>
                <div className="row g-3 mb-4">
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #16a085 0%, #0e6655 100%)' }}>
                            <div className="card-body d-flex align-items-center gap-3 py-3">
                                <div className="rounded-circle bg-white bg-opacity-25 p-2 d-flex align-items-center justify-content-center" style={{ width: 44, height: 44 }}>
                                    <Users color="white" size={22} />
                                </div>
                                <div>
                                    <div className="small text-white text-opacity-75 fw-bold text-uppercase" style={{ fontSize: 10 }}>Total Employees</div>
                                    <div className="h5 fw-bold text-white mb-0">{payrollData.length}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}>
                            <div className="card-body d-flex align-items-center gap-3 py-3">
                                <div className="rounded-circle bg-white bg-opacity-25 p-2 d-flex align-items-center justify-content-center" style={{ width: 44, height: 44 }}>
                                    <DollarSign color="white" size={22} />
                                </div>
                                <div>
                                    <div className="small text-white text-opacity-75 fw-bold text-uppercase" style={{ fontSize: 10 }}>Total Payroll</div>
                                    <div className="h5 fw-bold text-white mb-0">{formatCurrency(totalPayroll)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                            <div className="card-body d-flex align-items-center gap-3 py-3">
                                <div className="rounded-circle bg-white bg-opacity-25 p-2 d-flex align-items-center justify-content-center" style={{ width: 44, height: 44 }}>
                                    <BadgeCheck color="white" size={22} />
                                </div>
                                <div>
                                    <div className="small text-white text-opacity-75 fw-bold text-uppercase" style={{ fontSize: 10 }}>Paid</div>
                                    <div className="h5 fw-bold text-white mb-0">{paidCount} <span className="small fw-normal text-white text-opacity-75">/ {payrollData.length}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
                            <div className="card-body d-flex align-items-center gap-3 py-3">
                                <div className="rounded-circle bg-white bg-opacity-25 p-2 d-flex align-items-center justify-content-center" style={{ width: 44, height: 44 }}>
                                    <Clock color="white" size={22} />
                                </div>
                                <div>
                                    <div className="small text-white text-opacity-75 fw-bold text-uppercase" style={{ fontSize: 10 }}>Pending</div>
                                    <div className="h5 fw-bold text-white mb-0">{unpaidCount} <span className="small fw-normal text-white text-opacity-75">employees</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollReveal>

            {/* Tabs */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white dark:bg-gray-800 border-0 p-0 overflow-hidden">
                    <div className="nav nav-tabs border-0 flex-nowrap">
                        <button
                            onClick={() => setActiveTab('payroll')}
                            className={`nav-link border-0 py-3 px-4 fw-medium text-nowrap ${activeTab === 'payroll' ? 'text-emerald-600 border-bottom border-emerald-600 border-2' : 'text-muted'}`}
                        >
                            <CalendarDays size={18} className="me-2" />
                            Payroll Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('pay')}
                            className={`nav-link border-0 py-3 px-4 fw-medium text-nowrap ${activeTab === 'pay' ? 'text-emerald-600 border-bottom border-emerald-600 border-2' : 'text-muted'}`}
                        >
                            <Send size={18} className="me-2" />
                            Pay Salaries
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`nav-link border-0 py-3 px-4 fw-medium text-nowrap ${activeTab === 'history' ? 'text-emerald-600 border-bottom border-emerald-600 border-2' : 'text-muted'}`}
                        >
                            <Receipt size={18} className="me-2" />
                            Payment History
                        </button>
                    </div>
                </div>
            </div>

            {/* Period Selector */}
            <ScrollReveal delay={0.1}>
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body py-3">
                        <div className="d-flex flex-wrap align-items-center gap-3">
                            <div className="d-flex align-items-center gap-2">
                                <label className="small fw-bold text-muted text-uppercase mb-0" style={{ fontSize: 10 }}>Period:</label>
                                <select
                                    className="form-select form-select-sm"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                    style={{ width: 140 }}
                                >
                                    {MONTHS.map((m, i) => (
                                        <option key={i} value={i + 1}>{m}</option>
                                    ))}
                                </select>
                                <select
                                    className="form-select form-select-sm"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                    style={{ width: 90 }}
                                >
                                    {[2024, 2025, 2026, 2027].map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={() => { loadPayrollData(); if (activeTab === 'history') loadSalaryHistory(); }}
                                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105 active:scale-95 d-flex align-items-center gap-2"
                            >
                                <RefreshCcw size={14} />
                                Refresh
                            </button>
                            {activeTab === 'history' && (
                                <select
                                    className="form-select form-select-sm"
                                    value={historyStatusFilter}
                                    onChange={(e) => setHistoryStatusFilter(e.target.value)}
                                    style={{ width: 140 }}
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="completed">Completed</option>
                                    <option value="processing">Processing</option>
                                    <option value="failed">Failed</option>
                                </select>
                            )}
                        </div>
                    </div>
                </div>
            </ScrollReveal>

            {isLoading && (
                <div className="text-center py-5">
                    <Loader2 className="mx-auto animate-spin text-emerald-500" size={32} />
                    <div className="text-muted mt-2 small">Loading payroll data...</div>
                </div>
            )}

            {/* =====================================================
                TAB 1: PAYROLL OVERVIEW
               ===================================================== */}
            {activeTab === 'payroll' && !isLoading && (
                <ScrollReveal delay={0.15}>
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white dark:bg-gray-800 border-bottom py-3 d-flex align-items-center justify-content-between">
                            <h6 className="fw-bold mb-0">
                                Payroll for {MONTHS[selectedMonth - 1]} {selectedYear}
                            </h6>
                            <span className="badge bg-emerald-100 text-emerald-700 px-3 py-2">
                                {payrollData.length} Employees
                            </span>
                        </div>
                        <div className="table-responsive">
                            <table className="table align-middle table-hover mb-0">
                                <thead className="table-light">
                                    <tr className="small text-uppercase fw-bold text-muted">
                                        <th className="ps-4">Employee</th>
                                        <th>Department</th>
                                        <th>Pay Type</th>
                                        <th>Days Attended</th>
                                        <th>Total Hours</th>
                                        <th>Base Rate</th>
                                        <th>Calculated Salary</th>
                                        <th className="text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payrollData.map(item => (
                                        <tr key={item.employee.id}>
                                            <td className="ps-4">
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="rounded-circle bg-emerald-100 text-emerald-600 d-flex align-items-center justify-content-center fw-bold" style={{ width: 36, height: 36, fontSize: 14 }}>
                                                        {item.employee.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold text-dark small">{item.employee.name}</div>
                                                        <div className="text-muted" style={{ fontSize: 10 }}>{item.employee.employeeId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span className="badge bg-light text-dark">{item.employee.department}</span></td>
                                            <td><span className="badge bg-primary-subtle text-primary text-capitalize">{item.employee.salaryType}</span></td>
                                            <td className="fw-medium">{item.daysAttended} days</td>
                                            <td className="text-muted">{item.totalHours} hrs</td>
                                            <td className="smaller">{formatCurrency(item.employee.baseSalary)}</td>
                                            <td>
                                                <div className="fw-bold text-success">{formatCurrency(item.calculatedSalary)}</div>
                                            </td>
                                            <td className="text-center">
                                                {item.isPaid ? (
                                                    <span className="badge bg-success-subtle text-success d-inline-flex align-items-center gap-1 px-2 py-1">
                                                        <CheckCircle size={12} />Paid
                                                    </span>
                                                ) : (
                                                    <span className="badge bg-warning-subtle text-warning d-inline-flex align-items-center gap-1 px-2 py-1">
                                                        <Clock size={12} />Pending
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {payrollData.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="text-center py-5 text-muted">
                                                <Users size={32} className="mb-2 text-muted" />
                                                <div>No payroll data for this period</div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </ScrollReveal>
            )}

            {/* =====================================================
                TAB 2: PAY SALARIES
               ===================================================== */}
            {activeTab === 'pay' && !isLoading && (
                <ScrollReveal delay={0.15}>
                    {/* Batch Actions & Search Bar */}
                    <div className="card border-0 shadow-sm mb-3">
                        <div className="card-body py-3">
                            <div className="row g-3 align-items-center">
                                <div className="col-md-4">
                                    <div className="position-relative">
                                        <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
                                        <input
                                            type="text"
                                            className="form-control form-control-sm ps-5 py-2 border-light bg-light"
                                            placeholder="Search name, ID, or department..."
                                            value={employeeSearch}
                                            onChange={(e) => setEmployeeSearch(e.target.value)}
                                            style={{ borderRadius: 10 }}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-8">
                                    <div className="d-flex flex-wrap align-items-center justify-content-md-end gap-2">
                                        <button
                                            onClick={selectAllFiltered}
                                            className="px-4 py-2 border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold transition-all hover:bg-blue-100/50 active:scale-95"
                                        >
                                            Select All Visible Unpaid
                                        </button>
                                        <button
                                            onClick={deselectAll}
                                            className="px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 rounded-xl text-xs font-bold transition-all hover:bg-gray-50 active:scale-95 disabled:opacity-50"
                                            disabled={selectedEmployees.size === 0}
                                        >
                                            Deselect All
                                        </button>
                                        <div className="vr mx-2 d-none d-md-block" style={{ height: 24 }}></div>
                                        <span className="text-muted small me-2">
                                            {selectedEmployees.size} selected
                                            {selectedEmployees.size > 0 && (
                                                <span className="fw-bold text-success ms-2">
                                                    (Total: {formatCurrency(selectedTotal)})
                                                </span>
                                            )}
                                        </span>
                                        <button
                                            onClick={openBatchModal}
                                            disabled={selectedEmployees.size === 0}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 dark:shadow-none transition-all hover:scale-105 active:scale-95 d-flex align-items-center gap-2 border-0 disabled:opacity-50"
                                        >
                                            <Send size={16} />
                                            Pay Selected
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Employee Cards Grid */}
                    <div className="row g-3">
                        {filteredPayroll.map(item => {
                            const isSelected = selectedEmployees.has(item.employee.id);
                            return (
                                <div key={item.employee.id} className="col-md-6 col-lg-4">
                                    <div
                                        className={`card border-2 shadow-sm h-100 transition-all position-relative ${item.isPaid
                                            ? 'border-success bg-success-subtle opacity-75'
                                            : isSelected
                                                ? 'border-emerald-500'
                                                : 'border-light'
                                            }`}
                                        style={{ cursor: item.isPaid ? 'default' : 'pointer', transition: 'all 0.2s ease' }}
                                        onClick={() => !item.isPaid && toggleEmployeeSelection(item.employee.id)}
                                    >
                                        {/* Selection indicator */}
                                        {isSelected && !item.isPaid && (
                                            <div className="position-absolute" style={{ top: 8, right: 8 }}>
                                                <div className="bg-emerald-500 text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 24, height: 24 }}>
                                                    <Check size={14} />
                                                </div>
                                            </div>
                                        )}
                                        {item.isPaid && (
                                            <div className="position-absolute" style={{ top: 8, right: 8 }}>
                                                <span className="badge bg-success d-flex align-items-center gap-1 px-2 py-1">
                                                    <CheckCircle size={12} />
                                                    Paid
                                                </span>
                                            </div>
                                        )}

                                        <div className="card-body p-3">
                                            <div className="d-flex align-items-center gap-3 mb-3">
                                                <div className="rounded-circle bg-emerald-100 text-emerald-600 d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style={{ width: 44, height: 44, fontSize: 16 }}>
                                                    {item.employee.name.charAt(0)}
                                                </div>
                                                <div className="flex-grow-1 overflow-hidden">
                                                    <div className="fw-bold text-dark text-truncate">{item.employee.name}</div>
                                                    <div className="text-muted" style={{ fontSize: 11 }}>{item.employee.position} • {item.employee.department}</div>
                                                </div>
                                            </div>

                                            <div className="row g-2 mb-3">
                                                <div className="col-4">
                                                    <div className="text-muted" style={{ fontSize: 10 }}>DAYS</div>
                                                    <div className="fw-bold small">{item.daysAttended}</div>
                                                </div>
                                                <div className="col-4">
                                                    <div className="text-muted" style={{ fontSize: 10 }}>HOURS</div>
                                                    <div className="fw-bold small">{item.totalHours}</div>
                                                </div>
                                                <div className="col-4">
                                                    <div className="text-muted" style={{ fontSize: 10 }}>TYPE</div>
                                                    <div className="fw-bold small text-capitalize">{item.employee.salaryType}</div>
                                                </div>
                                            </div>

                                            <div className="d-flex align-items-center justify-content-between pt-2 border-top">
                                                <div className="flex-grow-1 me-2">
                                                    <div className="text-muted d-flex justify-content-between" style={{ fontSize: 10 }}>
                                                        <span>SALARY AMOUNT ({currency})</span>
                                                        {customAmounts[item.employee.id] !== item.calculatedSalary && (
                                                            <span className="text-emerald-500 fw-bold">MODIFIED</span>
                                                        )}
                                                    </div>
                                                    <div className="position-relative mt-1">
                                                        <input
                                                            type="number"
                                                            className={`form-control form-control-sm border-0 bg-light fw-bold text-success p-1 ps-2 ${item.isPaid ? 'bg-transparent' : ''}`}
                                                            value={customAmounts[item.employee.id] || 0}
                                                            onChange={(e) => {
                                                                const val = Number(e.target.value);
                                                                setCustomAmounts(prev => ({ ...prev, [item.employee.id]: val }));
                                                            }}
                                                            onClick={(e) => e.stopPropagation()}
                                                            disabled={item.isPaid}
                                                            style={{ fontSize: 13, height: 32 }}
                                                        />
                                                        {!item.isPaid && (
                                                            <div className="position-absolute end-0 top-50 translate-middle-y pe-2">
                                                                <button
                                                                    className="btn btn-sm p-0 text-muted hover:text-emerald-500"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setCustomAmounts(prev => ({ ...prev, [item.employee.id]: item.calculatedSalary }));
                                                                    }}
                                                                    title="Reset to calculated amount"
                                                                >
                                                                    <RefreshCcw size={12} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {!item.isPaid && (
                                                    <button
                                                        className="px-4 py-1.5 border border-blue-600 text-blue-600 rounded-xl text-xs font-bold transition-all hover:bg-blue-600 hover:text-white active:scale-95 bg-transparent"
                                                        onClick={(e) => { e.stopPropagation(); openPayModal(item); }}
                                                    >
                                                        <Send size={14} className="me-1 d-inline" />
                                                        Pay Now
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {filteredPayroll.length === 0 && (
                        <div className="text-center py-5 text-muted">
                            <Users size={40} className="mb-3 opacity-25" />
                            <div>{employeeSearch ? `No matches for "${employeeSearch}"` : 'No employees in payroll for this period'}</div>
                        </div>
                    )}
                </ScrollReveal>
            )}

            {/* =====================================================
                TAB 3: PAYMENT HISTORY
               ===================================================== */}
            {activeTab === 'history' && !isLoading && (
                <ScrollReveal delay={0.15}>
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white dark:bg-gray-800 border-bottom py-3 d-flex align-items-center justify-content-between">
                            <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                                <Receipt size={18} />
                                Salary Payment History
                            </h6>
                            <span className="badge bg-light text-dark">{historyTotal} records</span>
                        </div>
                        <div className="table-responsive">
                            <table className="table align-middle table-hover mb-0">
                                <thead className="table-light">
                                    <tr className="small text-uppercase fw-bold text-muted">
                                        <th className="ps-4">Employee</th>
                                        <th>Amount</th>
                                        <th>Method</th>
                                        <th>Account</th>
                                        <th>Transaction ID</th>
                                        <th>Period</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {salaryHistory.map(record => {
                                        const channel = getChannelInfo(record.paymentMethod);
                                        const ChannelIcon = channel.icon;
                                        return (
                                            <tr key={record.id}>
                                                <td className="ps-4">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="rounded-circle bg-emerald-100 text-emerald-600 d-flex align-items-center justify-content-center fw-bold" style={{ width: 32, height: 32, fontSize: 12 }}>
                                                            {record.employee?.name?.charAt(0) || '?'}
                                                        </div>
                                                        <div>
                                                            <div className="fw-medium text-dark small">{record.employee?.name || 'Unknown'}</div>
                                                            <div className="text-muted" style={{ fontSize: 10 }}>{record.employee?.employeeId}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="fw-bold text-success small">{formatCurrency(record.amount)}</td>
                                                <td>
                                                    <div className={`d-inline-flex align-items-center gap-1 badge ${channel.bgColor} ${channel.color} px-2 py-1`}>
                                                        <ChannelIcon size={12} />
                                                        <span style={{ fontSize: 10 }}>{channel.name}</span>
                                                    </div>
                                                </td>
                                                <td className="smaller text-muted font-monospace">{record.recipientAccount || '-'}</td>
                                                <td className="font-monospace smaller text-muted">{record.transactionId || '-'}</td>
                                                <td className="smaller">{MONTHS[(record.salaryMonth || 1) - 1]?.slice(0, 3)} {record.salaryYear}</td>
                                                <td>
                                                    {record.status === 'completed' && (
                                                        <span className="badge bg-success-subtle text-success d-inline-flex align-items-center gap-1 px-2 py-1">
                                                            <CheckCircle size={10} />Completed
                                                        </span>
                                                    )}
                                                    {record.status === 'processing' && (
                                                        <span className="badge bg-warning-subtle text-warning d-inline-flex align-items-center gap-1 px-2 py-1">
                                                            <Loader2 size={10} className="animate-spin" />Processing
                                                        </span>
                                                    )}
                                                    {record.status === 'failed' && (
                                                        <span className="badge bg-danger-subtle text-danger d-inline-flex align-items-center gap-1 px-2 py-1">
                                                            <XCircle size={10} />Failed
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="smaller text-muted">{new Date(record.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        );
                                    })}
                                    {salaryHistory.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="text-center py-5 text-muted">
                                                <Receipt size={32} className="mb-2 opacity-25" />
                                                <div>No salary payment records found for this period</div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </ScrollReveal>
            )}

            {/* =====================================================
                INDIVIDUAL PAY MODAL
               ===================================================== */}
            <Modal isOpen={showPayModal} onClose={() => setShowPayModal(false)} title="Disburse Salary" size="md" draggable={true}>
                {payTarget && !paymentResult && (
                    <div>
                        {/* Employee Info */}
                        <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-light rounded-3">
                            <div className="rounded-circle bg-emerald-500 text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: 50, height: 50, fontSize: 20 }}>
                                {payTarget.employee.name.charAt(0)}
                            </div>
                            <div className="flex-grow-1">
                                <div className="fw-bold text-dark">{payTarget.employee.name}</div>
                                <div className="text-muted small">{payTarget.employee.position} • {payTarget.employee.department}</div>
                                <div className="text-muted" style={{ fontSize: 10 }}>ID: {payTarget.employee.employeeId}</div>
                            </div>
                            <div className="text-end">
                                <div className="text-muted" style={{ fontSize: 10 }}>SALARY AMOUNT</div>
                                <div className="h5 fw-bold text-success mb-0">{formatCurrency(customAmounts[payTarget.employee.id] || payTarget.calculatedSalary)}</div>
                                <div className="text-muted" style={{ fontSize: 10 }}>{payTarget.daysAttended} days • {payTarget.totalHours} hrs</div>
                            </div>
                        </div>

                        {/* Payment Channel Selection */}
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-uppercase mb-2" style={{ fontSize: 10 }}>
                                Select Payment Channel (AfricasTalking)
                            </label>
                            <div className="row g-2">
                                {PAYMENT_CHANNELS.map(channel => {
                                    const Icon = channel.icon;
                                    const isActive = selectedChannel === channel.id;
                                    return (
                                        <div key={channel.id} className="col-4">
                                            <div
                                                className={`card border-2 h-100 ${isActive ? `${channel.borderColor} ${channel.bgColor}` : 'border-light'}`}
                                                style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                                                onClick={() => setSelectedChannel(channel.id)}
                                            >
                                                <div className="card-body p-2 text-center">
                                                    <div className={`rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center ${isActive ? channel.bgColor : 'bg-light'}`} style={{ width: 40, height: 40 }}>
                                                        <Icon size={20} className={isActive ? channel.color : 'text-muted'} />
                                                    </div>
                                                    <div className={`fw-bold ${isActive ? channel.color : 'text-muted'}`} style={{ fontSize: 11 }}>{channel.name}</div>
                                                    <div className="text-muted" style={{ fontSize: 9 }}>{channel.description}</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Recipient Account */}
                        <div className="mb-4">
                            <label className="form-label small fw-bold text-uppercase mb-1" style={{ fontSize: 10 }}>
                                {selectedChannel === 'bank_transfer' ? 'Bank Account Number' : 'Phone Number'}
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                value={recipientAccount}
                                onChange={(e) => setRecipientAccount(e.target.value)}
                                placeholder={selectedChannel === 'bank_transfer' ? 'Enter bank account number' : 'e.g., +250788123456'}
                            />
                        </div>

                        {/* Summary */}
                        <div className="p-3 bg-light rounded-3 mb-3">
                            <div className="d-flex justify-content-between mb-1 small">
                                <span className="text-muted">Employee:</span>
                                <span className="fw-bold">{payTarget.employee.name}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-1 small">
                                <span className="text-muted">Channel:</span>
                                <span className="fw-bold">{getChannelInfo(selectedChannel).name}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-1 small">
                                <span className="text-muted">Account:</span>
                                <span className="fw-bold font-monospace">{recipientAccount || '-'}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-1 small">
                                <span className="text-muted">Period:</span>
                                <span className="fw-bold">{MONTHS[selectedMonth - 1]} {selectedYear}</span>
                            </div>
                            <hr className="my-2" />
                            <div className="d-flex justify-content-between">
                                <span className="fw-bold text-dark">Total Amount:</span>
                                <span className="h5 fw-bold text-success mb-0">{formatCurrency(customAmounts[payTarget.employee.id] || payTarget.calculatedSalary)}</span>
                            </div>
                        </div>

                        {/* Pay Button */}
                        <div className="d-flex gap-2">
                            <button onClick={() => setShowPayModal(false)} className="btn btn-outline-secondary flex-grow-1">
                                Cancel
                            </button>
                            <button
                                onClick={handlePay}
                                disabled={isPaying || !recipientAccount}
                                className="btn btn-success flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                            >
                                {isPaying ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Processing via AfricasTalking...
                                    </>
                                ) : (
                                    <>
                                        <Send size={16} />
                                        Send Payment
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Payment Result */}
                {paymentResult && (
                    <div className="text-center py-4">
                        {paymentResult.status === 'completed' ? (
                            <>
                                <div className="rounded-circle bg-success mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: 80, height: 80 }}>
                                    <CheckCircle color="white" size={40} />
                                </div>
                                <h4 className="fw-bold text-success mb-1">Payment Successful!</h4>
                                <p className="text-muted mb-3">
                                    Salary of <strong>{formatCurrency(customAmounts[payTarget?.employee.id || ''] || payTarget?.calculatedSalary || 0)}</strong> has been sent to{' '}
                                    <strong>{payTarget?.employee.name}</strong> via <strong>{getChannelInfo(selectedChannel).name}</strong>
                                </p>
                                {paymentResult.transactionId && (
                                    <div className="bg-light rounded-3 p-3 d-inline-block mb-3">
                                        <div className="text-muted" style={{ fontSize: 10 }}>TRANSACTION ID</div>
                                        <div className="fw-bold font-monospace">{paymentResult.transactionId}</div>
                                    </div>
                                )}
                                <div>
                                    <button onClick={() => setShowPayModal(false)} className="btn btn-primary px-4">
                                        Done
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="rounded-circle bg-danger mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: 80, height: 80 }}>
                                    <XCircle color="white" size={40} />
                                </div>
                                <h4 className="fw-bold text-danger mb-1">Payment Failed</h4>
                                <p className="text-muted mb-3">
                                    {paymentResult.error || 'The payment could not be processed. Please try again.'}
                                </p>
                                <div className="d-flex gap-2 justify-content-center">
                                    <button onClick={() => setShowPayModal(false)} className="btn btn-outline-secondary px-4">
                                        Close
                                    </button>
                                    <button onClick={() => setPaymentResult(null)} className="btn btn-primary px-4">
                                        Try Again
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Modal>

            {/* =====================================================
                BATCH PAY MODAL
               ===================================================== */}
            <Modal isOpen={showBatchModal} onClose={() => setShowBatchModal(false)} title="Batch Salary Payment" size="md" draggable={true}>
                {!batchResult && (
                    <div>
                        <div className="alert alert-info d-flex align-items-center gap-2 py-2" style={{ fontSize: 13 }}>
                            <AlertCircle size={16} />
                            You are about to pay <strong>{selectedEmployees.size} employees</strong> a total of{' '}
                            <strong>{formatCurrency(selectedTotal)}</strong> for {MONTHS[selectedMonth - 1]} {selectedYear}.
                        </div>

                        {/* Channel Selection */}
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-uppercase mb-2" style={{ fontSize: 10 }}>
                                Payment Channel for All
                            </label>
                            <div className="row g-2">
                                {PAYMENT_CHANNELS.map(channel => {
                                    const Icon = channel.icon;
                                    const isActive = batchChannel === channel.id;
                                    return (
                                        <div key={channel.id} className="col-4">
                                            <div
                                                className={`card border-2 h-100 ${isActive ? `${channel.borderColor} ${channel.bgColor}` : 'border-light'}`}
                                                style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                                                onClick={() => setBatchChannel(channel.id)}
                                            >
                                                <div className="card-body p-2 text-center">
                                                    <Icon size={20} className={`mx-auto mb-1 ${isActive ? channel.color : 'text-muted'}`} />
                                                    <div className={`fw-bold ${isActive ? channel.color : 'text-muted'}`} style={{ fontSize: 11 }}>{channel.name}</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Employee List */}
                        <div className="mb-4">
                            <div className="small fw-bold text-uppercase text-muted mb-2" style={{ fontSize: 10 }}>Employees to Pay</div>
                            <div style={{ maxHeight: 200, overflowY: 'auto' }} className="border rounded-3">
                                {payrollData.filter(p => selectedEmployees.has(p.employee.id)).map(item => (
                                    <div key={item.employee.id} className="d-flex align-items-center justify-content-between p-2 border-bottom">
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="rounded-circle bg-emerald-100 text-emerald-600 d-flex align-items-center justify-content-center fw-bold" style={{ width: 28, height: 28, fontSize: 11 }}>
                                                {item.employee.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="fw-medium small">{item.employee.name}</div>
                                                <div className="text-muted" style={{ fontSize: 9 }}>{item.employee.phone}</div>
                                            </div>
                                        </div>
                                        <span className="fw-bold text-success small">{formatCurrency(customAmounts[item.employee.id] || item.calculatedSalary)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="p-3 bg-light rounded-3 mb-3">
                            <div className="d-flex justify-content-between mb-1 small">
                                <span className="text-muted">Employees:</span>
                                <span className="fw-bold">{selectedEmployees.size}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-1 small">
                                <span className="text-muted">Channel:</span>
                                <span className="fw-bold">{getChannelInfo(batchChannel).name}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-1 small">
                                <span className="text-muted">Period:</span>
                                <span className="fw-bold">{MONTHS[selectedMonth - 1]} {selectedYear}</span>
                            </div>
                            <hr className="my-2" />
                            <div className="d-flex justify-content-between">
                                <span className="fw-bold text-dark">Grand Total:</span>
                                <span className="h5 fw-bold text-success mb-0">{formatCurrency(selectedTotal)}</span>
                            </div>
                        </div>

                        <div className="d-flex gap-2">
                            <button onClick={() => setShowBatchModal(false)} className="btn btn-outline-secondary flex-grow-1">
                                Cancel
                            </button>
                            <button
                                onClick={handleBatchPay}
                                disabled={isBatchPaying}
                                className="btn btn-success flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                            >
                                {isBatchPaying ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Processing {selectedEmployees.size} payments...
                                    </>
                                ) : (
                                    <>
                                        <Send size={16} />
                                        Confirm Batch Payment
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Batch Result */}
                {batchResult && (
                    <div className="text-center py-4">
                        <div className="rounded-circle bg-success mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: 80, height: 80 }}>
                            <BadgeCheck color="white" size={40} />
                        </div>
                        <h4 className="fw-bold text-success mb-2">Batch Payment Complete!</h4>

                        <div className="row g-3 mb-4 mt-2">
                            <div className="col-4">
                                <div className="card border-0 bg-light">
                                    <div className="card-body p-2 text-center">
                                        <div className="h4 fw-bold text-dark mb-0">{batchResult.total}</div>
                                        <div className="text-muted" style={{ fontSize: 10 }}>TOTAL</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="card border-0 bg-success-subtle">
                                    <div className="card-body p-2 text-center">
                                        <div className="h4 fw-bold text-success mb-0">{batchResult.successful}</div>
                                        <div className="text-success" style={{ fontSize: 10 }}>SUCCESSFUL</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="card border-0 bg-danger-subtle">
                                    <div className="card-body p-2 text-center">
                                        <div className="h4 fw-bold text-danger mb-0">{batchResult.failed}</div>
                                        <div className="text-danger" style={{ fontSize: 10 }}>FAILED</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button onClick={() => { setShowBatchModal(false); setBatchResult(null); }} className="btn btn-primary px-4">
                            Done
                        </button>
                    </div>
                )}
            </Modal>
        </div>
    );
}
