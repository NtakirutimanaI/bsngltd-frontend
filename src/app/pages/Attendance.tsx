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
    Users
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
    const [activeTab, setActiveTab] = useState<'marking' | 'payroll' | 'history'>('marking');
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

    return (
        <div className="container-fluid p-0">
            <ScrollReveal>
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                        <h1 className="h3 fw-bold text-dark">Attendance & Payroll</h1>
                        <p className="text-muted">Manage site attendance, hours, and salary disbursements</p>
                    </div>
                    {isAdminOrManager && activeTab === 'marking' && (
                        <button
                            onClick={saveAttendance}
                            disabled={isSubmitting}
                            className="btn btn-sm bg-orange-600 border-orange-600 text-white d-flex align-items-center gap-2 hover:bg-orange-700 transition-all"
                        >
                            <Save size={16} />
                            {isSubmitting ? 'Saving...' : 'Save Records'}
                        </button>
                    )}
                </div>
            </ScrollReveal>

            {/* Tabs */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white border-0 p-0 overflow-hidden">
                    <div className="nav nav-tabs border-0 flex-nowrap">
                        {isAdminOrManager && (
                            <>
                                <button
                                    onClick={() => setActiveTab('marking')}
                                    className={`nav-link border-0 py-3 px-4 fw-medium text-nowrap ${activeTab === 'marking' ? 'text-orange-600 border-bottom border-orange-600 border-2' : 'text-muted'}`}
                                >
                                    <CalendarDays size={18} className="me-2" />
                                    Site Attendance
                                </button>
                                <button
                                    onClick={() => setActiveTab('payroll')}
                                    className={`nav-link border-0 py-3 px-4 fw-medium text-nowrap ${activeTab === 'payroll' ? 'text-orange-600 border-bottom border-orange-600 border-2' : 'text-muted'}`}
                                >
                                    <CreditCard size={18} className="me-2" />
                                    Payroll Management
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`nav-link border-0 py-3 px-4 fw-medium text-nowrap ${activeTab === 'history' ? 'text-orange-600 border-bottom border-orange-600 border-2' : 'text-muted'}`}
                        >
                            <History size={18} className="me-2" />
                            {isAdminOrManager ? 'My History' : 'My Attendance & Payments'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-4">
                {activeTab === 'marking' && isAdminOrManager && (
                    <ScrollReveal delay={0.1}>
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-body py-3 border-bottom">
                                <div className="d-flex align-items-center justify-content-between gap-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <label className="small fw-bold text-muted text-uppercase mb-0">Select Date:</label>
                                        <input
                                            type="date"
                                            className="form-control form-control-sm"
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            style={{ width: '180px' }}
                                        />
                                    </div>
                                    <div className="d-flex gap-2">
                                        <div className="badge bg-success-subtle text-success p-2">
                                            <CheckCircle size={14} className="me-1" /> Present: {Object.values(attendanceRecords).filter(r => r.status === 'Present').length}
                                        </div>
                                        <div className="badge bg-danger-subtle text-danger p-2">
                                            <XCircle size={14} className="me-1" /> Absent: {Object.values(attendanceRecords).filter(r => r.status === 'Absent').length}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="table-responsive">
                                <table className="table align-middle table-hover mb-0">
                                    <thead className="table-light">
                                        <tr className="small text-uppercase fw-bold text-muted">
                                            <th className="ps-4">Employee</th>
                                            <th>Status</th>
                                            <th>Check In</th>
                                            <th>Check Out</th>
                                            <th>Hours</th>
                                            <th>Reason / Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {employees.map(emp => {
                                            const record = attendanceRecords[emp.id] || {};
                                            return (
                                                <tr key={emp.id}>
                                                    <td className="ps-4">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div className="avatar-sm bg-orange-100 text-orange-600 rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: 32, height: 32 }}>
                                                                {emp.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="fw-medium text-dark small">{emp.name}</div>
                                                                <div className="text-muted smaller" style={{ fontSize: 10 }}>{emp.employeeId}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <select
                                                            className={`form-select form-select-sm border-0 fw-medium ${record.status === 'Present' ? 'text-success' :
                                                                record.status === 'Absent' ? 'text-danger' :
                                                                    'text-warning'
                                                                }`}
                                                            style={{ width: 110, background: 'transparent' }}
                                                            value={record.status}
                                                            onChange={(e) => handleStatusChange(emp.id, e.target.value)}
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
                                                            className="form-control form-control-sm border-0 bg-light-subtle"
                                                            value={record.checkIn || ''}
                                                            onChange={(e) => handleFieldChange(emp.id, 'checkIn', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="time"
                                                            className="form-control form-control-sm border-0 bg-light-subtle"
                                                            value={record.checkOut || ''}
                                                            onChange={(e) => handleFieldChange(emp.id, 'checkOut', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            className="form-control form-control-sm border-0 text-center fw-bold bg-transparent"
                                                            style={{ width: 60 }}
                                                            value={record.workingHours || 0}
                                                            readOnly
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-sm border-0 border-bottom rounded-0"
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
                    <ScrollReveal delay={0.1}>
                        <div className="row g-4 mb-4">
                            <div className="col-md-4">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body">
                                        <h6 className="fw-bold mb-3">Filter Period</h6>
                                        <div className="row g-2">
                                            <div className="col-7">
                                                <select
                                                    className="form-select"
                                                    value={selectedMonth}
                                                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                                >
                                                    <option value={1}>January</option>
                                                    <option value={2}>February</option>
                                                    <option value={3}>March</option>
                                                    {/* ... */}
                                                    <option value={new Date().getMonth() + 1}>Current Month</option>
                                                </select>
                                            </div>
                                            <div className="col-5">
                                                <select
                                                    className="form-select"
                                                    value={selectedYear}
                                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                                >
                                                    <option value={2025}>2025</option>
                                                    <option value={2026}>2026</option>
                                                </select>
                                            </div>
                                        </div>
                                        <button onClick={loadPayrollData} className="btn btn-outline-primary w-100 mt-3 btn-sm">Refresh Calculation</button>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-8">
                                <div className="row g-3">
                                    <div className="col-sm-6">
                                        <div className="card border-0 bg-primary-subtle shadow-sm h-100">
                                            <div className="card-body d-flex align-items-center gap-3">
                                                <div className="rounded-circle bg-primary p-3">
                                                    <Users color="white" />
                                                </div>
                                                <div>
                                                    <div className="smaller text-primary fw-bold text-uppercase">Total Payroll Count</div>
                                                    <div className="h4 fw-bold mb-0">{payrollData.length} Employees</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-sm-6">
                                        <div className="card border-0 bg-success-subtle shadow-sm h-100">
                                            <div className="card-body d-flex align-items-center gap-3">
                                                <div className="rounded-circle bg-success p-3">
                                                    <DollarSign color="white" />
                                                </div>
                                                <div>
                                                    <div className="smaller text-success fw-bold text-uppercase">Est. Monthly Total</div>
                                                    <div className="h4 fw-bold mb-0">
                                                        {formatCurrency(payrollData.reduce((sum, p) => sum + p.calculatedSalary, 0))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card border-0 shadow-sm">
                            <div className="table-responsive">
                                <table className="table align-middle table-hover mb-0">
                                    <thead className="table-light">
                                        <tr className="small text-uppercase fw-bold text-muted">
                                            <th className="ps-4">Employee</th>
                                            <th>Pay Type</th>
                                            <th>Days Attended</th>
                                            <th>Total Hours</th>
                                            <th>Base Rate</th>
                                            <th>Calculated Salary</th>
                                            <th className="text-end pe-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payrollData.map(item => (
                                            <tr key={item.employee.id}>
                                                <td className="ps-4">
                                                    <div className="fw-bold text-dark">{item.employee.name}</div>
                                                    <div className="text-muted smaller">{item.employee.employeeId}</div>
                                                </td>
                                                <td><span className="badge bg-light text-dark text-capitalize">{item.employee.salaryType}</span></td>
                                                <td className="fw-medium">{item.daysAttended} days</td>
                                                <td className="text-muted">{item.totalHours} hrs</td>
                                                <td className="smaller">{formatCurrency(item.employee.baseSalary)}</td>
                                                <td>
                                                    <div className="fw-bold text-success">{formatCurrency(item.calculatedSalary)}</div>
                                                </td>
                                                <td className="text-end pe-4">
                                                    <button
                                                        onClick={() => disburseSalary(item)}
                                                        className="btn btn-primary btn-sm rounded-pill px-3 py-1 smaller"
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
                    <div className="row g-4">
                        <div className="col-lg-8">
                            <ScrollReveal delay={0.1} className="card border-0 shadow-sm mb-4">
                                <div className="card-header bg-white border-0 py-3">
                                    <h5 className="fw-bold mb-0">My Attendance History</h5>
                                </div>
                                <div className="table-responsive">
                                    <table className="table align-middle mb-0">
                                        <thead className="table-light">
                                            <tr className="smaller text-uppercase fw-bold text-muted">
                                                <th className="ps-4">Date</th>
                                                <th>Status</th>
                                                <th>Hours</th>
                                                <th>Check In/Out</th>
                                                <th>Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {myHistory.map((h, i) => (
                                                <tr key={i}>
                                                    <td className="ps-4 fw-medium small">{h.date}</td>
                                                    <td>
                                                        <span className={`badge ${h.status === 'Present' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                                            {h.status}
                                                        </span>
                                                    </td>
                                                    <td className="fw-bold">{h.workingHours}h</td>
                                                    <td className="smaller text-muted">{h.checkIn} - {h.checkOut}</td>
                                                    <td className="smaller font-italic text-muted">{h.reason || '-'}</td>
                                                </tr>
                                            ))}
                                            {myHistory.length === 0 && (
                                                <tr><td colSpan={5} className="text-center py-4 text-muted">No attendance records found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </ScrollReveal>
                        </div>
                        <div className="col-lg-4">
                            <ScrollReveal delay={0.2} className="card border-0 shadow-sm border-start border-success border-4 h-100">
                                <div className="card-header bg-white border-0 py-3 d-flex justify-content-between">
                                    <h5 className="fw-bold mb-0">Payment Records</h5>
                                    <CreditCard className="text-success" />
                                </div>
                                <div className="card-body p-0">
                                    <div className="list-group list-group-flush">
                                        {myPayments.map((p, i) => (
                                            <div key={i} className="list-group-item border-0 border-bottom p-3">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <div className="fw-bold text-dark">{formatCurrency(p.amount)}</div>
                                                        <div className="smaller text-muted">{p.date}</div>
                                                    </div>
                                                    <span className="badge bg-success">Paid</span>
                                                </div>
                                                <div className="smaller text-muted mt-2">{p.description}</div>
                                            </div>
                                        ))}
                                        {myPayments.length === 0 && (
                                            <div className="p-4 text-center">
                                                <AlertCircle className="text-muted mx-auto mb-2" />
                                                <p className="smaller text-muted">No payment records related to attendance found yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </ScrollReveal>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
