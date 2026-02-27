import { useState, useEffect } from "react";
import {
    Activity,
    ShieldAlert,
    CreditCard,
    Database,
    Globe,
    Lock,
    RefreshCw,
    Server,
    Terminal,
    Eye,
    EyeOff,
    CheckCircle,
    Info,
    Settings,
    Code
} from "lucide-react";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { fetchApi } from "../api/client";
import { toast } from "sonner";

export function DeveloperCore() {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [repairMode, setRepairMode] = useState(false);
    const [publicVisible, setPublicVisible] = useState(true);
    const [showCredentials, setShowCredentials] = useState(false);

    useEffect(() => {
        loadDeveloperStats();
    }, []);

    const loadDeveloperStats = async () => {
        try {
            // We can fetch system settings to determine repair mode etc.
            const settings = await fetchApi<any[]>("/settings/public");
            const isRepair = settings.find(s => s.key === 'repair_mode')?.value === 'true';
            const isVisible = settings.find(s => s.key === 'site_public_visibility')?.value !== 'false';

            setRepairMode(isRepair);
            setPublicVisible(isVisible);

            // Mock server data (this should ideally come from a protected admin endpoint)
            setStats({
                server: {
                    os: "Windows Server 2022",
                    runtime: "Node.js v18.x / NestJS",
                    database: "PostgreSQL 14 / TypeORM",
                    api_status: "Healthy",
                    uptime: "15 days, 4 hours",
                    memory_usage: "452MB / 2048MB",
                    cpu_load: "12%"
                },
                payments: {
                    period: "Monthly (1st of month)",
                    last_payroll: "2026-02-01",
                    next_payroll: "2026-03-01",
                    grace_period: "3 days"
                }
            });
        } catch (error) {
            console.error("Failed to load developer stats", error);
        }
    };

    const toggleRepairMode = async () => {
        setLoading(true);
        try {
            const newVal = !repairMode;
            // This would call a specialized admin setting endpoint
            await fetchApi(`/settings/repair_mode`, {
                method: "PUT",
                body: JSON.stringify({ value: newVal ? 'true' : 'false' })
            });
            setRepairMode(newVal);
            toast.success(newVal ? "System entered Repair Mode" : "System exited Repair Mode");
        } catch (err) {
            toast.error("Control failed. Ensure your account has SuperAdmin level 10.");
        } finally {
            setLoading(false);
        }
    };

    const toggleVisibility = async () => {
        setLoading(true);
        try {
            const newVal = !publicVisible;
            await fetchApi(`/settings/site_public_visibility`, {
                method: "PUT",
                body: JSON.stringify({ value: newVal ? 'true' : 'false' })
            });
            setPublicVisible(newVal);
            toast.success(newVal ? "Website is now PUBLIC" : "Website is now OFFLINE (Private)");
        } catch (err) {
            toast.error("Control failed. Access Denied.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-5">
            <ScrollReveal>
                <div className="bg-dark p-4 rounded-3 text-white mb-4 d-flex align-items-center gap-3">
                    <Terminal size={32} className="text-emerald-500" />
                    <div>
                        <h2 className="h4 fw-bold mb-0">Developer Engine Console</h2>
                        <p className="text-muted small mb-0">Authorized Developer: innocentntakir@gmail.com (Full Control Root)</p>
                    </div>
                </div>
            </ScrollReveal>

            <div className="row g-4">
                {/* 1. Critical System Controls */}
                <div className="col-md-6">
                    <ScrollReveal delay={0.1}>
                        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                            <div className="card-body p-4">
                                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                    <ShieldAlert className="text-red-600" /> System State Control
                                </h5>

                                <div className="space-y-4">
                                    <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded-3">
                                        <div>
                                            <p className="fw-bold mb-0">Repair Mode</p>
                                            <p className="text-muted smaller mb-0">Show maintenance page to all users</p>
                                        </div>
                                        <button
                                            onClick={toggleRepairMode}
                                            disabled={loading}
                                            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm border-0 ${repairMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                                        >
                                            {repairMode ? <Activity className="spinning" size={14} /> : 'Activate'}
                                        </button>
                                    </div>

                                    <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded-3">
                                        <div>
                                            <p className="fw-bold mb-0">Public Visibility</p>
                                            <p className="text-muted smaller mb-0">Site is visible on the internet</p>
                                        </div>
                                        <button
                                            onClick={toggleVisibility}
                                            disabled={loading}
                                            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm border-0 d-flex align-items-center gap-2 ${publicVisible ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                                        >
                                            {publicVisible ? <Globe size={14} /> : <EyeOff size={14} />}
                                            {publicVisible ? 'Online' : 'Offline'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>

                {/* 2. Payment Period Control */}
                <div className="col-md-6">
                    <ScrollReveal delay={0.2}>
                        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                            <div className="card-body p-4">
                                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                    <CreditCard className="text-blue-600" /> Financial Cycles
                                </h5>
                                <div className="space-y-3">
                                    <div className="d-flex justify-content-between border-bottom pb-2">
                                        <span className="text-muted">Payment Period</span>
                                        <span className="fw-bold">{stats?.payments?.period}</span>
                                    </div>
                                    <div className="d-flex justify-content-between border-bottom pb-2">
                                        <span className="text-muted">Last Cycle</span>
                                        <span className="text-success">{stats?.payments?.last_payroll}</span>
                                    </div>
                                    <div className="d-flex justify-content-between border-bottom pb-2">
                                        <span className="text-muted">Next Cycle</span>
                                        <span className="text-emerald-600">{stats?.payments?.next_payroll}</span>
                                    </div>
                                    <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 w-100 mt-2 py-2 rounded-xl border-0 text-xs font-bold transition-all">Configure Payment Rules</button>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>

                {/* 3. Server Information */}
                <div className="col-md-12">
                    <ScrollReveal delay={0.3}>
                        <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                            <div className="card-body p-4">
                                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                    <Server className="text-emerald-600" /> Server & Infrastructure
                                </h5>
                                <div className="row g-4">
                                    <div className="col-md-4">
                                        <div className="p-3 bg-light rounded-3 h-100">
                                            <div className="d-flex align-items-center gap-2 text-muted small mb-2"><Database size={14} /> Database Env</div>
                                            <div className="fw-bold">{stats?.server?.database}</div>
                                            <div className="text-success smaller"><CheckCircle size={10} /> Connection Stable</div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="p-3 bg-light rounded-3 h-100">
                                            <div className="d-flex align-items-center gap-2 text-muted small mb-2"><Activity size={14} /> Resource Load</div>
                                            <div className="fw-bold">CPU: {stats?.server?.cpu_load}</div>
                                            <div className="progress mt-2" style={{ height: 4 }}>
                                                <div className="progress-bar bg-success" style={{ width: stats?.server?.cpu_load }}></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="p-3 bg-light rounded-3 h-100">
                                            <div className="d-flex align-items-center gap-2 text-muted small mb-2"><RefreshCw size={14} /> API Engine</div>
                                            <div className="fw-bold text-success">{stats?.server?.api_status}</div>
                                            <div className="text-muted smaller">Uptime: {stats?.server?.uptime}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>

                {/* 4. Credentials Manager */}
                <div className="col-md-6">
                    <ScrollReveal delay={0.4}>
                        <div className="card border-0 shadow-sm border-start border-4 border-danger" style={{ borderRadius: '16px' }}>
                            <div className="card-body p-4">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                                        <Lock className="text-red-700" /> Core Credentials
                                    </h5>
                                    <button
                                        onClick={() => setShowCredentials(!showCredentials)}
                                        className="btn btn-ghost btn-sm text-muted"
                                    >
                                        {showCredentials ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <div className="d-flex justify-content-between border-bottom pb-2">
                                        <span className="text-muted small">DB Password</span>
                                        <code className="text-dark">{showCredentials ? "PgSrv_2026_Root_#!" : "••••••••••••"}</code>
                                    </div>
                                    <div className="d-flex justify-content-between border-bottom pb-2">
                                        <span className="text-muted small">JWT Secret</span>
                                        <code className="text-dark">{showCredentials ? "bsng_secure_engine_A7x" : "••••••••••••"}</code>
                                    </div>
                                    <div className="d-flex justify-content-between border-bottom pb-2">
                                        <span className="text-muted small">AfricasTalking Key</span>
                                        <code className="text-dark">{showCredentials ? "ats_983274jh2_live" : "••••••••••••"}</code>
                                    </div>
                                    <p className="text-danger smaller mt-2 d-flex align-items-center gap-1">
                                        <Info size={12} /> These are system environment variables.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>

                {/* 5. API Master List */}
                <div className="col-md-6">
                    <ScrollReveal delay={0.5}>
                        <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                            <div className="card-body p-4">
                                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                    <Code className="text-emerald-600" /> API System Engine
                                </h5>
                                <div className="max-h-64 overflow-y-auto px-1 custom-scrollbar" style={{ maxHeight: '200px' }}>
                                    {[
                                        { m: 'GET', p: '/users', s: 'Active' },
                                        { m: 'POST', p: '/auth/login', s: 'Active' },
                                        { m: 'PATCH', p: '/employees/:id', s: 'Active' },
                                        { m: 'POST', p: '/payments/disburse', s: 'Active' },
                                        { m: 'GET', p: '/settings/master', s: 'Protected' },
                                        { m: 'DELETE', p: '/projects/:id', s: 'Active' },
                                        { m: 'PUT', p: '/website/sections', s: 'Active' },
                                    ].map((api, i) => (
                                        <div key={i} className="d-flex align-items-center justify-content-between py-2 border-bottom">
                                            <div className="d-flex align-items-center gap-2">
                                                <span className={`badge ${api.m === 'GET' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'} smaller`} style={{ fontSize: 9 }}>{api.m}</span>
                                                <code className="smaller text-dark" style={{ fontSize: 11 }}>{api.p}</code>
                                            </div>
                                            <span className="smaller text-muted">{api.s}</span>
                                        </div>
                                    ))}
                                </div>
                                <button className="bg-gray-900 hover:bg-black text-white w-100 mt-3 py-2.5 rounded-xl border-0 text-sm font-bold transition-all shadow-lg d-flex align-items-center justify-content-center gap-2">
                                    <Settings size={16} /> Full API Documentation
                                </button>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </div>

            <style>{`
                .spinning { animation: spin 2s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
