import { useState } from "react";
import {
    Shield,
    UserCog,
    Settings as SettingsIcon,
    Layout,
    Mail,
    Users,
    Globe,
    Rss,
    Briefcase,
    Heart,
    Terminal
} from "lucide-react";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { useAuth } from "@/app/context/AuthContext";

// Consolidated Pages
import { ManageUsers } from "./ManageUsers";
import { Settings } from "./Settings";
import { WebsiteCMS } from "./WebsiteCMS";
import { Messages } from "./Messages";
import { ManageUpdates } from "./ManageUpdates";
import { ManageServices } from "./ManageServices";
import { Sponsors } from "./Sponsors";
import { DeveloperCore } from "./DeveloperCore";

export function Administration() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'users' | 'settings' | 'content' | 'messages' | 'sponsors' | 'developer'>('users');
    const [contentSubTab, setContentSubTab] = useState<'cms' | 'updates' | 'services'>('cms');

    const roleName = ((typeof user?.role === 'object' && user.role !== null) ? user.role.name : user?.role || 'guest').toLowerCase();
    const isAdmin = ['super_admin', 'admin', 'manager'].includes(roleName);
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
            <ScrollReveal className="mb-4 px-4 pt-4">
                <h1 className="h3 fw-bold text-dark d-flex align-items-center gap-2">
                    <UserCog className="text-orange-600" />
                    Admin Control Center
                </h1>
                <p className="text-muted">Manage system security, users, global configurations and website content</p>
            </ScrollReveal>

            {/* Hub Navigation */}
            <div className="card border-0 shadow-sm mb-4 mx-4" style={{ borderRadius: '16px' }}>
                <div className="card-body p-0">
                    <div className="d-flex flex-wrap border-bottom">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex-fill py-3 border-0 bg-transparent transition-all d-flex align-items-center justify-content-center gap-2 fw-medium ${activeTab === 'users' ? 'text-orange-600 border-bottom border-orange-600 border-3' : 'text-muted hover:bg-light'}`}
                        >
                            <Users size={18} /> Identity & Access
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`flex-fill py-3 border-0 bg-transparent transition-all d-flex align-items-center justify-content-center gap-2 fw-medium ${activeTab === 'settings' ? 'text-orange-600 border-bottom border-orange-600 border-3' : 'text-muted hover:bg-light'}`}
                        >
                            <SettingsIcon size={18} /> System Config
                        </button>
                        <button
                            onClick={() => setActiveTab('content')}
                            className={`flex-fill py-3 border-0 bg-transparent transition-all d-flex align-items-center justify-content-center gap-2 fw-medium ${activeTab === 'content' ? 'text-orange-600 border-bottom border-orange-600 border-3' : 'text-muted hover:bg-light'}`}
                        >
                            <Layout size={18} /> Content Management
                        </button>
                        <button
                            onClick={() => setActiveTab('messages')}
                            className={`flex-fill py-3 border-0 bg-transparent transition-all d-flex align-items-center justify-content-center gap-2 fw-medium ${activeTab === 'messages' ? 'text-orange-600 border-bottom border-orange-600 border-3' : 'text-muted hover:bg-light'}`}
                        >
                            <Mail size={18} /> Communications
                        </button>
                        <button
                            onClick={() => setActiveTab('sponsors')}
                            className={`flex-fill py-3 border-0 bg-transparent transition-all d-flex align-items-center justify-content-center gap-2 fw-medium ${activeTab === 'sponsors' ? 'text-orange-600 border-bottom border-orange-600 border-3' : 'text-muted hover:bg-light'}`}
                        >
                            <Heart size={18} /> Partners & Sponsors
                        </button>
                        {isDeveloper && (
                            <button
                                onClick={() => setActiveTab('developer')}
                                className={`flex-fill py-3 border-0 bg-transparent transition-all d-flex align-items-center justify-content-center gap-2 fw-medium ${activeTab === 'developer' ? 'text-danger border-bottom border-danger border-3' : 'text-muted hover:bg-light'}`}
                            >
                                <Terminal size={18} /> Developer Engine
                            </button>
                        )}
                    </div>

                    {/* Sub-tabs for Content */}
                    {activeTab === 'content' && (
                        <div className="d-flex gap-4 px-4 py-2 bg-light/50 border-bottom overflow-auto">
                            <button
                                onClick={() => setContentSubTab('cms')}
                                className={`btn btn-sm border-0 d-flex align-items-center gap-2 text-nowrap ${contentSubTab === 'cms' ? 'fw-bold text-orange-600' : 'text-muted'}`}
                            >
                                <Globe size={14} /> Page Sections
                            </button>
                            <button
                                onClick={() => setContentSubTab('updates')}
                                className={`btn btn-sm border-0 d-flex align-items-center gap-2 text-nowrap ${contentSubTab === 'updates' ? 'fw-bold text-orange-600' : 'text-muted'}`}
                            >
                                <Rss size={14} /> Blog & Updates
                            </button>
                            <button
                                onClick={() => setContentSubTab('services')}
                                className={`btn btn-sm border-0 d-flex align-items-center gap-2 text-nowrap ${contentSubTab === 'services' ? 'fw-bold text-orange-600' : 'text-muted'}`}
                            >
                                <Briefcase size={14} /> Services Portfolio
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Tab Panels */}
            <div className="admin-content-panel h-100 px-4">
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
                {activeTab === 'content' && (
                    <div className="fade-in h-100">
                        {contentSubTab === 'cms' && <WebsiteCMS />}
                        {contentSubTab === 'updates' && <ManageUpdates />}
                        {contentSubTab === 'services' && <ManageServices />}
                    </div>
                )}
                {activeTab === 'messages' && (
                    <div className="fade-in h-100">
                        <Messages />
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
                .text-orange-600 { color: #ea580c !important; }
                .border-orange-600 { border-color: #ea580c !important; }
                .hover\:bg-light:hover { background-color: #f8f9fa !important; }
            `}</style>
        </div>
    );
}
