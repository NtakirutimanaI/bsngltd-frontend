import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { fetchApi } from '@/app/api/client';
import { Modal } from '@/app/components/Modal';
import { PaginationSelector } from '@/app/components/ui/pagination-selector';
import {
    Users, UserPlus, Search, Edit2, Trash2, X, Eye, EyeOff,
    Shield, UserCog, Briefcase, Heart, Globe,
    RefreshCw, CheckCircle, XCircle
} from 'lucide-react';

interface Role {
    id: string;
    name: string;
    description: string;
    level: number;
}

interface User {
    id: string;
    username: string;
    email: string;
    fullName: string;
    phone?: string;
    role: Role;
    userRole: string;
    isActive: boolean;
    createdAt: string;
    country?: string;
}

interface UserFormData {
    username: string;
    email: string;
    fullName: string;
    phone: string;
    password: string;
    roleId: string;
    userRole: string;
    isActive: boolean;
    country: string;
}

const USER_CATEGORIES = [
    { key: 'all', label: 'All Users', icon: Users, color: '#16a085' },
    {
        key: 'administration', label: 'Administration', icon: Shield, color: '#ef4444',
        roles: ['super_admin', 'admin']
    },
    {
        key: 'employees', label: 'Employees', icon: Briefcase, color: '#3b82f6',
        roles: ['employee', 'manager', 'site_manager', 'editor', 'hr', 'accountant']
    },
    {
        key: 'partners', label: 'Partners & Investors', icon: Heart, color: '#8b5cf6',
        roles: ['partner', 'investor', 'donor', 'contractor', 'consultant']
    },
    {
        key: 'general', label: 'General Users', icon: Globe, color: '#10b981',
        roles: ['client', 'general_user', 'beneficiary', 'volunteer', 'guest', 'auditor']
    },
];

const ALL_USER_ROLES = [
    { value: 'super_admin', label: 'Super Admin', group: 'Administration' },
    { value: 'admin', label: 'Admin', group: 'Administration' },
    { value: 'manager', label: 'Manager', group: 'Employees' },
    { value: 'site_manager', label: 'Site Manager', group: 'Employees' },
    { value: 'editor', label: 'Editor', group: 'Employees' },
    { value: 'employee', label: 'Employee', group: 'Employees' },
    { value: 'hr', label: 'HR', group: 'Employees' },
    { value: 'accountant', label: 'Accountant', group: 'Employees' },
    { value: 'partner', label: 'Partner', group: 'Partners & Investors' },
    { value: 'investor', label: 'Investor', group: 'Partners & Investors' },
    { value: 'donor', label: 'Donor', group: 'Partners & Investors' },
    { value: 'contractor', label: 'Contractor', group: 'Partners & Investors' },
    { value: 'consultant', label: 'Consultant', group: 'Partners & Investors' },
    { value: 'client', label: 'Client', group: 'General Users' },
    { value: 'general_user', label: 'General User', group: 'General Users' },
    { value: 'beneficiary', label: 'Beneficiary', group: 'General Users' },
    { value: 'volunteer', label: 'Volunteer', group: 'General Users' },
    { value: 'auditor', label: 'Auditor', group: 'General Users' },
    { value: 'guest', label: 'Guest', group: 'General Users' },
];

function getRoleBadgeColor(userRole: string): string {
    const map: Record<string, string> = {
        super_admin: '#ef4444', admin: '#16a085', manager: '#eab308',
        site_manager: '#84cc16', editor: '#06b6d4', employee: '#3b82f6',
        hr: '#8b5cf6', accountant: '#a855f7', partner: '#ec4899',
        investor: '#f43f5e', donor: '#d946ef', contractor: '#14b8a6',
        consultant: '#0ea5e9', client: '#10b981', general_user: '#6b7280',
        beneficiary: '#22c55e', volunteer: '#f59e0b', auditor: '#64748b',
        guest: '#94a3b8',
    };
    return map[userRole] || '#6b7280';
}

