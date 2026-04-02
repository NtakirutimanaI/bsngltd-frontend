import { useState } from "react";
import { toast } from "sonner";
import {
    Building2,
    Home,
    Plus,
    Download,
    MapPin
} from "lucide-react";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { useAuth } from "@/app/context/AuthContext";

// Components (Assuming we keep old logic or import it)
import { Projects } from "./Projects";
import { Properties } from "./Properties";
import { ManageSites } from "./ManageSites";
import { ExportReportModal } from "@/app/components/ExportReportModal";
import { AddProjectModal } from "@/app/components/AddProjectModal";
import { AddPropertyModal } from "@/app/components/AddPropertyModal";
import { AddSiteModal } from "@/app/components/AddSiteModal";

import { useSearchParams } from "react-router";

export function Portfolio() {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = (searchParams.get('tab') as 'projects' | 'properties' | 'sites') || 'projects';

    const setActiveTab = (tab: 'projects' | 'properties' | 'sites') => {
        setSearchParams({ tab });
    };

    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
    const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false);
    const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const roleName = ((typeof user?.role === 'object' && user.role !== null) ? user.role.name : user?.role || 'guest').toLowerCase();
    const canAdd = ['super_admin', 'admin', 'manager', 'site_manager'].includes(roleName);

    return (
        <div className="container-fluid px-2 px-md-4 pt-1 pb-2">
            <ExportReportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} onExport={(format) => { toast.success(`Downloading ${format.toUpperCase()} report...`); }} />

            {/* Header */}
            <ScrollReveal className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-4 px-2 px-md-4 pt-1">
                <div>
                    <h1 className="h5 fw-bold text-dark mb-0">Portfolio Hub</h1>
                    <p className="text-muted mb-0" style={{ fontSize: '12px' }}>Manage real estate assets, construction projects, and working sites</p>
                </div>
                <div className="d-flex gap-2">
                    {canAdd && (
                        <button
                            className="btn btn-primary px-4 py-2 rounded-xl text-xs font-bold shadow-lg d-flex align-items-center gap-2 border-0"
                            onClick={() => {
                                if (activeTab === 'projects') setIsAddProjectModalOpen(true);
                                else if (activeTab === 'properties') setIsAddPropertyModalOpen(true);
                                else setIsAddSiteModalOpen(true);
                            }}>
                            <Plus size={14} /> New {activeTab === 'projects' ? 'Project' : activeTab === 'properties' ? 'Property' : 'Site'}
                        </button>
                    )}
                    <button
                        className="btn btn-light p-2 border rounded-xl text-gray-500 transition-all hover:scale-110 active:scale-95 bg-white shadow-sm"
                        onClick={() => setIsExportModalOpen(true)}
                    >
                        <Download size={16} />
                    </button>
                </div>
            </ScrollReveal>

            {/* Hub Tabs */}
            <div className="bg-light rounded mb-4 shadow-sm mx-2 mx-md-4 p-2">
                <div className="nav nav-pills p-1.5 gap-2 bg-white rounded-xl">
                    <button
                        onClick={() => setActiveTab('projects')}
                        className={`nav-link flex-fill d-flex align-items-center justify-content-center gap-2 py-2.5 transition-all text-sm font-bold border-0 ${activeTab === 'projects' ? 'active' : 'text-gray-500 hover:text-primary'}`}
                        style={{ borderRadius: '10px' }}
                    >
                        <Building2 size={16} /> Active Projects
                    </button>
                    <button
                        onClick={() => setActiveTab('properties')}
                        className={`nav-link flex-fill d-flex align-items-center justify-content-center gap-2 py-2.5 transition-all text-sm font-bold border-0 ${activeTab === 'properties' ? 'active' : 'text-gray-500 hover:text-primary'}`}
                        style={{ borderRadius: '10px' }}
                    >
                        <Home size={16} /> Property Inventory
                    </button>
                    <button
                        onClick={() => setActiveTab('sites')}
                        className={`nav-link flex-fill d-flex align-items-center justify-content-center gap-2 py-2.5 transition-all text-sm font-bold border-0 ${activeTab === 'sites' ? 'active' : 'text-gray-500 hover:text-primary'}`}
                        style={{ borderRadius: '10px' }}
                    >
                        <MapPin size={16} /> Working Sites
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="portfolio-content-panel px-2 px-md-4">
                {activeTab === 'projects' ? (
                    <div className="fade-in">
                        <Projects hideHeader refreshKey={refreshKey} />
                    </div>
                ) : activeTab === 'properties' ? (
                    <div className="fade-in">
                        <Properties hideHeader refreshKey={refreshKey} />
                    </div>
                ) : (
                    <div className="fade-in">
                        <ManageSites hideHeader refreshKey={refreshKey} />
                    </div>
                )}
            </div>

            {/* Modals */}
            <AddProjectModal 
                isOpen={isAddProjectModalOpen} 
                onClose={() => setIsAddProjectModalOpen(false)} 
                onSuccess={() => {
                    setRefreshKey(prev => prev + 1);
                    setIsAddProjectModalOpen(false);
                }}
            />
            <AddPropertyModal 
                isOpen={isAddPropertyModalOpen} 
                onClose={() => setIsAddPropertyModalOpen(false)} 
                onSuccess={() => {
                    setRefreshKey(prev => prev + 1);
                    setIsAddPropertyModalOpen(false);
                }}
            />
            <AddSiteModal 
                isOpen={isAddSiteModalOpen} 
                onClose={() => setIsAddSiteModalOpen(false)} 
                onSuccess={() => {
                    setRefreshKey(prev => prev + 1);
                    setIsAddSiteModalOpen(false);
                }}
            />

            <style>{`
                .fade-in { animation: fadeIn 0.3s ease-in-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .portfolio-content-panel { min-height: 70vh; }
            `}</style>
        </div>
    );
}
