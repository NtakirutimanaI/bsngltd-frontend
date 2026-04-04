import { useSearchParams } from "react-router";
import { Mail, MessageSquare, ChevronRight } from "lucide-react";
import { Messages } from "./Messages";
import { ContactMessages } from "./ContactMessages";

export function Communications() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = (searchParams.get('tab') as 'website' | 'internal') || 'website';

    const setActiveTab = (tab: any) => {
        setSearchParams({ tab });
    };

    const categories = [
        { id: 'website', name: 'Website Enquiries', icon: Mail, color: 'text-blue-500', description: 'Public contact forms' },
        { id: 'internal', name: 'Internal Team Chats', icon: MessageSquare, color: 'text-indigo-500', description: 'Secure collaboration' }
    ];

    return (
        <div className="container-fluid py-0 min-vh-100" style={{ background: 'transparent' }}>
            <div className="row g-4 pt-2">
                {/* Category sub-sidebar */}
                <div className="col-lg-3 px-lg-4 border-end border-gray-100">
                    <div className="glass-card p-2 rounded-xl mb-3 border border-white shadow-sm" style={{ background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)' }}>
                        <div className="d-flex align-items-center gap-2 mb-0 pb-2 border-bottom border-gray-100">
                            <div className="bg-primary rounded-lg p-2 text-white shadow-sm d-flex align-items-center justify-content-center">
                                <MessageSquare size={16} />
                            </div>
                            <div className="overflow-hidden">
                                <h2 className="fw-bold mb-0 text-truncate" style={{ fontSize: '13px' }}>Communication</h2>
                                <p className="smaller text-muted mb-0" style={{ fontSize: '11px' }}>Centralized messaging</p>
                            </div>
                        </div>
                    </div>

                    <div className="directory-scroll-container">
                        {categories.map((cat) => (
                            <div 
                                key={cat.id} 
                                onClick={() => setActiveTab(cat.id)}
                                className={`site-row p-1 mb-1.5 rounded-xl transition-all border cursor-pointer ${activeTab === cat.id ? 'active-site shadow-md' : 'bg-white text-dark border-gray-100 hover:bg-light'}`}
                                style={activeTab === cat.id ? { 
                                    background: '#009CFF',
                                    borderColor: '#009CFF',
                                    color: 'white'
                                } : {}}
                            >
                                <div className="px-3 py-2 d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center gap-3 overflow-hidden flex-grow-1">
                                        <div className={`rounded-lg p-2 d-flex align-items-center justify-content-center ${activeTab === cat.id ? 'bg-white/20' : 'bg-blue-50'}`} style={{ width: '34px', height: '34px' }}>
                                            <cat.icon size={16} className={activeTab === cat.id ? 'text-white' : cat.color} />
                                        </div>
                                        <div className="overflow-hidden text-start">
                                            <h6 className="fw-bold mb-0 text-truncate" style={{ fontSize: '11px' }}>{cat.name}</h6>
                                            <div className={`smaller ${activeTab === cat.id ? 'text-white/80' : 'text-muted'}`} style={{ fontSize: '9px' }}>{cat.description}</div>
                                        </div>
                                    </div>
                                    {activeTab === cat.id && <ChevronRight size={14} />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="col-lg-9 px-lg-4">
                    <div className="admin-content-panel h-100 px-0 mt-2">
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
                </div>
            </div>

            <style>{`
                .active-site { border-color: #009CFF !important; }
                .fade-in { animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .smaller { font-size: 11px; }
                .site-row:hover { border-color: #009CFF !important; background-color: #f8fbff !important; }
                .directory-scroll-container::-webkit-scrollbar { width: 4px; }
                .directory-scroll-container::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .shadow-xs { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
                .fade-in-up { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes fadeInUp { 
                    from { opacity: 0; transform: translateY(15px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
            `}</style>
        </div>
    );
}