export function ManageUsers({ hideHeader = false }: { hideHeader?: boolean }) {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [activeCategory, setActiveCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalUsers, setTotalUsers] = useState(0);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [viewUser, setViewUser] = useState<User | null>(null);

    const [formData, setFormData] = useState<UserFormData>({
        username: '', email: '', fullName: '', phone: '',
        password: '', roleId: '', userRole: 'general_user',
        isActive: true, country: '',
    });

    const roleName = ((typeof currentUser?.role === 'object' && currentUser.role !== null)
        ? currentUser.role.name : currentUser?.role || 'guest').toLowerCase();
    const canManageUsers = ['super_admin', 'admin', 'manager', 'hr'].includes(roleName);

    useEffect(() => {
        if (canManageUsers) { fetchRoles(); }
    }, [canManageUsers]);

    useEffect(() => {
        if (canManageUsers) { fetchUsers(); }
    }, [canManageUsers, currentPage, pageSize, activeCategory, searchQuery]);

    useEffect(() => {
        if (statusMsg) {
            const t = setTimeout(() => setStatusMsg(null), 4000);
            return () => clearTimeout(t);
        }
    }, [statusMsg]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const cat = USER_CATEGORIES.find(c => c.key === activeCategory);
            let url = `/users?page=${currentPage}&limit=${pageSize}`;
            if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
            if (cat && cat.roles) {
                // Fetch all for category, filter client-side for multi-role categories
                url = `/users?page=1&limit=500`;
                if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
            }
            const response = await fetchApi<{ data: User[]; total: number }>(url);
            let data = response.data;
            if (cat && cat.roles) {
                data = data.filter(u => cat.roles!.includes(u.userRole));
            }
            setTotalUsers(cat && cat.roles ? data.length : response.total);
            if (cat && cat.roles) {
                const start = (currentPage - 1) * pageSize;
                data = data.slice(start, start + pageSize);
            }
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await fetchApi<Role[]>('/roles');
            setRoles(response);
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: any = {
                username: formData.username, email: formData.email,
                fullName: formData.fullName, phone: formData.phone || undefined,
                roleId: formData.roleId || undefined, userRole: formData.userRole,
                isActive: formData.isActive, country: formData.country || undefined,
            };
            if (formData.password) payload.password = formData.password;

            if (editingUser) {
                await fetchApi(`/users/${editingUser.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
                setStatusMsg({ type: 'success', text: `User "${formData.fullName}" updated successfully!` });
            } else {
                await fetchApi('/users', { method: 'POST', body: JSON.stringify(payload) });
                setStatusMsg({ type: 'success', text: `User "${formData.fullName}" created successfully!` });
            }
            setShowModal(false);
            resetForm();
            fetchUsers();
        } catch (error: any) {
            setStatusMsg({ type: 'error', text: error?.message || 'Failed to save user.' });
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            username: user.username, email: user.email, fullName: user.fullName,
            phone: user.phone || '', password: '', roleId: user.role?.id || '',
            userRole: user.userRole, isActive: user.isActive, country: user.country || '',
        });
        setShowModal(true);
    };

    const handleDelete = async (userId: string, name: string) => {
        if (!confirm(`Are you sure you want to delete user "${name}"? This action cannot be undone.`)) return;
        try {
            await fetchApi(`/users/${userId}`, { method: 'DELETE' });
            setStatusMsg({ type: 'success', text: `User "${name}" deleted.` });
            fetchUsers();
        } catch (error: any) {
            setStatusMsg({ type: 'error', text: error?.message || 'Failed to delete user.' });
        }
    };

    const handleToggleActive = async (user: User) => {
        try {
            await fetchApi(`/users/${user.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ isActive: !user.isActive }),
            });
            setStatusMsg({ type: 'success', text: `User "${user.fullName}" ${!user.isActive ? 'activated' : 'deactivated'}.` });
            fetchUsers();
        } catch (error: any) {
            setStatusMsg({ type: 'error', text: error?.message || 'Failed to update status.' });
        }
    };

    const resetForm = () => {
        setFormData({
            username: '', email: '', fullName: '', phone: '',
            password: '', roleId: '', userRole: 'general_user',
            isActive: true, country: '',
        });
        setEditingUser(null);
        setShowPassword(false);
    };

    const totalPages = Math.ceil(totalUsers / pageSize);

    if (!canManageUsers) {
        return (
            <div style={{ padding: 40, textAlign: 'center' }}>
                <Shield size={48} style={{ color: '#ef4444', marginBottom: 16 }} />
                <h3 style={{ color: '#1f2937', marginBottom: 8 }}>Access Denied</h3>
                <p style={{ color: '#6b7280' }}>You don't have permission to access user management.</p>
            </div>
        );
    }


    return (
        <div className={`container-fluid ${hideHeader ? 'p-0' : 'px-2 px-md-4 pt-1 pb-2'}`}>
            {/* Status Toast */}
            {statusMsg && (
                <div style={{
                    position: 'fixed', top: 24, right: 24, zIndex: 9999,
                    background: statusMsg.type === 'success' ? '#059669' : '#dc2626',
                    color: 'white', padding: '14px 24px', borderRadius: 12,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)', display: 'flex',
                    alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 500,
                    animation: 'slideIn .3s ease',
                }}>
                    {statusMsg.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                    {statusMsg.text}
                </div>
            )}

            {/* Header */}
            {!hideHeader && (
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-2 px-2 px-md-4 pt-1">
                    <div>
                        <h1 className="h5 fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                            <UserCog size={16} style={{ color: '#16a085' }} />
                            User Management
                        </h1>
                        <p className="text-muted mb-0" style={{ fontSize: '12px' }}>
                            Manage all system users, roles, and permissions
                        </p>
                    </div>
                    <div className="d-flex gap-3">
                        <button
                            onClick={() => fetchUsers()}
                            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 px-4 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105 active:scale-95 d-flex align-items-center gap-2"
                        >
                            <RefreshCw size={14} /> Refresh
                        </button>
                        <button
                            onClick={() => { resetForm(); setShowModal(true); }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold shadow-lg shadow-emerald-200 dark:shadow-none transition-all hover:scale-105 active:scale-95 d-flex align-items-center gap-2 border-0"
                        >
                            <UserPlus size={14} /> Add New User
                        </button>
                    </div>
                </div>
            )}

            {/* Category Tabs */}
            <div className={`card border-0 shadow-sm mb-2 ${hideHeader ? '' : 'mx-2 mx-md-4'}`} style={{ borderRadius: '12px', overflow: 'hidden' }}>
                <div className="card-header bg-white border-0 p-0">
                    <div className="nav nav-pills p-1 gap-2 flex-nowrap overflow-auto">
                        {USER_CATEGORIES.map(cat => {
                            const Icon = cat.icon;
                            const isActive = activeCategory === cat.key;
                            return (
                                <button key={cat.key} onClick={() => { setActiveCategory(cat.key); setCurrentPage(1); }}
                                    className={`nav-link flex-shrink-0 d-flex align-items-center gap-1.5 py-2 transition-all ${isActive ? 'text-white' : 'text-muted hover:bg-light'}`}
                                    style={{
                                        borderRadius: '8px', border: 'none',
                                        background: isActive ? '#16a085' : 'transparent',
                                        color: isActive ? '#fff' : '#6c757d',
                                        fontWeight: 600, fontSize: '12px',
                                        padding: '6px 12px', minWidth: 'fit-content'
                                    }}>
                                    <Icon size={14} />
                                    <span className="d-none d-md-inline">{cat.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className={`card border-0 shadow-sm mb-2 ${hideHeader ? '' : 'mx-2 mx-md-4'}`} style={{ borderRadius: '12px' }}>
                <div className="card-body py-2">
                    <div className="position-relative d-flex align-items-center gap-2">
                        <Search className="position-absolute start-0 translate-middle-y ms-3 text-muted" size={14} />
                        <input
                            type="text" placeholder="Search by name, email, or username..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="form-control form-control-sm ps-5 bg-light border-0"
                            style={{ fontSize: '12px', borderRadius: '8px' }}
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="btn btn-light btn-sm p-1" style={{ borderRadius: '6px' }}>
                                <X size={12} />
                            </button>
                        )}
                        <div className="text-muted small" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
                            {totalUsers} user{totalUsers !== 1 ? 's' : ''} found
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className={`card border-0 shadow-sm ${hideHeader ? '' : 'mx-2 mx-md-4'}`} style={{ borderRadius: '12px' }}>
                {loading ? (
                    <div className="text-center py-4">
                        <RefreshCw size={24} style={{ color: '#16a085', animation: 'spin 1s linear infinite' }} />
                        <p className="text-muted mt-2" style={{ fontSize: '12px' }}>Loading users...</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                        <Users size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                        <p style={{ fontSize: '14px', fontWeight: 500 }}>No users found</p>
                        <p style={{ fontSize: '12px' }}>Try adjusting your search or filter criteria</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0" style={{ fontSize: '12px' }}>
                            <thead className="bg-light">
                                <tr>
                                    {['Full Name', 'Email', 'Username', 'User Role', 'System Role', 'Status', 'Joined', 'Actions'].map(h => (
                                        <th key={h} className={
                                            h === 'Actions' ? 'text-end pe-4' : 'ps-4'
                                        } style={{
                                            fontWeight: 600, color: '#374151', fontSize: '11px',
                                            textTransform: 'uppercase', letterSpacing: '0.05em', padding: '8px 16px'
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="transition-all">
                                        <td className="ps-4 py-2">
                                            <div className="d-flex align-items-center gap-2">
                                                <div style={{
                                                    width: 28, height: 28, borderRadius: '50%',
                                                    background: `linear-gradient(135deg, ${getRoleBadgeColor(user.userRole)}40, ${getRoleBadgeColor(user.userRole)}20)`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: getRoleBadgeColor(user.userRole), fontWeight: 700, fontSize: '12px',
                                                    flexShrink: 0,
                                                }}>
                                                    {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, color: '#1f2937', fontSize: '12px' }}>{user.fullName}</div>
                                                    {user.phone && <div style={{ fontSize: '10px', color: '#9ca3af' }}>{user.phone}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-2" style={{ color: '#6b7280', fontSize: '11px' }}>{user.email}</td>
                                        <td className="py-2">
                                            <span style={{
                                                background: '#f3f4f6', padding: '2px 6px', borderRadius: 4,
                                                fontSize: '10px', color: '#374151', fontWeight: 500,
                                            }}>{user.username}</span>
                                        </td>
                                        <td className="py-2">
                                            <span style={{
                                                background: `${getRoleBadgeColor(user.userRole)}18`,
                                                color: getRoleBadgeColor(user.userRole),
                                                padding: '2px 8px', borderRadius: 12, fontSize: '10px',
                                                fontWeight: 600, textTransform: 'capitalize',
                                                border: `1px solid ${getRoleBadgeColor(user.userRole)}30`,
                                            }}>
                                                {user.userRole?.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="py-2">
                                            <span style={{
                                                background: '#e0e7ff', color: '#4338ca',
                                                padding: '2px 6px', borderRadius: 12, fontSize: '10px', fontWeight: 500,
                                            }}>
                                                {user.role?.name?.replace(/_/g, ' ') || '—'}
                                            </span>
                                        </td>
                                        <td className="py-2">
                                            <button onClick={() => handleToggleActive(user)} style={{
                                                display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px',
                                                borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: '10px', fontWeight: 600,
                                                background: user.isActive ? '#dcfce7' : '#fee2e2',
                                                color: user.isActive ? '#16a34a' : '#dc2626',
                                            }}>
                                                {user.isActive ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="py-2" style={{ color: '#9ca3af', fontSize: '10px' }}>
                                            {new Date(user.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric', month: 'short', day: 'numeric',
                                            })}
                                        </td>
                                        <td className="py-2 pe-4 text-end">
                                            <div className="d-flex justify-content-end gap-1">
                                                <button onClick={() => setViewUser(user)} title="View" style={{
                                                    background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6,
                                                    padding: '4px 6px', cursor: 'pointer', color: '#16a34a',
                                                }}><Eye size={12} /></button>
                                                <button onClick={() => handleEdit(user)} title="Edit" style={{
                                                    background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6,
                                                    padding: '4px 6px', cursor: 'pointer', color: '#2563eb',
                                                }}><Edit2 size={12} /></button>
                                                <button onClick={() => handleDelete(user.id, user.fullName)} title="Delete"
                                                    disabled={user.id === currentUser?.id} style={{
                                                        background: user.id === currentUser?.id ? '#f9fafb' : '#fef2f2',
                                                        border: `1px solid ${user.id === currentUser?.id ? '#e5e7eb' : '#fecaca'}`,
                                                        borderRadius: 6, padding: '4px 6px', cursor: user.id === currentUser?.id ? 'not-allowed' : 'pointer',
                                                        color: user.id === currentUser?.id ? '#d1d5db' : '#dc2626',
                                                        opacity: user.id === currentUser?.id ? 0.5 : 1,
                                                    }}><Trash2 size={12} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="d-flex justify-content-between align-items-center py-2 px-4" style={{ borderTop: '1px solid #f3f4f6' }}>
                        <span className="text-muted" style={{ fontSize: '11px' }}>
                            Page {currentPage} of {totalPages} · {totalUsers} total
                        </span>
                        <div className="d-flex gap-1">
                            <PaginationSelector
                                currentPage={currentPage}
                                totalPages={totalPages}
                                pageSize={pageSize}
                                totalItems={totalUsers}
                                onPageChange={setCurrentPage}
                                onPageSizeChange={(newSize) => {
                                    setPageSize(newSize);
                                    setCurrentPage(1); // Reset to first page when changing page size
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* View User Modal */}
            <Modal isOpen={!!viewUser} onClose={() => setViewUser(null)} title="User Details" size="sm" draggable={true}>
                {viewUser && (
                    <div className="flex flex-col gap-4">
                        <div style={{
                            background: 'linear-gradient(135deg, #1e293b, #475569)',
                            padding: '16px 20px', color: 'white', textAlign: 'center',
                            borderRadius: '12px',
                        }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: '50%', margin: '0 auto 8px',
                                background: `linear-gradient(135deg, ${getRoleBadgeColor(viewUser.userRole)}, ${getRoleBadgeColor(viewUser.userRole)}aa)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 16, fontWeight: 800, border: '2px solid rgba(255,255,255,0.3)',
                                color: 'white'
                            }}>{viewUser.fullName?.charAt(0)?.toUpperCase()}</div>
                            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'white' }}>{viewUser.fullName}</h3>
                            <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: '11px' }}>@{viewUser.username}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                            {[
                                ['Email', viewUser.email],
                                ['Phone', viewUser.phone || '—'],
                                ['User Role', viewUser.userRole?.replace(/_/g, ' ')],
                                ['System Role', viewUser.role?.name?.replace(/_/g, ' ') || '—'],
                                ['Status', viewUser.isActive ? 'Active' : 'Inactive'],
                                ['Country', viewUser.country || '—'],
                                ['Joined', new Date(viewUser.createdAt).toLocaleDateString()],
                            ].map(([label, value]) => (
                                <div key={label} style={{
                                    display: 'flex', justifyContent: 'space-between', padding: '8px 0',
                                    borderBottom: '1px solid #f3f4f6', fontSize: '12px',
                                }}>
                                    <span style={{ color: '#6b7280', fontWeight: 500 }}>{label}</span>
                                    <span className="dark:text-white" style={{ color: '#1f2937', fontWeight: 600, textTransform: 'capitalize' }}>{value}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                            <button onClick={() => setViewUser(null)} style={{
                                background: '#f3f4f6', border: 'none', padding: '6px 16px',
                                borderRadius: 6, cursor: 'pointer', fontWeight: 600, color: '#374151', fontSize: '12px'
                            }}>Close</button>
                            <button onClick={() => { handleEdit(viewUser); setViewUser(null); }} style={{
                                background: '#16a085', border: 'none', padding: '6px 16px',
                                borderRadius: 6, cursor: 'pointer', fontWeight: 600, color: 'white', fontSize: '12px'
                            }}>Edit User</button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Add/Edit User Modal */}
            <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editingUser ? 'Edit User' : 'Add New User'} size="md" draggable={true}>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
                        {/* Full Name */}
                        <div>
                            <label className="dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 3 }}>
                                Full Name <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input type="text" required value={formData.fullName}
                                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                style={inputStyle} placeholder="John Doe" />
                        </div>
                        {/* Username */}
                        <div>
                            <label className="dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 3 }}>
                                Username <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input type="text" required value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                style={inputStyle} placeholder="johndoe" />
                        </div>
                        {/* Email */}
                        <div>
                            <label className="dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 3 }}>
                                Email <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input type="email" required value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                style={inputStyle} placeholder="john@example.com" />
                        </div>
                        {/* Phone */}
                        <div>
                            <label className="dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 3 }}>Phone</label>
                            <input type="tel" value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                style={inputStyle} placeholder="+250 7XX XXX XXX" />
                        </div>
                        {/* Password */}
                        <div>
                            <label className="dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 3 }}>
                                Password {!editingUser && <span style={{ color: '#ef4444' }}>*</span>}
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input type={showPassword ? 'text' : 'password'} required={!editingUser}
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    style={{ ...inputStyle, paddingRight: 40 }}
                                    placeholder={editingUser ? 'Leave blank to keep current' : 'Min 6 characters'} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af',
                                }}>
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        {/* Country */}
                        <div>
                            <label className="dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 3 }}>Country</label>
                            <input type="text" value={formData.country}
                                onChange={e => setFormData({ ...formData, country: e.target.value })}
                                style={inputStyle} placeholder="Rwanda" />
                        </div>
                        {/* User Role (Classification) */}
                        <div>
                            <label className="dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 3 }}>
                                User Classification <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <select required value={formData.userRole}
                                onChange={e => setFormData({ ...formData, userRole: e.target.value })}
                                style={inputStyle}>
                                {['Administration', 'Employees', 'Partners & Investors', 'General Users'].map(group => (
                                    <optgroup key={group} label={group}>
                                        {ALL_USER_ROLES.filter(r => r.group === group).map(r => (
                                            <option key={r.value} value={r.value}>{r.label}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>
                        {/* System Role */}
                        <div>
                            <label className="dark:text-gray-300" style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: 3 }}>System Role</label>
                            <select value={formData.roleId}
                                onChange={e => setFormData({ ...formData, roleId: e.target.value })}
                                style={inputStyle}>
                                <option value="">Select System Role</option>
                                {roles.map(role => (
                                    <option key={role.id} value={role.id}>
                                        {role.name.replace(/_/g, ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* Status */}
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                <div style={{
                                    width: 36, height: 20, borderRadius: 10, padding: 2,
                                    background: formData.isActive ? '#22c55e' : '#d1d5db',
                                    transition: 'background .2s', cursor: 'pointer',
                                }} onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}>
                                    <div style={{
                                        width: 16, height: 16, borderRadius: '50%', background: 'white',
                                        transform: formData.isActive ? 'translateX(16px)' : 'translateX(0)',
                                        transition: 'transform .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                    }} />
                                </div>
                                <span className="dark:text-gray-300" style={{ fontSize: '12px' }}>User is {formData.isActive ? 'Active' : 'Inactive'}</span>
                            </label>
                        </div>
                    </div>

                    <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
                        <button
                            type="button"
                            onClick={() => { setShowModal(false); resetForm(); }}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:scale-105 active:scale-95 bg-white dark:bg-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 dark:shadow-none transition-all hover:scale-105 active:scale-95 d-flex align-items-center gap-2 border-0"
                        >
                            {editingUser ? 'Update User' : 'Create User'}
                        </button>
                    </div>
                </form>
            </Modal>

            <style>{`
        @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '4px 8px', borderRadius: 6,
    border: '1px solid #e5e7eb', fontSize: '12px', color: '#1f2937',
    outline: 'none', transition: 'border-color .2s', background: '#fafafa',
    boxSizing: 'border-box',
};
