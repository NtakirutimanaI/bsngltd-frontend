import { useState, useEffect } from "react";
import {
    CalendarDays,
    CheckCircle,
    XCircle,
    AlertCircle,
    Save,
    CreditCard,
    History,
    DollarSign,
    Users,
    Settings
} from "lucide-react";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { fetchApi } from '../api/client';
import { useAuth } from "@/app/context/AuthContext";
import { useCurrency } from "@/app/context/CurrencyContext";

interface Employee {
    id: string;
    employeeId: string;
    name: string;
    salaryType: string;
    baseSalary: number;
}

interface AttendanceRecord {
    id?: string;
    employeeId: string;
    employee?: Employee;
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
    status?: string;
}

export function Attendance() {
    const { user } = useAuth();
    const { currency } = useCurrency();
    const [activeTab, setActiveTab] = useState<'marking' | 'payroll' | 'history' | 'content'>('marking');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<Record<string, Partial<AttendanceRecord>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [payrollData, setPayrollData] = useState<PayrollItem[]>([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [myHistory, setMyHistory] = useState<AttendanceRecord[]>([]);
    const [myPayments, setMyPayments] = useState<any[]>([]);

    const roleName = ((typeof user?.role === 'object' && user.role !== null) ? user.role.name : user?.role || 'guest').toLowerCase();
    const isAdminOrManager = ['super_admin', 'admin', 'manager', 'site_manager'].includes(roleName);
    const isEmployee = roleName === 'employee';

    useEffect(() => {
        if (isEmployee) {
            setActiveTab('history');
        }
    }, [roleName]);

    // Load employees and current date's attendance
    useEffect(() => {
        if (isAdminOrManager && activeTab === 'marking') {
            loadMarkingData();
        }
    }, [selectedDate, activeTab]);

    useEffect(() => {
        if (isAdminOrManager && activeTab === 'payroll') {
            loadPayrollData();
        }
    }, [selectedMonth, selectedYear, activeTab]);

    useEffect(() => {
        if (activeTab === 'history') {
            loadMyData();
        }
    }, [activeTab, user]);

    const loadMarkingData = async () => {
        try {
            const empRes = await fetchApi<any>('/employees?limit=100');
            const emps = empRes.data || [];
            setEmployees(emps);

            const attRes = await fetchApi<AttendanceRecord[]>(`/employees/attendance/all?date=${selectedDate}`);
            const attMap: Record<string, Partial<AttendanceRecord>> = {};

            emps.forEach((emp: Employee) => {
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
        } catch (err) {
            console.error(err);
        }
    };

    const loadPayrollData = async () => {
        try {
            const data = await fetchApi<PayrollItem[]>(`/employees/payroll/calculate?month=${selectedMonth}&year=${selectedYear}`);
            setPayrollData(data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadMyData = async () => {
        if (!user?.email) return;
        try {
            const att = await fetchApi<AttendanceRecord[]>(`/employees/attendance/me?email=${user.email}`);
            setMyHistory(att);

            // Also fetch payment history related to salaries
            const payments = await fetchApi<any[]>(`/payments?type=salary&limit=50`); // Ideally filtered by payee name/email
            setMyPayments(payments.filter(p => p.payee?.includes(user.fullName || user.name)));
        } catch (err) {
            console.error(err);
        }
    };

    const handleStatusChange = (empId: string, status: any) => {
        setAttendanceRecords(prev => ({
            ...prev,
            [empId]: { ...prev[empId], status }
        }));
    };

    const handleFieldChange = (empId: string, field: string, value: any) => {
        setAttendanceRecords(prev => {
            const updated = { ...prev[empId], [field]: value };
            // Recalculate hours if checkin/checkout changed (simple logic)
            if (field === 'checkIn' || field === 'checkOut') {
                const [h1, m1] = (updated.checkIn || '00:00').split(':').map(Number);
                const [h2, m2] = (updated.checkOut || '00:00').split(':').map(Number);
                const hours = (h2 + m2 / 60) - (h1 + m1 / 60);
                updated.workingHours = Math.max(0, Number(hours.toFixed(2)));
            }
            return { ...prev, [empId]: updated };
        });
    };

    const saveAttendance = async () => {
        setIsSubmitting(true);
        try {
            for (const empId in attendanceRecords) {
                await fetchApi('/employees/attendance', {
                    method: 'POST',
                    body: JSON.stringify(attendanceRecords[empId])
                });
            }
            alert("Attendance saved successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to save attendance");
        } finally {
            setIsSubmitting(false);
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

    const disburseSalary = async (item: PayrollItem) => {
        if (!confirm(`Are you sure you want to disburse salary of ${formatCurrency(item.calculatedSalary)} to ${item.employee.name}?`)) return;

        try {
            await fetchApi('/payments', {
                method: 'POST',
                body: JSON.stringify({
                    code: `SAL-${item.employee.employeeId}-${selectedMonth}-${selectedYear}`,
                    amount: item.calculatedSalary,
                    type: 'salary',
                    status: 'paid',
                    method: 'bank_transfer',
                    date: new Date().toISOString().split('T')[0],
                    description: `Salary for ${selectedMonth}/${selectedYear} based on ${item.daysAttended} days attended.`,
                    payee: item.employee.name,
                    payer: 'BSNG Construction'
                })
            });
            alert(`Salary disbursed to ${item.employee.name}`);
        } catch (err) {
            console.error(err);
            alert("Disbursement failed");
        }
    };

    const sidebarItems = [];
    if (isAdminOrManager) {
        sidebarItems.push({ id: 'marking', name: 'Site Attendance', icon: CalendarDays });
        sidebarItems.push({ id: 'payroll', name: 'Payroll Management', icon: CreditCard });
    }
    sidebarItems.push({ id: 'history', name: isAdminOrManager ? 'My History' : 'My Attendance & Payments', icon: History });
    if (isAdminOrManager) {
        sidebarItems.push({ id: 'content', name: 'Content Management', icon: Settings });
    }

    return (
        <div className="container-fluid p-0">
            <ScrollReveal>
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                        <h1 className="h3 fw-bold text-dark">Attendance Center</h1>
                        <p className="text-muted mt-1">Manage site attendance, hours, salary disbursements, and policies</p>
                    </div>
                    {isAdminOrManager && activeTab === 'marking' && (
                        <button
                            onClick={saveAttendance}
                            disabled={isSubmitting}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 dark:shadow-none transition-all hover:scale-105 active:scale-95 d-flex align-items-center gap-2 border-0"
                        >
                            <Save size={16} />
                            {isSubmitting ? 'Saving...' : 'Save Records'}
                        </button>
                    )}
                </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <ScrollReveal delay={0.1} className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2 h-fit sticky top-24">
                        {sidebarItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as any)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === item.id
                                    ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-semibold"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/20"
                                    }`}
                            >
                                <item.icon size={20} />
                                <span>{item.name}</span>
                            </button>
                        ))}
                    </div>
                </ScrollReveal>

                {/* Content Panel */}
                <div className="lg:col-span-3">
                    {activeTab === 'marking' && isAdminOrManager && (
                        <ScrollReveal delay={0.2} className="fade-in">
                            <div className="bg-white dark:bg-gray-800 border-0 shadow-sm rounded-xl mb-4 overflow-hidden">
                                <div className="card-body p-4 border-b border-gray-100 dark:border-gray-700">
                                    <div className="d-flex align-items-center justify-content-between gap-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <label className="text-sm fw-bold text-gray-500 text-uppercase mb-0 tracking-wider">Select Date:</label>
                                            <input
                                                type="date"
                                                className="form-control form-control-sm bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-emerald-500 font-medium"
                                                value={selectedDate}
                                                onChange={(e) => setSelectedDate(e.target.value)}
                                                style={{ width: '180px' }}
                                            />
                                        </div>
                                        <div className="d-flex gap-2">
                                            <div className="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg text-sm font-semibold d-flex align-items-center gap-2">
                                                <CheckCircle size={14} /> Present: {Object.values(attendanceRecords).filter(r => r.status === 'Present').length}
                                            </div>
                                            <div className="bg-red-50 text-red-600 dark:bg-red-900/20 px-3 py-1.5 rounded-lg text-sm font-semibold d-flex align-items-center gap-2">
                                                <XCircle size={14} /> Absent: {Object.values(attendanceRecords).filter(r => r.status === 'Absent').length}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="table-responsive">
                                    <table className="table align-middle table-hover mb-0">
                                        <thead className="bg-gray-50 dark:bg-gray-900">
                                            <tr className="text-xs text-gray-500 text-uppercase fw-bold tracking-wider">
                                                <th className="ps-4 py-3">Employee</th>
                                                <th className="py-3">Status</th>
                                                <th className="py-3">Check In</th>
                                                <th className="py-3">Check Out</th>
                                                <th className="py-3">Hours</th>
                                                <th className="py-3">Reason / Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {employees.map(emp => {
                                                const record = attendanceRecords[emp.id] || {};
                                                return (
                                                    <tr key={emp.id} className="border-t border-gray-100 dark:border-gray-700">
                                                        <td className="ps-4 py-3">
                                                            <div className="d-flex align-items-center gap-3">
                                                                <div className="h-10 w-10 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 rounded-full d-flex align-items-center justify-content-center fw-bold text-lg">
                                                                    {emp.name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <div className="fw-semibold text-gray-900 dark:text-gray-100 text-sm">{emp.name}</div>
                                                                    <div className="text-gray-500 text-xs">{emp.employeeId}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3">
                                                            <select
                                                                className={`form-select form-select-sm border-0 fw-semibold bg-gray-50 dark:bg-gray-900 rounded-lg py-1.5 ${record.status === 'Present' ? 'text-emerald-600' :
                                                                    record.status === 'Absent' ? 'text-red-500' :
                                                                        'text-emerald-500'
                                                                    }`}
                                                                style={{ width: 110 }}
                                                                value={record.status}
                                                                onChange={(e) => handleStatusChange(emp.id, e.target.value)}
                                                            >
                                                                <option value="Present">Present</option>
                                                                <option value="Absent">Absent</option>
                                                                <option value="Late">Late</option>
                                                                <option value="Leave">Leave</option>
                                                            </select>
                                                        </td>
                                                        <td className="py-3">
                                                            <input
                                                                type="time"
                                                                className="form-control form-control-sm border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg focus:ring-emerald-500"
                                                                value={record.checkIn || ''}
                                                                onChange={(e) => handleFieldChange(emp.id, 'checkIn', e.target.value)}
                                                            />
                                                        </td>
                                                        <td className="py-3">
                                                            <input
                                                                type="time"
                                                                className="form-control form-control-sm border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg focus:ring-emerald-500"
                                                                value={record.checkOut || ''}
                                                                onChange={(e) => handleFieldChange(emp.id, 'checkOut', e.target.value)}
                                                            />
                                                        </td>
                                                        <td className="py-3">
                                                            <input
                                                                type="number"
                                                                className="form-control form-control-sm border-0 text-center fw-bold bg-transparent text-gray-700 dark:text-gray-300"
                                                                style={{ width: 60 }}
                                                                value={record.workingHours || 0}
                                                                readOnly
                                                            />
                                                        </td>
                                                        <td className="py-3 pe-4">
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg focus:ring-emerald-500"
                                                                placeholder="Notes..."
                                                                value={record.reason || ''}
                                                                onChange={(e) => handleFieldChange(emp.id, 'reason', e.target.value)}
                                                            />
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </ScrollReveal>
                    )}

                    {activeTab === 'payroll' && isAdminOrManager && (
                        <ScrollReveal delay={0.2} className="fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                                    <h6 className="fw-bold mb-3 text-gray-800 dark:text-gray-200">Filter Period</h6>
                                    <div className="flex gap-2">
                                        <select
                                            className="form-select flex-1 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-emerald-500 text-sm"
                                            value={selectedMonth}
                                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                        >
                                            <option value={1}>January</option>
                                            <option value={2}>February</option>
                                            <option value={3}>March</option>
                                            {/* ... */}
                                            <option value={new Date().getMonth() + 1}>Current Month</option>
                                        </select>
                                        <select
                                            className="form-select w-32 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-emerald-500 text-sm"
                                            value={selectedYear}
                                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                                        >
                                            <option value={2025}>2025</option>
                                            <option value={2026}>2026</option>
                                        </select>
                                    </div>
                                    <button onClick={loadPayrollData} className="w-full mt-3 py-2 px-4 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg font-semibold text-sm transition-colors">
                                        Refresh Calculation
                                    </button>
                                </div>
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl shadow-sm border border-emerald-100 dark:border-emerald-900/30 p-4 flex items-center gap-4">
                                    <div className="h-12 w-12 bg-emerald-600 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm">
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <div className="text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">Total Payroll Count</div>
                                        <div className="text-2xl fw-bold text-gray-900 dark:text-white">{payrollData.length} <span className="text-sm font-normal text-gray-500">Employees</span></div>
                                    </div>
                                </div>
                                <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl shadow-sm border border-emerald-100 dark:border-emerald-900/20 p-4 flex items-center gap-4">
                                    <div className="h-12 w-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm">
                                        <DollarSign size={24} />
                                    </div>
                                    <div>
                                        <div className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">Est. Monthly Total</div>
                                        <div className="text-2xl fw-bold text-gray-900 dark:text-white">
                                            {formatCurrency(payrollData.reduce((sum, p) => sum + p.calculatedSalary, 0))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                <div className="table-responsive">
                                    <table className="table align-middle table-hover mb-0">
                                        <thead className="bg-gray-50 dark:bg-gray-900">
                                            <tr className="text-xs text-gray-500 text-uppercase fw-bold tracking-wider">
                                                <th className="ps-4 py-3">Employee</th>
                                                <th className="py-3">Pay Type</th>
                                                <th className="py-3">Days Attended</th>
                                                <th className="py-3">Total Hours</th>
                                                <th className="py-3">Base Rate</th>
                                                <th className="py-3">Calculated Salary</th>
                                                <th className="text-end pe-4 py-3">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {payrollData.map(item => (
                                                <tr key={item.employee.id} className="border-t border-gray-100 dark:border-gray-700">
                                                    <td className="ps-4 py-3">
                                                        <div className="fw-semibold text-gray-900 dark:text-gray-100">{item.employee.name}</div>
                                                        <div className="text-gray-500 text-xs">{item.employee.employeeId}</div>
                                                    </td>
                                                    <td className="py-3">
                                                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs fw-semibold text-capitalize">
                                                            {item.employee.salaryType}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 fw-medium text-gray-700 dark:text-gray-300">{item.daysAttended} days</td>
                                                    <td className="py-3 text-gray-500 text-sm">{item.totalHours} hrs</td>
                                                    <td className="py-3 text-xs text-gray-500">{formatCurrency(item.employee.baseSalary)}</td>
                                                    <td className="py-3">
                                                        <div className="fw-bold text-emerald-600">{formatCurrency(item.calculatedSalary)}</div>
                                                    </td>
                                                    <td className="text-end pe-4 py-3">
                                                        <button
                                                            onClick={() => disburseSalary(item)}
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95 border-0 shadow-sm"
                                                        >
                                                            Disburse
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </ScrollReveal>
                    )}

                    {activeTab === 'history' && (
                        <ScrollReveal delay={0.2} className="fade-in">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                                            <h5 className="fw-bold mb-0 text-gray-900 dark:text-gray-100">My Attendance History</h5>
                                        </div>
                                        <div className="table-responsive">
                                            <table className="table align-middle mb-0">
                                                <thead className="bg-gray-50 dark:bg-gray-900">
                                                    <tr className="text-xs text-gray-500 text-uppercase fw-bold tracking-wider">
                                                        <th className="ps-4 py-3">Date</th>
                                                        <th className="py-3">Status</th>
                                                        <th className="py-3">Hours</th>
                                                        <th className="py-3">Check In/Out</th>
                                                        <th className="py-3">Notes</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {myHistory.map((h, i) => (
                                                        <tr key={i} className="border-t border-gray-100 dark:border-gray-700">
                                                            <td className="ps-4 py-3 fw-medium text-sm text-gray-800 dark:text-gray-200">{h.date}</td>
                                                            <td className="py-3">
                                                                <span className={`px-2 py-1 rounded-md text-xs font-semibold ${h.status === 'Present' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-red-50 text-red-600 dark:bg-red-900/20'}`}>
                                                                    {h.status}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 fw-bold text-gray-700 dark:text-gray-300">{h.workingHours}h</td>
                                                            <td className="py-3 text-xs text-gray-500">{h.checkIn} - {h.checkOut}</td>
                                                            <td className="py-3 text-xs italic text-gray-500">{h.reason || '-'}</td>
                                                        </tr>
                                                    ))}
                                                    {myHistory.length === 0 && (
                                                        <tr><td colSpan={5} className="text-center py-8 text-gray-500">No attendance records found.</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <div className="lg:col-span-1">
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-l-4 border-emerald-500 overflow-hidden h-full">
                                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 d-flex justify-content-between items-center">
                                            <h5 className="fw-bold mb-0 text-gray-900 dark:text-gray-100">Payment Records</h5>
                                            <CreditCard className="text-emerald-500 h-5 w-5" />
                                        </div>
                                        <div className="p-0">
                                            {myPayments.map((p, i) => (
                                                <div key={i} className="p-4 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                                        <div className="fw-bold text-gray-900 dark:text-gray-100 text-lg">{formatCurrency(p.amount)}</div>
                                                        <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded">Paid</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mb-2">{p.date}</div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">{p.description}</div>
                                                </div>
                                            ))}
                                            {myPayments.length === 0 && (
                                                <div className="p-8 text-center flex flex-col items-center justify-center">
                                                    <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                                                        <AlertCircle className="text-gray-400 h-6 w-6" />
                                                    </div>
                                                    <p className="text-sm text-gray-500">No payment records found.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    )}

                    {activeTab === 'content' && isAdminOrManager && (
                        <ScrollReveal delay={0.2} className="fade-in">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 text-center">
                                <div className="mx-auto h-16 w-16 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                                    <Settings size={32} />
                                </div>
                                <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Content Management Settings</h4>
                                <p className="text-gray-500 max-w-md mx-auto">
                                    Manage attendance policies, shift timings, holiday calendars, and global settings for all employees.
                                </p>
                                <div className="mt-6 flex justify-center gap-4">
                                    <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors">
                                        Configure Shifts
                                    </button>
                                    <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                        Holiday Calendar
                                    </button>
                                </div>
                            </div>
                        </ScrollReveal>
                    )}
                </div>
            </div>
            <style>{`
                .fade-in { animation: fadeIn 0.3s ease-in-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}

