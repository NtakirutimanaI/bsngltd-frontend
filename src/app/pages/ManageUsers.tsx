import { useState, useEffect } from "react";
import { Users, MapPin, Shield, Eye, UserPlus, ShieldCheck, Briefcase, HeartHandshake, Building2, PlusCircle, UserCircle, Edit2, Trash2, MoreVertical, Globe, Calendar, Mail, Phone, UserCircle as UserIcon } from "lucide-react";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { fetchApi } from "../api/client";
import { AddUserModal } from "../components/AddUserModal";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Badge } from "@/app/components/ui/badge";
import { Modal } from "@/app/components/Modal";

interface UserCategory {
    id: string;
    name: string;
    key: string;
    icon: any;
    description: string;
    count: number;
}

export function ManageUsers() {
    const [categories, setCategories] = useState<UserCategory[]>([
        { id: '1', name: 'Administration', key: 'admin', icon: ShieldCheck, description: 'Super Admin, Admin & Site Managers', count: 0 },
        { id: '2', name: 'Employees', key: 'employee', icon: Briefcase, description: 'Site staff and construction workers', count: 0 },
        { id: '3', name: 'Sponsors', key: 'sponsor', icon: HeartHandshake, description: 'Project financial backers / Donors', count: 0 },
        { id: '4', name: 'Organizations', key: 'org', icon: Building2, description: 'Partner companies and clients', count: 0 },
        { id: '5', name: 'General Users', key: 'user', icon: UserCircle, description: 'Public accounts and observers', count: 0 },
    ]);

    const [selectedCategory, setSelectedCategory] = useState<UserCategory>(categories[0]);
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<any>(null);
    const [selectedUserForDetail, setSelectedUserForDetail] = useState<any>(null);

    const getRolesByCategory = (key: string) => {
        switch(key) {
            case 'admin': return ['super_admin', 'admin', 'manager', 'site_manager', 'auditor', 'hr', 'accountant'];
            case 'employee': return ['employee'];
            case 'sponsor': return ['sponsor', 'donor'];
            case 'org': return ['client', 'partner'];
            case 'user': return ['general_user', 'guest', 'editor'];
            default: return [];
        }
    };

    const [total, setTotal] = useState(0);
    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const res = await fetchApi<any>(`/users?limit=1000&search=${searchTerm}`);
            const allUsers = res.data || res;
            
            // Update category counts dynamically based on fetched data
            setCategories((prev: UserCategory[]) => prev.map((cat: UserCategory) => {
                const roles = getRolesByCategory(cat.key);
                const count = allUsers.filter((u: any) => roles.includes(u.userRole)).length;
                return { ...cat, count };
            }));

            const roles = getRolesByCategory(selectedCategory.key);
            const filteredUsers = allUsers.filter((u: any) => 
                roles.includes(u.userRole)
            );

            setUsers(filteredUsers);
            setTotal(filteredUsers.length);
        } catch (error) {
            console.error("Failed to load users", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async (user: any) => {
        if (!confirm(`Are you sure you want to delete ${user.fullName}?`)) return;
        try {
            await fetchApi(`/users/${user.id}`, { method: 'DELETE' });
            toast.success("User removed successfully");
            loadUsers();
        } catch (err) {
            toast.error("Failed to delete user account");
        }
    };

    useEffect(() => {
        loadUsers();
    }, [selectedCategory, searchTerm]);

    const getStatusColor = (status: string) => {
        switch(status.toLowerCase()) {
            case 'active': return 'bg-success';
            case 'inactive': return 'bg-secondary';
            case 'suspended': return 'bg-danger';
            default: return 'bg-info';
        }
    };

    return (
        <div className="container-fluid py-4 min-vh-100" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
            <ScrollReveal className="row mb-3 px-lg-4">
                <div className="col-12">
                   <div className="d-flex align-items-center gap-3">
                        {/* Stat Card 1: Categories */}
                        <div className="glass-card p-2 px-3 rounded-xl border border-white shadow-sm d-flex align-items-center gap-3" style={{ background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)', minWidth: '180px' }}>
                            <div className="bg-primary bg-gradient rounded-lg p-2 text-white shadow-sm">
                                <ShieldCheck size={18} />
                            </div>
                            <div>
                                <div className="fw-bold text-dark h5 mb-0">{categories.length}</div>
                                <div className="smaller text-muted fw-bold" style={{ fontSize: '10px' }}>CATEGORIES</div>
                            </div>
                        </div>

                        {/* Stat Card 2: Total Users */}
                        <div className="glass-card p-2 px-3 rounded-xl border border-white shadow-sm d-flex align-items-center gap-3" style={{ background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)', minWidth: '180px' }}>
                            <div className="bg-orange-500 bg-gradient rounded-lg p-2 text-white shadow-sm">
                                <Users size={18} />
                            </div>
                            <div>
                                <div className="fw-bold text-dark h5 mb-0">{total}</div>
                                <div className="smaller text-muted fw-bold" style={{ fontSize: '10px' }}>TOTAL USERS</div>
                            </div>
                        </div>
                   </div>
                </div>
            </ScrollReveal>

            <div className="row g-4 pt-2">
                {/* Sidebar: Categories (Precision Width Adjustment) */}
                <div className="col-auto px-lg-3" style={{ width: 'calc(16.66% + 2px)', minWidth: '182px' }}>
                    <div className="glass-card p-1.5 rounded-xl mb-3 border border-white shadow-sm" style={{ background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)' }}>
                        <div className="d-flex justify-content-between align-items-center mb-0 pb-1.5 border-bottom border-gray-100 px-1">
                            <div className="d-flex align-items-center gap-2 px-1">
                                <div className="bg-blue-600 rounded-lg p-1.5 text-white shadow-sm">
                                    <ShieldCheck size={14} />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="smaller text-muted mb-0 text-truncate" style={{ fontSize: '10px' }}>Group-based access</p>
                                </div>
                            </div>
                             <button 
                                onClick={() => { setUserToEdit(null); setIsUserModalOpen(true); }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 rounded-lg font-bold shadow-sm transition-all hover:scale-105 active:scale-95 border-0"
                                style={{ fontSize: '9px' }}
                            >
                                <PlusCircle size={10} className="me-1" /> New Invite
                            </button>
                        </div>
                    </div>

                    <div className="flex-column gap-2 d-flex">
                        {categories.map((cat: UserCategory) => {
                            const Icon = cat.icon;
                            return (
                                <div 
                                    key={cat.id} 
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`bg-white border-0 shadow-sm rounded-xl overflow-hidden site-row transition-all mb-2 border ${selectedCategory.id === cat.id ? 'border-primary' : 'border-gray-100'} hover:shadow-md cursor-pointer`}
                                >
                                    <div className="p-2 px-3 d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center gap-2 overflow-hidden flex-grow-1">
                                            <div className={`icon-box ${selectedCategory.id === cat.id ? 'bg-primary text-white' : 'bg-blue-50 text-blue-600'} rounded-lg p-2 flex-shrink-0 transition-all`}>
                                                <Icon size={16} />
                                            </div>
                                            <div className="overflow-hidden">
                                                <div className="d-flex flex-column gap-0">
                                                    <h6 className="fw-bold mb-0 text-truncate" style={{ fontSize: '11px' }}>{cat.name}</h6>
                                                    <Badge className="bg-light text-muted p-0 px-1 border-0 mt-1" style={{ fontSize: '7px', width: 'fit-content' }}>{cat.count} USERS</Badge>
                                                </div>
                                            </div>
                                        </div>
                                        {selectedCategory.id === cat.id && (
                                            <div className="ms-2">
                                                <div className="h-1.5 w-1.5 bg-success rounded-circle shadow-sm" style={{ width: '6px', height: '6px' }} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content: User List (Fitted) */}
                <div className="col px-lg-4 border-start border-gray-100">
                    <div className="rounded-xl mb-3 border border-white shadow-sm h-100" style={{ background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)', overflow: 'hidden' }}>
                        <div className="p-2 border-bottom border-gray-100 mb-0 d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                                <div className="bg-orange-500 rounded-lg p-2 text-white shadow-sm">
                                    <UserPlus size={16} />
                                </div>
                                <div>
                                    <h2 className="fw-bold mb-0" style={{ fontSize: '13px' }}>{selectedCategory.name} Directory</h2>
                                    <p className="smaller text-muted mb-0" style={{ fontSize: '11px' }}>Managing access levels for this group</p>
                                </div>
                            </div>
                             <button 
                                onClick={() => { setUserToEdit(null); setIsUserModalOpen(true); }}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded-lg font-bold shadow-sm transition-all hover:scale-105 active:scale-95 border-0"
                                style={{ fontSize: '9px' }}
                            >
                                <UserPlus size={10} className="me-1" /> Add {selectedCategory.name.slice(0, -1)}
                            </button>
                        </div>
                    <div className="directory-scroll-container px-1" style={{ maxHeight: '70vh', overflowY: 'auto', overflowX: 'hidden' }}>
                            {isLoading ? (
                                <div className="text-center py-5 text-muted small">Loading directory...</div>
                            ) : users.length === 0 ? (
                                <div className="text-center py-5 bg-white rounded shadow-sm border border-dashed border-gray-200">
                                    <Users className="text-muted mb-2 opacity-25" size={40} />
                                    <h3 className="smaller fw-bold text-muted">No users in this category</h3>
                                    <p className="smaller text-muted">Click the add button to invite your first member.</p>
                                </div>
                            ) : (
                                <div className="flex-column gap-2 d-flex pt-1 pb-3">
                                    {users.map((user: any) => (
                                        <div key={user.id} className="bg-white border-0 shadow-sm rounded-xl overflow-hidden site-row transition-all mb-1.5 border border-gray-100 hover:shadow-md">
                                            <div className="p-1 px-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                                                <div className="d-flex align-items-center gap-2 overflow-hidden flex-grow-1" style={{ minWidth: '180px' }}>
                                                    <div className="bg-orange-50 text-orange-600 rounded-circle p-1.5 flex-shrink-0 border border-orange-100">
                                                        <UserCircle size={16} />
                                                    </div>
                                                    <div className="overflow-hidden text-start py-0.5">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <h6 className="fw-bold mb-0 text-truncate" style={{ fontSize: '13px' }}>{user.fullName}</h6>
                                                            <Badge className={`${getStatusColor(user.isActive ? 'active' : 'suspended')} px-1 py-0 border-0`} style={{ fontSize: '8px' }}>{user.isActive ? 'ACTIVE' : 'SUSPENDED'}</Badge>
                                                        </div>
                                                        <div className="smaller text-muted d-flex align-items-center gap-1" style={{ fontSize: '10px' }}>
                                                            <span className="text-primary fw-bold" style={{ fontSize: '9px' }}>{user.email}</span>
                                                            <span>•</span>
                                                            <span className="text-secondary fw-bold" style={{ fontSize: '9px' }}>{user.userRole.replace('_', ' ').toUpperCase()}</span>
                                                            {user.site ? (
                                                                <>
                                                                    <span>•</span>
                                                                    <span className="text-success fw-bold p-1 bg-success/10 rounded-lg px-2 border border-success/20" style={{ fontSize: '9px' }}>
                                                                        <MapPin size={9} className="me-1 mb-0.5" />
                                                                        S/ {user.site.name.toUpperCase()} (#{user.site.code})
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                ['super_admin', 'admin', 'manager', 'site_manager', 'hr', 'accountant', 'employee'].includes(user.userRole) && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span className="text-danger fw-bold p-1 bg-danger/10 rounded-lg px-2 border border-danger/20" style={{ fontSize: '9px' }}>
                                                                            <MapPin size={9} className="me-1 mb-0.5" />
                                                                            SITE UNASSIGNED
                                                                        </span>
                                                                    </>
                                                                )
                                                            )}
                                                            <span>•</span>
                                                            <span className="text-truncate px-1" style={{ fontSize: '9px' }}>{new Date(user.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="d-flex align-items-center gap-1 flex-shrink-0 ms-2 py-1">
                                                    <button 
                                                        className="btn btn-light rounded-lg py-0.5 px-2 fw-bold border shadow-sm h-fit-content d-flex align-items-center"
                                                        style={{ fontSize: '10px', height: '24px' }}
                                                        onClick={() => setSelectedUserForDetail(user)}
                                                    >
                                                        <Eye size={11} className="me-1 border-0" />
                                                        View Profile
                                                    </button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger className="btn btn-link text-muted p-0.5 hover:bg-gray-100 rounded-circle border-0">
                                                            <MoreVertical size={13} />
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="shadow border-0 rounded-lg">
                                                            <DropdownMenuItem onClick={() => { setUserToEdit(user); setIsUserModalOpen(true); }} className="text-xs">
                                                                <Edit2 size={11} className="me-2 text-primary" /> Edit Permissions
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleDeleteUser(user)} className="text-danger text-xs">
                                                                <Trash2 size={11} className="me-2" /> Delete User
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <AddUserModal
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                onSuccess={() => loadUsers()}
                initialData={userToEdit}
            />

            {/* View Profile Modal */}
            <Modal isOpen={!!selectedUserForDetail} onClose={() => setSelectedUserForDetail(null)} title="User Profile Hub" size="md" draggable={true}>
                {selectedUserForDetail && (
                    <div className="p-2">
                        <div className="bg-primary rounded-xl p-3 text-white mb-4 d-flex align-items-center gap-3 shadow-lg" style={{ background: '#009CFF' }}>
                            <div className="bg-white/20 p-3 rounded-xl">
                                <UserCircle size={32} />
                            </div>
                            <div className="text-start">
                                <h4 className="fw-bold mb-0 text-white">{selectedUserForDetail.fullName}</h4>
                                <div className="d-flex align-items-center gap-2 mt-1">
                                    <Badge className="bg-white text-primary border-0 font-bold px-2" style={{ fontSize: '9px' }}>{selectedUserForDetail.userRole.toUpperCase()}</Badge>
                                    <Badge className={`${selectedUserForDetail.isActive ? 'bg-success' : 'bg-danger'} text-white border-0 px-2`} style={{ fontSize: '9px' }}>{selectedUserForDetail.isActive ? 'ACTIVE' : 'SUSPENDED'}</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="row g-4 text-start">
                            <div className="col-md-6 border-end">
                                <h6 className="fw-bold mb-3 text-primary" style={{ fontSize: '10px' }}>BASIC INFORMATION</h6>
                                <div className="d-flex flex-column gap-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-light p-2 rounded-lg text-muted"> <UserCircle size={16} /> </div>
                                        <div>
                                            <div className="small text-muted" style={{ fontSize: '9px' }}>Full Name</div>
                                            <div className="fw-bold text-dark small">{selectedUserForDetail.fullName}</div>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-light p-2 rounded-lg text-muted"> <Mail size={16} /> </div>
                                        <div>
                                            <div className="small text-muted" style={{ fontSize: '9px' }}>Email Address</div>
                                            <div className="fw-bold text-dark small">{selectedUserForDetail.email}</div>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-light p-2 rounded-lg text-muted"> <Phone size={16} /> </div>
                                        <div>
                                            <div className="small text-muted" style={{ fontSize: '9px' }}>Phone / WhatsApp</div>
                                            <div className="fw-bold text-dark small">{selectedUserForDetail.phone || '+250 -- --- ----'}</div>
                                        </div>
                                    </div>
                                    {selectedUserForDetail.age && (
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-light p-2 rounded-lg text-muted"> <Users size={16} /> </div>
                                            <div>
                                                <div className="small text-muted" style={{ fontSize: '9px' }}>Age</div>
                                                <div className="fw-bold text-dark small">{selectedUserForDetail.age} Years Old</div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-light p-2 rounded-lg text-muted"> <MapPin size={16} /> </div>
                                        <div>
                                            <div className="small text-muted" style={{ fontSize: '9px' }}>Physical Address</div>
                                            <div className="fw-bold text-dark small">{selectedUserForDetail.address || 'Address Not Set'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: System Info */}
                            <div className="col-md-6">
                                <h6 className="fw-bold mb-3 text-primary" style={{ fontSize: '10px' }}>GEOGRAPHIC & SYSTEM SETTINGS</h6>
                                <div className="d-grid gap-2">
                                    {selectedUserForDetail.site && (
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-success-subtle p-2 rounded-lg text-success">
                                                <Building2 size={16} />
                                            </div>
                                            <div>
                                                <div className="small text-muted" style={{ fontSize: '9px' }}>Employment Location</div>
                                                <div className="fw-bold text-success small">{selectedUserForDetail.site.name.toUpperCase()}</div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-light p-2 rounded-lg text-muted"> <Globe size={16} /> </div>
                                        <div>
                                            <div className="small text-muted" style={{ fontSize: '9px' }}>Country / Region</div>
                                            <div className="fw-bold text-dark small">{selectedUserForDetail.country || 'RWANDA (RW)'}</div>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-light p-2 rounded-lg text-muted"> <Shield size={16} /> </div>
                                        <div>
                                            <div className="small text-muted" style={{ fontSize: '9px' }}>Account Status</div>
                                            <div className="fw-bold text-dark small">
                                                {selectedUserForDetail.isActive ? (
                                                    <span className="text-success">● FULL ACCESS - ACTIVE</span>
                                                ) : (
                                                    <span className="text-danger">● ACCESS SUSPENDED</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-light p-2 rounded-lg text-muted"> <Globe size={16} /> </div>
                                        <div>
                                            <div className="small text-muted" style={{ fontSize: '9px' }}>Platform Language & TZ</div>
                                            <div className="fw-bold text-dark small uppercase">
                                                {selectedUserForDetail.language?.toUpperCase() || 'ENGLISH (EN)'} • {selectedUserForDetail.timezone || 'UTC'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-light p-2 rounded-lg text-muted"> <Calendar size={16} /> </div>
                                        <div>
                                            <div className="small text-muted" style={{ fontSize: '9px' }}>Member Since</div>
                                            <div className="fw-bold text-dark small">
                                                {new Date(selectedUserForDetail.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-2 p-2 bg-blue-50/50 rounded-lg border border-blue-100">
                                    <div className="small text-blue-600 fw-bold" style={{ fontSize: '9px' }}>SECURITY OVERVIEW</div>
                                    <p className="smaller text-muted mb-0" style={{ fontSize: '9px' }}>Password status verified. Multi-factor authentication is {selectedUserForDetail.googleId ? 'Linked' : 'Not Linked'}.</p>
                                </div>
                            </div>
                        </div>

                        <div className="d-flex justify-content-end gap-2 pt-4 border-top mt-4">
                            <button
                                className="btn btn-light px-4 py-1.5 border fw-bold text-muted shadow-sm rounded-lg text-xs"
                                onClick={() => setSelectedUserForDetail(null)}
                            >
                                Close Overview
                            </button>
                            <button
                                onClick={() => { setUserToEdit(selectedUserForDetail); setSelectedUserForDetail(null); setIsUserModalOpen(true); }}
                                className="btn btn-primary px-4 py-1.5 fw-bold shadow-sm d-flex align-items-center gap-2 rounded-lg text-xs border-0"
                                style={{ background: '#009CFF' }}
                            >
                                <ShieldCheck size={12} /> Edit Permissions
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            <style>{`
                .site-row:hover { background-color: #f8fbff !important; border-color: #009CFF !important; }
                .rounded-xl { border-radius: 1rem !important; }
                .icon-box { transition: all 0.3s ease; }
                .smaller { font-size: 11px; }
                .search-input { padding-left: 35px !important; }
                .search-input::placeholder { text-indent: 5px; }
            `}</style>
        </div>
    );
}
