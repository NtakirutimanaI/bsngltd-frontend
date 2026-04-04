import { useState, useEffect } from "react";
import {
    Users,
    Globe,
    TrendingUp,
    MapPin,
    BarChart3,
    Activity,
    Percent,
    ArrowUpRight,
    Navigation,
    DollarSign,
} from "lucide-react";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { fetchApi } from "../api/client";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { useSite } from "../context/SiteContext";

interface AnalyticsData {
    overview: {
        daily: number;
        weekly: number;
        monthly: number;
    };
    countries: Array<{ country: string; count: string }>;
    topMembers: Array<{ name: string; email: string; visits: string }>;
}

export function WebsiteAnalytics({ hideHeader = false }: { hideHeader?: boolean }) {
    const { selectedSite } = useSite();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        fetchApi<AnalyticsData>("/statistics/analytics")
            .then(res => {
                setData(res);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch analytics", err);
                setIsLoading(false);
            });
    }, [selectedSite?.id]);

    const COLORS = ["#009CFF", "#3b82f6", "#10b981", "#8b5cf6", "#f43f5e"];

    if (isLoading) {
        return (
            <div className="d-flex items-center justify-center min-vh-50">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    const chartData = [
        { name: "Daily", visitors: data?.overview.daily || 0 },
        { name: "Weekly", visitors: data?.overview.weekly || 0 },
        { name: "Monthly", visitors: data?.overview.monthly || 0 },
    ];

    const countryData = data?.countries.map(c => ({
        name: c.country || "Unknown",
        value: parseInt(c.count)
    })) || [];

    return (
        <div className="space-y-4">
            {/* Stats Overview - High Density */}
            <div className="row g-3 mb-2">
                {[
                    { label: "Daily Visitors", value: data?.overview.daily, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
                    { label: "Weekly Visitors", value: data?.overview.weekly, icon: TrendingUp, color: "text-indigo-500", bg: "bg-indigo-50" },
                    { label: "Monthly Visitors", value: data?.overview.monthly, icon: Globe, color: "text-emerald-500", bg: "bg-emerald-50" },
                    { label: "Ad Revenue (Est.)", value: "$124.50", icon: DollarSign, color: "text-purple-500", bg: "bg-purple-50" },
                ].map((stat, i) => (
                    <ScrollReveal key={i} delay={i * 0.05} className="col-sm-6 col-xl-3">
                        <div className="glass-card p-2 rounded-xl border border-white shadow-sm d-flex align-items-center gap-3" style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)' }}>
                            <div className={`${stat.bg} rounded-lg d-flex align-items-center justify-content-center shadow-xs`} style={{ width: '36px', height: '36px', minWidth: '36px' }}>
                                <stat.icon size={16} className={stat.color} />
                            </div>
                            <div className="overflow-hidden flex-grow-1">
                                <p className="text-muted mb-0 font-medium" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
                                <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '14px' }}>
                                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                                </h6>
                            </div>
                            <div className="bg-green-50 px-1 py-0.5 rounded flex items-center gap-0.5" style={{ fontSize: '9px', color: '#10b981', fontWeight: 700 }}>
                                <ArrowUpRight size={8} /> 12%
                            </div>
                        </div>
                    </ScrollReveal>
                ))}
            </div>

            <div className="row g-3">
                {/* Visitor Chart - Compact */}
                <ScrollReveal delay={0.3} className="col-lg-8">
                    <div className="glass-card rounded-xl shadow-sm border border-white p-3" style={{ background: 'rgba(255, 255, 255, 0.6)' }}>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <h3 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2" style={{ fontSize: '13px' }}>
                                <BarChart3 size={14} className="text-blue-500" />
                                Statistics for {selectedSite?.name || 'All Sites'}
                            </h3>
                        </div>
                        <div style={{ height: '220px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#009CFF" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#009CFF" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#999' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#999' }} />
                                    <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', fontSize: '11px' }} />
                                    <Area type="monotone" dataKey="visitors" stroke="#009CFF" strokeWidth={2} fillOpacity={1} fill="url(#colorVis)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </ScrollReveal>

                {/* Country List - Compact */}
                <ScrollReveal delay={0.4} className="col-lg-4">
                    <div className="glass-card rounded-xl shadow-sm border border-white p-3 h-100" style={{ background: 'rgba(255, 255, 255, 0.6)' }}>
                        <h3 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2" style={{ fontSize: '13px' }}>
                            <MapPin size={14} className="text-red-500" />
                            Top Locations
                        </h3>
                        <div className="space-y-2">
                            {countryData.slice(0, 5).map((item, i) => (
                                <div key={i} className="d-flex align-items-center justify-content-between p-2 rounded-lg bg-white/40 border border-white/50">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="rounded-circle" style={{ width: '6px', height: '6px', backgroundColor: COLORS[i % COLORS.length] }}></div>
                                        <span className="text-muted" style={{ fontSize: '11px' }}>{item.name}</span>
                                    </div>
                                    <span className="fw-bold text-dark" style={{ fontSize: '11px' }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </ScrollReveal>
            </div>

            <div className="row g-3">
                {/* Active Members - High Density */}
                <ScrollReveal delay={0.5} className="col-lg-6">
                    <div className="glass-card rounded-xl shadow-sm border border-white p-3 h-100" style={{ background: 'rgba(255, 255, 255, 0.6)' }}>
                        <h3 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2" style={{ fontSize: '13px' }}>
                            <Navigation size={14} className="text-emerald-500" />
                            Frequent Visitors (Members)
                        </h3>
                        <div className="space-y-2">
                            {data?.topMembers?.map((member, i) => (
                                <div key={i} className="d-flex align-items-center justify-content-between p-2 rounded-xl bg-white/40 hover:bg-white/60 transition-all border border-white/50">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="rounded-lg bg-blue-50 text-blue-600 fw-bold d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', fontSize: '11px' }}>
                                            {member.name.charAt(0)}
                                        </div>
                                        <div className="overflow-hidden">
                                            <div className="fw-bold text-dark text-truncate" style={{ fontSize: '11px' }}>{member.name}</div>
                                            <div className="text-muted text-truncate" style={{ fontSize: '9px' }}>{member.email}</div>
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <div className="fw-bold text-blue-600" style={{ fontSize: '11px' }}>{member.visits}</div>
                                        <div className="text-muted" style={{ fontSize: '8px', textTransform: 'uppercase' }}>Visits</div>
                                    </div>
                                </div>
                            )) || <p className="text-center text-muted py-4 small">No data</p>}
                        </div>
                    </div>
                </ScrollReveal>

                {/* Monetization - High Density */}
                <ScrollReveal delay={0.6} className="col-lg-6">
                    <div className="glass-card rounded-xl shadow-sm border border-white p-3 h-100" style={{ background: 'rgba(255, 255, 255, 0.6)' }}>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <h3 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2" style={{ fontSize: '13px' }}>
                                <DollarSign size={14} className="text-purple-500" />
                                Monetization
                            </h3>
                            <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded fw-bold" style={{ fontSize: '9px', textTransform: 'uppercase' }}>Active</span>
                        </div>
                        <div className="p-3 rounded-xl border border-dashed border-gray-200 bg-white/30 d-flex flex-column align-items-center text-center">
                            <div className="bg-purple-50 rounded-full p-2 mb-2 text-purple-600">
                                <Percent size={18} />
                            </div>
                            <h4 className="fw-bold text-dark mb-1" style={{ fontSize: '13px' }}>Ad Earnings Status</h4>
                            <p className="text-muted mb-3" style={{ fontSize: '10px' }}>Earning on every visitor interaction.</p>
                            <div className="row g-2 w-100">
                                <div className="col-6">
                                    <div className="bg-white/50 p-2 rounded-lg border border-white/60">
                                        <div className="text-muted mb-0" style={{ fontSize: '9px' }}>eCPM</div>
                                        <div className="fw-bold text-dark" style={{ fontSize: '14px' }}>$4.20</div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="bg-white/50 p-2 rounded-lg border border-white/60">
                                        <div className="text-muted mb-0" style={{ fontSize: '9px' }}>CTR</div>
                                        <div className="fw-bold text-dark" style={{ fontSize: '14px' }}>2.8%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </div>
    );
}
