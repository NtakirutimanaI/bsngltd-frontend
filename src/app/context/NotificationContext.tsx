import React, { createContext, useContext, useState } from 'react';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    time: string;
    read: boolean;
    link?: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    deleteNotification: (id: string) => void;
    addNotification: (notification: Omit<Notification, 'id' | 'read' | 'time'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: "1",
            title: "New Project Assigned",
            message: "You've been assigned to Kigali Heights Tower project",
            type: "info",
            time: "5 minutes ago",
            read: false,
            link: "/dashboard/portfolio"
        },
        {
            id: "2",
            title: "Payment Received",
            message: "RWF 15M received from Government of Rwanda",
            type: "success",
            time: "1 hour ago",
            read: false,
            link: "/dashboard/finance"
        },
        {
            id: "3",
            title: "Budget Alert",
            message: "Green Valley Estates is 80% over budget",
            type: "warning",
            time: "2 hours ago",
            read: false,
            link: "/dashboard/insights"
        },
        {
            id: "4",
            title: "Payment Failed",
            message: "Contractor payment transaction failed",
            type: "error",
            time: "3 hours ago",
            read: true,
            link: "/dashboard/finance"
        },
        {
            id: "5",
            title: "New Employee",
            message: "Alice Mukamana has joined the HR department",
            type: "info",
            time: "Yesterday",
            read: true,
            link: "/dashboard/employees"
        },
    ]);

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

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            addNotification
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
