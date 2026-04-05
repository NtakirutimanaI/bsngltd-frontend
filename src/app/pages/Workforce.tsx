import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import {
    Plus,
    Search,
    Filter,
    Edit2,
    Trash2,
    Eye,
    Send,
    Smartphone,
    Wifi,
    Download,
    AlertCircle,
    RotateCcw,
    Building2,
    CalendarDays,
    Users,
} from "lucide-react";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { PaginationSelector } from "@/app/components/ui/pagination-selector";
import { Modal } from "@/app/components/Modal";
import { fetchApi } from '../api/client';
import { useAuth } from "@/app/context/AuthContext";
import { useCurrency } from "@/app/context/CurrencyContext";
import { toast } from "sonner";
import { Badge } from "@/app/components/ui/badge";
import { AddEmployeeModal } from "@/app/components/AddEmployeeModal";
import { SitesTab } from "./workforce/SitesTab";
import { ContractsTab } from "./workforce/ContractsTab";
import { AssignmentsTab } from "./workforce/AssignmentsTab";
import { Check } from "lucide-react";
import { ExportReportModal } from "@/app/components/ExportReportModal";

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
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = (searchParams.get('tab') as 'directory' | 'attendance' | 'payroll' | 'sites' | 'contracts' | 'assignments') || 'directory';

    const setActiveTab = (tab: any) => {
        setSearchParams({ tab });
    };

    
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
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
            <ExportReportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} onExport={(format) => { toast.success(`Downloading ${format.toUpperCase()} report...`); }} />

            {/* Compact Stat Cards Replacement for Header */}
            <ScrollReveal className="row mb-3 px-2 px-md-4 pt-1">
                <div className="col-12">
                   <div className="d-flex align-items-center gap-3">
                        {/* Stat Card 1: Total Staff */}
                        <div className="glass-card p-2 px-3 rounded-xl border border-white shadow-sm d-flex align-items-center gap-3" style={{ background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)', minWidth: '180px' }}>
                            <div className="bg-primary bg-gradient rounded-lg p-2 text-white shadow-sm">
                                <Users size={18} />
                            </div>
                            <div>
                                <div className="fw-bold text-dark h5 mb-0">{totalItems}</div>
                                <div className="smaller text-muted fw-bold" style={{ fontSize: '10px' }}>TOTAL STAFF</div>
                            </div>
                        </div>

                        {/* Stat Card 2: Attendance */}
                        <div className="glass-card p-2 px-3 rounded-xl border border-white shadow-sm d-flex align-items-center gap-3" style={{ background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)', minWidth: '180px' }}>
                            <div className="bg-success bg-gradient rounded-lg p-2 text-white shadow-sm">
                                <Check size={18} />
                            </div>
                            <div>
                                <div className="fw-bold text-dark h5 mb-0">{Math.round(employees.reduce((s,e)=>s+(Number(e.status==='active')),0)/ (employees.length||1)*100)}%</div>
                                <div className="smaller text-muted fw-bold" style={{ fontSize: '10px' }}>AVG ATTENDANCE</div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="ms-auto d-flex gap-2">
                             {activeTab === 'directory' && isAdminOrManager && (
                                 <button
                                    onClick={() => { setEditingEmployee(null); setIsAddModalOpen(true); }}
                                    className="btn btn-sm d-flex align-items-center gap-2 text-white"
                                    style={{ background: '#009CFF', borderRadius: '8px', fontSize: '11px', fontWeight: 600, padding: '8px 16px', height: '32px' }}
                                >
                                    <Plus size={13} /> Add Staff
                                </button>
                            )}
                            <button
                                className="bg-white hover:bg-gray-50 text-gray-600 p-2 rounded-lg border shadow-sm transition-all hover:scale-105 active:scale-95 d-flex align-items-center justify-content-center"
                                onClick={() => setIsExportModalOpen(true)}
                            >
                                <Download size={16} />
                            </button>
                        </div>
                   </div>
                </div>
            </ScrollReveal>

            <div className="bg-light rounded mb-4 shadow-sm mx-2 mx-md-4 p-2">
                <div className="nav nav-pills p-1.5 gap-2 bg-white rounded-xl overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('directory')}
                        className={`nav-link flex-fill d-flex align-items-center justify-content-center gap-2 py-2.5 transition-all text-sm font-bold border-0 ${activeTab === 'directory' ? 'active' : 'text-gray-500 hover:text-primary'}`}
                        style={{ borderRadius: '10px' }}
                    >
                        <Users size={16} /> Personnel Roster
                    </button>
                    <button
                        onClick={() => setActiveTab('attendance')}
                        className={`nav-link flex-fill d-flex align-items-center justify-content-center gap-2 py-2.5 transition-all text-sm font-bold border-0 ${activeTab === 'attendance' ? 'active' : 'text-gray-500 hover:text-primary'}`}
                        style={{ borderRadius: '10px' }}
                    >
                        <i className="fa-solid fa-calendar-check"></i> Attendance Tracking
                    </button>
                    <button
                        onClick={() => setActiveTab('payroll')}
                        className={`nav-link flex-fill d-flex align-items-center justify-content-center gap-2 py-2.5 transition-all text-sm font-bold border-0 ${activeTab === 'payroll' ? 'active' : 'text-gray-500 hover:text-primary'}`}
                        style={{ borderRadius: '10px' }}
                    >
                        <i className="fa-solid fa-credit-card"></i> Payroll Processing
                    </button>
                    <button
                        onClick={() => setActiveTab('sites' as any)}
                        className={`nav-link flex-fill d-flex align-items-center justify-content-center gap-2 py-2.5 transition-all text-xs font-bold border-0 ${activeTab === 'sites' as any ? 'active' : 'text-gray-500 hover:text-primary'}`}
                        style={{ borderRadius: '10px', whiteSpace: 'nowrap' }}
                    >
                        <Building2 size={16} /> Sites
                    </button>
                    <button
                        onClick={() => setActiveTab('contracts' as any)}
                        className={`nav-link flex-fill d-flex align-items-center justify-content-center gap-2 py-2.5 transition-all text-xs font-bold border-0 ${activeTab === 'contracts' as any ? 'active' : 'text-gray-500 hover:text-primary'}`}
                        style={{ borderRadius: '10px', whiteSpace: 'nowrap' }}
                    >
                        <CalendarDays size={16} /> Contracts
                    </button>
                    <button
                        onClick={() => setActiveTab('assignments' as any)}
                        className={`nav-link flex-fill d-flex align-items-center justify-content-center gap-2 py-2.5 transition-all text-xs font-bold border-0 ${activeTab === 'assignments' as any ? 'active' : 'text-gray-500 hover:text-primary'}`}
                        style={{ borderRadius: '10px', whiteSpace: 'nowrap' }}
                    >
                        <Users size={16} /> Assignments
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <ScrollReveal className="mb-4">
                <div className="bg-light rounded p-4 shadow-sm mx-2 mx-md-4 border">
                    <div className="row g-2 align-items-center">
                        <div className="col-md-5">
                            <div className="position-relative">
                                <Search className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted" size={14} />
                                <input
                                    type="text"
                                    className="form-control ps-3 pe-5 bg-white py-1"
                                    placeholder="Search by name, ID or department..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ borderRadius: '5px', fontSize: '13px' }}
                                />
                            </div>
                        </div>
                        <div className="col-md-7 d-flex justify-content-md-end gap-2 align-items-center">
                            {activeTab === 'attendance' ? (
                                <input
                                    type="date"
                                    className="form-control border-1 bg-white"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    style={{ width: '160px', borderRadius: '5px', fontSize: '13px' }}
                                />
                            ) : (
                                <>
                                    <select
                                        className="form-select border-1 bg-white"
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                        style={{ width: '120px', borderRadius: '5px', fontSize: '13px' }}
                                    >
                                        {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                                    </select>
                                    <select
                                        className="form-select border-1 bg-white"
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                                        style={{ width: '100px', borderRadius: '5px', fontSize: '13px' }}
                                    >
                                        {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </>
                            )}
                            <button className="btn btn-primary p-2 d-flex align-items-center justify-content-center" style={{ borderRadius: '5px' }}>
                                <Filter size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </ScrollReveal>

            {/* Content Area */}
            <div className="tab-content mt-2 px-2 px-md-4">
                {/* 1. DIRECTORY TAB */}
                {activeTab === 'directory' && (
                    <ScrollReveal>
                        <div className="bg-light rounded p-4 shadow-sm h-100">
                            <div className="d-flex align-items-center justify-content-between mb-4">
                                <h6 className="mb-0 fw-bold">Staff Directory</h6>
                                <span className="text-muted small">Total: {totalItems} members</span>
                            </div>
                            <div className="table-responsive">
                                <table className="table text-start align-middle table-bordered table-hover mb-0">
                                    <thead className="bg-white">
                                        <tr className="text-dark">
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
                                                        <div className="rounded-circle fw-bold d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, backgroundColor: '#e8f8f5', color: '#009CFF', fontSize: '12px' }}>
                                                            {emp.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="fw-bold text-dark d-flex align-items-center gap-2" style={{ fontSize: '13px' }}>
                                                                {emp.name}
                                                                <Badge className="bg-blue-50 text-blue-600 border-0 px-1 py-0" style={{ fontSize: '8px' }}>EMPLOYEE</Badge>
                                                            </div>
                                                            <div className="text-muted smaller" style={{ fontSize: '10px' }}>ID: {emp.employeeId}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span
                                                        className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider"
                                                        style={{
                                                            backgroundColor: 'rgba(22, 160, 133, 0.12)',
                                                            color: '#009CFF',
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
                        <div className="bg-light rounded p-4 shadow-sm h-100">
                            <div className="d-flex align-items-center justify-content-between mb-4">
                                <h6 className="mb-0 fw-bold">Attendance Records</h6>
                                <span className="text-muted small">Date: {new Date(selectedDate).toLocaleDateString()}</span>
                            </div>
                            <div className="table-responsive">
                                {isAdminOrManager ? (
                                    <table className="table text-start align-middle table-bordered table-hover mb-0">
                                        <thead className="bg-white">
                                            <tr className="text-dark">
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
                                                                className="form-control form-control-sm border-1 bg-white"
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
                                                                style={{ borderRadius: '5px' }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="time"
                                                                className="form-control form-control-sm border-1 bg-white"
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
                                                                style={{ borderRadius: '5px' }}
                                                            />
                                                        </td>
                                                        <td className="text-center fw-bold" style={{ color: '#009CFF' }}>{record.workingHours || 0}h</td>
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
                                    <table className="table text-start align-middle table-bordered table-hover mb-0">
                                        <thead className="bg-white">
                                            <tr className="text-dark">
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
                                                            <span className={`badge px-2 py-1 ${record.status === 'Present' ? 'bg-success-api text-white' : record.status === 'Absent' ? 'bg-danger-api text-white' : 'bg-warning-api text-white'}`}>
                                                                {record.status}
                                                            </span>
                                                        </td>
                                                        <td className="small">{record.checkIn}</td>
                                                        <td className="small">{record.checkOut}</td>
                                                        <td className="text-center fw-bold small" style={{ color: '#009CFF' }}>{record.workingHours}h</td>
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
                        <ScrollReveal className="mb-4">
                            <div className="bg-light rounded p-4 shadow-sm mx-2 mx-md-4 border">
                                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <button
                                            onClick={() => setSelectedEmployees(new Set(payrollData.filter(p => !p.isPaid).map(p => p.employee.id)))}
                                            className="btn btn-sm btn-outline-primary px-3 fw-bold"
                                            style={{ borderRadius: '5px', fontSize: '13px' }}
                                        >
                                            Select All Unpaid
                                        </button>
                                        <button
                                            onClick={() => setSelectedEmployees(new Set())}
                                            className="btn btn-sm btn-outline-secondary px-3"
                                            style={{ borderRadius: '5px', fontSize: '13px' }}
                                        >
                                            Clear Selection
                                        </button>
                                        <div className="vr d-none d-md-block mx-2"></div>
                                        <span className="text-dark small fw-bold">
                                            {selectedEmployees.size} staff selected
                                            {selectedEmployees.size > 0 && <span className="ms-2 px-2 py-1 bg-white rounded border text-primary">{formatCurrency(selectedTotal)}</span>}
                                        </span>
                                    </div>
                                    <button
                                        disabled={selectedEmployees.size === 0}
                                        onClick={() => setShowBatchModal(true)}
                                        className="btn btn-primary px-5 py-2 rounded-xl text-sm font-bold shadow-lg d-flex align-items-center gap-2 border-0 disabled:opacity-50"
                                    >
                                        <Send size={14} /> Pay Selected
                                    </button>
                                </div>
                            </div>
                        </ScrollReveal>

                        <div className="row g-4 px-2 px-md-4">
                            {payrollData.filter(item =>
                                item.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                item.employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
                            ).map(item => {
                                const isSelected = selectedEmployees.has(item.employee.id);
                                return (
                                    <div key={item.employee.id} className="col-md-6 col-lg-4">
                                        <div
                                            className={`bg-light rounded p-4 h-100 transition-all cursor-pointer border ${isSelected ? 'border-primary' : ''}`}
                                            onClick={() => toggleEmployeeSelection(item.employee.id)}
                                            style={{ backgroundColor: isSelected ? 'rgba(0, 156, 255, 0.05)' : '#f8f9fa' }}
                                        >
                                            <div className="d-flex justify-content-between align-items-start mb-4">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className={`rounded-circle d-flex align-items-center justify-content-center fw-bold text-white shadow-sm`} style={{ width: 44, height: 44, background: isSelected ? '#009CFF' : '#6c757d' }}>
                                                        {isSelected ? <Check size={24} /> : item.employee.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold text-dark">{item.employee.name}</div>
                                                        <div className="text-muted small">ID: {item.employee.employeeId}</div>
                                                    </div>
                                                </div>
                                                {item.isPaid && <span className="badge bg-primary text-white px-3 py-1.5"><Check size={14} className="me-1" /> Paid</span>}
                                            </div>

                                            <div className="row g-2 mb-4">
                                                <div className="col-6">
                                                    <div className="bg-white p-3 rounded text-center border">
                                                        <div className="smaller text-muted fw-bold">ATTENDANCE</div>
                                                        <div className="fw-bold text-dark">{item.daysAttended} Days</div>
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <div className="bg-white p-3 rounded text-center border">
                                                        <div className="smaller text-muted fw-bold">TOTAL HOURS</div>
                                                        <div className="fw-bold text-dark">{item.totalHours}h</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-white p-3 rounded border">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <span className="smaller text-muted fw-bold">SALARY AMOUNT</span>
                                                    {customAmounts[item.employee.id] !== item.calculatedSalary && (
                                                        <span className="text-primary smaller fw-bold">MODIFIED</span>
                                                    )}
                                                </div>
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="input-group">
                                                        <span className="input-group-text bg-light border-0 py-1 px-2 text-primary fw-bold" style={{ fontSize: '13px' }}>RWF</span>
                                                        <input
                                                            type="number"
                                                            className="form-control border-0 bg-light fw-bold text-primary py-1"
                                                            value={customAmounts[item.employee.id] || 0}
                                                            onChange={(e) => setCustomAmounts(prev => ({ ...prev, [item.employee.id]: Number(e.target.value) }))}
                                                            onClick={e => e.stopPropagation()}
                                                            disabled={item.isPaid}
                                                            style={{ fontSize: '14px' }}
                                                        />
                                                    </div>
                                                    {!item.isPaid && customAmounts[item.employee.id] !== item.calculatedSalary && (
                                                        <button
                                                            className="btn btn-sm btn-light border p-1"
                                                            onClick={(e) => { e.stopPropagation(); setCustomAmounts(prev => ({ ...prev, [item.employee.id]: item.calculatedSalary })); }}
                                                        >
                                                            <RotateCcw size={14} />
                                                        </button>
                                                    )}
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
                                    style={{ borderRadius: '12px', border: batchChannel === ch.id ? '2px solid #009CFF' : '2px solid #e9ecef', background: batchChannel === ch.id ? '#e8f8f5' : '' }}
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        <div className={`p-2 rounded-3 ${ch.bgColor} ${ch.color}`}><ch.icon size={20} /></div>
                                        <div>
                                            <div className="fw-bold text-dark">{ch.name}</div>
                                            <div className="smaller text-muted">{ch.description}</div>
                                        </div>
                                    </div>
                                    <div style={{ width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: batchChannel === ch.id ? '#009CFF' : 'transparent', border: batchChannel === ch.id ? 'none' : '2px solid #ccc' }}>
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
                        style={{ borderRadius: '10px', background: '#009CFF', border: 'none', fontSize: '14px' }}
                    >
                        {isBatchPaying ? <><RotateCcw className="spinning me-2" size={16} /> Processing...</> : <><Send size={16} className="me-2" /> Disburse {formatCurrency(selectedTotal)}</>}
                    </button>
                </div>
            </Modal>
            <style>{`
                .spinning { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .bg-success-api { background-color: #00b894 !important; }
                .bg-danger-api { background-color: #ff7675 !important; }
                .bg-warning-api { background-color: #fab1a0 !important; }
            `}</style>
        </div>
    );
}


