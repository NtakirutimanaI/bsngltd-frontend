import { useState } from "react";
import { toast } from "sonner";
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
import { ExportReportModal } from "@/app/components/ExportReportModal";

export function Insights() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'business' | 'website'>('business');


    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const roleName = ((typeof user?.role === 'object' && user.role !== null) ? user.role.name : user?.role || 'guest').toLowerCase();
    const isAdminOrAuditor = ['super_admin', 'admin', 'manager', 'auditor'].includes(roleName);

    if (!isAdminOrAuditor) {
        return (
            <div className="text-center py-5 mt-5">
                <ExportReportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} onExport={(format) => { toast.success(`Downloading ${format.toUpperCase()} report...`); }} />

                <Zap size={64} className="text-warning mb-3 opacity-25 mx-auto" />
                <h2 className="fw-bold">Insights Restricted</h2>
                <p className="text-muted">High-level analytics are only available to management and auditors.</p>
            </div>
        );
    }

    return (
        <div className="container-fluid px-2 px-md-4 pt-1 pb-2">
            {/* Header */}
            <ScrollReveal className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-2 px-2 px-md-4 pt-1">
                <div>
                    <h1 className="h5 fw-bold text-dark mb-0">Insights Center</h1>
                    <p className="text-muted mb-0" style={{ fontSize: '12px' }}>Holistic view of business performance, financial health, and digital presence</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn px-3 py-1 d-flex align-items-center gap-1" style={{
                        background: 'transparent', border: '2px solid #16a085', color: '#16a085', fontWeight: 600, fontSize: '12px', height: '30px'
                    }}>
                        <Download size={13} /> Generate PDF
                    </button>
                    <button
                        className="btn px-3 py-1 text-white border-0 shadow d-flex align-items-center gap-1"
                        style={{ background: '#16a085', border: 'none', color: '#fff', fontWeight: 600, fontSize: '12px', height: '30px' }}
                    >
                        <FileText size={13} /> Export Raw Data
                    </button>
                </div>
            </ScrollReveal>

            {/* Hub Tabs */}
            <div className="card border-0 shadow-sm mb-2 mx-2 mx-md-4" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                <div className="card-header bg-white border-0 p-0">
                    <div className="nav nav-pills p-1 gap-2">
                        <button
                            onClick={() => setActiveTab('business')}
                            className={`nav-link flex-fill d-flex align-items-center justify-content-center gap-1 py-2 transition-all ${activeTab === 'business' ? 'text-white shadow' : 'text-muted hover:bg-light'}`}
                            style={{ borderRadius: '8px', border: 'none', background: activeTab === 'business' ? '#16a085' : 'transparent', color: activeTab === 'business' ? '#fff' : '#6c757d', fontWeight: 600, fontSize: '12px' }}
                        >
                            <TrendingUp size={14} /> Business Performance
                        </button>
                        <button
                            onClick={() => setActiveTab('website')}
                            className={`nav-link flex-fill d-flex align-items-center justify-content-center gap-1 py-2 transition-all ${activeTab === 'website' ? 'text-white shadow' : 'text-muted hover:bg-light'}`}
                            style={{ borderRadius: '8px', border: 'none', background: activeTab === 'website' ? '#16a085' : 'transparent', color: activeTab === 'website' ? '#fff' : '#6c757d', fontWeight: 600, fontSize: '12px' }}
                        >
                            <Globe size={14} /> Digital Analytics
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="insights-content-panel px-2 px-md-4 pb-2">
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
