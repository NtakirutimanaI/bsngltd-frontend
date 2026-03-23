import {
    Bell,
    Check,
    Trash2,
    Clock,
    Search,
    AlertCircle,
    Info,
    Inbox,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { useState, useMemo } from "react";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { useNotifications, Notification } from "@/app/context/NotificationContext";
import { useNavigate } from "react-router";
import "@/styles/dashboard-premium.css";

export function Notifications() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "success" | "info" | "warning" | "error">("all");

    const filteredNotifications = useMemo(() => {
        return notifications.filter(n => {
            const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                n.message.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = activeFilter === "all" ? true : (activeFilter === "unread" ? !n.read : n.type === activeFilter);
            return matchesSearch && matchesFilter;
        });
    }, [notifications, searchQuery, activeFilter]);

    const getTypeIcon = (type: string, isRead: boolean) => {
        const iconSize = 20;
        switch (type) {
            case "success": return <div className={`p-2.5 rounded-xl ${isRead ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none'}`}><CheckCircle2 size={iconSize} /></div>;
            case "warning": return <div className={`p-2.5 rounded-xl ${isRead ? 'bg-amber-50 text-amber-500 dark:bg-amber-950/30' : 'bg-amber-500 text-white shadow-lg shadow-amber-200 dark:shadow-none'}`}><AlertCircle size={iconSize} /></div>;
            case "error": return <div className={`p-2.5 rounded-xl ${isRead ? 'bg-rose-50 text-rose-500 dark:bg-rose-950/30' : 'bg-rose-500 text-white shadow-lg shadow-rose-200 dark:shadow-none'}`}><XCircle size={iconSize} /></div>;
            case "info": return <div className={`p-2.5 rounded-xl ${isRead ? 'bg-sky-50 text-sky-500 dark:bg-sky-950/30' : 'bg-sky-500 text-white shadow-lg shadow-sky-200 dark:shadow-none'}`}><Info size={iconSize} /></div>;
            default: return <div className={`p-2.5 rounded-xl ${isRead ? 'bg-slate-50 text-slate-500 dark:bg-slate-950/30' : 'bg-slate-500 text-white shadow-lg shadow-slate-200 dark:shadow-none'}`}><Bell size={iconSize} /></div>;
        }
    };

    const handleItemClick = (notification: Notification) => {
        markAsRead(notification.id);
        if (notification.link) {
            navigate(notification.link);
        }
    };

    return (
        <div className="container-fluid px-4 py-3 min-vh-100 bg-gray-50/50 dark:bg-gray-950/20">
            {/* Header Section */}
            <div className="max-w-6xl mx-auto">
                <ScrollReveal className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-2">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5 overflow-hidden">
                            <span className="h-px w-8 bg-blue-600 rounded-full"></span>
                            <span className="text-blue-600 font-bold tracking-[0.2em] text-[10px] uppercase">Notification Center</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">Stay Updated</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Manage your system activity and project alerts in one place.</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-4 bg-white dark:bg-gray-900 p-1.5 pl-4 pr-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">Unread Alerts</span>
                                <span className="text-xl font-black text-blue-600 mt-1">{unreadCount}</span>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="h-12 flex items-center gap-2 px-4 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Check size={16} />
                                    MARK ALL AS READ
                                </button>
                            )}
                        </div>
                    </div>
                </ScrollReveal>

                {/* Filter & Search Section */}
                <ScrollReveal delay={0.1} className="mb-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        <div className="lg:col-span-8 flex flex-wrap gap-2 p-1.5 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                            {(["all", "unread", "success", "info", "warning", "error"] as const).map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={`flex-1 min-w-[80px] py-2 px-3 rounded-xl font-bold text-[11px] transition-all capitalize ${activeFilter === filter
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none"
                                        : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                        <div className="lg:col-span-4 relative group">
                            <Search className="absolute left-4 top-1/2 -translate-middle-y text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search notifications..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-full min-h-[52px] pl-12 pr-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
                            />
                        </div>
                    </div>
                </ScrollReveal>

                {/* List Section */}
                <ScrollReveal delay={0.2}>
                    <div className="flex flex-col gap-4 mb-12">
                        {filteredNotifications.length === 0 ? (
                            <div className="premium-card bg-white dark:bg-gray-900 rounded-[2.5rem] py-20 px-6 flex flex-col items-center justify-center text-center">
                                <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6 animate-bounce transition-all duration-300">
                                    <Inbox className="w-10 h-10 text-blue-500" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Everything is Clear</h3>
                                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto font-medium">
                                    No {activeFilter !== 'all' ? activeFilter : ''} notifications found. Your inbox is perfectly organized!
                                </p>
                            </div>
                        ) : (
                            filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleItemClick(notification)}
                                    className={`premium-card group relative p-1 transition-all cursor-pointer ${!notification.read ? "border-l-4 border-l-blue-600" : ""}`}
                                >
                                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-3 flex items-start gap-3">
                                        <div className="shrink-0 relative">
                                            {getTypeIcon(notification.type, notification.read)}
                                            {!notification.read && (
                                                <div className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-blue-600 rounded-full border-2 border-white dark:border-gray-900 animator-pulse" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${notification.read ? 'bg-gray-100 text-gray-400 dark:bg-gray-800' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30'}`}>
                                                    {notification.type}
                                                </span>
                                                <div className="flex items-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock size={12} strokeWidth={3} />
                                                        {notification.time}
                                                    </div>
                                                </div>
                                            </div>

                                            <h3 className={`text-base mb-1 tracking-tight ${notification.read ? "text-gray-600 font-bold" : "text-gray-950 dark:text-white font-black"}`}>
                                                {notification.title}
                                            </h3>
                                            <p className={`text-sm leading-relaxed max-w-3xl ${notification.read ? "text-gray-400 font-medium" : "text-gray-500 dark:text-gray-400 font-semibold"}`}>
                                                {notification.message}
                                            </p>
                                        </div>

                                        <div className="shrink-0 flex items-center self-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteNotification(notification.id);
                                                }}
                                                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all shadow-sm active:scale-90"
                                                title="Delete this alert"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {filteredNotifications.length > 0 && (
                        <div className="flex items-center justify-center pb-12">
                            <div className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-900 rounded-full shadow-sm border border-gray-100 dark:border-gray-800">
                                <span className="h-1.5 w-1.5 bg-blue-600 rounded-full"></span>
                                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">End of Activity Log</span>
                            </div>
                        </div>
                    )}
                </ScrollReveal>
            </div>

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7); }
                    70% { transform: scale(1.2); opacity: 0.5; box-shadow: 0 0 0 10px rgba(37, 99, 235, 0); }
                    100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
                }
                .animator-pulse {
                    animation: pulse 2s infinite ease-in-out;
                }
                .premium-card {
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .premium-card:hover {
                    transform: translateX(8px);
                }
            `}</style>
        </div>
    );
}
