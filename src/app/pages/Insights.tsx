import { useState } from "react";
import {
    TrendingUp,
    Download,
    Globe,
    FileText,
    Zap
} from "lucide-react";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { useAuth } from "@/app/context/AuthContext";

// Components
import { Reports } from "./Reports";
import { WebsiteAnalytics } from "./WebsiteAnalytics";

export function Insights() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'business' | 'website'>('business');

    const roleName = ((typeof user?.role === 'object' && user.role !== null) ? user.role.name : user?.role || 'guest').toLowerCase();
    const isAdminOrAuditor = ['super_admin', 'admin', 'manager', 'auditor'].includes(roleName);

    if (!isAdminOrAuditor) {
        return (
            <div className="text-center py-5 mt-5">
                <Zap size={64} className="text-warning mb-3 opacity-25 mx-auto" />
                <h2 className="fw-bold">Insights Restricted</h2>
                <p className="text-muted">High-level analytics are only available to management and auditors.</p>
            </div>
        );
    }

    return (
        <div className="container-fluid p-0">
            {/* Header */}
            <ScrollReveal className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4 mb-4 px-4 pt-4">
                <div>
                    <h1 className="h3 fw-bold text-dark">Insights Center</h1>
                    <p className="text-muted mt-1">Holistic view of business performance, financial health, and digital presence</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary px-3" style={{ borderRadius: '12px' }}>
                        <Download size={18} /> Generate PDF
                    </button>
                    <button
                        className="btn px-4 py-2 text-white border-0 shadow-lg d-flex align-items-center gap-2"
                        style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', borderRadius: '12px', fontWeight: '600' }}
                    >
                        <FileText size={18} /> Export Raw Data
                    </button>
                </div>
            </ScrollReveal>

            {/* Hub Tabs */}
            <div className="card border-0 shadow-sm mb-4 mx-4" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <div className="card-header bg-white border-0 p-0">
                    <div className="nav nav-pills p-2 gap-2">
                        <button
                            onClick={() => setActiveTab('business')}
                            className={`nav-link flex-fill d-flex align-items-center justify-content-center gap-2 py-3 transition-all ${activeTab === 'business' ? 'bg-indigo-600 text-white shadow-md' : 'text-muted hover:bg-light'}`}
                            style={{ borderRadius: '12px', border: 'none' }}
                        >
                            <TrendingUp size={20} /> Business Performance
                        </button>
                        <button
                            onClick={() => setActiveTab('website')}
                            className={`nav-link flex-fill d-flex align-items-center justify-content-center gap-2 py-3 transition-all ${activeTab === 'website' ? 'bg-indigo-600 text-white shadow-md' : 'text-muted hover:bg-light'}`}
                            style={{ borderRadius: '12px', border: 'none' }}
                        >
                            <Globe size={20} /> Digital Analytics
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="insights-content-panel px-4 pb-4">
                {activeTab === 'business' ? (
                    <div className="fade-in">
                        <Reports hideHeader={true} />
                    </div>
                ) : (
                    <div className="fade-in">
                        <WebsiteAnalytics hideHeader={true} />
                    </div>
                )}
            </div>

            <style>{`
                .fade-in { animation: fadeIn 0.3s ease-in-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .insights-content-panel { min-height: 70vh; }
                .bg-indigo-600 { background-color: #4f46e5 !important; }
            `}</style>
        </div>
    );
}
