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

export function Portfolio() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'projects' | 'properties'>('projects');

    const roleName = ((typeof user?.role === 'object' && user.role !== null) ? user.role.name : user?.role || 'guest').toLowerCase();
    const canAdd = ['super_admin', 'admin', 'manager', 'site_manager'].includes(roleName);

    return (
        <div className="container-fluid px-2 px-md-4 pt-1 pb-2">
            {/* Header */}
            <ScrollReveal className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-2 px-2 px-md-4 pt-1">
                <div>
                    <h1 className="h5 fw-bold text-dark mb-0">Portfolio Hub</h1>
                    <p className="text-muted mb-0" style={{ fontSize: '12px' }}>Manage real estate assets, construction projects, and inventory</p>
                </div>
                <div className="d-flex gap-2">
                    {canAdd && (
                        <button
                            className="btn px-3 py-1 text-white border-0 shadow d-flex align-items-center gap-1"
                            style={{ background: '#16a085', border: 'none', color: '#fff', fontWeight: 600, fontSize: '12px', height: '30px' }}
                        >
                            <Plus size={13} /> {activeTab === 'projects' ? 'New Project' : 'New Property'}
                        </button>
                    )}
                    <button 
                        className="btn px-3 py-1 d-flex align-items-center gap-1"
                        style={{ background: 'transparent', border: '2px solid #16a085', color: '#16a085', fontWeight: 600, fontSize: '12px', height: '30px' }}
                    >
                        <Download size={13} /> Export
                    </button>
                </div>
            </ScrollReveal>

            {/* Hub Tabs */}
            <div className="card border-0 shadow-sm mb-2 mx-2 mx-md-4" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                <div className="card-header bg-white border-0 p-0">
                    <div className="nav nav-pills p-1 gap-2">
                        <button
                            onClick={() => setActiveTab('projects')}
                            className={`nav-link flex-fill d-flex align-items-center justify-content-center gap-1 py-2 transition-all ${activeTab === 'projects' ? 'text-white shadow' : 'text-muted hover:bg-light'}`}
                            style={{ 
                                borderRadius: '8px', 
                                border: 'none',
                                background: activeTab === 'projects' ? '#16a085' : 'transparent',
                                color: activeTab === 'projects' ? '#fff' : '#6c757d',
                                fontWeight: 600,
                                fontSize: '12px'
                            }}
                        >
                            <Building2 size={14} /> Active Projects
                        </button>
                        <button
                            onClick={() => setActiveTab('properties')}
                            className={`nav-link flex-fill d-flex align-items-center justify-content-center gap-1 py-2 transition-all ${activeTab === 'properties' ? 'text-white shadow' : 'text-muted hover:bg-light'}`}
                            style={{ 
                                borderRadius: '8px', 
                                border: 'none',
                                background: activeTab === 'properties' ? '#16a085' : 'transparent',
                                color: activeTab === 'properties' ? '#fff' : '#6c757d',
                                fontWeight: 600,
                                fontSize: '12px'
                            }}
                        >
                            <Home size={14} /> Property Inventory
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
