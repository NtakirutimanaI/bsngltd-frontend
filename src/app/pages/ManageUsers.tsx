import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { fetchApi } from '@/app/api/client';
import { Modal } from '@/app/components/Modal';
import {
    Users, UserPlus, Search, Edit2, Trash2, X, Eye, EyeOff,
    Shield, UserCog, Briefcase, Heart, Globe, ChevronLeft, ChevronRight,
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
    { key: 'all', label: 'All Users', icon: Users, color: '#f97316' },
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
        super_admin: '#ef4444', admin: '#f97316', manager: '#eab308',
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
    const [totalUsers, setTotalUsers] = useState(0);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [viewUser, setViewUser] = useState<User | null>(null);
    const PAGE_SIZE = 15;

    const [formData, setFormData] = useState<UserFormData>({
        username: '', email: '', fullName: '', phone: '',
        password: '', roleId: '', userRole: 'general_user',
        isActive: true, country: '',
    });

    const roleName = ((typeof currentUser?.role === 'object' && currentUser.role !== null)
        ? currentUser.role.name : currentUser?.role || 'guest').toLowerCase();
    const isAdmin = ['super_admin', 'admin'].includes(roleName);

    useEffect(() => {
        if (isAdmin) { fetchRoles(); }
    }, [isAdmin]);

    useEffect(() => {
        if (isAdmin) { fetchUsers(); }
    }, [isAdmin, currentPage, activeCategory, searchQuery]);

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
            let url = `/users?page=${currentPage}&limit=${PAGE_SIZE}`;
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
                const start = (currentPage - 1) * PAGE_SIZE;
                data = data.slice(start, start + PAGE_SIZE);
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

    const totalPages = Math.ceil(totalUsers / PAGE_SIZE);



    if (!isAdmin) {
        return (
            <div style={{ padding: 40, textAlign: 'center' }}>
                <Shield size={48} style={{ color: '#ef4444', marginBottom: 16 }} />
                <h3 style={{ color: '#1f2937', marginBottom: 8 }}>Access Denied</h3>
                <p style={{ color: '#6b7280' }}>You don't have permission to access user management.</p>
            </div>
        );
    }

    const sectionStyle: React.CSSProperties = {
        background: 'white', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #f3f4f6', overflow: 'hidden',
    };

    return (
        <div style={{ padding: '0 0 32px' }}>
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
                <div style={{
                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
                    borderRadius: 20, padding: '32px 36px', marginBottom: 28,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    flexWrap: 'wrap', gap: 16,
                }}>
                    <div>
                        <h1 style={{
                            fontSize: 28, fontWeight: 800, color: 'white', margin: 0,
                            display: 'flex', alignItems: 'center', gap: 12,
                        }}>
                            <UserCog size={32} style={{ color: '#f97316' }} />
                            User Management
                        </h1>
                        <p style={{ color: '#94a3b8', marginTop: 6, fontSize: 14 }}>
                            Manage all system users, roles, and permissions
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => fetchUsers()} style={{
                            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white', padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500,
                        }}>
                            <RefreshCw size={14} /> Refresh
                        </button>
                        <button onClick={() => { resetForm(); setShowModal(true); }} style={{
                            background: 'linear-gradient(135deg, #f97316, #ea580c)', border: 'none',
                            color: 'white', padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600,
                            boxShadow: '0 4px 10px rgba(249,115,22,0.3)',
                        }}>
                            <UserPlus size={16} /> Add New User
                        </button>
                    </div>
                </div>
            )}

            {/* Category Tabs */}
            <div style={{
                display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap',
            }}>
                {USER_CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    const isActive = activeCategory === cat.key;
                    return (
                        <button key={cat.key} onClick={() => { setActiveCategory(cat.key); setCurrentPage(1); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '10px 20px', borderRadius: 12, cursor: 'pointer',
                                border: isActive ? `2px solid ${cat.color}` : '2px solid #e5e7eb',
                                background: isActive ? `${cat.color}12` : 'white',
                                color: isActive ? cat.color : '#6b7280',
                                fontWeight: isActive ? 700 : 500, fontSize: 13,
                                transition: 'all .2s ease',
                                boxShadow: isActive ? `0 2px 8px ${cat.color}20` : 'none',
                            }}>
                            <Icon size={16} />
                            {cat.label}
                        </button>
                    );
                })}
            </div>

            {/* Search Bar */}
            <div style={{ ...sectionStyle, marginBottom: 20, padding: '16px 20px' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Search size={18} style={{ color: '#9ca3af' }} />
                    <input
                        type="text" placeholder="Search by name, email, or username..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        style={{
                            flex: 1, border: 'none', outline: 'none', fontSize: 14,
                            color: '#1f2937', background: 'transparent',
                        }}
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} style={{
                            background: '#f3f4f6', border: 'none', borderRadius: 8,
                            padding: '4px 8px', cursor: 'pointer', color: '#6b7280',
                        }}>
                            <X size={14} />
                        </button>
                    )}
                    <div style={{ color: '#9ca3af', fontSize: 13, whiteSpace: 'nowrap' }}>
                        {totalUsers} user{totalUsers !== 1 ? 's' : ''} found
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div style={sectionStyle}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 60 }}>
                        <RefreshCw size={32} style={{ color: '#f97316', animation: 'spin 1s linear infinite' }} />
                        <p style={{ color: '#6b7280', marginTop: 12 }}>Loading users...</p>
                    </div>
                ) : users.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>
                        <Users size={48} style={{ marginBottom: 12, opacity: 0.4 }} />
                        <p style={{ fontSize: 16, fontWeight: 500 }}>No users found</p>
                        <p style={{ fontSize: 13 }}>Try adjusting your search or filter criteria</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                                    {['Full Name', 'Email', 'Username', 'User Role', 'System Role', 'Status', 'Joined', 'Actions'].map(h => (
                                        <th key={h} style={{
                                            padding: '14px 16px', textAlign: h === 'Actions' ? 'right' : 'left',
                                            fontWeight: 600, color: '#374151', fontSize: 12,
                                            textTransform: 'uppercase', letterSpacing: '0.05em',
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, idx) => (
                                    <tr key={user.id} style={{
                                        borderBottom: '1px solid #f3f4f6',
                                        background: idx % 2 === 0 ? 'white' : '#fafafa',
                                        transition: 'background .15s',
                                    }}
                                        onMouseEnter={e => (e.currentTarget.style.background = '#fff7ed')}
                                        onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? 'white' : '#fafafa')}
                                    >
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{
                                                    width: 36, height: 36, borderRadius: '50%',
                                                    background: `linear-gradient(135deg, ${getRoleBadgeColor(user.userRole)}40, ${getRoleBadgeColor(user.userRole)}20)`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: getRoleBadgeColor(user.userRole), fontWeight: 700, fontSize: 14,
                                                    flexShrink: 0,
                                                }}>
                                                    {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, color: '#1f2937' }}>{user.fullName}</div>
                                                    {user.phone && <div style={{ fontSize: 11, color: '#9ca3af' }}>{user.phone}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: 13 }}>{user.email}</td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{
                                                background: '#f3f4f6', padding: '3px 10px', borderRadius: 6,
                                                fontSize: 12, color: '#374151', fontWeight: 500,
                                            }}>{user.username}</span>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{
                                                background: `${getRoleBadgeColor(user.userRole)}18`,
                                                color: getRoleBadgeColor(user.userRole),
                                                padding: '4px 12px', borderRadius: 20, fontSize: 11,
                                                fontWeight: 600, textTransform: 'capitalize',
                                                border: `1px solid ${getRoleBadgeColor(user.userRole)}30`,
                                            }}>
                                                {user.userRole?.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{
                                                background: '#e0e7ff', color: '#4338ca',
                                                padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                                            }}>
                                                {user.role?.name?.replace(/_/g, ' ') || '—'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <button onClick={() => handleToggleActive(user)} style={{
                                                display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px',
                                                borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                                                background: user.isActive ? '#dcfce7' : '#fee2e2',
                                                color: user.isActive ? '#16a34a' : '#dc2626',
                                            }}>
                                                {user.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td style={{ padding: '12px 16px', color: '#9ca3af', fontSize: 12 }}>
                                            {new Date(user.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric', month: 'short', day: 'numeric',
                                            })}
                                        </td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                                                <button onClick={() => setViewUser(user)} title="View" style={{
                                                    background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8,
                                                    padding: '6px 8px', cursor: 'pointer', color: '#16a34a',
                                                }}><Eye size={14} /></button>
                                                <button onClick={() => handleEdit(user)} title="Edit" style={{
                                                    background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8,
                                                    padding: '6px 8px', cursor: 'pointer', color: '#2563eb',
                                                }}><Edit2 size={14} /></button>
                                                <button onClick={() => handleDelete(user.id, user.fullName)} title="Delete"
                                                    disabled={user.id === currentUser?.id} style={{
                                                        background: user.id === currentUser?.id ? '#f9fafb' : '#fef2f2',
                                                        border: `1px solid ${user.id === currentUser?.id ? '#e5e7eb' : '#fecaca'}`,
                                                        borderRadius: 8, padding: '6px 8px', cursor: user.id === currentUser?.id ? 'not-allowed' : 'pointer',
                                                        color: user.id === currentUser?.id ? '#d1d5db' : '#dc2626',
                                                        opacity: user.id === currentUser?.id ? 0.5 : 1,
                                                    }}><Trash2 size={14} /></button>
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
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '16px 20px', borderTop: '1px solid #f3f4f6',
                    }}>
                        <span style={{ fontSize: 13, color: '#6b7280' }}>
                            Page {currentPage} of {totalPages} · {totalUsers} total
                        </span>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)} style={{
                                background: currentPage <= 1 ? '#f3f4f6' : '#fff', border: '1px solid #e5e7eb',
                                padding: '8px 12px', borderRadius: 8, cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                                color: currentPage <= 1 ? '#d1d5db' : '#374151',
                            }}><ChevronLeft size={16} /></button>
                            <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{
                                background: currentPage >= totalPages ? '#f3f4f6' : '#fff', border: '1px solid #e5e7eb',
                                padding: '8px 12px', borderRadius: 8, cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                                color: currentPage >= totalPages ? '#d1d5db' : '#374151',
                            }}><ChevronRight size={16} /></button>
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
                            padding: '20px 24px', color: 'white', textAlign: 'center',
                            borderRadius: '12px',
                        }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: '50%', margin: '0 auto 10px',
                                background: `linear-gradient(135deg, ${getRoleBadgeColor(viewUser.userRole)}, ${getRoleBadgeColor(viewUser.userRole)}aa)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 20, fontWeight: 800, border: '3px solid rgba(255,255,255,0.3)',
                                color: 'white'
                            }}>{viewUser.fullName?.charAt(0)?.toUpperCase()}</div>
                            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'white' }}>{viewUser.fullName}</h3>
                            <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: 12 }}>@{viewUser.username}</p>
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
                                    display: 'flex', justifyContent: 'space-between', padding: '10px 0',
                                    borderBottom: '1px solid #f3f4f6', fontSize: 14,
                                }}>
                                    <span style={{ color: '#6b7280', fontWeight: 500 }}>{label}</span>
                                    <span className="dark:text-white" style={{ color: '#1f2937', fontWeight: 600, textTransform: 'capitalize' }}>{value}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                            <button onClick={() => setViewUser(null)} style={{
                                background: '#f3f4f6', border: 'none', padding: '8px 20px',
                                borderRadius: 8, cursor: 'pointer', fontWeight: 600, color: '#374151', fontSize: 13
                            }}>Close</button>
                            <button onClick={() => { handleEdit(viewUser); setViewUser(null); }} style={{
                                background: '#f97316', border: 'none', padding: '8px 20px',
                                borderRadius: 8, cursor: 'pointer', fontWeight: 600, color: 'white', fontSize: 13
                            }}>Edit User</button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Add/Edit User Modal */}
            <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editingUser ? 'Edit User' : 'Add New User'} size="md" draggable={true}>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' }}>
                        {/* Full Name */}
                        <div>
                            <label className="dark:text-gray-300" style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
                                Full Name <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input type="text" required value={formData.fullName}
                                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                style={inputStyle} placeholder="John Doe" />
                        </div>
                        {/* Username */}
                        <div>
                            <label className="dark:text-gray-300" style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
                                Username <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input type="text" required value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                style={inputStyle} placeholder="johndoe" />
                        </div>
                        {/* Email */}
                        <div>
                            <label className="dark:text-gray-300" style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
                                Email <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input type="email" required value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                style={inputStyle} placeholder="john@example.com" />
                        </div>
                        {/* Phone */}
                        <div>
                            <label className="dark:text-gray-300" style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Phone</label>
                            <input type="tel" value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                style={inputStyle} placeholder="+250 7XX XXX XXX" />
                        </div>
                        {/* Password */}
                        <div>
                            <label className="dark:text-gray-300" style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
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
                            <label className="dark:text-gray-300" style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Country</label>
                            <input type="text" value={formData.country}
                                onChange={e => setFormData({ ...formData, country: e.target.value })}
                                style={inputStyle} placeholder="Rwanda" />
                        </div>
                        {/* User Role (Classification) */}
                        <div>
                            <label className="dark:text-gray-300" style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
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
                            <label className="dark:text-gray-300" style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>System Role</label>
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
                            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                                <div style={{
                                    width: 44, height: 24, borderRadius: 12, padding: 2,
                                    background: formData.isActive ? '#22c55e' : '#d1d5db',
                                    transition: 'background .2s', cursor: 'pointer',
                                }} onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}>
                                    <div style={{
                                        width: 20, height: 20, borderRadius: '50%', background: 'white',
                                        transform: formData.isActive ? 'translateX(20px)' : 'translateX(0)',
                                        transition: 'transform .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                    }} />
                                </div>
                                <span className="dark:text-gray-300">User is {formData.isActive ? 'Active' : 'Inactive'}</span>
                            </label>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10, paddingTop: 16, borderTop: '1px solid #f3f4f6' }}>
                        <button type="button" onClick={() => { setShowModal(false); resetForm(); }} style={{
                            background: '#f3f4f6', border: 'none', padding: '8px 16px',
                            borderRadius: 8, cursor: 'pointer', fontWeight: 600, color: '#374151', fontSize: 12,
                        }}>Cancel</button>
                        <button type="submit" style={{
                            background: 'linear-gradient(135deg, #f97316, #ea580c)', border: 'none',
                            padding: '8px 20px', borderRadius: 8, cursor: 'pointer',
                            fontWeight: 600, color: 'white', fontSize: 12,
                            boxShadow: '0 4px 12px rgba(249,115,22,0.3)',
                        }}>{editingUser ? 'Update User' : 'Create User'}</button>
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
    width: '100%', padding: '6px 10px', borderRadius: 8,
    border: '1.5px solid #e5e7eb', fontSize: '12px', color: '#1f2937',
    outline: 'none', transition: 'border-color .2s', background: '#fafafa',
    boxSizing: 'border-box',
};
