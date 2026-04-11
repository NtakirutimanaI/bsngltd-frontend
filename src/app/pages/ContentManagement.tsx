import { useState } from "react";
import { useSearchParams } from "react-router";
import { Globe, Rss, Briefcase } from "lucide-react";

import { WebsiteCMS } from "./WebsiteCMS";
import { ManageUpdates } from "./ManageUpdates";
import { ManageServices } from "./ManageServices";


export function ContentManagement() {
    const [searchParams, setSearchParams] = useSearchParams();
    const contentSubTab = (searchParams.get('tab') as 'cms' | 'updates' | 'services') || 'cms';

    const setContentSubTab = (tab: any) => {
        setSearchParams({ tab });
    };

    return (
        <div className="container-fluid p-0">
            {/* Hub Navigation */}
            <div className="d-inline-flex mb-2 mx-3 bg-white border border-gray-100 rounded-3 overflow-hidden shadow-none">
                <div className="d-flex gap-2 px-2 py-2 w-100 overflow-auto">
                    <button
                        onClick={() => setContentSubTab('cms')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all d-flex align-items-center gap-2 text-nowrap border-0 ${contentSubTab === 'cms' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' : 'text-gray-500 bg-transparent hover:text-blue-600 hover:bg-blue-50'}`}
                    >
                        <Globe size={14} /> Page Sections
                    </button>
                    <button
                        onClick={() => setContentSubTab('updates')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all d-flex align-items-center gap-2 text-nowrap border-0 ${contentSubTab === 'updates' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' : 'text-gray-500 bg-transparent hover:text-blue-600 hover:bg-blue-50'}`}
                    >
                        <Rss size={14} /> Blog & Updates
                    </button>
                    <button
                        onClick={() => setContentSubTab('services')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all d-flex align-items-center gap-2 text-nowrap border-0 ${contentSubTab === 'services' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' : 'text-gray-500 bg-transparent hover:text-blue-600 hover:bg-blue-50'}`}
                    >
                        <Briefcase size={14} /> Services Portfolio
                    </button>
                </div>
            </div>

            {/* Tab Panels */}
            <div className="admin-content-panel h-100 px-3">
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
