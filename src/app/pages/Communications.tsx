import { useSearchParams } from "react-router";
import { Messages } from "./Messages";
import { ContactMessages } from "./ContactMessages";
import { Notifications } from "./Notifications";
import { useAuth } from "../context/AuthContext";

export function Communications() {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    
    const roleName = ((typeof user?.role === 'object' && user.role !== null) ? user.role.name : user?.role || 'guest').toLowerCase();
    const isAdminOrManager = ['super_admin', 'admin', 'manager', 'site_manager'].includes(roleName);
    
    // Default to 'internal' (Charts) for all, but allow 'website' or 'notifications' via params
    const activeTab = (searchParams.get('tab') as 'website' | 'internal' | 'notifications') || 'internal';

    return (
        <div className="container-fluid py-0 min-vh-100" style={{ background: 'transparent' }}>
            <div className="row g-0">
                {/* Full width content based on promoted sidebar links */}
                <div className="col-12 h-100">
                    <div className="admin-content-panel h-100 px-0">
                        {activeTab === 'website' && isAdminOrManager && (
                            <div className="fade-in-up h-100 p-0">
                                <ContactMessages />
                            </div>
                        )}
                        {activeTab === 'internal' && (
                            <div className="fade-in-up h-100">
                                <Messages />
                            </div>
                        )}
                        {activeTab === 'notifications' && (
                            <div className="fade-in-up h-100">
                                <Notifications />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .fade-in-up { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes fadeInUp { 
                    from { opacity: 0; transform: translateY(15px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
            `}</style>
        </div>
    );
}
