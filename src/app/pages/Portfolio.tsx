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
        <div className="container-fluid p-0">
            {/* Header */}
            <ScrollReveal className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4 mb-4 px-4 pt-4">
                <div>
                    <h1 className="h3 fw-bold text-dark">Portfolio Hub</h1>
                    <p className="text-muted mt-1">Manage real estate assets, construction projects, and inventory</p>
                </div>
                <div className="d-flex gap-2">
                    {canAdd && (
                        <button
                            className="btn px-4 py-2 text-white border-0 shadow-lg d-flex align-items-center gap-2"
                            style={{ background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)', borderRadius: '12px', fontWeight: '600' }}
                        >
                            <Plus size={18} /> {activeTab === 'projects' ? 'New Project' : 'New Property'}
                        </button>
                    )}
                    <button className="btn btn-outline-secondary px-3" style={{ borderRadius: '12px' }}>
                        <Download size={18} /> Export
                    </button>
                </div>
            </ScrollReveal>

            {/* Hub Tabs */}
            <div className="card border-0 shadow-sm mb-4 mx-4" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <div className="card-header bg-white border-0 p-0">
                    <div className="nav nav-pills p-2 gap-2">
                        <button
                            onClick={() => setActiveTab('projects')}
                            className={`nav-link flex-fill d-flex align-items-center justify-content-center gap-2 py-3 transition-all ${activeTab === 'projects' ? 'bg-slate-800 text-white shadow-md' : 'text-muted hover:bg-light'}`}
                            style={{ borderRadius: '12px', border: 'none' }}
                        >
                            <Building2 size={20} /> Active Projects
                        </button>
                        <button
                            onClick={() => setActiveTab('properties')}
                            className={`nav-link flex-fill d-flex align-items-center justify-content-center gap-2 py-3 transition-all ${activeTab === 'properties' ? 'bg-slate-800 text-white shadow-md' : 'text-muted hover:bg-light'}`}
                            style={{ borderRadius: '12px', border: 'none' }}
                        >
                            <Home size={20} /> Property Inventory
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="portfolio-content-panel px-4">
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
                .bg-slate-800 { background-color: #1e293b !important; }
            `}</style>
        </div>
    );
}
