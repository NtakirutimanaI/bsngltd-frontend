import React, { createContext, useContext } from 'react';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    time: string;
    read: boolean;
    link?: string;
    userEmail?: string;
    siteId?: string;
    isAdminOnly?: boolean;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    deleteNotification: (id: string) => void;
    addNotification: (notification: Omit<Notification, 'id' | 'read' | 'time'>) => void;
    getFilteredNotifications: (userEmail?: string, siteId?: string, isAdmin?: boolean) => Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const STORAGE_KEY = 'bsng_notifications_v3';
    
    const [notifications, setNotifications] = React.useState<Notification[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse notifications", e);
            }
        }
        return [
            {
                id: "pay-1",
                title: "Payment Confirmed",
                message: "Your payment of RWF 4,500,000 has been verified and applied to your account.",
                type: "success",
                time: "2 hours ago",
                read: false,
                link: "/dashboard/finance",
                userEmail: "client@bsng.com"
            },
            {
                id: "book-1",
                title: "Booking Approved",
                message: "Good news! Admin has confirmed your site visit scheduled for next Tuesday.",
                type: "info",
                time: "5 hours ago",
                read: false,
                link: "/dashboard/bookings",
                userEmail: "client@bsng.com"
            },
            {
                id: "serv-1",
                title: "New Service Available",
                message: "BSNG now offers direct interior design consulting. Check our services catalog.",
                type: "info",
                time: "Yesterday",
                read: true,
                link: "/dashboard/services"
            },
            {
                id: "upd-1",
                title: "Platform Update",
                message: "We've improved the Chats speed and added a new Finance Ledger view.",
                type: "success",
                time: "Yesterday",
                read: true,
                link: "/dashboard"
            },
            {
                id: "prof-1",
                title: "Profile Activity",
                message: "Your security password was successfully updated earlier today.",
                type: "warning",
                time: "Just now",
                read: false,
                link: "/dashboard/settings?tab=profile",
                userEmail: "client@bsng.com"
            },
        ];
    });

    React.useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    }, [notifications]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map((n) => ({ ...n, read: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter((n) => n.id !== id));
    };

    const addNotification = (notif: Omit<Notification, 'id' | 'read' | 'time'>) => {
        const newNotif: Notification = {
            ...notif,
            id: Math.random().toString(36).substr(2, 9),
            read: false,
            time: "Just now"
        };
        setNotifications(prev => [newNotif, ...prev]);
    };

    const getFilteredNotifications = (userEmail?: string, siteId?: string, isAdminOrManager: boolean = false) => {
        return notifications.filter(n => {
            if (n.isAdminOnly && !isAdminOrManager) return false;
            if (isAdminOrManager) return true;
            if (n.userEmail && n.userEmail === userEmail) return true;
            if (n.siteId && n.siteId === siteId) return true;
            if (!n.userEmail && !n.siteId && !n.isAdminOnly) return true; // Global system alerts
            return false;
        });
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            addNotification,
            getFilteredNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
