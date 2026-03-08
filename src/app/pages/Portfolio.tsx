import { useState } from "react";
import {
    Building2,
    Home,
    Search,
    Filter,
    Plus,
    Calendar,
    MapPin,
    Tag,
    Layers,
    Download
} from "lucide-react";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { useAuth } from "@/app/context/AuthContext";

// Components (Assuming we keep old logic or import it)
import { Projects } from "./Projects";
import { Properties } from "./Properties";
import { ExportReportModal } from "@/app/components/ExportReportModal";

export function Portfolio() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'projects' | 'properties'>('projects');

    
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
const roleName = ((typeof user?.role === 'object' && user.role !== null) ? user.role.name : user?.role || 'guest').toLowerCase();
    const canAdd = ['super_admin', 'admin', 'manager', 'site_manager'].includes(roleName);

    return (
        <div className="container-fluid px-2 px-md-4 pt-1 pb-2">
            <ExportReportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} onExport={(format) => { toast.success(`Downloading ${format.toUpperCase()} report...`); }} />

            {/* Header */}
            <ScrollReveal className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-2 px-2 px-md-4 pt-1">
                <div>
                    <h1 className="h5 fw-bold text-dark mb-0">Portfolio Hub</h1>
                    <p className="text-muted mb-0" style={{ fontSize: '12px' }}>Manage real estate assets, construction projects, and inventory</p>
                </div>
                <div className="d-flex gap-3">
                    {canAdd && (
                        <button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold shadow-lg shadow-emerald-200 dark:shadow-none transition-all hover:scale-105 active:scale-95 d-flex align-items-center gap-2 border-0"
                         onClick={() => setIsExportModalOpen(true)}>
                            <Plus size={14} /> {activeTab === 'projects' ? 'New Project' : 'New Property'}
                        </button>
                    )}
                    <button
                        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 px-4 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105 active:scale-95 d-flex align-items-center gap-2"
                    >
                        <Download size={14} /> Export
                    </button>
                </div>
            </ScrollReveal>

            {/* Hub Tabs */}
            <div className="card border-0 shadow-sm mb-2 mx-2 mx-md-4" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                <div className="card-header bg-white border-0 p-0">
                    <div className="nav nav-pills p-1 gap-2">
                        <button
                            onClick={() => setActiveTab('projects')}
                            className={`nav-link flex-fill d-flex align-items-center justify-content-center gap-2 py-2.5 transition-all text-sm font-bold rounded-xl border-0 ${activeTab === 'projects' ? 'shadow-lg' : 'hover:bg-emerald-50'}`}
                            style={{
                                backgroundColor: activeTab === 'projects' ? '#059669' : 'transparent',
                                color: activeTab === 'projects' ? 'white' : '#6b7280'
                            }}
                        >
                            <Building2 size={16} /> Active Projects
                        </button>
                        <button
                            onClick={() => setActiveTab('properties')}
                            className={`nav-link flex-fill d-flex align-items-center justify-content-center gap-2 py-2.5 transition-all text-sm font-bold rounded-xl border-0 ${activeTab === 'properties' ? 'shadow-lg' : 'hover:bg-emerald-50'}`}
                            style={{
                                backgroundColor: activeTab === 'properties' ? '#059669' : 'transparent',
                                color: activeTab === 'properties' ? 'white' : '#6b7280'
                            }}
                        >
                            <Home size={16} /> Property Inventory
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="portfolio-content-panel px-2 px-md-4">
                {activeTab === 'projects' ? (
                    <div className="fade-in">
                        <Projects hideHeader />
                    </div>
                ) : (
                    <div className="fade-in">
                        <Properties hideHeader />
                    </div>
                )}
            </div>

            <style>{`
                .fade-in { animation: fadeIn 0.3s ease-in-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .portfolio-content-panel { min-height: 70vh; }
            `}</style>
        </div>
    );
}
