import { useState, useEffect } from "react";
import {
    Eye, Search, Calendar, User, Phone, Mail, MapPin,
    CheckCircle, Clock, XCircle, RefreshCcw, Filter,
    MessageSquare, BookOpen, Loader2,
    LayoutGrid, Ban
} from "lucide-react";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { fetchApi } from '../api/client';
import { useLanguage } from "@/app/context/LanguageContext";
import { useAuth } from "@/app/context/AuthContext";

interface Booking {
    id: string;
    propertyId: string;
    property?: {
        id: string;
        title: string;
        location: string;
        code: string;
        type: string;
        price: number;
        isForSale: boolean;
        isForRent: boolean;
    };
    name: string;
    email: string;
    phone: string;
    date: string;
    message: string;
    status: string;
    bookingType: string;
    paymentStatus: string;
    amount: number;
    createdAt: string;
}

export function Bookings() {
    const { dt } = useLanguage();
    const { user } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    const isAdmin = (() => {
        if (!user) return false;
        const roleName = (typeof user?.role === 'object' && user.role !== null)
            ? (user.role as any).name
            : (user?.role || 'guest');
        const n = roleName.toString().toLowerCase().replace(/\s+/g, '_');
        return ['super_admin', 'admin', 'manager', 'site_manager'].includes(n);
    })();

    useEffect(() => { loadBookings(); }, [user]);

    const loadBookings = async () => {
        try {
            setIsLoading(true);
            const query = isAdmin ? '' : `?userId=${user?.id}`;
            const data = await fetchApi<Booking[]>(`/bookings${query}`);
            setBookings(data);
        } catch (error) {
            console.error("Failed to load bookings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            await fetchApi(`/bookings/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ status })
            });
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
            if (selectedBooking?.id === id) {
                setSelectedBooking(prev => prev ? { ...prev, status } : null);
            }
        } catch (error) {
            console.error("Failed to update booking:", error);
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'confirmed': return { dot: '#10b981', bg: 'rgba(16,185,129,0.1)', text: '#059669', label: 'Confirmed', icon: <CheckCircle size={11} /> };
            case 'cancelled': return { dot: '#ef4444', bg: 'rgba(239,68,68,0.1)', text: '#dc2626', label: 'Cancelled', icon: <XCircle size={11} /> };
            case 'rejected': return { dot: '#ef4444', bg: 'rgba(239,68,68,0.1)', text: '#dc2626', label: 'Rejected', icon: <XCircle size={11} /> };
            default: return { dot: '#f59e0b', bg: 'rgba(245,158,11,0.1)', text: '#d97706', label: 'Pending', icon: <Clock size={11} /> };
        }
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    const filteredBookings = bookings.filter(b => {
        const matchesSearch = searchTerm === '' ||
            b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.phone.includes(searchTerm) ||
            (b.property && dt(b.property.title).toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        cancelled: bookings.filter(b => b.status === 'cancelled' || b.status === 'rejected').length,
    };

    const statCards = [
        { label: 'Total Bookings', value: stats.total,    icon: BookOpen,      iconBg: 'rgba(0,156,255,0.12)',  iconColor: '#009CFF' },
        { label: 'Pending',        value: stats.pending,  icon: Clock,         iconBg: 'rgba(245,158,11,0.12)', iconColor: '#d97706' },
        { label: 'Confirmed',      value: stats.confirmed,icon: CheckCircle,   iconBg: 'rgba(16,185,129,0.12)', iconColor: '#10b981' },
        { label: 'Cancelled',      value: stats.cancelled,icon: XCircle,       iconBg: 'rgba(239,68,68,0.12)',  iconColor: '#ef4444' },
    ];

    const filterOptions = [
        { value: 'all',       label: 'All',       icon: LayoutGrid },
        { value: 'pending',   label: 'Pending',   icon: Clock },
        { value: 'confirmed', label: 'Confirmed', icon: CheckCircle },
        { value: 'cancelled', label: 'Cancelled', icon: XCircle },
        { value: 'rejected',  label: 'Rejected',  icon: Ban },
    ];

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <Loader2 className="animate-spin" size={28} style={{ color: '#009CFF' }} />
            </div>
        );
    }

    return (
        <div className="container-fluid py-0 min-vh-100" style={{ background: 'transparent' }}>
            <div className="row g-1 pt-1">
                {/* ── Page Header ── */}
                <div className="col-12 px-lg-4">
                    <ScrollReveal>
                        <div className="glass-card p-3 rounded-xl border border-white shadow-sm d-flex align-items-center justify-content-between"
                            style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}>
                            <div className="d-flex align-items-center gap-3">
                                <div className="rounded-lg d-flex align-items-center justify-content-center shadow-sm"
                                    style={{ width: 36, height: 36, background: '#009CFF' }}>
                                    <BookOpen size={16} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="fw-bold mb-0" style={{ fontSize: '14px' }}>Booking Center</h2>
                                    <p className="text-muted mb-0" style={{ fontSize: '11px' }}>Manage property viewing requests</p>
                                </div>
                            </div>
                            <button
                                onClick={loadBookings}
                                className="btn btn-sm d-flex align-items-center gap-2 text-white"
                                style={{ background: '#009CFF', borderRadius: '8px', fontSize: '11px', fontWeight: 600 }}>
                                <RefreshCcw size={13} /> Refresh
                            </button>
                        </div>
                    </ScrollReveal>
                </div>

                {/* ── Stat Cards ── */}
                <div className="col-12 px-lg-4">
                    <ScrollReveal delay={0.05}>
                        <div className="row g-3">
                            {statCards.map((s, i) => (
                                <div key={i} className="col-6 col-lg-3">
                                    <div className="glass-card p-3 rounded-xl border border-white shadow-sm"
                                        style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="rounded-lg d-flex align-items-center justify-content-center flex-shrink-0"
                                                style={{ width: 38, height: 38, background: s.iconBg }}>
                                                <s.icon size={17} style={{ color: s.iconColor }} />
                                            </div>
                                            <div>
                                                <div className="text-muted fw-semibold text-uppercase mb-0"
                                                    style={{ fontSize: '9px', letterSpacing: '0.5px' }}>{s.label}</div>
                                                <div className="fw-bold" style={{ fontSize: '20px', lineHeight: 1.1, color: '#1e293b' }}>{s.value}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollReveal>
                </div>

                {/* ── Filters ── */}
                <div className="col-12 px-lg-4">
                    <ScrollReveal delay={0.1}>
                        <div className="glass-card p-3 rounded-xl border border-white shadow-sm"
                            style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}>
                            <div className="row g-2 align-items-center">
                                <div className="col-md-5">
                                    <div className="position-relative">
                                        <Search size={13} className="position-absolute text-muted"
                                            style={{ left: '11px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                                        <input
                                            type="text"
                                            className="form-control form-control-sm border-gray-200 bookings-search-input"
                                            placeholder="Search name, email, phone, property…"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            style={{ borderRadius: '8px', fontSize: '12px' }}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-7">
                                    <div className="d-flex align-items-center gap-2 flex-wrap">
                                        <Filter size={13} className="text-muted flex-shrink-0" />
                                        {filterOptions.map(opt => {
                                            const Icon = opt.icon;
                                            return (
                                            <button
                                                key={opt.value}
                                                onClick={() => setStatusFilter(opt.value)}
                                                className={`btn btn-sm d-flex align-items-center gap-2 transition-all ${statusFilter === opt.value ? 'shadow-sm' : ''}`}
                                                style={{
                                                    borderRadius: '10px',
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    padding: '6px 14px',
                                                    background: statusFilter === opt.value ? '#009CFF' : 'rgba(0,156,255,0.04)',
                                                    color: statusFilter === opt.value ? '#fff' : '#64748b',
                                                    border: statusFilter === opt.value ? '1px solid #009CFF' : '1px solid transparent'
                                                }}>
                                                <Icon size={14} className={statusFilter === opt.value ? 'text-white' : 'text-muted'} />
                                                {opt.label}
                                            </button>
                                        )})}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>

                {/* ── Table ── */}
                <div className="col-12 px-lg-4">
                    <ScrollReveal delay={0.15}>
                        <div className="glass-card rounded-xl border border-white shadow-sm overflow-hidden"
                            style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)' }}>

                            {/* Table header bar */}
                            <div className="px-3 py-2 border-bottom border-gray-100 d-flex align-items-center justify-content-between"
                                style={{ background: 'rgba(248,251,255,0.9)' }}>
                                <span className="fw-bold text-dark" style={{ fontSize: '12px' }}>
                                    All Reservations
                                    <span className="ms-2 badge rounded-pill"
                                        style={{ background: 'rgba(0,156,255,0.1)', color: '#009CFF', fontSize: '10px' }}>
                                        {filteredBookings.length}
                                    </span>
                                </span>
                            </div>

                            {filteredBookings.length === 0 ? (
                                <div className="text-center py-5">
                                    <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                                        style={{ width: 56, height: 56, background: 'rgba(0,156,255,0.08)' }}>
                                        <Eye size={24} style={{ color: '#009CFF' }} />
                                    </div>
                                    <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '13px' }}>No bookings found</h6>
                                    <p className="text-muted mb-0" style={{ fontSize: '11px' }}>
                                        Bookings appear here when customers request property viewings
                                    </p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table mb-0 align-middle bsng-table">
                                        <thead>
                                            <tr style={{ background: 'rgba(248,251,255,0.5)' }}>
                                                {['Customer', 'Property', 'Type', 'Viewing Date', 'Payment', 'Status', 'Submitted', 'Actions'].map((h, i) => (
                                                    <th key={i} className="fw-bold text-uppercase py-2"
                                                        style={{ fontSize: '9.5px', color: '#94a3b8', letterSpacing: '0.5px', borderBottom: '1px solid #f1f5f9', paddingLeft: i === 0 ? '16px' : '8px', paddingRight: i === 7 ? '16px' : '8px', whiteSpace: 'nowrap' }}>
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredBookings.map((booking, idx) => {
                                                const sc = getStatusConfig(booking.status);
                                                return (
                                                    <tr key={booking.id}
                                                        onClick={() => setSelectedBooking(booking)}
                                                        style={{
                                                            cursor: 'pointer',
                                                            borderBottom: idx < filteredBookings.length - 1 ? '1px solid #f1f5f9' : 'none',
                                                            transition: 'background 0.12s ease'
                                                        }}
                                                        className="bsng-table-row">

                                                        {/* Customer */}
                                                        <td style={{ paddingLeft: '16px', paddingTop: '10px', paddingBottom: '10px' }}>
                                                            <div className="d-flex align-items-center gap-2">
                                                                <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                                                    style={{ width: 32, height: 32, background: 'rgba(0,156,255,0.1)' }}>
                                                                    <User size={14} style={{ color: '#009CFF' }} />
                                                                </div>
                                                                <div>
                                                                    <div className="fw-bold" style={{ fontSize: '12px', color: '#1e293b' }}>{booking.name}</div>
                                                                    <div className="text-muted" style={{ fontSize: '10px' }}>{booking.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Property */}
                                                        <td style={{ padding: '10px 8px' }}>
                                                            <div className="fw-semibold" style={{ fontSize: '12px', color: '#1e293b' }}>
                                                                {booking.property ? dt(booking.property.title) : 'N/A'}
                                                            </div>
                                                            {booking.property && (
                                                                <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '10px' }}>
                                                                    <MapPin size={9} /> {dt(booking.property.location)}
                                                                </div>
                                                            )}
                                                        </td>

                                                        {/* Type */}
                                                        <td style={{ padding: '10px 8px' }}>
                                                            <span className="px-2 py-1 rounded-pill fw-bold text-capitalize"
                                                                style={{
                                                                    fontSize: '10px',
                                                                    background: booking.bookingType === 'sale' ? 'rgba(16,185,129,0.1)' : 'rgba(0,156,255,0.1)',
                                                                    color: booking.bookingType === 'sale' ? '#059669' : '#009CFF'
                                                                }}>
                                                                {booking.bookingType || 'rent'}
                                                            </span>
                                                        </td>

                                                        {/* Viewing Date */}
                                                        <td style={{ padding: '10px 8px' }}>
                                                            <div className="d-flex align-items-center gap-1" style={{ fontSize: '11px', color: '#475569' }}>
                                                                <Calendar size={11} style={{ color: '#009CFF' }} />
                                                                {formatDate(booking.date)}
                                                            </div>
                                                        </td>

                                                        {/* Payment */}
                                                        <td style={{ padding: '10px 8px' }}>
                                                            <span className="px-2 py-1 rounded-pill fw-bold text-capitalize"
                                                                style={{
                                                                    fontSize: '10px',
                                                                    background: booking.paymentStatus === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                                                                    color: booking.paymentStatus === 'completed' ? '#059669' : '#d97706'
                                                                }}>
                                                                {booking.paymentStatus || 'pending'}
                                                            </span>
                                                        </td>

                                                        {/* Status */}
                                                        <td style={{ padding: '10px 8px' }}>
                                                            <span className="d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill fw-bold text-capitalize"
                                                                style={{ fontSize: '10px', background: sc.bg, color: sc.text }}>
                                                                {sc.icon} {sc.label}
                                                            </span>
                                                        </td>

                                                        {/* Submitted */}
                                                        <td style={{ padding: '10px 8px' }}>
                                                            <div className="text-muted" style={{ fontSize: '11px' }}>{formatDate(booking.createdAt)}</div>
                                                        </td>

                                                        {/* Actions */}
                                                        <td style={{ paddingRight: '16px', padding: '10px 16px 10px 8px' }} onClick={(e) => e.stopPropagation()}>
                                                            <div className="d-flex gap-1 justify-content-end">
                                                                <button
                                                                    onClick={() => setSelectedBooking(booking)}
                                                                    className="btn btn-primary d-flex align-items-center justify-content-center"
                                                                    style={{ borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', height: '24px', border: 'none', padding: '0 8px' }}>
                                                                    Detail
                                                                </button>
                                                                {isAdmin && booking.status === 'pending' && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => updateStatus(booking.id, 'confirmed')}
                                                                            className="btn btn-outline-success d-flex align-items-center justify-content-center bg-white"
                                                                            style={{ borderRadius: '6px', width: '24px', height: '24px', border: '1px solid #10b981', color: '#10b981', padding: '0' }}
                                                                            title="Confirm">
                                                                            <CheckCircle size={11} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => updateStatus(booking.id, 'rejected')}
                                                                            className="btn btn-outline-danger d-flex align-items-center justify-content-center bg-white"
                                                                            style={{ borderRadius: '6px', width: '24px', height: '24px', border: '1px solid #dc3545', color: '#dc3545', padding: '0' }}
                                                                            title="Reject">
                                                                            <XCircle size={11} />
                                                                        </button>
                                                                    </>
                                                                )}
                                                                {isAdmin && booking.status === 'confirmed' && (
                                                                    <button
                                                                        onClick={() => updateStatus(booking.id, 'cancelled')}
                                                                        className="btn btn-outline-danger d-flex align-items-center justify-content-center bg-white"
                                                                        style={{ borderRadius: '6px', width: '24px', height: '24px', border: '1px solid #dc3545', color: '#dc3545', padding: '0' }}
                                                                        title="Cancel">
                                                                        <XCircle size={11} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </ScrollReveal>
                </div>
            </div>

            {/* ── Booking Details Drawer/Modal ── */}
            {selectedBooking && (
                <div
                    className="modal d-block"
                    style={{ backgroundColor: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)' }}
                    onClick={() => setSelectedBooking(null)}>
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
                        style={{ maxWidth: '460px' }}
                        onClick={e => e.stopPropagation()}>
                        <div className="modal-content border-0 rounded-xl overflow-hidden shadow-xl">

                            {/* Modal Header */}
                            <div className="p-4 d-flex align-items-center justify-content-between"
                                style={{ background: 'linear-gradient(135deg, #009CFF 0%, #0070cc 100%)' }}>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="rounded-lg d-flex align-items-center justify-content-center"
                                        style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.2)' }}>
                                        <BookOpen size={16} className="text-white" />
                                    </div>
                                    <div>
                                        <h5 className="fw-bold mb-0 text-white" style={{ fontSize: '14px' }}>Booking Details</h5>
                                        <p className="mb-0 text-white" style={{ fontSize: '11px', opacity: 0.75 }}>
                                            Ref #{selectedBooking.id.slice(0, 8).toUpperCase()}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedBooking(null)}
                                    className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}>
                                    <XCircle size={14} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-4" style={{ background: 'rgba(255,255,255,0.97)' }}>

                                {/* Status summary pill */}
                                <div className="d-flex align-items-center justify-content-between mb-4 p-3 rounded-xl"
                                    style={{ background: 'rgba(248,251,255,1)', border: '1px solid #f1f5f9' }}>
                                    <div>
                                        <div className="text-muted fw-semibold text-uppercase mb-1" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>Booking Status</div>
                                        {(() => {
                                            const sc = getStatusConfig(selectedBooking.status);
                                            return (
                                                <span className="d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill fw-bold text-capitalize"
                                                    style={{ fontSize: '11px', background: sc.bg, color: sc.text }}>
                                                    {sc.icon} {sc.label}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                    <div className="text-end">
                                        <div className="text-muted fw-semibold text-uppercase mb-1" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>Submitted</div>
                                        <div className="fw-bold" style={{ fontSize: '12px', color: '#1e293b' }}>{formatDate(selectedBooking.createdAt)}</div>
                                    </div>
                                </div>

                                {/* Customer */}
                                <div className="mb-1 text-muted fw-semibold text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>Customer</div>
                                <div className="p-3 rounded-xl mb-3" style={{ background: 'rgba(0,156,255,0.05)', border: '1px solid rgba(0,156,255,0.1)' }}>
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <User size={13} style={{ color: '#009CFF' }} />
                                        <span className="fw-bold" style={{ fontSize: '13px', color: '#1e293b' }}>{selectedBooking.name}</span>
                                    </div>
                                    <div className="d-flex gap-3">
                                        <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '11px' }}>
                                            <Mail size={11} /> {selectedBooking.email}
                                        </div>
                                        <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '11px' }}>
                                            <Phone size={11} /> {selectedBooking.phone}
                                        </div>
                                    </div>
                                </div>

                                {/* Property */}
                                {selectedBooking.property && (
                                    <>
                                        <div className="mb-1 text-muted fw-semibold text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>Property</div>
                                        <div className="p-3 rounded-xl mb-3" style={{ background: 'rgba(248,251,255,1)', border: '1px solid #f1f5f9' }}>
                                            <div className="fw-bold mb-1" style={{ fontSize: '12px', color: '#1e293b' }}>
                                                {dt(selectedBooking.property.title)}
                                            </div>
                                            <div className="d-flex align-items-center gap-1 text-muted mb-2" style={{ fontSize: '11px' }}>
                                                <MapPin size={11} /> {dt(selectedBooking.property.location)}
                                            </div>
                                            <div className="d-flex gap-2">
                                                <span className="px-2 py-1 rounded-pill fw-bold"
                                                    style={{ fontSize: '10px', background: selectedBooking.property.isForSale ? 'rgba(16,185,129,0.1)' : 'rgba(0,156,255,0.1)', color: selectedBooking.property.isForSale ? '#059669' : '#009CFF' }}>
                                                    {selectedBooking.property.isForSale ? 'For Sale' : 'For Rent'}
                                                </span>
                                                <span className="px-2 py-1 rounded-pill fw-bold"
                                                    style={{ fontSize: '10px', background: 'rgba(100,116,139,0.1)', color: '#64748b' }}>
                                                    {selectedBooking.property.code}
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Viewing Details */}
                                <div className="mb-1 text-muted fw-semibold text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>Viewing Details</div>
                                <div className="row g-2 mb-3">
                                    <div className="col-4">
                                        <div className="p-2 rounded-xl text-center" style={{ background: 'rgba(248,251,255,1)', border: '1px solid #f1f5f9' }}>
                                            <div className="text-muted mb-1" style={{ fontSize: '9px' }}>DATE</div>
                                            <div className="fw-bold d-flex align-items-center justify-content-center gap-1" style={{ fontSize: '11px', color: '#1e293b' }}>
                                                <Calendar size={10} style={{ color: '#009CFF' }} /> {formatDate(selectedBooking.date)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="p-2 rounded-xl text-center" style={{ background: 'rgba(248,251,255,1)', border: '1px solid #f1f5f9' }}>
                                            <div className="text-muted mb-1" style={{ fontSize: '9px' }}>TYPE</div>
                                            <span className="px-2 py-0 rounded-pill fw-bold text-capitalize"
                                                style={{ fontSize: '10px', background: selectedBooking.bookingType === 'sale' ? 'rgba(16,185,129,0.1)' : 'rgba(0,156,255,0.1)', color: selectedBooking.bookingType === 'sale' ? '#059669' : '#009CFF' }}>
                                                {selectedBooking.bookingType || 'rent'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="p-2 rounded-xl text-center" style={{ background: 'rgba(248,251,255,1)', border: '1px solid #f1f5f9' }}>
                                            <div className="text-muted mb-1" style={{ fontSize: '9px' }}>PAYMENT</div>
                                            <span className="px-2 py-0 rounded-pill fw-bold text-capitalize"
                                                style={{ fontSize: '10px', background: selectedBooking.paymentStatus === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: selectedBooking.paymentStatus === 'completed' ? '#059669' : '#d97706' }}>
                                                {selectedBooking.paymentStatus || 'pending'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className="p-3 rounded-xl mb-3 d-flex align-items-center justify-content-between"
                                    style={{ background: 'rgba(0,156,255,0.05)', border: '1px solid rgba(0,156,255,0.12)' }}>
                                    <div>
                                        <div className="text-muted fw-semibold text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>Amount</div>
                                        <div className="fw-bold" style={{ fontSize: '16px', color: '#009CFF' }}>
                                            RWF {new Intl.NumberFormat().format(selectedBooking.amount || 0)}
                                        </div>
                                    </div>
                                    <div className="rounded-lg d-flex align-items-center justify-content-center"
                                        style={{ width: 36, height: 36, background: 'rgba(0,156,255,0.1)' }}>
                                        <BookOpen size={16} style={{ color: '#009CFF' }} />
                                    </div>
                                </div>

                                {/* Message */}
                                {selectedBooking.message && (
                                    <>
                                        <div className="mb-1 text-muted fw-semibold text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>Message</div>
                                        <div className="p-3 rounded-xl mb-3 d-flex gap-2" style={{ background: 'rgba(248,251,255,1)', border: '1px solid #f1f5f9' }}>
                                            <MessageSquare size={13} className="text-muted flex-shrink-0 mt-1" />
                                            <p className="mb-0" style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>{selectedBooking.message}</p>
                                        </div>
                                    </>
                                )}

                                {/* Admin Actions */}
                                {isAdmin && (
                                    <div className="d-flex gap-2 mt-2">
                                        {selectedBooking.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => updateStatus(selectedBooking.id, 'confirmed')}
                                                    className="btn flex-fill d-flex align-items-center justify-content-center gap-2 text-white"
                                                    style={{ background: '#10b981', borderRadius: '10px', fontSize: '12px', fontWeight: 600, padding: '8px' }}>
                                                    <CheckCircle size={14} /> Confirm Viewing
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(selectedBooking.id, 'rejected')}
                                                    className="btn d-flex align-items-center justify-content-center gap-2"
                                                    style={{ borderRadius: '10px', fontSize: '12px', fontWeight: 600, padding: '8px 16px', background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}>
                                                    <XCircle size={14} /> Reject
                                                </button>
                                            </>
                                        )}
                                        {selectedBooking.status === 'confirmed' && (
                                            <button
                                                onClick={() => updateStatus(selectedBooking.id, 'cancelled')}
                                                className="btn flex-fill d-flex align-items-center justify-content-center gap-2"
                                                style={{ borderRadius: '10px', fontSize: '12px', fontWeight: 600, padding: '8px', background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}>
                                                <XCircle size={14} /> Cancel Viewing
                                            </button>
                                        )}
                                        {(selectedBooking.status === 'cancelled' || selectedBooking.status === 'rejected') && (
                                            <div className="w-100 text-center text-muted py-2" style={{ fontSize: '12px' }}>
                                                This booking has been closed.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .bsng-table { border-collapse: separate; border-spacing: 0; }
                .bsng-table-row:hover { background: rgba(0,156,255,0.03) !important; }
                .rounded-xl { border-radius: 12px !important; }
                .shadow-xl { box-shadow: 0 20px 40px -10px rgba(15,23,42,0.18) !important; }
                .fade-in-up { animation: fadeInUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards; }
                .bookings-search-input { padding-left: 32px !important; }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
