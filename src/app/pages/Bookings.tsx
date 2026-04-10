import { useState, useEffect } from "react";
import { 
    Eye, Search, Calendar, User, Phone, Mail, MapPin, 
    CheckCircle, Clock, XCircle, RefreshCcw, Filter, 
    MessageSquare, BookOpen, Loader2, LayoutGrid, Ban,
    Trash2, Check, ArrowRight, CreditCard, ShoppingBag, 
    KeyRound
} from "lucide-react";
import { ScrollReveal } from "@/app/components/ScrollReveal";
import { fetchApi } from '../api/client';
import { useLanguage } from "@/app/context/LanguageContext";
import { useAuth } from "@/app/context/AuthContext";
import { useCurrency } from "@/app/context/CurrencyContext";

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
        monthlyRent?: number;
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
    const { dt, t } = useLanguage();
    const { user } = useAuth();
    const { formatPrice } = useCurrency();
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
                method: 'PATCH',
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

    const deleteBooking = async (id: string) => {
        if (!confirm("Are you sure you want to delete this activity record?")) return;
        try {
            await fetchApi(`/bookings/${id}`, { method: 'DELETE' });
            setBookings(prev => prev.filter(b => b.id !== id));
            setSelectedBooking(null);
        } catch (error) {
            console.error("Failed to delete booking:", error);
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'confirmed': return { dot: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Confirmed', icon: <CheckCircle size={11} /> };
            case 'cancelled': return { dot: '#ef4444', bg: 'bg-rose-50', text: 'text-rose-600', label: 'Cancelled', icon: <XCircle size={11} /> };
            case 'rejected': return { dot: '#ef4444', bg: 'bg-rose-50', text: 'text-rose-600', label: 'Rejected', icon: <XCircle size={11} /> };
            default: return { dot: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-600', label: 'Pending Review', icon: <Clock size={11} /> };
        }
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    const filteredBookings = bookings.filter(b => {
        const matchesSearch = searchTerm === '' ||
            b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (b.property && dt(b.property.title).toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="bookings-hub container-fluid px-0 min-vh-100">
            {/* Professional High Density Header */}
            <div className="glass-card p-3 rounded-xl mb-4 border border-white shadow-sm d-flex align-items-center justify-content-between bg-white/70 backdrop-blur-md">
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary rounded-lg p-2.5 text-white shadow-sm d-flex align-items-center justify-content-center">
                        <ShoppingBag size={20} />
                    </div>
                    <div>
                        <h2 className="fw-bold mb-0" style={{ fontSize: '15px' }}>Purchase & Lease Activity</h2>
                        <p className="text-muted mb-0" style={{ fontSize: '11px' }}>Track your property checkout history and status</p>
                    </div>
                </div>
                <div className="d-flex gap-2">
                    <div className="position-relative d-none d-md-block">
                        <Search size={14} className="position-absolute text-muted" style={{ left: '12px', top: '10px' }} />
                        <input 
                            type="text" 
                            placeholder="Search activity..." 
                            className="form-control form-control-sm ps-5 border-0 shadow-sm bg-white/80" 
                            style={{ borderRadius: '8px', fontSize: '12px', width: '220px', height: '34px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={loadBookings} className="btn btn-sm d-flex align-items-center gap-2 bg-white text-dark shadow-sm px-3 border-0" style={{ borderRadius: '8px', fontSize: '12px' }}>
                        <RefreshCcw size={14} /> Refresh
                    </button>
                </div>
            </div>

            {/* Status Filter Pills */}
            <div className="d-flex gap-2 mb-4 overflow-auto pb-1 scrollbar-hidden">
                {['all', 'pending', 'confirmed', 'rejected', 'cancelled'].map((opt) => (
                    <button 
                        key={opt}
                        onClick={() => setStatusFilter(opt)}
                        className={`btn btn-sm px-4 py-2 border-0 fw-bold transition-all ${statusFilter === opt ? 'bg-primary text-white shadow-md' : 'bg-white/60 text-muted hover:bg-white shadow-sm'}`}
                        style={{ borderRadius: '10px', fontSize: '11px', whiteSpace: 'nowrap' }}
                    >
                        {opt.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Activity Content */}
            <div className="row g-3">
                {filteredBookings.length === 0 ? (
                    <div className="col-12 text-center py-5 opacity-40">
                        <ShoppingCart size={48} className="mb-3 text-muted mx-auto" />
                        <h5 className="fw-bold">No activity found</h5>
                        <p className="small">Your property purchase and lease requests will appear here once submitted.</p>
                    </div>
                ) : (
                    filteredBookings.map((booking, index) => {
                        const sc = getStatusConfig(booking.status);
                        return (
                            <div key={booking.id} className="col-lg-4 col-md-6">
                                <ScrollReveal delay={index * 0.05}>
                                    <div className="glass-card h-100 p-0 rounded-2xl border border-white shadow-sm overflow-hidden bg-white/40 transition-all hover:translate-y-[-2px] hover:shadow-md">
                                        {/* Status Header */}
                                        <div className={`px-4 py-2 border-bottom d-flex justify-content-between align-items-center ${sc.bg}`}>
                                            <span className={`fw-bold text-[9px] uppercase tracking-wider d-flex align-items-center gap-2 ${sc.text}`}>
                                                {sc.icon} {sc.label}
                                            </span>
                                            <span className="text-muted smaller fw-medium">{formatDate(booking.createdAt)}</span>
                                        </div>

                                        <div className="p-4">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div>
                                                    <span className={`badge mb-2 px-2 py-1 text-[9px] uppercase shadow-sm ${booking.bookingType === 'sale' ? 'bg-indigo-600' : 'bg-blue-600'} text-white`}>
                                                        {booking.bookingType === 'sale' ? 'FOR BUY' : 'FOR RENT'}
                                                    </span>
                                                    <h5 className="fw-bold text-dark mb-1 line-clamp-1" style={{ fontSize: '14px' }}>
                                                        {booking.property ? dt(booking.property.title) : 'N/A'}
                                                    </h5>
                                                    <div className="d-flex align-items-center gap-1.5 text-muted small" style={{ fontSize: '10px' }}>
                                                        <MapPin size={10} /> {booking.property ? dt(booking.property.location) : 'Location N/A'}
                                                    </div>
                                                </div>
                                                <div className="text-end">
                                                    <div className="fw-bold text-primary" style={{ fontSize: '13px' }}>{formatPrice(booking.amount)}</div>
                                                    <div className="text-muted smaller opacity-60">Checkout Amount</div>
                                                </div>
                                            </div>

                                            <div className="bg-light/50 p-2.5 rounded-xl border border-gray-100/50 mb-3 d-flex justify-content-around">
                                                <div className="text-center">
                                                    <div className="text-muted text-[8px] uppercase fw-bold opacity-60 mb-0">Code</div>
                                                    <div className="fw-bold text-dark text-[10px]">{booking.property?.code || 'N/A'}</div>
                                                </div>
                                                <div className="text-center border-start ps-3 border-gray-200">
                                                    <div className="text-muted text-[8px] uppercase fw-bold opacity-60 mb-0">User Ref</div>
                                                    <div className="fw-bold text-dark text-[10px]">#{booking.id.slice(-6).toUpperCase()}</div>
                                                </div>
                                                <div className="text-center border-start ps-3 border-gray-200">
                                                    <div className="text-muted text-[8px] uppercase fw-bold opacity-60 mb-0">Payment</div>
                                                    <div className={`fw-bold text-[10px] ${booking.paymentStatus === 'completed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                        {booking.paymentStatus === 'completed' ? 'Paid' : 'Pending'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-3 border-top d-flex gap-2">
                                                <button 
                                                    onClick={() => setSelectedBooking(booking)}
                                                    className="btn btn-sm btn-dark flex-grow-1 fw-bold d-flex align-items-center justify-content-center gap-2"
                                                    style={{ borderRadius: '8px', fontSize: '11px', height: '34px' }}
                                                >
                                                    <Eye size={14} /> Full Details
                                                </button>
                                                {!isAdmin && booking.status === 'pending' && (
                                                    <button 
                                                        onClick={() => deleteBooking(booking.id)}
                                                        className="btn btn-sm btn-outline-danger shadow-sm d-flex align-items-center justify-content-center px-3"
                                                        style={{ borderRadius: '8px', height: '34px' }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Detailed Activity Modal */}
            {selectedBooking && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)' }} onClick={() => setSelectedBooking(null)}>
                    <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
                        <div className="modal-content border-0 rounded-2xl shadow-2xl overflow-hidden glass-card">
                            <div className={`p-4 text-white d-flex align-items-center justify-content-between ${selectedBooking.bookingType === 'sale' ? 'bg-indigo-600' : 'bg-blue-600'}`}>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-white/20 rounded-lg p-2.5 d-flex align-items-center justify-content-center">
                                        {selectedBooking.bookingType === 'sale' ? <ShoppingBag size={20} /> : <KeyRound size={20} />}
                                    </div>
                                    <div>
                                        <h5 className="fw-bold mb-0" style={{ fontSize: '15px' }}>Checkout Detail</h5>
                                        <p className="mb-0 smaller opacity-80">Reference ID: #{selectedBooking.id.toUpperCase()}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedBooking(null)} className="btn btn-link text-white p-0"><XCircle size={20} /></button>
                            </div>
                            
                            <div className="p-4 bg-white/95">
                                <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
                                    <div>
                                        <span className="text-muted smaller fw-bold text-uppercase d-block mb-1">Current Status</span>
                                        <span className={`badge px-3 py-1.5 rounded-pill fw-bold text-[10px] uppercase ${getStatusConfig(selectedBooking.status).bg} ${getStatusConfig(selectedBooking.status).text}`}>
                                            {getStatusConfig(selectedBooking.status).label}
                                        </span>
                                    </div>
                                    <div className="text-end">
                                        <span className="text-muted smaller fw-bold text-uppercase d-block mb-1">Checkout Date</span>
                                        <span className="fw-bold text-dark" style={{ fontSize: '13px' }}>{formatDate(selectedBooking.createdAt)}</span>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h6 className="fw-bold text-dark mb-3">Property Information</h6>
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 d-flex gap-3 align-items-center">
                                        <div className="bg-white p-2 rounded-lg shadow-sm">
                                            <BookOpen size={20} className="text-primary" />
                                        </div>
                                        <div>
                                            <div className="fw-bold text-dark text-sm">{selectedBooking.property ? dt(selectedBooking.property.title) : 'N/A'}</div>
                                            <div className="text-muted smaller">{selectedBooking.property ? dt(selectedBooking.property.location) : 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="row g-3 mb-4">
                                    <div className="col-6">
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 h-100">
                                            <span className="text-muted text-[9px] fw-bold uppercase d-block mb-2">Checkout Amount</span>
                                            <div className="fw-bold text-primary h5 mb-0">{formatPrice(selectedBooking.amount)}</div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 h-100">
                                            <span className="text-muted text-[9px] fw-bold uppercase d-block mb-2">Payment Status</span>
                                            <div className={`fw-bold h5 mb-0 ${selectedBooking.paymentStatus === 'completed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                {selectedBooking.paymentStatus === 'completed' ? 'Paid' : 'Pending'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {selectedBooking.message && (
                                    <div className="mb-4">
                                        <span className="text-muted smaller fw-bold text-uppercase d-block mb-2">Client Note</span>
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 italic smaller text-muted">
                                            "{dt(selectedBooking.message)}"
                                        </div>
                                    </div>
                                )}

                                {/* Payment Actions for Client */}
                                {!isAdmin && selectedBooking.paymentStatus !== 'completed' && (
                                    <button className="btn btn-primary w-100 py-3 fw-bold rounded-xl shadow-lg d-flex align-items-center justify-content-center gap-2 mb-3">
                                        <CreditCard size={18} /> Proceed to Secure Payment
                                    </button>
                                )}

                                {/* Admin Management Actions */}
                                {isAdmin && selectedBooking.status === 'pending' && (
                                    <div className="d-flex gap-3">
                                        <button 
                                            onClick={() => updateStatus(selectedBooking.id, 'confirmed')}
                                            className="btn btn-success flex-grow-1 py-2.5 fw-bold rounded-xl d-flex align-items-center justify-content-center gap-2"
                                        >
                                            <Check size={18} /> Approve activity
                                        </button>
                                        <button 
                                            onClick={() => updateStatus(selectedBooking.id, 'rejected')}
                                            className="btn btn-outline-danger flex-grow-1 py-2.5 fw-bold rounded-xl d-flex align-items-center justify-content-center gap-2"
                                        >
                                            <Ban size={18} /> Reject
                                        </button>
                                    </div>
                                )}

                                {isAdmin && selectedBooking.status === 'confirmed' && (
                                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 d-flex align-items-center gap-3 text-emerald-700">
                                        <CheckCircle size={20} />
                                        <span className="fw-bold smaller">This checkout activity has been approved.</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .bookings-hub { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
                .scrollbar-hidden::-webkit-scrollbar { display: none; }
                .smaller { font-size: 11px; }
            `}</style>
        </div>
    );
}

function ShoppingCart(props: any) {
    return <ShoppingBag {...props} />;
}
