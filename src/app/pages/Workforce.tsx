import { useState, useEffect } from "react";
import {
    Users,
    CalendarDays,
    CreditCard,
    Plus,
    Search,
    Filter,
    Edit2,
    Trash2,
    Eye,
    Save,
    Send,
    Smartphone,
    Wifi,
    Building2,
    Download,
    AlertCircle,
    RotateCcw,
    RefreshCw,
} from "lucide-react";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { PaginationSelector } from "@/app/components/ui/pagination-selector";
import { Modal } from "@/app/components/Modal";
import { fetchApi } from '../api/client';
import { useAuth } from "@/app/context/AuthContext";
import { useCurrency } from "@/app/context/CurrencyContext";
import { toast } from "sonner";
import { AddEmployeeModal } from "@/app/components/AddEmployeeModal";
import { SitesTab } from "./workforce/SitesTab";
import { ContractsTab } from "./workforce/ContractsTab";
import { AssignmentsTab } from "./workforce/AssignmentsTab";
import { Check } from "lucide-react";

// Types
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
    hireDate: string;
}

interface AttendanceRecord {
    id?: string;
    employeeId: string;
    date: string;
    status: 'Present' | 'Absent' | 'Late' | 'Leave';
    checkIn: string;
    checkOut: string;
    workingHours: number;
    reason: string;
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

export function Workforce() {
    const { user } = useAuth();
    const { currency } = useCurrency();
    const [activeTab, setActiveTab] = useState<'directory' | 'attendance' | 'payroll' | 'sites' | 'contracts' | 'assignments'>('directory');

    // Auth & Permissions
    const roleName = ((typeof user?.role === 'object' && user.role !== null) ? user.role.name : user?.role || 'guest').toLowerCase();
    const isAdminOrManager = ['super_admin', 'admin', 'manager', 'site_manager'].includes(roleName);

    // Shared State
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // 1. Directory State
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

    // 2. Attendance State
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceRecords, setAttendanceRecords] = useState<Record<string, Partial<AttendanceRecord>>>({});
    const [personalAttendance, setPersonalAttendance] = useState<AttendanceRecord[]>([]);
    const [isSavingAttendance, setIsSavingAttendance] = useState(false);

    // 3. Payroll State
    const [payrollData, setPayrollData] = useState<PayrollItem[]>([]);
    const [customAmounts, setCustomAmounts] = useState<Record<string, number>>({});
    const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [batchChannel, setBatchChannel] = useState<PaymentChannel>('mobile_money');
    const [isBatchPaying, setIsBatchPaying] = useState(false);

    // Initial Load
    useEffect(() => {
        loadEmployees();
    }, []);

    useEffect(() => {
        if (activeTab === 'attendance') {
            loadAttendanceData();
        } else if (activeTab === 'payroll' && isAdminOrManager) {
            loadPayrollData();
        }
    }, [activeTab, selectedDate, selectedMonth, selectedYear, employees, currentPage, pageSize]);

    // Data Loaders
    const loadEmployees = async () => {
        try {
            const query = new URLSearchParams({
                page: currentPage.toString(),
                limit: pageSize.toString(),
                search: searchTerm
            }).toString();
            const res = await fetchApi<any>(`/employees?${query}`);
            setEmployees(res.data || []);
            setTotalPages(res.lastPage || 1);
            setTotalItems(res.total || 0);
        } catch (err) {
            toast.error("Failed to load employees");
        }
    };

    const loadAttendanceData = async () => {
        try {
            if (isAdminOrManager) {
                const attRes = await fetchApi<AttendanceRecord[]>(`/employees/attendance/all?date=${selectedDate}`);
                const attMap: Record<string, Partial<AttendanceRecord>> = {};

                employees.forEach(emp => {
                    const record = attRes.find(r => r.employeeId === emp.id);
                    attMap[emp.id] = record || {
                        employeeId: emp.id,
                        date: selectedDate,
                        status: 'Present',
                        checkIn: '08:00',
                        checkOut: '17:00',
                        workingHours: 8,
                        reason: ''
                    };
                });
                setAttendanceRecords(attMap);
            } else if (user?.email) {
                const res = await fetchApi<AttendanceRecord[]>(`/employees/attendance/me?email=${user.email}`);
                setPersonalAttendance(res);
            }
        } catch (err) {
            toast.error("Failed to load attendance");
        }
    };

