import { Bell, Check, Trash2, Calendar, MapPin, CreditCard, AlertCircle } from "lucide-react";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { useNotifications, Notification } from "@/app/context/NotificationContext";
import { useNavigate } from "react-router";

export function Notifications() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
    const navigate = useNavigate();

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "success": return <CreditCard className="w-5 h-5 text-blue-600" />;
            case "warning": return <AlertCircle className="w-5 h-5 text-blue-600" />;
            case "error": return <AlertCircle className="w-5 h-5 text-red-600" />;
            case "info": return <MapPin className="w-5 h-5 text-blue-600" />;
            default: return <Bell className="w-5 h-5 text-gray-600" />;
        }
    };

    const getTypeStyles = (type: string) => {
        switch (type) {
            case "success": return "bg-green-100 text-green-800 border-green-200";
            case "warning": return "bg-blue-100 text-blue-800 border-blue-200";
            case "error": return "bg-red-100 text-red-800 border-red-200";
            default: return "bg-blue-100 text-blue-800 border-blue-200";
        }
    };

    const handleItemClick = (notification: Notification) => {
        markAsRead(notification.id);
        if (notification.link) {
            navigate(notification.link);
        }
    };

    return (
        <div className="container-fluid p-4">
            <ScrollReveal className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Notifications Center</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your alerts, updates, and system activities.</p>
                </div>
                <div className="flex gap-3">
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-blue-600 border border-blue-200 dark:border-blue-900/50 rounded-lg font-bold text-sm shadow-sm hover:bg-blue-50 transition-all"
                        >
                            <Check className="w-4 h-4" />
                            MARK ALL AS READ
                        </button>
                    )}
                </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Recent Activity</span>
                            <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{notifications.length}</span>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                    <Bell className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">You're all caught up!</h3>
                                <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">No new notifications at the moment. We'll let you know when something important happens.</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`group relative p-5 transition-all hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer ${!notification.read ? "bg-blue-50/20 dark:bg-blue-900/5" : ""
                                        }`}
                                    onClick={() => handleItemClick(notification)}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${!notification.read ? "scale-110" : ""
                                            } transition-transform duration-300 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700`}>
                                            {getTypeIcon(notification.type)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold tracking-tight border ${getTypeStyles(notification.type)}`}>
                                                    {notification.type.toUpperCase()}
                                                </span>
                                                <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                                                    <Calendar className="w-3 h-3" />
                                                    {notification.time}
                                                </div>
                                                {!notification.read && (
                                                    <div className="h-2 w-2 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(234,88,12,0.5)] animator-pulse" />
                                                )}
                                            </div>

                                            <h3 className={`text-base font-bold text-gray-900 dark:text-white mb-1 ${!notification.read ? "font-extrabold" : ""}`}>
                                                {notification.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
                                                {notification.message}
                                            </p>
                                        </div>

                                        <div className="shrink-0 flex items-center gap-2 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteNotification(notification.id);
                                                }}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                title="Delete notification"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="p-4 bg-gray-50/30 dark:bg-gray-800/10 text-center border-t border-gray-100 dark:border-gray-800">
                            <span className="text-xs font-medium text-gray-400">Total {notifications.length} notifications</span>
                        </div>
                    )}
                </div>
            </ScrollReveal>

            <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animator-pulse {
          animation: pulse 2s infinite ease-in-out;
        }
      `}</style>
        </div>
    );
}
