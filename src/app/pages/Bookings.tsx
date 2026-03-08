import { useState, useEffect } from "react";
import {
    Eye, Search, Calendar, User, Phone, Mail, MapPin,
    CheckCircle, Clock, XCircle, RefreshCcw, Filter, MessageSquare
} from "lucide-react";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { fetchApi } from '../api/client';
import { useLanguage } from "@/app/context/LanguageContext";

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
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            setIsLoading(true);
            const data = await fetchApi<Booking[]>('/bookings');
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return { bg: 'bg-success', text: 'text-success', light: 'bg-success-subtle' };
            case 'cancelled': return { bg: 'bg-danger', text: 'text-danger', light: 'bg-danger-subtle' };
            default: return { bg: 'bg-warning', text: 'text-warning', light: 'bg-warning-subtle' };
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed': return <CheckCircle size={14} />;
            case 'cancelled': return <XCircle size={14} />;
            default: return <Clock size={14} />;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

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
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
    };

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <RefreshCcw className="animate-spin text-emerald-600" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-3">
            <ScrollReveal>
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
                    <div>
                        <h1 className="h3 fw-bold text-gray-900 dark:text-white mb-1">Property Bookings</h1>
                        <p className="text-muted small mb-0">Manage property viewing requests from potential buyers and tenants</p>
                    </div>
                    <button onClick={loadBookings} className="btn btn-outline-primary d-flex align-items-center gap-2">
                        <RefreshCcw size={16} /> Refresh
                    </button>
                </div>
            </ScrollReveal>

            {/* Stats Cards */}
            <ScrollReveal delay={0.1}>
                <div className="row g-3 mb-4">
                    {[
                        { label: 'Total Bookings', value: stats.total, icon: Eye, color: 'primary' },
                        { label: 'Pending', value: stats.pending, icon: Clock, color: 'warning' },
                        { label: 'Confirmed', value: stats.confirmed, icon: CheckCircle, color: 'success' },
                        { label: 'Cancelled', value: stats.cancelled, icon: XCircle, color: 'danger' },
                    ].map((stat, i) => (
                        <div key={i} className="col-6 col-lg-3">
                            <div className={`card border-0 shadow-sm h-100`}>
                                <div className="card-body d-flex align-items-center gap-3 p-3">
                                    <div className={`btn-square bg-${stat.color}-subtle text-${stat.color} rounded-3`} style={{ width: '44px', height: '44px' }}>
                                        <stat.icon size={20} />
                                    </div>
                                    <div>
                                        <div className="text-muted small text-uppercase fw-bold" style={{ fontSize: '10px' }}>{stat.label}</div>
                                        <div className="h4 fw-bold mb-0">{stat.value}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollReveal>

            {/* Filters */}
            <ScrollReveal delay={0.2}>
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-3">
                        <div className="row g-3 align-items-center">
                            <div className="col-md-6">
                                <div className="position-relative">
                                    <Search className="position-absolute text-muted" size={16} style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                    <input
                                        type="text"
                                        className="form-control ps-5"
                                        placeholder="Search by name, email, phone, or property..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="d-flex gap-2 align-items-center">
                                    <Filter size={16} className="text-muted" />
                                    {['all', 'pending', 'confirmed', 'cancelled'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => setStatusFilter(status)}
                                            className={`btn btn-sm ${statusFilter === status ? 'btn-primary' : 'btn-outline-secondary'} text-capitalize`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ScrollReveal>

            {/* Bookings Table */}
            <ScrollReveal delay={0.3}>
                <div className="card border-0 shadow-sm">
                    <div className="card-body p-0">
                        {filteredBookings.length === 0 ? (
                            <div className="text-center py-5">
                                <Eye className="text-muted mb-3" size={48} />
                                <h5 className="text-muted">No bookings found</h5>
                                <p className="text-muted small">Bookings will appear here when customers request property viewings</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover mb-0 align-middle">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="fw-bold text-uppercase small py-3 ps-3" style={{ fontSize: '10px' }}>Customer</th>
                                            <th className="fw-bold text-uppercase small py-3" style={{ fontSize: '10px' }}>Property</th>
                                            <th className="fw-bold text-uppercase small py-3" style={{ fontSize: '10px' }}>Type</th>
                                            <th className="fw-bold text-uppercase small py-3" style={{ fontSize: '10px' }}>Viewing Date</th>
                                            <th className="fw-bold text-uppercase small py-3" style={{ fontSize: '10px' }}>Payment</th>
                                            <th className="fw-bold text-uppercase small py-3" style={{ fontSize: '10px' }}>Status</th>
                                            <th className="fw-bold text-uppercase small py-3" style={{ fontSize: '10px' }}>Submitted</th>
                                            <th className="fw-bold text-uppercase small py-3 pe-3 text-end" style={{ fontSize: '10px' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredBookings.map(booking => {
                                            const statusColor = getStatusColor(booking.status);
                                            return (
                                                <tr key={booking.id} className="border-bottom" style={{ cursor: 'pointer' }} onClick={() => setSelectedBooking(booking)}>
                                                    <td className="ps-3 py-3">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div className="btn-square bg-primary-subtle text-primary rounded-circle" style={{ width: '36px', height: '36px' }}>
                                                                <User size={16} />
                                                            </div>
                                                            <div>
                                                                <div className="fw-bold small">{booking.name}</div>
                                                                <div className="text-muted" style={{ fontSize: '11px' }}>{booking.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3">
                                                        <div className="fw-bold small">{booking.property ? dt(booking.property.title) : 'N/A'}</div>
                                                        {booking.property && (
                                                            <div className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '11px' }}>
                                                                <MapPin size={10} /> {dt(booking.property.location)}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-3">
                                                        <span className={`badge ${booking.bookingType === 'sale' ? 'bg-success' : 'bg-primary'} x-small text-capitalize`}>
                                                            {booking.bookingType || 'rent'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3">
                                                        <div className="d-flex align-items-center gap-1 small text-muted">
                                                            <Calendar size={12} className="text-primary" />
                                                            {formatDate(booking.date)}
                                                        </div>
                                                    </td>
                                                    <td className="py-3">
                                                        <span className={`badge ${booking.paymentStatus === 'completed' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'} x-small text-capitalize`}>
                                                            {booking.paymentStatus || 'pending'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3">
                                                        <span className={`badge ${statusColor.light} ${statusColor.text} d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill text-capitalize`}>
                                                            {getStatusIcon(booking.status)} {booking.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3">
                                                        <div className="text-muted small">{formatDate(booking.createdAt)}</div>
                                                    </td>
                                                    <td className="pe-3 py-3 text-end" onClick={(e) => e.stopPropagation()}>
                                                        <div className="d-flex gap-1 justify-content-end">
                                                            {booking.status === 'pending' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => updateStatus(booking.id, 'confirmed')}
                                                                        className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                                                                        title="Confirm"
                                                                    >
                                                                        <CheckCircle size={12} /> Confirm
                                                                    </button>
                                                                    <button
                                                                        onClick={() => updateStatus(booking.id, 'cancelled')}
                                                                        className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                                                                        title="Cancel"
                                                                    >
                                                                        <XCircle size={12} />
                                                                    </button>
                                                                </>
                                                            )}
                                                            {booking.status === 'confirmed' && (
                                                                <button
                                                                    onClick={() => updateStatus(booking.id, 'cancelled')}
                                                                    className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                                                                >
                                                                    <XCircle size={12} /> Cancel
                                                                </button>
                                                            )}
                                                            {booking.status === 'cancelled' && (
                                                                <button
                                                                    onClick={() => updateStatus(booking.id, 'pending')}
                                                                    className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1"
                                                                >
                                                                    <Clock size={12} /> Reopen
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
                </div>
            </ScrollReveal>

            {/* Booking Details Modal */}
            {selectedBooking && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setSelectedBooking(null)}>
                    <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
                        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                            <div className="bg-primary text-white p-4">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h5 className="fw-bold mb-1">Booking Details</h5>
                                        <p className="small opacity-75 mb-0">Viewing request #{selectedBooking.id.slice(0, 8)}</p>
                                    </div>
                                    <button onClick={() => setSelectedBooking(null)} className="btn btn-sm btn-light rounded-circle" style={{ width: '28px', height: '28px' }}>
                                        <XCircle size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                {/* Customer Info */}
                                <h6 className="fw-bold text-uppercase text-muted small mb-3" style={{ fontSize: '10px', letterSpacing: '1px' }}>Customer Information</h6>
                                <div className="row g-3 mb-4">
                                    <div className="col-12">
                                        <div className="d-flex align-items-center gap-2 p-3 bg-light rounded-3">
                                            <User size={16} className="text-primary" />
                                            <div>
                                                <div className="fw-bold">{selectedBooking.name}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="d-flex align-items-center gap-2 p-3 bg-light rounded-3">
                                            <Mail size={14} className="text-primary" />
                                            <div className="small text-truncate">{selectedBooking.email}</div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="d-flex align-items-center gap-2 p-3 bg-light rounded-3">
                                            <Phone size={14} className="text-primary" />
                                            <div className="small">{selectedBooking.phone}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Property Info */}
                                {selectedBooking.property && (
                                    <>
                                        <h6 className="fw-bold text-uppercase text-muted small mb-3" style={{ fontSize: '10px', letterSpacing: '1px' }}>Property</h6>
                                        <div className="p-3 bg-light rounded-3 mb-4">
                                            <div className="fw-bold">{dt(selectedBooking.property.title)}</div>
                                            <div className="text-muted small d-flex align-items-center gap-1">
                                                <MapPin size={12} /> {dt(selectedBooking.property.location)}
                                            </div>
                                            <div className="mt-1">
                                                <span className={`badge ${selectedBooking.property.isForSale ? 'bg-success' : 'bg-primary'} me-1`}>
                                                    {selectedBooking.property.isForSale ? 'For Sale' : 'For Rent'}
                                                </span>
                                                <span className="badge bg-secondary">{selectedBooking.property.code}</span>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Viewing Date */}
                                <h6 className="fw-bold text-uppercase text-muted small mb-3" style={{ fontSize: '10px', letterSpacing: '1px' }}>Viewing Details</h6>
                                <div className="d-flex gap-3 mb-4">
                                    <div className="p-3 bg-light rounded-3 flex-fill">
                                        <div className="text-muted small">Requested Date</div>
                                        <div className="fw-bold d-flex align-items-center gap-1">
                                            <Calendar size={14} className="text-primary" /> {formatDate(selectedBooking.date)}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-light rounded-3 flex-fill">
                                        <div className="text-muted small">Booking Type</div>
                                        <span className={`badge ${selectedBooking.bookingType === 'sale' ? 'bg-success' : 'bg-primary'} mt-1`}>
                                            {selectedBooking.bookingType === 'sale' ? 'For Sale' : 'For Rent'}
                                        </span>
                                    </div>
                                    <div className="p-3 bg-light rounded-3 flex-fill">
                                        <div className="text-muted small">Status</div>
                                        <span className={`badge ${getStatusColor(selectedBooking.status).light} ${getStatusColor(selectedBooking.status).text} d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill text-capitalize mt-1`}>
                                            {getStatusIcon(selectedBooking.status)} {selectedBooking.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-3 bg-info-subtle border border-info-subtle rounded-3 mb-4">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <div className="text-info small fw-bold text-uppercase" style={{ fontSize: '9px' }}>Payment Status</div>
                                            <div className="fw-bold text-info-emphasis">{selectedBooking.paymentStatus || 'Pending'}</div>
                                        </div>
                                        <div className="text-end">
                                            <div className="text-info small fw-bold text-uppercase" style={{ fontSize: '9px' }}>Amount</div>
                                            <div className="fw-bold text-info-emphasis">RWF {new Intl.NumberFormat().format(selectedBooking.amount || 0)}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Message */}
                                {selectedBooking.message && (
                                    <>
                                        <h6 className="fw-bold text-uppercase text-muted small mb-3" style={{ fontSize: '10px', letterSpacing: '1px' }}>Message</h6>
                                        <div className="p-3 bg-light rounded-3 mb-4">
                                            <div className="d-flex gap-2">
                                                <MessageSquare size={14} className="text-muted flex-shrink-0 mt-1" />
                                                <p className="mb-0 small">{selectedBooking.message}</p>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Actions */}
                                <div className="d-flex gap-2">
                                    {selectedBooking.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => updateStatus(selectedBooking.id, 'confirmed')}
                                                className="btn btn-success flex-fill d-flex align-items-center justify-content-center gap-2"
                                            >
                                                <CheckCircle size={16} /> Confirm Viewing
                                            </button>
                                            <button
                                                onClick={() => updateStatus(selectedBooking.id, 'cancelled')}
                                                className="btn btn-outline-danger d-flex align-items-center justify-content-center gap-2"
                                            >
                                                <XCircle size={16} /> Cancel
                                            </button>
                                        </>
                                    )}
                                    {selectedBooking.status === 'confirmed' && (
                                        <button
                                            onClick={() => updateStatus(selectedBooking.id, 'cancelled')}
                                            className="btn btn-outline-danger flex-fill d-flex align-items-center justify-content-center gap-2"
                                        >
                                            <XCircle size={16} /> Cancel Viewing
                                        </button>
                                    )}
                                    {selectedBooking.status === 'cancelled' && (
                                        <button
                                            onClick={() => updateStatus(selectedBooking.id, 'pending')}
                                            className="btn btn-outline-warning flex-fill d-flex align-items-center justify-content-center gap-2"
                                        >
                                            <Clock size={16} /> Reopen Booking
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
