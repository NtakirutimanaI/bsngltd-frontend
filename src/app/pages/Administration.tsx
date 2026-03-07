import { useState } from "react";
import {
    Shield,
    Settings as SettingsIcon,
    Mail,
    Users,
    Heart,
    Terminal,
    LayoutDashboard
} from "lucide-react";
import { Link } from "react-router";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import "@/styles/dashboard-premium.css";
import { useAuth } from "@/app/context/AuthContext";

import { ManageUsers } from "./ManageUsers";
import { Settings } from "./Settings";
import { Messages } from "./Messages";
import { Sponsors } from "./Sponsors";
import { DeveloperCore } from "./DeveloperCore";
import { ContactMessages } from "./ContactMessages";

export function Administration() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'users' | 'settings' | 'messages' | 'contact_messages' | 'sponsors' | 'developer'>('users');

    const roleName = ((typeof user?.role === 'object' && user.role !== null) ? user.role.name : user?.role || 'guest').toLowerCase();
    const isAdmin = ['super_admin', 'admin', 'manager', 'hr'].includes(roleName);
    const isDeveloper = user?.email === 'innocentntakir@gmail.com';

    if (!isAdmin) {
        return (
            <div className="text-center py-5 mt-5">
                <Shield size={64} className="text-danger mb-3 opacity-25 mx-auto" />
                <h2 className="fw-bold">Access Restricted</h2>
                <p className="text-muted">You do not have administrative privileges to access this center.</p>
            </div>
        );
    }

    return (
        <div className="container-fluid p-0">
            {/* Header */}
            <ScrollReveal className="mb-4 px-2 pt-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1">
                        <h1 className="h4 fw-bold text-dark d-flex align-items-center gap-2 mb-1">
                            <Shield className="text-emerald-600" strokeWidth={2.5} size={24} />
                            Admin Control Center
                        </h1>
                        <p className="text-muted small mb-0">Security, users, and global configurations</p>
                    </div>
                    <Link to="/dashboard" className="w-full sm:w-auto">
                        <button className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl text-sm font-bold shadow-sm flex items-center justify-center gap-2 transition-all hover:bg-gray-50 active:scale-95">
                            <LayoutDashboard size={16} />
                            <span className="whitespace-nowrap">Dashboard</span>
                        </button>
                    </Link>
                </div>
            </ScrollReveal>

            {/* Hub Navigation */}
            <div className="bg-white border mb-3 overflow-hidden" style={{ borderRadius: '12px', borderColor: '#e5e7eb' }}>
                <div className="card-body p-0">
                    <div className="d-flex flex-wrap bg-light/30">
                        {(['users', 'settings', 'messages', 'contact_messages', 'sponsors', 'developer'] as const).map((tab) => {
                            if (tab === 'developer' && !isDeveloper) return null;
                            if (roleName === 'hr' && tab !== 'users') return null; // HR only manages users/employees
                            const config = {
                                users: { name: "Identity & Access", icon: Users, color: '#16a085' },
                                settings: { name: "System Config", icon: SettingsIcon, color: '#16a085' },
                                messages: { name: "Internal Chats", icon: Mail, color: '#16a085' },
                                contact_messages: { name: "Website Enquiries", icon: Mail, color: '#16a085' },
                                sponsors: { name: "Partners & Sponsors", icon: Heart, color: '#16a085' },
                                developer: { name: "Developer Engine", icon: Terminal, color: '#dc2626' }
                            }[tab];

                            return (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-fill py-3.5 border-0 bg-transparent transition-all d-flex align-items-center justify-content-center gap-2 fw-bold text-sm ${activeTab === tab ? 'bg-white border-bottom' : 'text-muted-foreground hover:bg-light'}`}
                                    style={activeTab === tab ? { borderBottom: `3px solid ${config.color}`, color: config.color } : {}}
                                >
                                    <config.icon size={18} strokeWidth={activeTab === tab ? 2.5 : 2} />
                                    {config.name}
                                </button>
                            );
                        })}
                    </div>

                </div>
            </div>

            {/* Tab Panels */}
            <div className="admin-content-panel h-100 px-0">
                {activeTab === 'users' && (
                    <div className="fade-in">
                        <ManageUsers hideHeader={true} />
                    </div>
                )}
                {activeTab === 'settings' && (
                    <div className="fade-in">
                        <Settings />
                    </div>
                )}
                {activeTab === 'messages' && (
                    <div className="fade-in h-100">
                        <Messages />
                    </div>
                )}
                {activeTab === 'contact_messages' && (
                    <div className="fade-in h-100">
                        <ContactMessages />
                    </div>
                )}
                {activeTab === 'sponsors' && (
                    <div className="fade-in">
                        <Sponsors />
                    </div>
                )}
                {activeTab === 'developer' && isDeveloper && (
                    <div className="fade-in">
                        <DeveloperCore />
                    </div>
                )}
            </div>

            <style>{`
        .fade-in { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .gradient-text {
            background: linear-gradient(90deg, #1abc9c 0%, #16a085 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: 800;
        }
        .admin-content-panel { min-height: 60vh; }
        .text-emerald-600 { color: #16a085 !important; }
        .border-emerald-600 { border-color: #16a085 !important; }
        .hover\\:bg-light:hover { background-color: #f8f9fa !important; }
    `}</style>
        </div>
    );
}
