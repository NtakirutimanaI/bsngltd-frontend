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
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchApi<AnalyticsData>("/statistics/analytics")
            .then(res => {
                setData(res);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch analytics", err);
                setIsLoading(false);
            });
    }, []);

    const COLORS = ["#009CFF", "#3b82f6", "#10b981", "#8b5cf6", "#f43f5e"];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
        <div className="space-y-6">
            {!hideHeader && (
                <ScrollReveal>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="h3 fw-bold text-gray-900 dark:text-white mb-1">Website Analytics</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">Track your visitors, locations, and monetization status.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-bold flex items-center gap-2">
                                <Activity className="h-4 w-4" />
                                Live Tracking Active
                            </div>
                        </div>
                    </div>
                </ScrollReveal>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Daily Visitors", value: data?.overview.daily, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Weekly Visitors", value: data?.overview.weekly, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Monthly Visitors", value: data?.overview.monthly, icon: Globe, color: "text-blue-600", bg: "bg-green-50" },
                    { label: "Ad Revenue (Est.)", value: "$124.50", icon: DollarSign, color: "text-purple-600", bg: "bg-purple-50" },
                ].map((stat, i) => (
                    <ScrollReveal key={i} delay={i * 0.1} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`${stat.bg} dark:bg-gray-700 p-3 rounded-xl`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                            <span className="text-green-500 text-xs font-bold flex items-center gap-1 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                                <ArrowUpRight className="h-3 w-3" />
                                +12%
                            </span>
                        </div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{stat.label}</h3>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                            {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                        </div>
                    </ScrollReveal>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Visitor Chart */}
                <ScrollReveal delay={0.4} className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-blue-500" />
                            Visitor Statistics
                        </h3>
                    </div>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#009CFF" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#009CFF" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="visitors" stroke="#009CFF" strokeWidth={3} fillOpacity={1} fill="url(#colorVis)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </ScrollReveal>

                {/* Country Distribution */}
                <ScrollReveal delay={0.5} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold mb-6 dark:text-white flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-blue-500" />
                        Top Locations
                    </h3>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={countryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {countryData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-3">
                        {countryData.map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                    <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                                </div>
                                <span className="font-bold dark:text-white">{item.value} visits</span>
                            </div>
                        ))}
                    </div>
                </ScrollReveal>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Active Members */}
                <ScrollReveal delay={0.6} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold mb-6 dark:text-white flex items-center gap-2">
                        <Navigation className="h-5 w-5 text-green-500" />
                        Most Frequent Visitors (Members)
                    </h3>
                    <div className="space-y-4">
                        {data?.topMembers && data.topMembers.length > 0 ? (
                            data.topMembers.map((member, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center font-bold">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold dark:text-white">{member.name}</div>
                                            <div className="text-xs text-gray-500">{member.email}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-blue-600">{member.visits}</div>
                                        <div className="text-[10px] text-gray-400 uppercase font-bold">Visits</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-10">No member data available yet.</p>
                        )}
                    </div>
                </ScrollReveal>

                {/* Google Ads Monetization Status */}
                <ScrollReveal delay={0.7} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-purple-500" />
                            Monetization (Google Addons)
                        </h3>
                        <span className="px-2 py-1 bg-green-100 text-blue-600 text-[10px] font-bold rounded uppercase">Active</span>
                    </div>

                    <div className="p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center space-y-4 py-8">
                        <div className="h-16 w-16 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                            <Percent className="h-8 w-8 text-purple-600" />
                        </div>
                        <div>
                            <h4 className="font-bold dark:text-white">Earnings per Click/View</h4>
                            <p className="text-sm text-gray-500 max-w-xs">You are earning on every visitor interaction. Ads are automatically served to users.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 w-full pt-4">
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                                <div className="text-xs text-gray-500 mb-1">eCPM</div>
                                <div className="text-xl font-bold dark:text-white">$4.20</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                                <div className="text-xs text-gray-500 mb-1">CTR</div>
                                <div className="text-xl font-bold dark:text-white">2.8%</div>
                            </div>
                        </div>
                    </div>

                    {/* Example Ad Preview */}
                    <div className="mt-6 p-4 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                        <div className="text-[10px] text-gray-400 font-bold uppercase mb-2">Google Ad Preview (Admin only view)</div>
                        <div className="h-20 bg-white dark:bg-gray-800 rounded flex items-center justify-center shadow-inner">
                            <span className="text-gray-400 text-xs italic">Advertisement Banner Mockup</span>
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </div>
    );
}
