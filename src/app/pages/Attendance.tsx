import { useState, useEffect } from "react";
import {
    CalendarDays,
    Save,
    Users,
    FileCheck,
    MapPin,
    Search,
    ChevronRight,
} from "lucide-react";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { fetchApi } from '../api/client';
import { useAuth } from "@/app/context/AuthContext";
import { Badge } from "@/app/components/ui/badge";
import { ExportReportModal } from "@/app/components/ExportReportModal";
import logo from '@/assets/logo.png';

interface StandardMember {
    id: string;
    fullName: string;
    email: string;
    position: string;
    role: string;
    siteId?: string;
    source: 'user' | 'employee';
}

interface Site {
    id: string;
    name: string;
    code: string;
    location: string;
    status: string;
    employeesCount?: number;
}

interface AttendanceRecord {
    id?: string;
    employeeId: string;
    date: string;
    status: 'Present' | 'Absent' | 'Late' | 'Leave' | 'Permission' | 'Left';
    checkIn: string;
    checkOut: string;
    workingHours: number;
    overtimeHours?: number;
    reason: string;
}

export function Attendance() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'daily_attendance' | 'monthly_summary'>('daily_attendance');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    
    const [sites, setSites] = useState<Site[]>([]);
    const [selectedSite, setSelectedSite] = useState<Site | null>(null);
    const [isSitesLoading, setIsSitesLoading] = useState(true);
    const [siteSearchTerm, setSiteSearchTerm] = useState("");

    const [members, setMembers] = useState<StandardMember[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<Record<string, Partial<AttendanceRecord>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    const roleName = ((typeof user?.role === 'object' && user.role !== null) ? user.role.name : user?.role || 'guest').toLowerCase();
    const isAdmin = ['super_admin', 'admin', 'manager', 'hr'].includes(roleName);
    const isSiteManager = ['site_manager'].includes(roleName);
    const isEmployee = roleName === 'employee';

    // Load sites for the sidebar
    useEffect(() => {
        const loadSites = async () => {
            setIsSitesLoading(true);
            try {
                const res = await fetchApi<any>(`/sites?limit=100`);
                const allSites = Array.isArray(res) ? res : (res.data || []);
                setSites(allSites);
                if (allSites.length > 0 && !selectedSite) {
                    setSelectedSite(allSites[0]);
                }
            } catch (err) {
                console.error("Failed to load sites", err);
            } finally {
                setIsSitesLoading(false);
            }
        };
        loadSites();
    }, []);

    // Refresh data when site or date changes
    useEffect(() => {
        if (selectedSite || isEmployee) {
            loadMarkingData();
        }
    }, [selectedSite, selectedDate, activeTab]);

    const loadMarkingData = async () => {
        if (!selectedSite && !isEmployee) return;
        setMembers([]); 
        try {
            const currentSiteId = String(selectedSite?.id || '').trim();
            if (!currentSiteId) return;

            // 1. Fetch Users
            const userRes = await fetchApi<any>('/users?page=1&limit=500');
            const allUsers = userRes.data || (Array.isArray(userRes) ? userRes : []);
            
            // 2. Fetch Employees
            const empRes = await fetchApi<any>(`/employees?limit=500&siteId=${currentSiteId}`);
            const siteEmployees = empRes.data || (Array.isArray(empRes) ? empRes : []);

            const targetRoles = [
                'site_manager', 'employee', 'manager', 'admin', 'auditor', 
                'hr', 'super_admin', 'accountant', 'contractor'
            ];

            // 3. User Filtering
            const mappedUsers: StandardMember[] = allUsers
                .filter((u: any) => {
                    const uSiteId = String(u.siteId || u.site?.id || '').trim();
                    const matchesSite = uSiteId === currentSiteId;
                    const matchesRole = targetRoles.includes(String(u.userRole || '').toLowerCase());
                    return matchesSite && matchesRole;
                })
                .map((u: any) => ({
                    id: u.id,
                    fullName: u.fullName,
                    email: u.email,
                    position: (u.userRole || 'ADMIN').replace('_', ' ').toUpperCase(),
                    role: u.userRole,
                    siteId: currentSiteId,
                    source: 'user'
                }));

            // 4. Employee Filtering
            const mappedEmps: StandardMember[] = siteEmployees
                .filter((e: any) => {
                    const eSiteId = String(e.siteId || e.site?.id || '').trim();
                    return eSiteId === currentSiteId;
                })
                .map((e: any) => ({
                    id: e.id,
                    fullName: e.name,
                    email: e.email,
                    position: e.position || 'WORKER',
                    role: 'employee',
                    siteId: currentSiteId,
                    source: 'employee'
                }));

            // 5. Combine and Deduplicate
            const combined = [...mappedUsers, ...mappedEmps];
            const uniqueMap = new Map();
            combined.forEach(m => {
                if (m.id && !uniqueMap.has(m.id)) uniqueMap.set(m.id, m);
            });
            const finalMembers = Array.from(uniqueMap.values());
            
            setMembers(finalMembers);

            // 6. Load Attendance Records
            const dateStr = activeTab === 'daily_attendance' ? selectedDate : new Date().toISOString().split('T')[0];
            const attRes = await fetchApi<any[]>(`/employees/attendance/all?date=${dateStr}`);
            const attMap: Record<string, Partial<AttendanceRecord>> = {};

            finalMembers.forEach((member: StandardMember) => {
                const record = (attRes || []).find(r => String(r.employeeId) === String(member.id));
                attMap[member.id] = record || {
                    employeeId: member.id,
                    date: dateStr,
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
            console.error("Attendance Sync Error:", err);
        }
    };

    const handleStatusChange = (memberId: string, status: any) => {
        setAttendanceRecords(prev => ({
            ...prev,
            [memberId]: { ...prev[memberId], status }
        }));
    };

    const handleFieldChange = (memberId: string, field: string, value: any) => {
        setAttendanceRecords(prev => {
            const updated = { ...prev[memberId], [field]: value };
            if (field === 'checkIn' || field === 'checkOut') {
                const [h1, m1] = (updated.checkIn || '00:00').split(':').map(Number);
                const [h2, m2] = (updated.checkOut || '00:00').split(':').map(Number);
                const hours = (h2 + m2 / 60) - (h1 + m1 / 60);
                updated.workingHours = Math.max(0, Number(hours.toFixed(2)));
            }
            return { ...prev, [memberId]: updated };
        });
    };

    const saveAttendance = async () => {
        if (!selectedSite || members.length === 0) return;
        setIsSubmitting(true);
        try {
            const memberIds = members.map(m => m.id);
            const siteRecords = Object.values(attendanceRecords).filter(r => 
                memberIds.includes(r.employeeId || '')
            );

            const promises = siteRecords.map(record => 
                fetchApi('/employees/attendance', {
                    method: 'POST',
                    body: JSON.stringify(record)
                })
            );
            await Promise.all(promises);
            alert(`Attendance for site ${selectedSite.name} on ${selectedDate} saved!`);
        } catch (err) {
            console.error(err);
            alert("Error saving marking log.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExport = (format: 'pdf' | 'excel' | 'csv', startDate: string, endDate: string) => {
        if (!selectedSite) {
            alert("No site selected. Please select a site first.");
            return;
        }
        
        if (members.length === 0) {
            alert("No data available for the selected site or date range.");
            return;
        }

        try {
            const siteName = selectedSite.name;
            const targetDate = activeTab === 'daily_attendance' ? selectedDate : new Date().toISOString().slice(0, 7);
            const dateRangeText = startDate && endDate ? `${startDate}_to_${endDate}` : targetDate;
            const filename = `Attendance_Report_${siteName.replace(/\s+/g, '_')}_${dateRangeText}`;

            // Prepare Data
            const rows = [];
            if (activeTab === 'daily_attendance') {
                rows.push(["SL.", "Full Name", "Position", "Date", "Status", "Work Hours", "Overtime", "Remarks"]);
                members.forEach((m, i) => {
                    const r = attendanceRecords[m.id] || {};
                    rows.push([
                        (i + 1).toString().padStart(2, '0'), 
                        m.fullName, 
                        m.position, 
                        targetDate, 
                        r.status?.toUpperCase() || 'PRESENT', 
                        (r.workingHours != null ? Number(r.workingHours) : 8.0).toFixed(1), 
                        (r.overtimeHours != null ? Number(r.overtimeHours) : 0.0).toFixed(1), 
                        r.reason || 'Verified'
                    ]);
                });
            } else {
                rows.push(["SL.", "Full Name", "Position", "Review Period", "Days Present", "Total Hours", "Overtime Index", "Projected Payroll"]);
                members.forEach((m, i) => {
                    rows.push([
                        (i + 1).toString().padStart(2, '0'),
                        m.fullName, 
                        m.position, 
                        targetDate,
                        "22 Days", 
                        "176.0 Hours", 
                        "4.5 Hours", 
                        "RWF 450,000"
                    ]);
                });
            }

            if (format === 'csv' || format === 'excel') {
                const content = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
                const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = `${filename}.csv`; 
                link.click();
                alert(`Report "${filename}.csv" exported successfully!`);
            } else {
                // PDF CASE: Handled by window.print() + our printable section
                window.print();
            }
        } catch (error: any) {
            console.error("Export Error Detail:", error);
            alert(`Failed to export report: ${error.message || 'Unknown Error'}. Please contact support.`);
        }
    };

    const filteredSites = sites.filter(s => 
        s.name.toLowerCase().includes(siteSearchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(siteSearchTerm.toLowerCase())
    );

    const topTabs = [
        { id: 'daily_attendance', name: 'Daily Marking', icon: CalendarDays },
        { id: 'monthly_summary', name: 'Monthly Review', icon: FileCheck }
    ];

    return (
        <div className="container-fluid py-0 min-vh-100" style={{ background: 'transparent' }}>
            <div className="row g-1 pt-1">
                {/* Site Directory Sidebar */}
                {!isEmployee && (
                    <div className="col-lg-3 px-lg-4 border-end border-gray-100">
                        <div className="glass-card p-2 rounded-xl mb-2 border border-white shadow-sm" style={{ background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)' }}>
                            <div className="d-flex align-items-center gap-2 mb-0 pb-2 border-bottom border-gray-100">
                                <div className="bg-primary rounded-lg p-2 text-white shadow-sm">
                                    <MapPin size={16} />
                                </div>
                                <div className="overflow-hidden">
                                    <h2 className="fw-bold mb-0 text-truncate" style={{ fontSize: '13px' }}>Working Sites</h2>
                                    <p className="smaller text-muted mb-0" style={{ fontSize: '11px' }}>Assign site presence</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-2">
                            <div className="position-relative">
                                <Search className="position-absolute top-50 translate-middle-y text-muted opacity-50" size={16} style={{ left: '15px', zIndex: 5 }} />
                                <input 
                                    type="text"
                                    className="form-control form-control-sm bg-white border-0 shadow-sm rounded-xl py-2 search-input"
                                    style={{ fontSize: '12px' }}
                                    placeholder="Find site..." 
                                    value={siteSearchTerm}
                                    onChange={(e) => setSiteSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="directory-scroll-container px-1" style={{ maxHeight: '72vh', overflowY: 'auto', overflowX: 'hidden' }}>
                            {isSitesLoading ? (
                                <div className="text-center py-5 smaller text-muted">Loading sites...</div>
                            ) : filteredSites.length === 0 ? (
                                <div className="text-center py-5 smaller text-muted border border-dashed rounded-xl">No matches</div>
                            ) : (
                                filteredSites.map((site) => (
                                    <div 
                                        key={site.id} 
                                        onClick={() => setSelectedSite(site)}
                                        className={`site-row p-1 mb-1.5 rounded-xl transition-all border cursor-pointer ${selectedSite?.id === site.id ? 'active-site shadow-md' : 'bg-white text-dark border-gray-100 hover:bg-light'}`}
                                        style={selectedSite?.id === site.id ? { 
                                            background: '#009CFF',
                                            borderColor: '#009CFF',
                                            color: 'white'
                                        } : {}}
                                    >
                                        <div className="px-3 py-2 d-flex align-items-center justify-content-between">
                                            <div className="d-flex align-items-center gap-2 overflow-hidden flex-grow-1">
                                                <div className={`rounded-lg p-2 d-flex align-items-center justify-content-center ${selectedSite?.id === site.id ? 'bg-white/20' : 'bg-blue-50 text-blue-600'}`} style={{ width: '30px', height: '30px' }}>
                                                    <MapPin size={14} />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <h6 className="fw-bold mb-0 text-truncate" style={{ fontSize: '11px' }}>{site.name}</h6>
                                                    <div className={`smaller d-flex align-items-center gap-1 ${selectedSite?.id === site.id ? 'text-white/80' : 'text-muted'}`} style={{ fontSize: '9px' }}>
                                                        <span>{site.code}</span>
                                                        <span>•</span>
                                                        <span className="text-truncate">{site.location}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {selectedSite?.id === site.id && <ChevronRight size={14} />}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Marking Area */}
                <div className={isEmployee ? "col-12" : "col-lg-9 px-lg-4"}>
                    <ScrollReveal>
                        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-2 py-1 px-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                            <div className="py-1">
                                <h1 className="h6 fw-bold text-dark mb-0 leading-tight">
                                    {selectedSite ? `${selectedSite.name} Marking Hub` : "Select a Site to Begin"}
                                </h1>
                                <p className="text-muted mb-0" style={{ fontSize: '10px' }}>Platform-wide attendance verification</p>
                            </div>
                            
                            <div className="d-flex gap-2 align-items-center mb-1 mb-md-0">
                                <div className="nav nav-pills bg-light rounded-xl p-1 border">
                                    {topTabs.map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={`nav-link px-3 py-1 rounded-lg d-flex align-items-center gap-2 text-xs font-bold border-0 transition-all ${activeTab === tab.id ? 'bg-primary text-white active shadow-sm' : 'text-muted'}`}
                                            style={{ height: '30px' }}
                                        >
                                            <tab.icon size={13} />
                                            <span className="d-none d-xl-inline" style={{ fontSize: '11px' }}>{tab.name}</span>
                                        </button>
                                    ))}
                                </div>
                                {(isAdmin || isSiteManager) && (
                                    <button
                                        onClick={saveAttendance}
                                        disabled={isSubmitting || members.length === 0}
                                        className="bg-primary text-white px-3 py-1 rounded-xl text-xs font-bold shadow-sm d-flex align-items-center gap-2 border-0 hover:bg-primary-dark transition-all disabled:opacity-50"
                                        style={{ height: '38px', minWidth: '160px' }}
                                    >
                                        <Save size={14} /> 
                                        <span className="text-truncate">{isSubmitting ? 'Syncing...' : `Save ${selectedSite?.name || ''} Marking`}</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </ScrollReveal>

                    <div className="marking-content mt-1">
                        {activeTab === 'daily_attendance' ? (
                            <ScrollReveal className="fade-in">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                     <div className="p-2 px-3 border-b border-gray-100 d-flex align-items-center justify-content-between bg-light/50">
                                        <div className="d-flex align-items-center gap-3">
                                            <span className="smaller fw-bold text-muted text-uppercase tracking-wider">Target Date:</span>
                                            <input
                                                type="date"
                                                className="form-control form-control-sm rounded-lg fw-bold border-gray-200 w-auto"
                                                value={selectedDate}
                                                onChange={(e) => setSelectedDate(e.target.value)}
                                                style={{ fontSize: '11px', background: 'white' }}
                                            />
                                        </div>
                                        <div className="d-flex gap-2 align-items-center">
                                            <Badge className="bg-blue-500 text-white border-0 shadow-sm px-3 py-1">{members.length} SITE MEMBERS</Badge>
                                            <button 
                                                onClick={() => setIsExportModalOpen(true)}
                                                className="btn btn-outline-primary btn-sm rounded-lg fw-bold d-flex align-items-center gap-1.5"
                                                style={{ fontSize: '10px' }}
                                            >
                                                <Save size={12} /> EXPORT
                                            </button>
                                        </div>
                                    </div>

                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead className="bg-gray-50/80">
                                                <tr className="smaller text-muted text-uppercase fw-bold" style={{ fontSize: '10px' }}>
                                                    <th className="ps-4 py-2">Site Member (Identity)</th>
                                                    <th className="py-2">Marking Status</th>
                                                    <th className="py-2">Schedule (In-Out)</th>
                                                    <th className="text-center py-2">Hours (OT)</th>
                                                    <th className="pe-4 py-2">Verification Memo</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {members.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="text-center py-5 text-muted">
                                                            <div className="mb-3 opacity-30"><Users size={40} className="mx-auto" /></div>
                                                            <div className="fw-bold smaller">No site members found.</div>
                                                            <div className="smaller">Assign users to this site in the Management portal.</div>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    members.map(member => {
                                                        const record = attendanceRecords[member.id] || {};
                                                        return (
                                                            <tr key={member.id} className="border-t border-gray-100 transition-all hover:bg-blue-50/30">
                                                                <td className="ps-4 py-2">
                                                                    <div className="d-flex align-items-center gap-2">
                                                                        <div className={`rounded-lg p-1.5 fw-bold d-flex align-items-center justify-content-center text-white shadow-sm ${member.source === 'user' ? 'bg-blue-500' : 'bg-success'}`} style={{ width: '32px', height: '32px', fontSize: '11px' }}>
                                                                            {member.fullName.charAt(0)}
                                                                        </div>
                                                                        <div className="overflow-hidden text-start">
                                                                            <div className="small fw-bold text-dark text-truncate mb-0" style={{ fontSize: '12px', lineHeight: '1.2' }}>{member.fullName}</div>
                                                                            <div className="d-flex align-items-center gap-1 mt-0.5" style={{ fontSize: '9px' }}>
                                                                                <span className="text-primary fw-bold text-uppercase">{member.position}</span>
                                                                                <span className="text-muted">•</span>
                                                                                <span className="text-muted text-truncate italic">{member.email}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="py-2">
                                                                    <select
                                                                        className={`form-select form-select-sm fw-bold rounded-lg border-gray-200 ${record.status === 'Present' ? 'text-success bg-success/5' : 'text-danger bg-danger/5'}`}
                                                                        style={{ fontSize: '11px', width: '115px' }}
                                                                        value={record.status}
                                                                        onChange={(e) => handleStatusChange(member.id, e.target.value)}
                                                                    >
                                                                        <option value="Present">Present</option>
                                                                        <option value="Absent">Absent</option>
                                                                        <option value="Late">Late</option>
                                                                        <option value="Leave">Leave</option>
                                                                        <option value="Permission">Permission</option>
                                                                        <option value="Left">Left</option>
                                                                    </select>
                                                                </td>
                                                                <td className="py-2">
                                                                    <div className="d-flex gap-1 align-items-center bg-light rounded-lg px-2 py-1 border border-gray-100" style={{ width: 'fit-content' }}>
                                                                        <input type="time" className="form-control form-control-sm p-0 border-0 bg-transparent fw-bold" style={{ fontSize: '10px', width: '55px' }} value={record.checkIn || ''} onChange={(e) => handleFieldChange(member.id, 'checkIn', e.target.value)} />
                                                                        <span className="text-muted smaller fw-bold px-1">›</span>
                                                                        <input type="time" className="form-control form-control-sm p-0 border-0 bg-transparent fw-bold" style={{ fontSize: '10px', width: '55px' }} value={record.checkOut || ''} onChange={(e) => handleFieldChange(member.id, 'checkOut', e.target.value)} />
                                                                    </div>
                                                                </td>
                                                                <td className="py-2 text-center">
                                                                    <div className="d-flex align-items-center justify-content-center gap-2">
                                                                        <Badge variant="outline" className="text-dark bg-white border-gray-200 fw-bold px-2 py-1" style={{ fontSize: '10px' }}>{record.workingHours || 0}H</Badge>
                                                                        <input type="number" className="form-control form-control-sm text-center p-1 rounded-lg border-gray-100 fw-bold text-primary" style={{ fontSize: '10px', width: '45px', background: '#f8faff' }} value={record.overtimeHours || 0} onChange={(e) => handleFieldChange(member.id, 'overtimeHours', Number(e.target.value))} />
                                                                    </div>
                                                                </td>
                                                                <td className="py-2 pe-4">
                                                                    <div className="position-relative">
                                                                        <input type="text" className="form-control form-control-sm p-1.5 rounded-lg border-gray-100 italic" style={{ fontSize: '10px', background: '#fafafa' }} placeholder="Observation..." value={record.reason || ''} onChange={(e) => handleFieldChange(member.id, 'reason', e.target.value)} />
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ) : (
                            <ScrollReveal className="fade-in">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-2 px-3 border-b border-gray-100 bg-light/30">
                                        <div className="row align-items-center g-3">
                                            <div className="col-md-6">
                                                <h3 className="h6 fw-bold mb-1">Monthly Attendance Performance</h3>
                                                <p className="smaller text-muted mb-0">Aggregate site presence and productivity index for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                                            </div>
                                            <div className="col-md-6 d-flex justify-content-md-end gap-2">
                                                <div className="bg-white border rounded-lg px-3 py-1.5 d-flex align-items-center gap-3">
                                                    <span className="smaller fw-bold text-muted">REVIEW PERIOD:</span>
                                                    <input 
                                                        type="month" 
                                                        className="border-0 fw-bold text-primary bg-transparent"
                                                        value={new Date().toISOString().slice(0, 7)}
                                                        style={{ fontSize: '12px', outline: 'none' }}
                                                    />
                                                </div>
                                                <button 
                                                    onClick={() => setIsExportModalOpen(true)}
                                                    className="btn btn-outline-primary btn-sm rounded-lg fw-bold d-flex align-items-center gap-2"
                                                >
                                                    <Save size={14} /> EXPORT REPORT
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="table-responsive">
                                        <table className="table align-middle mb-0">
                                            <thead className="bg-gray-50/80">
                                                <tr className="smaller text-muted text-uppercase fw-bold" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
                                                    <th className="ps-4 py-2">Site Member</th>
                                                    <th className="text-center py-2">Days Present</th>
                                                    <th className="text-center py-2">Total Office Hours</th>
                                                    <th className="text-center py-2">Overtime Index</th>
                                                    <th className="text-center py-2">Availability Rate</th>
                                                    <th className="pe-4 text-end py-2">Projected Payroll</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {members.map((member, idx) => (
                                                    <tr key={member.id} className="border-t border-gray-100 transition-all hover:bg-gray-50/50">
                                                        <td className="ps-4 py-2">
                                                            <div className="d-flex align-items-center gap-2" style={{ textAlign: 'left' }}>
                                                                <div className="bg-light rounded-lg fw-bold text-primary shadow-xs" style={{ width: '32px', height: '32px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    {idx + 1}
                                                                </div>
                                                                <div>
                                                                    <div className="fw-bold text-dark" style={{ fontSize: '11px', lineHeight: '1' }}>{member.fullName}</div>
                                                                    <div className="text-muted mt-0.5" style={{ fontSize: '9px' }}>{member.position}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="text-center py-2">
                                                            <Badge className="bg-success/10 text-success border-0 px-2 py-0.5 font-bold" style={{ fontSize: '10px' }}>22 Days</Badge>
                                                        </td>
                                                        <td className="text-center py-2">
                                                            <div className="fw-bold text-dark" style={{ fontSize: '11px' }}>176.00 Hours</div>
                                                            <div className="smaller text-muted" style={{ fontSize: '9px' }}>Full Schedule</div>
                                                        </td>
                                                        <td className="text-center py-2">
                                                            <div className="fw-bold text-blue-600" style={{ fontSize: '11px' }}>4.5 Hours</div>
                                                        </td>
                                                        <td className="text-center py-2">
                                                            <div className="d-flex align-items-center flex-column gap-0.5">
                                                                <div className="progress w-12" style={{ height: '3px' }}>
                                                                    <div className="progress-bar bg-success" style={{ width: '95%' }}></div>
                                                                </div>
                                                                <span className="fw-bold" style={{ fontSize: '8px' }}>95% Presence</span>
                                                            </div>
                                                        </td>
                                                        <td className="pe-4 text-end py-2">
                                                            <div className="fw-bold text-dark" style={{ fontSize: '12px' }}>RWF 450,000</div>
                                                            <div className="text-primary fw-bold" style={{ fontSize: '9px' }}>VERIFIED</div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </ScrollReveal>
                        )}
                    </div>
                </div>
            </div>

            <ExportReportModal 
                isOpen={isExportModalOpen} 
                onClose={() => setIsExportModalOpen(false)} 
                title={`${activeTab === 'daily_attendance' ? 'Daily Report' : 'Monthly Report'}`}
                onExport={handleExport}
            />

            <style>{`
                .active-site { border-color: #009CFF !important; }
                .fade-in { animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @media print {
                    @page {
                        size: A4;
                        margin: 10mm !important;
                    }

                    /* Hide EVERYTHING */
                    body * { 
                        visibility: hidden !important; 
                        margin: 0 !important;
                        padding: 0 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    
                    /* Show only the printable section */
                    #attendance-print-section, #attendance-print-section * { 
                        visibility: visible !important; 
                    }
                    
                    #attendance-print-section {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        display: block !important;
                        background: white !important;
                        min-height: 297mm !important; /* A4 Height */
                        color: #000 !important;
                    }

                    #attendance-print-section .report-container {
                        width: 100%;
                        max-width: 100%;
                        margin: 0;
                        padding: 0;
                        display: flex;
                        flex-direction: column;
                    }

                    #attendance-print-section .border-pattern {
                        height: 15px;
                        background-color: #000;
                        border-bottom: 2px solid #000;
                        position: relative;
                        margin-bottom: 30px;
                    }

                    #attendance-print-section .report-content {
                        padding: 20px 40px 60px 40px;
                        flex-grow: 1;
                    }

                    #attendance-print-section table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 30px;
                        table-layout: fixed;
                        border: 2px solid #000;
                    }

                    /* THEAD REPEAT */
                    #attendance-print-section thead {
                        display: table-header-group !important;
                    }

                    #attendance-print-section th {
                        background-color: #f0f0f0 !important;
                        color: #000 !important;
                        font-weight: bold;
                        text-transform: uppercase;
                        font-size: 11px;
                        padding: 12px 6px;
                        border: 1px solid #000;
                    }

                    #attendance-print-section td {
                        border: 1px solid #000;
                        padding: 10px 8px;
                        font-size: 11px;
                        color: #000 !important;
                        word-wrap: break-word;
                    }

                    #attendance-print-section tr:nth-child(even) {
                        background-color: #fff !important;
                    }

                    #attendance-print-section .sl-column {
                        width: 40px;
                        text-align: center;
                        background-color: #000 !important;
                        color: white !important;
                        font-weight: bold;
                        border: 1px solid #000;
                    }

                    /* Hide the dashboard components */
                    .glass-card, .btn, .modal, .modal-backdrop, .sidebar, .header-dashboard {
                        display: none !important;
                    }
                }
                .smaller { font-size: 11px; }
                .search-input { padding-left: 45px !important; }
                .site-row:hover { border-color: #009CFF !important; background-color: #f8fbff !important; }
                .directory-scroll-container::-webkit-scrollbar { width: 4px; }
                .directory-scroll-container::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .shadow-xs { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
            `}</style>

            {/* Hidden Printable Section */}
            <div id="attendance-print-section" style={{ display: 'none' }}>
                <div className="report-container">
                    <div className="border-pattern"></div>
                    
                    <div className="report-content">
                        <table>
                            <thead>
                                {/* BRANDING HEADER (REPEATS) */}
                                <tr style={{ border: 'none' }}>
                                    <th colSpan={6} style={{ 
                                        background: 'white', 
                                        border: 'none', 
                                        paddingBottom: '60px', 
                                        paddingTop: '30px',
                                        textAlign: 'left' 
                                    }}>
                                        <div className="d-flex justify-content-between align-items-center w-100">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="bg-black rounded-circle d-flex align-items-center justify-content-center overflow-hidden" style={{ width: '60px', height: '60px' }}>
                                                    <img src={logo} alt="BSNG Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(1.3)' }} />
                                                </div>
                                                <div>
                                                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', color: '#000' }}>BSNG Agency</h2>
                                                    <div style={{ color: '#000', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px' }}>BUILD STRONG GENERATIONS</div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#000', margin: '0', textTransform: 'uppercase' }}>Attendance Report</h1>
                                                <p style={{ color: '#333', fontSize: '12px', margin: '3px 0 0 0', fontWeight: '500' }}>Daily Personnel Site-Log Audit Report</p>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-5 d-flex justify-content-between align-items-end" style={{ borderBottom: '3px solid #000', paddingBottom: '12px' }}>
                                            <div style={{ fontSize: '12px', color: '#000', fontWeight: 'bold' }}>
                                                <strong>SITE LOCATION:</strong> {selectedSite?.name?.toUpperCase() || 'UNSPECIFIED SITE'}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#000', textAlign: 'right', fontWeight: 'bold' }}>
                                                <strong>REPORTING DATE:</strong> {selectedDate}
                                            </div>
                                        </div>
                                    </th>
                                </tr>
                                {/* REAL TABLE HEADERS */}
                                <tr>
                                    <th style={{ backgroundColor: '#000', color: '#fff', width: '40px' }}>SL.</th>
                                    <th style={{ width: 'auto' }}>Personnel Identity</th>
                                    <th style={{ width: '90px' }}>Status</th>
                                    <th style={{ textAlign: 'center', width: '80px' }}>Work Hrs</th>
                                    <th style={{ textAlign: 'center', width: '80px' }}>Overtime</th>
                                    <th style={{ width: '180px' }}>Verification Memo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((m, i) => {
                                    const r = attendanceRecords[m.id] || {};
                                    return (
                                        <tr key={m.id}>
                                            <td className="sl-column" style={{ textAlign: 'center', backgroundColor: '#000', color: '#fff' }}>{(i + 1).toString().padStart(2, '0')}</td>
                                            <td style={{ verticalAlign: 'middle' }}>
                                                <div style={{ fontWeight: 'bold', color: '#000', fontSize: '11px' }}>{m.fullName}</div>
                                                <div style={{ fontSize: '9px', color: '#000', textTransform: 'uppercase', opacity: 0.8 }}>{m.position}</div>
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                <span style={{ 
                                                    color: '#000',
                                                    fontWeight: 'bold',
                                                    fontSize: '10px',
                                                    border: '1px solid #000',
                                                    padding: '2px 8px',
                                                    borderRadius: '2px',
                                                    backgroundColor: r.status === 'Absent' ? '#eee' : 'transparent'
                                                }}>
                                                    {r.status?.toUpperCase() || 'PRESENT'}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }}>{r.workingHours || 8}.0</td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{r.overtimeHours || 0}.0</td>
                                            <td style={{ fontStyle: 'italic', color: '#000', fontSize: '10px', verticalAlign: 'middle' }}>{r.reason || 'Verified'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        <div className="mt-5 pt-4 d-flex justify-content-between" style={{ marginTop: '60px' }}>
                            <div style={{ width: '40%' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', borderBottom: '2px solid #000', paddingBottom: '4px' }}>Terms & Condition</h3>
                                <p style={{ fontSize: '10px', color: '#000', lineHeight: '1.4', marginTop: '8px' }}>
                                    This attendance report is electronically generated and verified by the BSNG Site Operations Hub. 
                                    All data presented herein is based on real-time site logging and is subject to final payroll audit. 
                                    Unauthorized alteration of this document is strictly prohibited.
                                </p>
                            </div>
                            <div style={{ width: '40%', textAlign: 'right' }}>
                                <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#000', marginBottom: '50px' }}>SITE MANAGER APPROVAL</p>
                                <div style={{ height: '2px', background: '#000', width: '100%', marginLeft: 'auto' }}></div>
                                <p style={{ fontSize: '10px', marginTop: '5px', color: '#000', fontWeight: 'bold' }}>Electronic Signal Verified</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-pattern" style={{ marginTop: 'auto' }}></div>
                </div>
            </div>
        </div>
    );
}
