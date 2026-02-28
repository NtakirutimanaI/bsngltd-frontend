import { useState } from "react";
import { Mail, MessageSquare, Sparkles } from "lucide-react";
import { Messages } from "./Messages";
import { ContactMessages } from "./ContactMessages";
import { ScrollReveal } from "@/app/components/ScrollReveal";

export function Communications() {
    const [activeTab, setActiveTab] = useState<'internal' | 'website'>('website');

    return (
        <div className="container-fluid p-0 md:p-4">
            {/* Header Section */}
            <ScrollReveal className="mb-6">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4">
                    <div className="d-flex align-items-center gap-4">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-600">
                            <MessageSquare strokeWidth={2} size={28} />
                        </div>
                        <div>
                            <h1 className="h3 fw-bold text-gray-900 dark:text-white mb-1">
                                Communications Center
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mb-0">
                                Centralized hub for managing team collaborations, internal chats, and all public website enquiries.
                            </p>
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-4 py-2 rounded-full border border-emerald-100 dark:border-emerald-800 shadow-sm shrink-0">
                        <Sparkles size={16} />
                        <span className="text-sm font-semibold">Live Sync Active</span>
                    </div>
                </div>
            </ScrollReveal>

            {/* Navigation Tabs */}
            <ScrollReveal className="mb-6 px-2 md:px-0" delay={0.1}>
                <div className="d-flex gap-4 border-bottom border-gray-200 dark:border-gray-800">
                    <button
                        onClick={() => setActiveTab('website')}
                        className={`pb-3 font-semibold text-sm transition-all duration-200 d-flex align-items-center gap-2 border-bottom border-2 border-x-0 border-t-0 ${activeTab === 'website'
                            ? 'text-emerald-600 border-emerald-600 dark:text-emerald-400 dark:border-emerald-400'
                            : 'text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                    >
                        <Mail size={18} />
                        Website Enquiries
                    </button>
                    <button
                        onClick={() => setActiveTab('internal')}
                        className={`pb-3 font-semibold text-sm transition-all duration-200 d-flex align-items-center gap-2 border-bottom border-2 border-x-0 border-t-0 ${activeTab === 'internal'
                            ? 'text-emerald-600 border-emerald-600 dark:text-emerald-400 dark:border-emerald-400'
                            : 'text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                    >
                        <MessageSquare size={18} />
                        Internal Team Chats
                    </button>
                </div>
            </ScrollReveal>

            {/* Content Area */}
            <div className="admin-content-panel h-100 px-0">
                {activeTab === 'website' && (
                    <div className="fade-in-up h-100">
                        <ContactMessages />
                    </div>
                )}
                {activeTab === 'internal' && (
                    <div className="fade-in-up h-100">
                        <Messages />
                    </div>
                )}
            </div>

            <style>{`
                .fade-in-up { 
                    animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
                }
                @keyframes fadeInUp { 
                    from { opacity: 0; transform: translateY(15px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
            `}</style>
        </div>
    );
}
