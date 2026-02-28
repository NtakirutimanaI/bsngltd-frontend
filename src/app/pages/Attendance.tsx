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
    Settings,
    FileText,
    TrendingDown,
    TrendingUp,
    ShieldAlert,
    Clock,
    FileCheck
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
    status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'Paid Leave' | 'Unpaid Leave' | 'Holiday' | 'Weekend' | 'Overtime';
    checkIn: string;
    checkOut: string;
    workingHours: number;
    overtimeHours?: number;
    reason: string;
}

interface PayrollItem {
    employee: Employee;
    daysPresent: number;
    paidLeaves: number;
    unpaidLeaves: number;
    absences: number;
    halfDays: number;
    lateConversions: number;
    overtimeHours: number;
    payableDays: number;
    totalHours: number;
    calculatedSalary: number;
    absenceDeduction: number;
    leaveDeduction: number;
    overtimeAmount: number;
    currency: string;
    status?: string;
}

export function Attendance() {
    const { user } = useAuth();
    const { currency, formatPrice } = useCurrency();
    const [activeTab, setActiveTab] = useState<'daily_attendance' | 'monthly_summary' | 'salary_rules' | 'payroll' | 'financial_summary' | 'history'>('history');
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
    const isAdmin = ['super_admin', 'admin'].includes(roleName);
    const isSiteManager = ['site_manager'].includes(roleName);
    const isManager = ['manager'].includes(roleName);
    const isEmployee = roleName === 'employee';

    useEffect(() => {
        if (isAdmin || isSiteManager) {
            setActiveTab('daily_attendance');
        } else if (isManager) {
            setActiveTab('financial_summary');
        } else {
            setActiveTab('history');
        }
    }, [roleName]);

    useEffect(() => {
        if (['daily_attendance'].includes(activeTab)) {
            loadMarkingData();
        }
    }, [selectedDate, activeTab]);

    useEffect(() => {
        if (['payroll', 'financial_summary'].includes(activeTab)) {
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
                    overtimeHours: 0,
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
            const data = await fetchApi<any[]>(`/employees/payroll/calculate?month=${selectedMonth}&year=${selectedYear}`);
            // Mocking detailed breakdown if API doesn't provide it yet
            const enrichedData: PayrollItem[] = data.map(d => ({
                ...d,
                daysPresent: d.daysAttended || 22,
                paidLeaves: 0,
                unpaidLeaves: 0,
                absences: 0,
                halfDays: 0,
                lateConversions: 0,
                overtimeHours: 0,
                payableDays: d.daysAttended || 22,
                totalHours: d.totalHours || (22 * 8),
                absenceDeduction: 0,
                leaveDeduction: 0,
                overtimeAmount: 0,
                calculatedSalary: d.calculatedSalary || d.employee?.baseSalary || 0
            }));
            setPayrollData(enrichedData);
        } catch (err) {
            console.error(err);
        }
    };

    const loadMyData = async () => {
        if (!user?.email) return;
        try {
            const att = await fetchApi<AttendanceRecord[]>(`/employees/attendance/me?email=${user.email}`);
            setMyHistory(att);

            const payments = await fetchApi<any[]>(`/payments?type=salary&limit=50`);
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
            alert("Attendance configuration validated and saved!");
        } catch (err) {
            console.error(err);
            alert("Failed to save attendance");
        } finally {
            setIsSubmitting(false);
        }
    };

    const disburseSalary = async (item: PayrollItem) => {
        if (!confirm(`Are you sure you want to disburse salary of ${formatPrice(item.calculatedSalary)} to ${item.employee.name}?`)) return;

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
                    description: `Salary for ${selectedMonth}/${selectedYear}. Expected Days: ${item.payableDays}`,
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
    if (isAdmin || isSiteManager) {
        sidebarItems.push({ id: 'daily_attendance', name: 'Daily Attendance', icon: CalendarDays });
    }
    if (isSiteManager) {
        sidebarItems.push({ id: 'monthly_summary', name: 'Monthly Summary', icon: FileCheck });
    }
    if (isAdmin) {
        sidebarItems.push({ id: 'salary_rules', name: 'Salary Rules', icon: Settings });
        sidebarItems.push({ id: 'payroll', name: 'Payroll Processing', icon: CreditCard });
    }
    if (isAdmin || isManager) {
        sidebarItems.push({ id: 'financial_summary', name: 'Financial Summary', icon: DollarSign });
    }
    sidebarItems.push({ id: 'history', name: isEmployee ? 'My Attendance & Payments' : 'My History', icon: History });

    return (
        <div className="container-fluid p-0">
            <ScrollReveal>
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                        <h1 className="h3 fw-bold text-dark">Attendance & Payroll System</h1>
                        <p className="text-muted mt-1">Manage attendance scaling into financial reporting securely</p>
                    </div>
                    {(activeTab === 'daily_attendance' || activeTab === 'monthly_summary') && (isAdmin || isSiteManager) && (
                        <button
                            onClick={saveAttendance}
                            disabled={isSubmitting}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 dark:shadow-none transition-all hover:scale-105 active:scale-95 d-flex align-items-center gap-2 border-0"
                        >
                            <Save size={16} />
                            {isSubmitting ? 'Saving...' : 'Validate & Save'}
                        </button>
                    )}
                </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
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
                <div className="lg:col-span-4">
                    {activeTab === 'daily_attendance' && (isAdmin || isSiteManager) && (
                        <ScrollReveal delay={0.2} className="fade-in">
                            <div className="bg-white dark:bg-gray-800 border-0 shadow-sm rounded-xl mb-4 overflow-hidden">
                                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                                    <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
                                        <div className="d-flex align-items-center gap-3">
                                            <h5 className="mb-0 fw-bold me-2">Validate Daily Attendance</h5>
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
                                            <div className="bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 px-3 py-1.5 rounded-lg text-sm font-semibold d-flex align-items-center gap-2">
                                                <AlertCircle size={14} /> Exceptions: {Object.values(attendanceRecords).filter(r => ['Late', 'Half Day'].includes(r.status as string)).length}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2 mb-0">As a Site Manager, your validation confirms absences, overtimes, and leaves. This directly impacts employee salary calculation.</p>
                                </div>
                                <div className="table-responsive">
                                    <table className="table align-middle table-hover mb-0">
                                        <thead className="bg-gray-50 dark:bg-gray-900">
                                            <tr className="text-xs text-gray-500 text-uppercase fw-bold tracking-wider">
                                                <th className="ps-4 py-3">Employee</th>
                                                <th className="py-3">Status</th>
                                                <th className="py-3">Times</th>
                                                <th className="py-3">OT Hrs</th>
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
                                                                className={`form-select form-select-sm border border-gray-200 fw-semibold bg-white dark:bg-gray-800 rounded-lg py-1.5 
                                                                    ${record.status === 'Present' ? 'text-emerald-600' :
                                                                        record.status === 'Absent' ? 'text-red-600' :
                                                                            ['Late', 'Half Day'].includes(record.status || '') ? 'text-orange-600' :
                                                                                ['Paid Leave', 'Holiday', 'Weekend'].includes(record.status || '') ? 'text-blue-600' :
                                                                                    'text-gray-600'
                                                                    }`}
                                                                style={{ width: 130 }}
                                                                value={record.status}
                                                                onChange={(e) => handleStatusChange(emp.id, e.target.value)}
                                                            >
                                                                <option value="Present">Present</option>
                                                                <option value="Absent">Absent</option>
                                                                <option value="Late">Late</option>
                                                                <option value="Half Day">Half Day</option>
                                                                <option value="Paid Leave">Paid Leave</option>
                                                                <option value="Unpaid Leave">Unpaid Leave</option>
                                                                <option value="Overtime">Overtime</option>
                                                                <option value="Holiday">Holiday</option>
                                                                <option value="Weekend">Weekend</option>
                                                            </select>
                                                        </td>
                                                        <td className="py-3">
                                                            <div className="d-flex gap-2">
                                                                <input
                                                                    type="time"
                                                                    title="Check In"
                                                                    className="form-control form-control-sm border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg focus:ring-emerald-500 w-24"
                                                                    value={record.checkIn || ''}
                                                                    onChange={(e) => handleFieldChange(emp.id, 'checkIn', e.target.value)}
                                                                />
                                                                <input
                                                                    type="time"
                                                                    title="Check Out"
                                                                    className="form-control form-control-sm border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg focus:ring-emerald-500 w-24"
                                                                    value={record.checkOut || ''}
                                                                    onChange={(e) => handleFieldChange(emp.id, 'checkOut', e.target.value)}
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="py-3">
                                                            <input
                                                                type="number"
                                                                className="form-control form-control-sm border-gray-200 dark:border-gray-700 text-center fw-bold bg-white dark:bg-gray-800 focus:ring-emerald-500 text-gray-700 dark:text-gray-300 rounded-lg"
                                                                style={{ width: 60 }}
                                                                value={record.overtimeHours || 0}
                                                                onChange={(e) => handleFieldChange(emp.id, 'overtimeHours', Number(e.target.value))}
                                                            />
                                                        </td>
                                                        <td className="py-3 pe-4">
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg focus:ring-emerald-500"
                                                                placeholder="Reason for exception..."
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

                    {activeTab === 'monthly_summary' && isSiteManager && (
                        <ScrollReveal delay={0.2} className="fade-in">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 text-center">
                                <div className="mx-auto h-16 w-16 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                                    <FileCheck size={32} />
                                </div>
                                <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Submit Monthly Attendance Summary</h4>
                                <p className="text-gray-500 max-w-lg mx-auto mb-6">
                                    Before payroll processing, confirm total working days, absences, unpaid leaves, and overtime hours for the site. Approving this freezes attendance changes for the month.
                                </p>
                                <div className="max-w-md mx-auto grid grid-cols-2 gap-4 mb-6 text-start">
                                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                                        <div className="text-sm text-gray-500">Period</div>
                                        <div className="fw-bold">{new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}</div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                                        <div className="text-sm text-gray-500">Total Employees</div>
                                        <div className="fw-bold text-emerald-600">{employees.length} Active</div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                                        <div className="text-sm text-gray-500">Total Validated Days</div>
                                        <div className="fw-bold text-gray-800 dark:text-gray-200">1,245 Days</div>
                                    </div>
                                    <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl">
                                        <div className="text-sm text-red-500">Total Absences</div>
                                        <div className="fw-bold text-red-600">32 Days</div>
                                    </div>
                                </div>
                                <button className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 dark:shadow-none">
                                    Confirm & Freeze Attendance
                                </button>
                            </div>
                        </ScrollReveal>
                    )}

                    {activeTab === 'salary_rules' && isAdmin && (
                        <ScrollReveal delay={0.2} className="fade-in">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                    <h5 className="fw-bold mb-1 text-gray-900 dark:text-gray-100">Attendance to Salary Rules</h5>
                                    <p className="text-sm text-gray-500 mb-0">Configure the rules that affect payroll calculation and deductions.</p>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2"><Settings size={18} className="text-emerald-500" /> Base Configurations</h6>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="form-label text-sm fw-bold">Monthly Working Days Standard</label>
                                                    <input type="number" className="form-control" defaultValue={22} />
                                                    <small className="text-muted">Used for daily wage formula: Monthly Salary ÷ Working Days</small>
                                                </div>
                                                <div>
                                                    <label className="form-label text-sm fw-bold">Overtime Rate</label>
                                                    <select className="form-select">
                                                        <option>1.5x Hourly Rate</option>
                                                        <option>2.0x Hourly Rate</option>
                                                        <option>Custom Fixed Amount</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="form-label text-sm fw-bold">Late Penalty Policy</label>
                                                    <select className="form-select">
                                                        <option>3 Lates = 1/2 Day Deduction</option>
                                                        <option>1 Late = Fixed Amount Deduction</option>
                                                        <option>No Penalty</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2"><DollarSign size={18} className="text-emerald-500" /> Status Impact Mapping</h6>
                                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                                <table className="table table-sm mb-0">
                                                    <thead className="bg-gray-50 dark:bg-gray-900">
                                                        <tr>
                                                            <th className="px-3 py-2 text-xs">Status</th>
                                                            <th className="px-3 py-2 text-xs">Salary Impact</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="text-sm">
                                                        <tr><td className="px-3 py-2 fw-medium">Present</td><td className="px-3 py-2 text-emerald-600">Full day paid</td></tr>
                                                        <tr><td className="px-3 py-2 fw-medium">Late</td><td className="px-3 py-2 text-orange-500">Paid / Penalty after limit</td></tr>
                                                        <tr><td className="px-3 py-2 fw-medium">Half Day</td><td className="px-3 py-2 text-orange-500">50% paid</td></tr>
                                                        <tr><td className="px-3 py-2 fw-medium">Absent</td><td className="px-3 py-2 text-red-500">0 paid</td></tr>
                                                        <tr><td className="px-3 py-2 fw-medium">Paid Leave</td><td className="px-3 py-2 text-blue-500">100% paid</td></tr>
                                                        <tr><td className="px-3 py-2 fw-medium">Unpaid Leave</td><td className="px-3 py-2 text-red-500">0 paid</td></tr>
                                                        <tr><td className="px-3 py-2 fw-medium">Holiday</td><td className="px-3 py-2 text-emerald-600">Paid</td></tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 text-end">
                                        <button className="btn btn-primary bg-emerald-600 border-0 fw-bold px-4">Update Salary Rules</button>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    )}

                    {activeTab === 'payroll' && isAdmin && (
                        <ScrollReveal delay={0.2} className="fade-in">
                            <div className="d-flex align-items-center gap-4 mb-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                                <div>
                                    <label className="form-label text-xs fw-bold text-gray-500 uppercase tracking-wider mb-1">Processing Month</label>
                                    <div className="flex gap-2">
                                        <select
                                            className="form-select form-select-sm bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg fw-bold"
                                            value={selectedMonth}
                                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                        >
                                            <option value={1}>January</option>
                                            <option value={2}>February</option>
                                            <option value={3}>March</option>
                                            <option value={new Date().getMonth() + 1}>Current Month</option>
                                        </select>
                                        <select
                                            className="form-select form-select-sm w-24 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg fw-bold"
                                            value={selectedYear}
                                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                                        >
                                            <option value={2025}>2025</option>
                                            <option value={2026}>2026</option>
                                        </select>
                                    </div>
                                </div>
                                <button onClick={loadPayrollData} className="btn btn-sm btn-outline-success fw-bold mt-4">
                                    Calculate Payable Days
                                </button>
                                <div className="ms-auto mt-4 text-end">
                                    <button className="btn btn-sm btn-success fw-bold d-flex align-items-center gap-2">
                                        <FileText size={16} /> Export Final Sheet
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                <div className="table-responsive">
                                    <table className="table align-middle table-hover mb-0">
                                        <thead className="bg-gray-50 dark:bg-gray-900">
                                            <tr className="text-xs text-gray-500 text-uppercase fw-bold tracking-wider">
                                                <th className="ps-4 py-3">Employee</th>
                                                <th className="py-3 text-center">Base Salary</th>
                                                <th className="py-3 text-center" title="Days Present + Paid Leave">Payable Days</th>
                                                <th className="py-3 text-center text-red-500">Deductions</th>
                                                <th className="py-3 text-center text-emerald-500">Additions (OT)</th>
                                                <th className="py-3 text-end">Gross Salary</th>
                                                <th className="text-end pe-4 py-3">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {payrollData.map(item => (
                                                <tr key={item.employee.id} className="border-t border-gray-100 dark:border-gray-700">
                                                    <td className="ps-4 py-3">
                                                        <div className="fw-semibold text-gray-900 dark:text-gray-100">{item.employee.name}</div>
                                                        <div className="text-gray-500 text-xs">{item.employee.salaryType} • {item.employee.employeeId}</div>
                                                    </td>
                                                    <td className="py-3 text-center text-sm">{formatPrice(item.employee.baseSalary)}</td>
                                                    <td className="py-3 text-center">
                                                        <div className="fw-bold">{item.payableDays} <span className="text-xs fw-normal text-gray-500">/ 22</span></div>
                                                    </td>
                                                    <td className="py-3 text-center text-sm">
                                                        <div className="text-red-600">-{formatPrice(item.absenceDeduction + item.leaveDeduction)}</div>
                                                        <div className="text-xs text-gray-400">({item.absences} abs)</div>
                                                    </td>
                                                    <td className="py-3 text-center text-sm">
                                                        <div className="text-emerald-600">+{formatPrice(item.overtimeAmount)}</div>
                                                        <div className="text-xs text-gray-400">({item.overtimeHours} hrs)</div>
                                                    </td>
                                                    <td className="py-3 text-end">
                                                        <div className="fw-bold text-gray-900 dark:text-gray-100 text-lg">
                                                            {formatPrice(item.calculatedSalary)}
                                                        </div>
                                                    </td>
                                                    <td className="text-end pe-4 py-3">
                                                        <button
                                                            onClick={() => disburseSalary(item)}
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                                                        >
                                                            Approve & Pay
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

                    {activeTab === 'financial_summary' && (isAdmin || isManager) && (
                        <ScrollReveal delay={0.2} className="fade-in space-y-6">
                            {/* Site Level Financial Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                    <div className="text-sm text-gray-500 fw-bold mb-1">Total Salary Cost</div>
                                    <div className="text-2xl fw-bold text-gray-900 dark:text-white mb-2">{formatPrice(payrollData.reduce((s, c) => s + c.calculatedSalary, 0))}</div>
                                    <div className="text-xs text-emerald-600 d-flex align-items-center gap-1"><TrendingDown size={12} /> -2.4% from last month</div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                    <div className="text-sm text-gray-500 fw-bold mb-1">Total Deductions</div>
                                    <div className="text-2xl fw-bold text-red-600 mb-2">{formatPrice(payrollData.reduce((s, c) => s + c.absenceDeduction + c.leaveDeduction, 0))}</div>
                                    <div className="text-xs text-gray-500">From {payrollData.reduce((s, c) => s + c.absences, 0)} absences</div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                    <div className="text-sm text-gray-500 fw-bold mb-1">Overtime Cost</div>
                                    <div className="text-2xl fw-bold text-orange-500 mb-2">{formatPrice(payrollData.reduce((s, c) => s + c.overtimeAmount, 0))}</div>
                                    <div className="text-xs text-red-500 d-flex align-items-center gap-1"><TrendingUp size={12} /> +12% over budget</div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                    <div className="text-sm text-gray-500 fw-bold mb-1">Net Payable Days</div>
                                    <div className="text-2xl fw-bold text-emerald-600 mb-2">{payrollData.reduce((s, c) => s + c.payableDays, 0)}</div>
                                    <div className="text-xs text-gray-500">Across {payrollData.length} employees</div>
                                </div>
                            </div>

                            {/* Risk Indicators */}
                            <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-4">
                                <h6 className="fw-bold text-red-800 dark:text-red-400 d-flex align-items-center gap-2 mb-3">
                                    <ShieldAlert size={18} /> Financial Risk Indicators
                                </h6>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg">
                                        <div className="text-sm fw-bold text-gray-700 dark:text-gray-300">High Absenteeism Rate</div>
                                        <div className="text-lg fw-bold text-red-600 mt-1">4.2%</div>
                                        <div className="text-xs text-gray-500 mt-1">Cost Impact: {formatPrice(120000)} unutilized payload</div>
                                    </div>
                                    <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg">
                                        <div className="text-sm fw-bold text-gray-700 dark:text-gray-300">Excess Overtime</div>
                                        <div className="text-lg fw-bold text-orange-600 mt-1">Warning</div>
                                        <div className="text-xs text-gray-500 mt-1">Site B exceeding OT budget by 15%</div>
                                    </div>
                                    <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded-lg">
                                        <div className="text-sm fw-bold text-gray-700 dark:text-gray-300">Late Conversions</div>
                                        <div className="text-lg fw-bold text-yellow-600 mt-1">12 Actions</div>
                                        <div className="text-xs text-gray-500 mt-1">Resulting in 4 half-day deductions</div>
                                    </div>
                                </div>
                            </div>

                            {/* Monthly Salary Impact Report */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                                    <h5 className="fw-bold mb-0">Monthly Salary Impact Report (Per Employee)</h5>
                                </div>
                                <div className="table-responsive">
                                    <table className="table align-middle table-hover mb-0">
                                        <thead className="bg-gray-50 dark:bg-gray-900 text-xs text-gray-500 uppercase">
                                            <tr>
                                                <th className="ps-4 py-3">Employee</th>
                                                <th className="py-3 text-center">Working Days</th>
                                                <th className="py-3 text-center text-emerald-600">Present</th>
                                                <th className="py-3 text-center text-red-500">Absent / Unpaid</th>
                                                <th className="py-3 text-center text-orange-500">Late / Half</th>
                                                <th className="py-3 text-center">Overtime</th>
                                                <th className="py-3 text-end">Final Pay</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {payrollData.map(item => (
                                                <tr key={item.employee.id} className="border-t border-gray-100 dark:border-gray-700">
                                                    <td className="ps-4 py-3 fw-medium text-gray-900 dark:text-gray-100">{item.employee.name}</td>
                                                    <td className="py-3 text-center">22</td>
                                                    <td className="py-3 text-center fw-bold">{item.daysPresent} <span className="text-xs text-gray-400 font-normal">(+ {item.paidLeaves} PL)</span></td>
                                                    <td className="py-3 text-center fw-bold">{item.absences} <span className="text-xs text-gray-400 font-normal">(+ {item.unpaidLeaves} UL)</span></td>
                                                    <td className="py-3 text-center fw-bold">{item.lateConversions} L / {item.halfDays} HD</td>
                                                    <td className="py-3 text-center fw-bold">{item.overtimeHours}h</td>
                                                    <td className="py-3 text-end fw-bold text-gray-900 dark:text-gray-100">{formatPrice(item.calculatedSalary)}</td>
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
                                                        <div className="fw-bold text-gray-900 dark:text-gray-100 text-lg">{formatPrice(p.amount)}</div>
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
                </div>
            </div>
            <style>{`
                .fade-in { animation: fadeIn 0.3s ease-in-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}

