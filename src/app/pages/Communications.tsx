import { useSearchParams } from "react-router";
import { Mail, MessageSquare, Sparkles } from "lucide-react";
import { Messages } from "./Messages";
import { ContactMessages } from "./ContactMessages";
import { ScrollReveal } from "@/app/components/ScrollReveal";


export function Communications() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = (searchParams.get('tab') as 'internal' | 'website') || 'website';

    const setActiveTab = (tab: any) => {
        setSearchParams({ tab });
    };

    return (
        <div className="container-fluid p-0 md:p-4">
            {/* Header Section */}
            <ScrollReveal className="mb-4">
                <div className="bg-light rounded p-4 shadow-sm d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4">
                    <div className="d-flex align-items-center gap-4">
                        <div className="p-3 bg-white rounded-circle text-primary shadow-sm" style={{ width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MessageSquare strokeWidth={2} size={28} />
                        </div>
                        <div>
                            <h4 className="mb-1">Communications Center</h4>
                            <p className="text-muted mb-0">
                                Centralized hub for managing team collaborations, internal chats, and all public website enquiries.
                            </p>
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-2 bg-white text-primary px-4 py-2 rounded-pill shadow-sm shrink-0">
                        <Sparkles size={16} />
                        <span className="small fw-bold">Live Sync Active</span>
                    </div>
                </div>
            </ScrollReveal>

            {/* Navigation Tabs */}
            <ScrollReveal className="mb-4" delay={0.1}>
                <div className="nav nav-pills d-flex gap-2 border-bottom pb-3">
                    <button
                        onClick={() => setActiveTab('website')}
                        className={`nav-item nav-link d-flex align-items-center gap-2 ${activeTab === 'website' ? 'active' : 'bg-light text-muted'}`}
                    >
                        <Mail size={18} />
                        Website Enquiries
                    </button>
                    <button
                        onClick={() => setActiveTab('internal')}
                        className={`nav-item nav-link d-flex align-items-center gap-2 ${activeTab === 'internal' ? 'active' : 'bg-light text-muted'}`}
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
