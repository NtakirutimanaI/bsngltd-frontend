import {
    Bell,
    Check,
    Trash2,
    Clock,
    AlertCircle,
    Info,
    Inbox,
    CheckCircle2,
    XCircle,
    MoreVertical
} from "lucide-react";
import { useNotifications, Notification } from "@/app/context/NotificationContext";
import { useNavigate } from "react-router";
import { ScrollReveal } from "@/app/components/ScrollReveal";

export function Notifications({ hideHeader = false }: { hideHeader?: boolean }) {
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
    const navigate = useNavigate();

    const getTypeIcon = (type: string, isRead: boolean) => {
        const iconSize = 14;
        const baseClass = "p-1.5 rounded-lg d-flex align-items-center justify-content-center shadow-sm";
        switch (type) {
            case "success": return <div className={`${baseClass} bg-emerald-50 text-emerald-500`}><CheckCircle2 size={iconSize} /></div>;
            case "warning": return <div className={`${baseClass} bg-amber-50 text-amber-500`}><AlertCircle size={iconSize} /></div>;
            case "error": return <div className={`${baseClass} bg-rose-50 text-rose-500`}><XCircle size={iconSize} /></div>;
            case "info": return <div className={`${baseClass} bg-sky-50 text-sky-500`}><Info size={iconSize} /></div>;
            default: return <div className={`${baseClass} bg-slate-50 text-slate-500`}><Bell size={iconSize} /></div>;
        }
    };

    const handleItemClick = (notification: Notification) => {
        markAsRead(notification.id);
        if (notification.link) {
            navigate(notification.link);
        }
    };

    return (
        <div className="notifications-hub h-100 p-1">
            {!hideHeader && (
                <div className="d-flex align-items-center justify-content-between mb-3 px-2">
                    <div>
                        <h3 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2" style={{ fontSize: '13px' }}>
                            <Bell size={14} className="text-primary" />
                            Activity Notifications
                        </h3>
                        <p className="text-muted mb-0" style={{ fontSize: '11px' }}>Stay updated with system events</p>
                    </div>
                    {unreadCount > 0 && (
                        <button 
                            onClick={markAllAsRead}
                            className="btn btn-sm d-flex align-items-center gap-1 py-1 px-2"
                            style={{ fontSize: '10px', background: '#e0f2fe', color: '#009CFF', borderRadius: '6px', border: 'none' }}
                        >
                            <Check size={12} /> Mark all read
                        </button>
                    )}
                </div>
            )}

            <div className="directory-scroll-container pr-1" style={{ maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                    <div className="text-center py-12 flex flex-col items-center justify-center opacity-40 mt-10">
                        <Inbox size={48} className="mb-3 text-muted" />
                        <h4 className="fw-bold" style={{ fontSize: '13px' }}>Inbox is empty</h4>
                        <p className="smaller">No notifications at the moment</p>
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <ScrollReveal key={notif.id} delay={0.05} className="mb-2">
                            <div 
                                onClick={() => handleItemClick(notif)}
                                className={`glass-card p-2 rounded-xl border transition-all cursor-pointer group ${notif.read ? 'bg-white/40 border-gray-100 opacity-80' : 'bg-white border-blue-100 shadow-sm'}`}
                                style={{ position: 'relative' }}
                            >
                                {!notif.read && <div className="position-absolute bg-primary rounded-circle" style={{ width: '6px', height: '6px', top: '10px', right: '10px' }} />}
                                
                                <div className="d-flex align-items-start gap-3">
                                    <div className="flex-shrink-0">
                                        {getTypeIcon(notif.type, notif.read)}
                                    </div>
                                    <div className="flex-grow-1 overflow-hidden">
                                        <div className="d-flex align-items-center justify-content-between mb-0.5">
                                            <h4 className={`mb-0 truncate ${notif.read ? 'text-dark fw-bold' : 'text-primary fw-black'}`} style={{ fontSize: '12px' }}>{notif.title}</h4>
                                            <span className="text-muted smaller d-flex align-items-center gap-1" style={{ fontSize: '9px' }}>
                                                <Clock size={10} /> {notif.time}
                                            </span>
                                        </div>
                                        <p className="text-muted mb-0 line-clamp-1" style={{ fontSize: '11px', lineHeight: '1.4' }}>{notif.message}</p>
                                    </div>
                                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                                            className="btn btn-link p-1 text-danger shadow-none"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))
                )}
            </div>

            <style>{`
                .fw-black { font-weight: 850; }
                .line-clamp-1 {
                    display: -webkit-box;
                    -webkit-line-clamp: 1;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .directory-scroll-container::-webkit-scrollbar { width: 4px; }
                .directory-scroll-container::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </div>
    );
}