    const loadPayrollData = async () => {
        try {
            const data = await fetchApi<PayrollItem[]>(`/employees/payroll/calculate?month=${selectedMonth}&year=${selectedYear}`);
            setPayrollData(data);
            const amounts: Record<string, number> = {};
            data.forEach(item => {
                amounts[item.employee.id] = item.calculatedSalary;
            });
            setCustomAmounts(amounts);
        } catch (err) {
            toast.error("Failed to load payroll data");
        }
    };

    // Actions
    const saveAttendance = async () => {
        setIsSavingAttendance(true);
        try {
            const records = Object.values(attendanceRecords);
            await fetchApi('/employees/attendance/batch', {
                method: 'POST',
                body: JSON.stringify({ records })
            });
            toast.success("All attendance records saved successfully!");
            loadAttendanceData();
        } catch (err) {
            toast.error("Failed to save attendance");
        } finally {
            setIsSavingAttendance(false);
        }
    };

    const toggleEmployeeSelection = (empId: string) => {
        const newSet = new Set(selectedEmployees);
        if (newSet.has(empId)) {
            newSet.delete(empId);
        } else {
            newSet.add(empId);
        }
        setSelectedEmployees(newSet);
    };

    const handleBatchPay = async () => {
        setIsBatchPaying(true);
        try {
            const selectedPayroll = payrollData.filter(p => selectedEmployees.has(p.employee.id));
            const employeesToPay = selectedPayroll.map(p => ({
                employeeId: p.employee.id,
                amount: customAmounts[p.employee.id] || p.calculatedSalary,
                baseSalary: p.employee.baseSalary,
                daysAttended: p.daysAttended,
                totalHours: p.totalHours,
                recipientAccount: p.employee.phone || '',
            }));

            await fetchApi<any>('/employees/salary/disburse-batch', {
                method: 'POST',
                body: JSON.stringify({
                    employees: employeesToPay,
                    paymentMethod: batchChannel,
                    salaryMonth: selectedMonth,
                    salaryYear: selectedYear,
                    initiatedBy: user?.fullName || user?.name || 'Admin',
                    currency: 'RWF',
                }),
            });
            toast.success(`Disbursement complete!`);
            loadPayrollData();
            setSelectedEmployees(new Set());
        } catch (err: any) {
            toast.error(err.message || "Batch payment failed");
        } finally {
            setIsBatchPaying(false);
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

    const filteredEmployees = (activeTab === 'directory' ? employees : (activeTab === 'payroll' ? payrollData.map(p => p.employee) : employees))
        .filter(emp =>
            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const selectedTotal = Array.from(selectedEmployees).reduce((sum, id) => {
        const item = payrollData.find(p => p.employee.id === id);
        return sum + (item ? (customAmounts[id] || item.calculatedSalary) : 0);
    }, 0);

    return (
        <div className="container-fluid px-2 px-md-4 pt-1 pb-2">
            {/* Header */}
            <ScrollReveal className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-2 px-2 px-md-4 pt-1">
                <div>
                    <h1 className="h5 fw-bold text-dark mb-0">Workforce Center</h1>
                    <p className="text-muted mb-0" style={{ fontSize: '12px' }}>Manage employees, attendance, and payroll in one place</p>
                </div>
                <div className="d-flex gap-2">
                    {activeTab === 'directory' && isAdminOrManager && (
                        <button
                            onClick={() => { setEditingEmployee(null); setIsAddModalOpen(true); }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-emerald-200 dark:shadow-none transition-all hover:scale-105 active:scale-95 d-flex align-items-center gap-2 border-0"
                        >
                            <Plus size={14} /> <span>Add Staff</span>
                        </button>
                    )}
                    {activeTab === 'attendance' && isAdminOrManager && (
                        <button
                            onClick={saveAttendance}
                            disabled={isSavingAttendance}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 dark:shadow-none transition-all hover:scale-105 active:scale-95 d-flex align-items-center gap-2 border-0"
                        >
                            {isSavingAttendance ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                            <span>{isSavingAttendance ? 'Saving...' : 'Save Records'}</span>
                        </button>
                    )}
                    <button
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 hover:text-emerald-600 hover:border-emerald-600 transition-all hover:scale-110 active:scale-95 bg-white dark:bg-gray-800"
                    >
                        <Download size={16} />
                    </button>
                </div>
            </ScrollReveal>

            {/* Hub Tabs */}
            <div className="card border-0 shadow-sm mb-2 mx-2 mx-md-4" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                <div className="card-header bg-white border-0 p-0">
                    <div className="nav nav-pills p-1.5 gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-2xl mx-1 my-1">
                        <button
                            onClick={() => setActiveTab('directory')}
                            className={`nav-link flex-fill d-flex align-items-center justify-content-center gap-2 py-2.5 transition-all ${activeTab === 'directory' ? 'text-white shadow-lg scale-100' : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'}`}
                            style={{
                                borderRadius: '14px',
                                border: 'none',
                                background: activeTab === 'directory' ? 'linear-gradient(135deg, #16a085 0%, #1abc9c 100%)' : 'transparent',
                                fontWeight: 700,
                                fontSize: '12px',
                                letterSpacing: '0.5px'
                            }}
                        >
                            <Users size={16} /> Staff Directory
                        </button>
                        <button
                            onClick={() => setActiveTab('attendance')}
                            className={`nav-link flex-fill d-flex align-items-center justify-content-center gap-2 py-2.5 transition-all ${activeTab === 'attendance' ? 'text-white shadow-lg scale-100' : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'}`}
                            style={{
                                borderRadius: '14px',
                                border: 'none',
                                background: activeTab === 'attendance' ? 'linear-gradient(135deg, #16a085 0%, #1abc9c 100%)' : 'transparent',
                                fontWeight: 700,
                                fontSize: '12px',
                                letterSpacing: '0.5px'
                            }}
                        >
                            <CalendarDays size={16} /> {isAdminOrManager ? 'Daily Attendance' : 'My Attendance'}
                        </button>
                        <button
                            onClick={() => setActiveTab('payroll')}
                            className={`nav-link flex-fill d-flex align-items-center justify-content-center gap-2 py-2.5 transition-all ${activeTab === 'payroll' ? 'text-white shadow-lg scale-100' : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'}`}
                            style={{
                                borderRadius: '14px',
                                border: 'none',
                                background: activeTab === 'payroll' ? 'linear-gradient(135deg, #16a085 0%, #1abc9c 100%)' : 'transparent',
                                fontWeight: 700,
                                fontSize: '12px',
                                letterSpacing: '0.5px'
                            }}
                        >
                            <CreditCard size={16} /> Payroll Center
                        </button>
                        <button
                            onClick={() => setActiveTab('sites' as any)}
                            className={`nav-link flex-fill d-flex align-items-center justify-content-center gap-2 py-2.5 transition-all ${activeTab === 'sites' as any ? 'text-white shadow-lg scale-100' : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'}`}
                            style={{
                                borderRadius: '14px',
                                border: 'none',
                                background: activeTab === 'sites' as any ? 'linear-gradient(135deg, #16a085 0%, #1abc9c 100%)' : 'transparent',
                                fontWeight: 700,
                                fontSize: '12px',
                                letterSpacing: '0.5px'
                            }}
                        >
                            <Building2 size={16} /> Sites
                        </button>
                        <button
                            onClick={() => setActiveTab('contracts' as any)}
                            className={`nav-link flex-fill d-flex align-items-center justify-content-center gap-2 py-2.5 transition-all ${activeTab === 'contracts' as any ? 'text-white shadow-lg scale-100' : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'}`}
                            style={{
                                borderRadius: '14px',
                                border: 'none',
                                background: activeTab === 'contracts' as any ? 'linear-gradient(135deg, #16a085 0%, #1abc9c 100%)' : 'transparent',
                                fontWeight: 700,
                                fontSize: '12px',
                                letterSpacing: '0.5px'
                            }}
                        >
                            <CalendarDays size={16} /> Contracts
                        </button>
                        <button
                            onClick={() => setActiveTab('assignments' as any)}
                            className={`nav-link flex-fill d-flex align-items-center justify-content-center gap-2 py-2.5 transition-all ${activeTab === 'assignments' as any ? 'text-white shadow-lg scale-100' : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'}`}
                            style={{
                                borderRadius: '14px',
                                border: 'none',
                                background: activeTab === 'assignments' as any ? 'linear-gradient(135deg, #16a085 0%, #1abc9c 100%)' : 'transparent',
                                fontWeight: 700,
                                fontSize: '12px',
                                letterSpacing: '0.5px'
                            }}
                        >
                            <Users size={16} /> Assignments
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <ScrollReveal className="mb-2">
                <div className="card border-0 shadow-sm mx-2 mx-md-4" style={{ borderRadius: '12px' }}>
                    <div className="card-body py-3">
                        <div className="row g-2 align-items-center">
                            <div className="col-md-5">
                                <div className="position-relative">
                                    <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={14} />
                                    <input
                                        type="text"
                                        className="form-control form-control-sm ps-5 bg-light border-0 py-1"
                                        placeholder="Search by name, ID or department..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ borderRadius: '8px' }}
                                    />
                                </div>
                            </div>
                            <div className="col-md-7 d-flex justify-content-md-end gap-2 align-items-center">
                                {activeTab === 'attendance' ? (
                                    <input
                                        type="date"
                                        className="form-control form-control-sm border-0 bg-light"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        style={{ width: '160px', borderRadius: '8px' }}
                                    />
                                ) : (
                                    <>
                                        <select
                                            className="form-select form-select-sm border-0 bg-light"
                                            value={selectedMonth}
                                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                            style={{ width: '120px', borderRadius: '8px' }}
                                        >
                                            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                                        </select>
                                        <select
                                            className="form-select form-select-sm border-0 bg-light"
                                            value={selectedYear}
                                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                                            style={{ width: '90px', borderRadius: '8px' }}
                                        >
                                            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </>
                                )}
                                <button className="btn btn-light btn-sm p-1" style={{ borderRadius: '8px' }}>
                                    <Filter size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollReveal>

            {/* Content Area */}
            <div className="tab-content mt-2 px-2 px-md-4">
                {/* 1. DIRECTORY TAB */}
                {activeTab === 'directory' && (
                    <ScrollReveal>
                        <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="bg-light">
                                        <tr className="text-muted small text-uppercase">
                                            <th className="ps-4">Employee Info</th>
                                            <th>Department</th>
                                            <th>Position</th>
                                            <th>Salary Type</th>
                                            <th>Status</th>
                                            <th className="pe-4 text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredEmployees.map(emp => (
                                            <tr key={emp.id} className="transition-all">
                                                <td className="ps-4 py-2">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="rounded-circle fw-bold d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, backgroundColor: '#e8f8f5', color: '#16a085', fontSize: '12px' }}>
                                                            {emp.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="fw-bold text-dark">{emp.name}</div>
                                                            <div className="text-muted small">ID: {emp.employeeId}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span
                                                        className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider"
                                                        style={{
                                                            backgroundColor: 'rgba(22, 160, 133, 0.12)',
                                                            color: '#16a085',
                                                            border: '1px solid rgba(22, 160, 133, 0.3)'
                                                        }}
                                                    >
                                                        {emp.department}
                                                    </span>
                                                </td>
                                                <td className="text-dark small">{emp.position}</td>
                                                <td className="text-capitalize small text-muted">{emp.salaryType}</td>
                                                <td>
                                                    <span className={`badge px-2 py-1 ${emp.status === 'active' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                                        {emp.status}
                                                    </span>
                                                </td>
                                                <td className="pe-4 text-end">
                                                    <button className="btn btn-icon text-muted hover:text-blue-600 p-0" style={{ color: 'inherit' }}><Eye size={14} /></button>
                                                    <button className="btn btn-icon text-muted hover:opacity-75 p-0" onClick={() => { setEditingEmployee(emp); setIsAddModalOpen(true); }}><Edit2 size={14} /></button>
                                                    <button className="btn btn-icon text-muted hover:text-red-600 p-0" style={{ color: 'inherit' }}><Trash2 size={14} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* Pagination for Directory */}
                            {activeTab === 'directory' && totalPages > 1 && (
                                <div className="px-4 py-3">
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
                        </div>
                    </ScrollReveal>
                )}

                {/* 2. ATTENDANCE TAB */}
                {activeTab === 'attendance' && (
                    <ScrollReveal>
                        <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
                            <div className="table-responsive">
                                {isAdminOrManager ? (
                                    <table className="table align-middle table-hover mb-0">
                                        <thead className="bg-light">
                                            <tr className="text-muted small text-uppercase">
                                                <th className="ps-4">Employee</th>
                                                <th>Status</th>
                                                <th>Check In</th>
                                                <th>Check Out</th>
                                                <th className="text-center">Hours</th>
                                                <th className="pe-4">Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredEmployees.map(emp => {
                                                const record = attendanceRecords[emp.id] || {};
                                                return (
                                                    <tr key={emp.id}>
                                                        <td className="ps-4">
                                                            <div className="fw-medium text-dark small">{emp.name}</div>
                                                            <div className="text-muted smaller" style={{ fontSize: '10px' }}>{emp.employeeId}</div>
                                                        </td>
                                                        <td>
                                                            <select
                                                                className={`form-select form-select-sm border-0 fw-bold ${record.status === 'Present' ? 'text-success' : record.status === 'Absent' ? 'text-danger' : 'text-warning'}`}
                                                                value={record.status}
                                                                onChange={(e) => setAttendanceRecords(prev => ({ ...prev, [emp.id]: { ...prev[emp.id], status: e.target.value as any } }))}
                                                                style={{ width: 100, background: 'transparent' }}
                                                            >
                                                                <option value="Present">Present</option>
                                                                <option value="Absent">Absent</option>
                                                                <option value="Late">Late</option>
                                                                <option value="Leave">Leave</option>
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="time"
                                                                className="form-control form-control-sm border-0 bg-light"
                                                                value={record.checkIn || ''}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    setAttendanceRecords(prev => {
                                                                        const updated = { ...prev[emp.id], checkIn: val };
                                                                        const [h1, m1] = (val || '00:00').split(':').map(Number);
                                                                        const [h2, m2] = (updated.checkOut || '00:00').split(':').map(Number);
                                                                        updated.workingHours = Math.max(0, Number(((h2 + m2 / 60) - (h1 + m1 / 60)).toFixed(2)));
                                                                        return { ...prev, [emp.id]: updated };
                                                                    });
                                                                }}
                                                                style={{ borderRadius: '6px' }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="time"
                                                                className="form-control form-control-sm border-0 bg-light"
                                                                value={record.checkOut || ''}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    setAttendanceRecords(prev => {
                                                                        const updated = { ...prev[emp.id], checkOut: val };
                                                                        const [h1, m1] = (updated.checkIn || '00:00').split(':').map(Number);
                                                                        const [h2, m2] = (val || '00:00').split(':').map(Number);
                                                                        updated.workingHours = Math.max(0, Number(((h2 + m2 / 60) - (h1 + m1 / 60)).toFixed(2)));
                                                                        return { ...prev, [emp.id]: updated };
                                                                    });
                                                                }}
                                                                style={{ borderRadius: '6px' }}
                                                            />
                                                        </td>
                                                        <td className="text-center fw-bold" style={{ color: '#16a085' }}>{record.workingHours || 0}h</td>
                                                        <td className="pe-4">
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm border-0 border-bottom rounded-0 bg-transparent"
                                                                placeholder="Notes..."
                                                                value={record.reason || ''}
                                                                onChange={(e) => setAttendanceRecords(prev => ({ ...prev, [emp.id]: { ...prev[emp.id], reason: e.target.value } }))}
                                                            />
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                ) : (
                                    <table className="table align-middle table-hover mb-0">
                                        <thead className="bg-light">
                                            <tr className="text-muted small text-uppercase">
                                                <th className="ps-4">Date</th>
                                                <th>Status</th>
                                                <th>Check In</th>
                                                <th>Check Out</th>
                                                <th className="text-center">Hours</th>
                                                <th className="pe-4">Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {personalAttendance.length > 0 ? (
                                                personalAttendance.map(record => (
                                                    <tr key={record.id}>
                                                        <td className="ps-4 fw-medium text-dark">{new Date(record.date).toLocaleDateString()}</td>
                                                        <td>
                                                            <span className={`badge px-2 py-1 ${record.status === 'Present' ? 'bg-success-subtle text-success' : record.status === 'Absent' ? 'bg-danger-subtle text-danger' : 'bg-warning-subtle text-warning'}`}>
                                                                {record.status}
                                                            </span>
                                                        </td>
                                                        <td className="small">{record.checkIn}</td>
                                                        <td className="small">{record.checkOut}</td>
                                                        <td className="text-center fw-bold small" style={{ color: '#16a085' }}>{record.workingHours}h</td>
                                                        <td className="pe-4 text-muted small">{record.reason || '-'}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="text-center py-4 text-muted">No attendance history found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </ScrollReveal>
                )}

                {/* 3. PAYROLL TAB */}
                {activeTab === 'payroll' && (
                    <>
                        <ScrollReveal className="mb-2">
                            <div className="card border-0 shadow-sm mx-2 mx-md-4" style={{ borderRadius: '12px' }}>
                                <div className="card-body py-2">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center gap-3">
                                            <button
                                                onClick={() => setSelectedEmployees(new Set(payrollData.filter(p => !p.isPaid).map(p => p.employee.id)))}
                                                className="btn btn-sm px-3"
                                                style={{ borderRadius: '8px', background: '#e8f8f5', color: '#16a085', border: '1px solid #16a085', fontWeight: 600, fontSize: '12px' }}
                                            >
                                                Select All Unpaid
                                            </button>
                                            <button
                                                onClick={() => setSelectedEmployees(new Set())}
                                                className="btn btn-sm btn-outline-secondary px-3"
                                                style={{ borderRadius: '8px', fontSize: '12px' }}
                                            >
                                                Clear
                                            </button>
                                            <div className="vr mx-2"></div>
                                            <span className="text-muted small">
                                                {selectedEmployees.size} staff selected
                                                {selectedEmployees.size > 0 && <span className="fw-bold text-success ms-2">(Total: {formatCurrency(selectedTotal)})</span>}
                                            </span>
                                        </div>
                                        <button
                                            disabled={selectedEmployees.size === 0}
                                            onClick={() => setShowBatchModal(true)}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 dark:shadow-none transition-all hover:scale-105 active:scale-95 d-flex align-items-center gap-2 border-0 disabled:opacity-50"
                                        >
                                            <Send size={14} /> Pay Selected
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        <div className="row g-2">
                            {payrollData.filter(item =>
                                item.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                item.employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
                            ).map(item => {
                                const isSelected = selectedEmployees.has(item.employee.id);
                                return (
                                    <div key={item.employee.id} className="col-md-6 col-lg-4">
                                        <div
                                            className={`card h-100 transition-all cursor-pointer ${isSelected ? 'shadow-lg' : 'shadow-sm hover:shadow-md'}`}
                                            onClick={() => toggleEmployeeSelection(item.employee.id)}
                                            style={{ borderRadius: '12px', border: isSelected ? '2px solid #16a085' : '2px solid transparent', background: isSelected ? '#e8f8f5' : '#fff' }}
                                        >
                                            <div className="card-body p-2">
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className={`rounded-circle d-flex align-items-center justify-content-center fw-bold`} style={{ width: 44, height: 44, background: isSelected ? '#16a085' : '#f0f0f0', color: isSelected ? '#fff' : '#888' }}>
                                                            {isSelected ? <Check size={24} color="white" /> : item.employee.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="fw-bold text-dark">{item.employee.name}</div>
                                                            <div className="badge bg-light text-muted small">{item.employee.department}</div>
                                                        </div>
                                                    </div>
                                                    {item.isPaid && <div className="badge bg-success text-white px-2 py-1"><Check size={12} /> Paid</div>}
                                                </div>

                                                <div className="row g-2 mb-3">
                                                    <div className="col-6">
                                                        <div className="bg-light p-2 rounded-3 text-center">
                                                            <div className="smaller text-muted">Attendance</div>
                                                            <div className="fw-bold text-dark">{item.daysAttended} Days</div>
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <div className="bg-light p-2 rounded-3 text-center">
                                                            <div className="smaller text-muted">Total Hours</div>
                                                            <div className="fw-bold text-dark">{item.totalHours}h</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-2 rounded-3 mb-2" style={{ background: '#e8f8f5' }}>
                                                    <div className="d-flex justify-content-between align-items-center mb-1 px-1">
                                                        <span className="smaller text-muted fw-bold">SALARY AMOUNT</span>
                                                        {customAmounts[item.employee.id] !== item.calculatedSalary && (
                                                            <span className="badge smaller" style={{ background: '#e8f8f5', color: '#16a085' }}>MODIFIED</span>
                                                        )}
                                                    </div>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <input
                                                            type="number"
                                                            className="form-control form-control-sm border-0 bg-white fw-bold p-2"
                                                            value={customAmounts[item.employee.id] || 0}
                                                            onChange={(e) => setCustomAmounts(prev => ({ ...prev, [item.employee.id]: Number(e.target.value) }))}
                                                            onClick={e => e.stopPropagation()}
                                                            disabled={item.isPaid}
                                                            style={{ borderRadius: '8px', color: '#16a085' }}
                                                        />
                                                        {!item.isPaid && customAmounts[item.employee.id] !== item.calculatedSalary && (
                                                            <button
                                                                className="btn btn-sm p-1 text-muted hover:text-teal-500"
                                                                onClick={(e) => { e.stopPropagation(); setCustomAmounts(prev => ({ ...prev, [item.employee.id]: item.calculatedSalary })); }}
                                                            >
                                                                <RotateCcw size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )}

                {/* 4. SITES TAB */}
                {activeTab === 'sites' && (
                    <SitesTab />
                )}

                {/* 5. CONTRACTS TAB */}
                {activeTab === 'contracts' && (
                    <ContractsTab />
                )}

                {/* 6. ASSIGNMENTS TAB */}
                {activeTab === 'assignments' && (
                    <AssignmentsTab />
                )}
            </div>

            {/* Modals */}
            <AddEmployeeModal
                isOpen={isAddModalOpen}
                initialData={editingEmployee}
                onClose={() => { setIsAddModalOpen(false); setEditingEmployee(null); }}
                onSuccess={() => loadEmployees()}
            />

            {/* Batch Payment Modal */}
            <Modal isOpen={showBatchModal} onClose={() => setShowBatchModal(false)} title="Batch Salary Disbursement" size="md" draggable={true}>
                <div className="p-2">
                    <div className="alert alert-info border-0 shadow-sm d-flex align-items-center gap-3 mb-4" style={{ borderRadius: '12px' }}>
                        <div className="bg-info text-white p-2 rounded-circle"><AlertCircle size={20} /></div>
                        <div>
                            <div className="fw-bold">Ready to pay {selectedEmployees.size} staff</div>
                            <div className="small">Total Disbursement: <span className="fw-bold">{formatCurrency(selectedTotal)}</span></div>
                        </div>
                    </div>

                    <label className="fw-bold text-muted small mb-2 d-block">CHOOSE PAYMENT METHOD</label>
                    <div className="row g-3 mb-4">
                        {PAYMENT_CHANNELS.map(ch => (
                            <div key={ch.id} className="col-12">
                                <div
                                    className={`p-3 border-2 cursor-pointer transition-all d-flex align-items-center justify-content-between ${batchChannel === ch.id ? '' : 'hover:bg-light'}`}
                                    onClick={() => setBatchChannel(ch.id)}
                                    style={{ borderRadius: '12px', border: batchChannel === ch.id ? '2px solid #16a085' : '2px solid #e9ecef', background: batchChannel === ch.id ? '#e8f8f5' : '' }}
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        <div className={`p-2 rounded-3 ${ch.bgColor} ${ch.color}`}><ch.icon size={20} /></div>
                                        <div>
                                            <div className="fw-bold text-dark">{ch.name}</div>
                                            <div className="smaller text-muted">{ch.description}</div>
                                        </div>
                                    </div>
                                    <div style={{ width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: batchChannel === ch.id ? '#16a085' : 'transparent', border: batchChannel === ch.id ? 'none' : '2px solid #ccc' }}>
                                        {batchChannel === ch.id && <Check size={14} color="white" />}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleBatchPay}
                        disabled={isBatchPaying}
                        className="btn w-100 py-2 fw-bold text-white"
                        style={{ borderRadius: '10px', background: '#16a085', border: 'none', fontSize: '14px' }}
                    >
                        {isBatchPaying ? <><RotateCcw className="spinning me-2" size={16} /> Processing...</> : <><Send size={16} className="me-2" /> Disburse {formatCurrency(selectedTotal)}</>}
                    </button>
                </div>
            </Modal>
            <style>{`
                .bg-emerald-600 { background-color: #0e6655 !important; }
                .text-white { color: #ffffff !important; }
                .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important; }
                .hover\:bg-light:hover { background-color: #f8f9fa !important; }
                .scale-102 { transform: scale(1.02); }
                .smaller { font-size: 0.75rem; }
                .spinning { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}


