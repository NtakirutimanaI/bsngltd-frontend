import { useState } from "react";
import { Globe, Rss, Briefcase, Layout } from "lucide-react";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { WebsiteCMS } from "./WebsiteCMS";
import { ManageUpdates } from "./ManageUpdates";
import { ManageServices } from "./ManageServices";

export function ContentManagement() {
    const [contentSubTab, setContentSubTab] = useState<'cms' | 'updates' | 'services'>('cms');

    return (
        <div className="container-fluid p-0">
            {/* Header */}
            <ScrollReveal className="mb-4 px-4 pt-4">
                <div>
                    <h1 className="h3 fw-bold text-dark d-flex align-items-center gap-2 mb-1">
                        <Layout className="text-emerald-600" strokeWidth={2.5} size={28} />
                        Content Management
                    </h1>
                    <p className="text-muted small">Manage website sections, blog updates, and services portfolio</p>
                </div>
            </ScrollReveal>

            {/* Hub Navigation */}
            <div className="premium-card mb-4 mx-4 overflow-hidden border-0 shadow-lg">
                <div className="card-body p-0">
                    <div className="d-flex gap-4 px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-bottom overflow-auto">
                        <button
                            onClick={() => setContentSubTab('cms')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all d-flex align-items-center gap-2 text-nowrap border-0 ${contentSubTab === 'cms' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
                        >
                            <Globe size={14} /> Page Sections
                        </button>
                        <button
                            onClick={() => setContentSubTab('updates')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all d-flex align-items-center gap-2 text-nowrap border-0 ${contentSubTab === 'updates' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
                        >
                            <Rss size={14} /> Blog & Updates
                        </button>
                        <button
                            onClick={() => setContentSubTab('services')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all d-flex align-items-center gap-2 text-nowrap border-0 ${contentSubTab === 'services' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
                        >
                            <Briefcase size={14} /> Services Portfolio
                        </button>
                    </div>
                </div>
            </div>

            {/* Tab Panels */}
            <div className="admin-content-panel h-100 px-4">
                <div className="fade-in h-100">
                    {contentSubTab === 'cms' && <WebsiteCMS />}
                    {contentSubTab === 'updates' && <ManageUpdates />}
                    {contentSubTab === 'services' && <ManageServices />}
                </div>
            </div>

            <style>{`
                .fade-in { animation: fadeIn 0.3s ease-in-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .admin-content-panel { min-height: 60vh; }
            `}</style>
        </div>
    );
}
