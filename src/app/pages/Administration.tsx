import {  } from "react";
import { useSearchParams } from "react-router";
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
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = (searchParams.get('tab') as 'users' | 'settings' | 'messages' | 'contact_messages' | 'sponsors' | 'developer') || 'users';

    const setActiveTab = (tab: any) => {
        setSearchParams({ tab });
    };

    const roleName = ((typeof user?.role === 'object' && user.role !== null) ? user.role.name : user?.role || 'guest').toLowerCase();
    const isAdmin = ['super_admin', 'admin', 'manager', 'hr'].includes(roleName);
    const isDeveloper = user?.email === 'info.buildstronggenerations@gmail.com';

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
            <ScrollReveal className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-4 px-2 px-md-4 pt-1">
                <div>
                    <h1 className="h5 fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                        <Shield className="text-primary" strokeWidth={2.5} size={24} />
                        Admin Control Center
                    </h1>
                    <p className="text-muted mb-0" style={{ fontSize: '12px' }}>Security, users, and global configurations</p>
                </div>
                <Link to="/dashboard">
                    <button className="btn btn-light px-4 py-2 rounded-xl text-xs font-bold shadow-sm d-flex align-items-center gap-2 border-0">
                        <LayoutDashboard size={16} />
                        <span>Dashboard</span>
                    </button>
                </Link>
            </ScrollReveal>

            <div className="bg-light rounded mb-4 shadow-sm mx-2 mx-md-4 p-2">
                <div className="nav nav-pills p-1.5 gap-2 bg-white rounded-xl">
                    {(['users', 'settings', 'messages', 'contact_messages', 'sponsors', 'developer'] as const).map((tab) => {
                        if (tab === 'developer' && !isDeveloper) return null;
                        if (roleName === 'hr' && tab !== 'users') return null;
                        const config = {
                            users: { name: "Access", icon: Users },
                            settings: { name: "System", icon: SettingsIcon },
                            messages: { name: "Internal", icon: Mail },
                            contact_messages: { name: "Website", icon: Mail },
                            sponsors: { name: "Partners", icon: Heart },
                            developer: { name: "Engine", icon: Terminal }
                        }[tab];

                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`nav-link flex-fill d-flex align-items-center justify-content-center gap-2 py-2.5 transition-all text-sm font-bold border-0 ${activeTab === tab ? 'active' : 'text-gray-500 hover:text-primary'}`}
                                style={{ borderRadius: '10px' }}
                            >
                                <config.icon size={18} />
                                <span className="d-none d-lg-inline">{config.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Panels */}
            <div className="admin-content-panel h-100 px-0">
                {activeTab === 'users' && (
                    <div className="fade-in">
                        <ManageUsers />
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
        .admin-content-panel { min-height: 60vh; }
    `}</style>
        </div>
    );
}
