import { useState, useEffect } from 'react';
import { fetchApi } from '../api/client';
import { ScrollReveal } from '@/app/components/ScrollReveal';
import { Users, Globe2, MapPin, Activity, Clock, ChevronUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useTheme } from '@/app/context/ThemeContext';

interface AnalyticsData {
    overview: {
        daily: number;
        weekly: number;
        monthly: number;
    };
    countries: { country: string; count: string }[];
    cities: { city: string; count: string }[];
    recentVisitors: {
        id: string;
        ip: string;
        country: string;
        city: string;
        url: string;
        createdAt: string;
    }[];
    dailyTrend: { date: string; visits: string }[];
}

export function Analytics() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();

    useEffect(() => {
        fetchApi<AnalyticsData>('/statistics/analytics')
            .then(res => {
                setData(res);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch analytics", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="container-fluid p-4 d-flex justify-content-center align-items-center min-vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!data) return (
        <div className="container-fluid p-5 d-flex flex-column justify-content-center align-items-center min-vh-50">
            <h4 className="text-danger fw-bold mb-2">Connection Interrupted</h4>
            <p className="text-muted mb-4">The database server is still synchronizing the live tracking metrics. This usually finishes in a few moments.</p>
            <button className="btn btn-primary px-4 py-2 fw-semibold" style={{ backgroundColor: '#16a085', borderColor: '#16a085' }} onClick={() => window.location.reload()}>
                <Activity size={18} className="me-2 d-inline" /> Refresh Dashboard
            </button>
        </div>
    );

    const chartData = data.dailyTrend.map(d => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        visits: parseInt(d.visits, 10)
    }));

    const mapCityData = data.cities.map(c => ({
        name: c.city || 'Unknown',
        visitors: parseInt(c.count, 10)
    }));

    return (
        <div className="container-fluid px-2 px-md-4 pt-1 pb-4">
            <ScrollReveal>
                <div className="mb-4">
                    <h1 className="h4 fw-bold text-dark mb-1">Visitor Analytics</h1>
                    <p className="text-muted small">Monitor traffic, user locations, and behavior across your platform.</p>
                </div>
            </ScrollReveal>

            {/* Overview Cards */}
            <div className="row g-3 mb-4">
                <div className="col-12 col-md-4">
                    <ScrollReveal delay={0.1}>
                        <div className="premium-card p-4 h-100 border-0 shadow-sm rounded-4 bg-white dark:bg-gray-800">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="text-muted fw-semibold small text-uppercase tracking-wider">Today's Visits</span>
                                <div className="p-2 bg-primary-subtle rounded-3 text-primary">
                                    <Activity size={20} />
                                </div>
                            </div>
                            <h3 className="fw-bold fs-2 mb-1">{data.overview.daily}</h3>
                            <p className="text-muted small mb-0 d-flex align-items-center gap-1">
                                <ChevronUp size={14} className="text-success" /> Visitors in last 24h
                            </p>
                        </div>
                    </ScrollReveal>
                </div>
                <div className="col-12 col-md-4">
                    <ScrollReveal delay={0.2}>
                        <div className="premium-card p-4 h-100 border-0 shadow-sm rounded-4 bg-white dark:bg-gray-800">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="text-muted fw-semibold small text-uppercase tracking-wider">Weekly Visits</span>
                                <div className="p-2 bg-success-subtle rounded-3 text-success">
                                    <Users size={20} />
                                </div>
                            </div>
                            <h3 className="fw-bold fs-2 mb-1">{data.overview.weekly}</h3>
                            <p className="text-muted small mb-0 d-flex align-items-center gap-1">
                                <ChevronUp size={14} className="text-success" /> Last 7 days
                            </p>
                        </div>
                    </ScrollReveal>
                </div>
                <div className="col-12 col-md-4">
                    <ScrollReveal delay={0.3}>
                        <div className="premium-card p-4 h-100 border-0 shadow-sm rounded-4 bg-white dark:bg-gray-800">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="text-muted fw-semibold small text-uppercase tracking-wider">Monthly Visits</span>
                                <div className="p-2 bg-info-subtle rounded-3 text-info">
                                    <Globe2 size={20} />
                                </div>
                            </div>
                            <h3 className="fw-bold fs-2 mb-1">{data.overview.monthly}</h3>
                            <p className="text-muted small mb-0 d-flex align-items-center gap-1">
                                <ChevronUp size={14} className="text-success" /> Last 30 days
                            </p>
                        </div>
                    </ScrollReveal>
                </div>
            </div>

            <div className="row g-4 mb-4">
                {/* Trend Chart */}
                <div className="col-lg-8">
                    <ScrollReveal delay={0.4}>
                        <div className="premium-card p-4 h-100 border-0 shadow-sm rounded-4 bg-white dark:bg-gray-800">
                            <h6 className="fw-bold mb-4 flex items-center gap-2">
                                <Activity size={18} className="text-primary" />
                                Traffic Overview (Last 7 Days)
                            </h6>
                            <div style={{ height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? "#374151" : "#f1f5f9"} />
                                        <XAxis dataKey="date" stroke={theme === 'dark' ? "#9ca3af" : "#64748b"} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <YAxis stroke={theme === 'dark' ? "#9ca3af" : "#64748b"} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <RechartsTooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                                        <Line type="monotone" dataKey="visits" stroke="#16a085" strokeWidth={4} dot={{ r: 4, fill: '#16a085', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} name="Visits" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>

                {/* Top Cities */}
                <div className="col-lg-4">
                    <ScrollReveal delay={0.5}>
                        <div className="premium-card p-4 h-100 border-0 shadow-sm rounded-4 bg-white dark:bg-gray-800">
                            <h6 className="fw-bold mb-4 flex items-center gap-2">
                                <MapPin size={18} className="text-primary" />
                                Top Cities
                            </h6>
                            <div style={{ height: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={mapCityData} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme === 'dark' ? "#374151" : "#f1f5f9"} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} tick={{ fontSize: 12, fill: theme === 'dark' ? '#9ca3af' : '#64748b' }} />
                                        <RechartsTooltip cursor={{ fill: theme === 'dark' ? '#374151' : '#f8f9fa' }} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                                        <Bar dataKey="visitors" fill="#16a085" radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </div>

            {/* Recent Visitors Table */}
            <div className="row">
                <div className="col-12">
                    <ScrollReveal delay={0.6}>
                        <div className="premium-card border-0 shadow-sm rounded-4 bg-white dark:bg-gray-800 overflow-hidden">
                            <div className="p-4 border-bottom border-light/10">
                                <h6 className="fw-bold mb-0 flex items-center gap-2">
                                    <Clock size={18} className="text-primary" />
                                    Recent Visitor Log
                                </h6>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="bg-light/50 dark:bg-gray-900/50">
                                        <tr>
                                            <th className="border-0 text-muted small text-uppercase fw-bold ps-4 py-3">Location</th>
                                            <th className="border-0 text-muted small text-uppercase fw-bold py-3">IP Address</th>
                                            <th className="border-0 text-muted small text-uppercase fw-bold py-3">Visited Page</th>
                                            <th className="border-0 text-muted small text-uppercase fw-bold text-end pe-4 py-3">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="border-0">
                                        {data.recentVisitors.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="text-center py-4 text-muted">No visitors yet</td>
                                            </tr>
                                        ) : (
                                            data.recentVisitors.map(v => (
                                                <tr key={v.id} className="border-bottom border-light/10">
                                                    <td className="ps-4 py-3">
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div className="bg-primary-subtle rounded-circle d-flex align-items-center justify-content-center text-primary" style={{ width: 36, height: 36 }}>
                                                                <MapPin size={16} />
                                                            </div>
                                                            <div>
                                                                <span className="d-block fw-semibold text-dark">{v.city || 'Unknown City'}</span>
                                                                <span className="text-muted small">{v.country || 'Unknown Country'}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3">
                                                        <span className="badge bg-light text-dark font-monospace border">{v.ip || 'Hidden'}</span>
                                                    </td>
                                                    <td className="py-3">
                                                        <span className="text-primary fw-medium small break-all">{v.url}</span>
                                                    </td>
                                                    <td className="text-end pe-4 py-3 text-muted small whitespace-nowrap">
                                                        {new Date(v.createdAt).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </div>
    );
}
