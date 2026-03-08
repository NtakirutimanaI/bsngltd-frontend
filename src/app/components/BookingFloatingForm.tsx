import { useState, useRef, useEffect } from 'react';
import { X, Users, Mail, Phone, Calendar, Send, Check, GripVertical, CreditCard, Smartphone, Wallet, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import { fetchApi } from '@/app/api/client';
import { useCurrency } from '@/app/context/CurrencyContext';
import { useAuth } from '@/app/context/AuthContext';

type BookingStep = 'form' | 'payment_method' | 'payment_details' | 'success';
type PaymentMethod = 'momo' | 'bank' | 'cash' | null;

interface BookingFloatingFormProps {
    propertyId?: string;
    serviceId?: string;
    title: string;
    type: 'sale' | 'rent' | 'service';
    amount: number;
    onClose: () => void;
}

export function BookingFloatingForm({ propertyId, serviceId, title, type, amount, onClose }: BookingFloatingFormProps) {
    const { t } = useLanguage();
    const { user } = useAuth();
    const { formatPrice } = useCurrency();
    const [step, setStep] = useState<BookingStep>('form');
    const [bookingId, setBookingId] = useState<string | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(null);

    const [bookingData, setBookingData] = useState({
        name: user?.fullName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        date: '',
        message: '',
    });

    const [paymentData, setPaymentData] = useState({
        phoneNumber: '',
        bankAccount: '',
        fullName: '',
    });

    // Draggable logic
    const [position, setPosition] = useState({ x: window.innerWidth - 380, y: 120 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const formRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                const newX = Math.max(20, Math.min(window.innerWidth - 350, e.clientX - dragOffset.x));
                const newY = Math.max(100, Math.min(window.innerHeight - 500, e.clientY - dragOffset.y));
                setPosition({ x: newX, y: newY });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset]);

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetchApi<any>('/bookings', {
                method: 'POST',
                body: JSON.stringify({
                    ...bookingData,
                    propertyId,
                    serviceId,
                    userId: user?.id,
                    bookingType: type,
                    amount: amount
                }),
            });
            setBookingId(response.id);
            setPaymentData({ ...paymentData, fullName: bookingData.name, phoneNumber: bookingData.phone });
            setStep('payment_method');
        } catch (error) {
            console.error("Booking failed", error);
            alert("Booking failed. Please try again.");
        }
    };

    const handlePaymentMethodSelect = (method: PaymentMethod) => {
        setSelectedPaymentMethod(method);
        setStep('payment_details');
    };

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                payer: paymentData.fullName,
                amount: amount,
                type: 'booking_payment',
                status: 'pending',
                method: selectedPaymentMethod,
                date: new Date().toISOString(),
                description: `Booking Payment for ${title} (${type === 'sale' ? t('forSale') : (type === 'rent' ? t('forRent') : 'Service')})`,
                propertyId: propertyId,
                serviceId: serviceId,
                bookingId: bookingId
            };

            await fetchApi('/payments', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            // Also update booking payment status
            if (bookingId) {
                await fetchApi(`/bookings/${bookingId}`, {
                    method: 'PATCH',
                    body: JSON.stringify({ paymentStatus: 'completed', status: 'confirmed' })
                });
            }

            setStep('success');
            setTimeout(() => {
                onClose();
            }, 4000);
        } catch (error) {
            console.error("Payment failed", error);
            alert("Payment failed. Please try again.");
        }
    };

    return (
        <div
            ref={formRef}
            className={`position-fixed shadow-lg bg-white rounded-3 border-0 wow fadeIn`}
            style={{
                width: '340px',
                left: `${position.x}px`,
                top: `${position.y}px`,
                zIndex: 1050,
                overflow: 'hidden',
                userSelect: isDragging ? 'none' : 'auto',
                transition: isDragging ? 'none' : 'all 0.1s ease-out'
            }}
        >
            {/* Header - Draggable Area */}
            <div
                className="bg-primary text-white p-2 d-flex align-items-center justify-content-between cursor-move"
                onMouseDown={handleMouseDown}
                style={{ cursor: 'move' }}
            >
                <div className="d-flex align-items-center gap-2">
                    <GripVertical size={16} className="opacity-50" />
                    <span className="small fw-bold">
                        {step === 'form' && (t('bookViewing') || 'Book Viewing')}
                        {step === 'payment_method' && 'Select Payment'}
                        {step === 'payment_details' && 'Payment Details'}
                        {step === 'success' && 'Success!'}
                    </span>
                </div>
                <button
                    onClick={onClose}
                    className="btn btn-sm btn-primary p-1 rounded-circle hover-bg-light-opacity"
                    style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <X size={14} />
                </button>
            </div>

            <div className="p-3">
                <div className="mb-2 d-flex justify-content-between align-items-center">
                    <p className="text-muted small mb-0 fw-bold text-truncate" style={{ fontSize: '11px', maxWidth: '70%' }}>{title}</p>
                    <span className={`badge ${type === 'sale' ? 'bg-success' : (type === 'rent' ? 'bg-primary' : 'bg-info')} x-small`}>
                        {type === 'sale' ? t('forSale') : (type === 'rent' ? t('forRent') : 'Service')}
                    </span>
                </div>

                {step === 'form' && (
                    <form onSubmit={handleBookingSubmit} className="row g-2">
                        <div className="col-12">
                            <label className="form-label mb-1 fw-bold text-muted text-uppercase" style={{ fontSize: '9px' }}>{t('fullName')}</label>
                            <div className="input-group input-group-sm">
                                <span className="input-group-text bg-light border-end-0"><Users size={12} className="text-primary" /></span>
                                <input type="text" className="form-control border-start-0 ps-0" placeholder="Enter name" value={bookingData.name} onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })} required />
                            </div>
                        </div>
                        <div className="col-12">
                            <label className="form-label mb-1 fw-bold text-muted text-uppercase" style={{ fontSize: '9px' }}>{t('emailAddress')}</label>
                            <div className="input-group input-group-sm">
                                <span className="input-group-text bg-light border-end-0"><Mail size={12} className="text-primary" /></span>
                                <input type="email" className="form-control border-start-0 ps-0" placeholder="email@example.com" value={bookingData.email} onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })} required />
                            </div>
                        </div>
                        <div className="col-12">
                            <label className="form-label mb-1 fw-bold text-muted text-uppercase" style={{ fontSize: '9px' }}>{t('phone')}</label>
                            <div className="input-group input-group-sm">
                                <span className="input-group-text bg-light border-end-0"><Phone size={12} className="text-primary" /></span>
                                <input type="tel" className="form-control border-start-0 ps-0" placeholder="+250 7XX XXX XXX" value={bookingData.phone} onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })} required />
                            </div>
                        </div>
                        <div className="col-12">
                            <label className="form-label mb-1 fw-bold text-muted text-uppercase" style={{ fontSize: '9px' }}>{t('preferredDate')}</label>
                            <div className="input-group input-group-sm">
                                <span className="input-group-text bg-light border-end-0"><Calendar size={12} className="text-primary" /></span>
                                <input type="date" className="form-control border-start-0 ps-0" min={new Date().toISOString().split('T')[0]} value={bookingData.date} onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })} required />
                            </div>
                        </div>
                        <div className="col-12">
                            <textarea className="form-control" placeholder="Optional message..." rows={2} style={{ fontSize: '11px', resize: 'none' }} value={bookingData.message} onChange={(e) => setBookingData({ ...bookingData, message: e.target.value })}></textarea>
                        </div>
                        <div className="col-12 mt-2">
                            <button className="btn btn-primary w-100 py-2 fw-bold rounded shadow-sm d-flex align-items-center justify-content-center gap-2" type="submit">
                                <Send size={14} />
                                <span style={{ fontSize: '13px' }}>{t('submitRequest') || 'Submit & Pay'}</span>
                            </button>
                        </div>
                    </form>
                )}

                {step === 'payment_method' && (
                    <div className="animate__animated animate__fadeIn py-2">
                        <div className="alert alert-success border-0 py-2 px-3 mb-3 d-flex align-items-center gap-2">
                            <Check size={16} />
                            <span className="small fw-bold">Information saved. Now select payment.</span>
                        </div>
                        <h6 className="mb-3 fw-bold text-dark small text-uppercase" style={{ letterSpacing: '0.5px' }}>{t('selectPaymentMethod')}</h6>
                        <div className="d-flex flex-column gap-2">
                            {[
                                { id: 'momo', icon: Smartphone, color: 'bg-warning-subtle text-warning', title: t('mobileMoney'), desc: 'MTN, Airtel-Tigo' },
                                { id: 'bank', icon: CreditCard, color: 'bg-primary-subtle text-primary', title: t('bankCard'), desc: 'Visa, Mastercard' },
                                { id: 'cash', icon: Wallet, color: 'bg-success-subtle text-success', title: t('cash'), desc: 'Pay at BSNG HQ' }
                            ].map((method) => (
                                <button key={method.id} onClick={() => handlePaymentMethodSelect(method.id as PaymentMethod)} className="btn btn-light w-100 text-start p-2 d-flex align-items-center border-0 bg-gray-50 hover-bg-gray-100 transition-all rounded-3">
                                    <div className={`btn-square ${method.color} me-3 rounded-pill`} style={{ width: '36px', height: '36px' }}>
                                        <method.icon size={18} />
                                    </div>
                                    <div className="flex-grow-1">
                                        <div className="fw-bold text-dark" style={{ fontSize: '13px' }}>{method.title}</div>
                                        <div className="text-muted" style={{ fontSize: '10px' }}>{method.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 'payment_details' && (
                    <div className="animate__animated animate__fadeIn">
                        <button onClick={() => setStep('payment_method')} className="btn btn-link text-decoration-none p-0 mb-3 text-primary d-flex align-items-center gap-1 x-small fw-bold">
                            <ArrowLeft size={14} /> {t('back')}
                        </button>
                        <form onSubmit={handlePaymentSubmit} className="row g-2">
                            <div className="col-12">
                                <label className="form-label mb-1 fw-bold text-muted text-uppercase" style={{ fontSize: '9px' }}>{t('fullName')}</label>
                                <input type="text" className="form-control form-control-sm" required value={paymentData.fullName} onChange={e => setPaymentData({ ...paymentData, fullName: e.target.value })} />
                            </div>
                            {selectedPaymentMethod === 'momo' && (
                                <div className="col-12">
                                    <label className="form-label mb-1 fw-bold text-muted text-uppercase" style={{ fontSize: '9px' }}>{t('mobileMoneyNumber')}</label>
                                    <input type="tel" className="form-control form-control-sm" required value={paymentData.phoneNumber} onChange={e => setPaymentData({ ...paymentData, phoneNumber: e.target.value })} />
                                </div>
                            )}
                            {selectedPaymentMethod === 'bank' && (
                                <div className="col-12">
                                    <label className="form-label mb-1 fw-bold text-muted text-uppercase" style={{ fontSize: '9px' }}>Card Number</label>
                                    <input type="text" className="form-control form-control-sm" required placeholder="0000 0000 0000 0000" />
                                </div>
                            )}
                            <div className="col-12 mt-3 pt-2 border-top">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="small text-muted fw-bold" style={{ fontSize: '11px' }}>Total Amount</span>
                                    <span className="text-primary fw-bold">{formatPrice(amount)}</span>
                                </div>
                                <button type="submit" className="btn btn-primary w-100 py-2 fw-bold rounded shadow-sm d-flex align-items-center justify-content-center gap-2">
                                    <Check size={16} />
                                    <span style={{ fontSize: '13px' }}>Confirm Payment</span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {step === 'success' && (
                    <div className="text-center py-4 bg-success-subtle rounded animate__animated animate__fadeIn">
                        <div className="btn-square bg-success text-white mx-auto mb-2 rounded-circle" style={{ width: '40px', height: '40px' }}>
                            <Check size={20} />
                        </div>
                        <p className="fw-bold mb-1 small text-success">Booking Confirmed!</p>
                        <p className="text-muted mb-0" style={{ fontSize: '10px' }}>Your booking and payment have been received.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
