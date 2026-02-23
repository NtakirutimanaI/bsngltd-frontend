import { useState, useRef, useEffect } from 'react';
import { X, Check, ArrowLeft, CreditCard, Smartphone, Wallet, Phone, MapPin, GripVertical, Send } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import { fetchApi } from '@/app/api/client';
import { useCurrency } from '@/app/context/CurrencyContext';

type PaymentMethod = 'momo' | 'bank' | 'cash' | null;

interface PaymentFloatingFormProps {
    propertyId: string;
    propertyTitle: string;
    propertyType: 'sale' | 'rent';
    amount: number;
    onClose: () => void;
}

export function PaymentFloatingForm({ propertyId, propertyTitle, propertyType, amount, onClose }: PaymentFloatingFormProps) {
    const { t } = useLanguage();
    const { formatPrice } = useCurrency();

    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(null);
    const [paymentStep, setPaymentStep] = useState<'select' | 'details' | 'success'>('select');
    const [paymentData, setPaymentData] = useState({
        phoneNumber: '',
        bankAccount: '',
        fullName: '',
    });

    // Draggable logic
    const [position, setPosition] = useState({ x: window.innerWidth - 380, y: 150 });
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

    const handlePaymentMethodSelect = (method: PaymentMethod) => {
        setSelectedPaymentMethod(method);
        setPaymentStep('details');
    };

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            payer: paymentData.fullName,
            amount: amount,
            type: 'client_payment',
            status: 'pending',
            method: selectedPaymentMethod,
            date: new Date().toISOString(),
            description: `Payment for ${propertyTitle} (${propertyType})`,
            propertyId: propertyId
        };

        fetchApi('/payments', {
            method: 'POST',
            body: JSON.stringify(payload)
        })
            .then(() => {
                setPaymentStep('success');
                setTimeout(() => {
                    onClose();
                }, 3000);
            })
            .catch(err => {
                console.error("Payment failed", err);
                alert("Payment failed. Please try again.");
            });
    };

    return (
        <div
            ref={formRef}
            className="position-fixed shadow-lg bg-white rounded-3 border-0 wow fadeIn"
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
                className="bg-primary text-white p-2 d-flex align-items-center justify-content-between"
                onMouseDown={handleMouseDown}
                style={{ cursor: 'move' }}
            >
                <div className="d-flex align-items-center gap-2">
                    <GripVertical size={16} className="opacity-50" />
                    <span className="small fw-bold">
                        {paymentStep === 'success' ? 'Payment Success' : (propertyType === 'sale' ? 'Purchase Property' : 'Rent Property')}
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
                {paymentStep === 'select' && (
                    <div className="animate__animated animate__fadeIn">
                        <h6 className="mb-3 fw-bold text-dark small text-uppercase" style={{ letterSpacing: '0.5px' }}>{t('selectPaymentMethod')}</h6>
                        <div className="d-flex flex-column gap-2">
                            {[
                                { id: 'momo', icon: Smartphone, color: 'bg-warning-subtle text-warning', title: t('mobileMoney'), desc: 'MTN, Airtel-Tigo' },
                                { id: 'bank', icon: CreditCard, color: 'bg-primary-subtle text-primary', title: t('bankCard'), desc: 'Visa, Mastercard' },
                                { id: 'cash', icon: Wallet, color: 'bg-success-subtle text-success', title: t('cash'), desc: 'Pay at BSNG HQ' }
                            ].map((method) => (
                                <button
                                    key={method.id}
                                    onClick={() => handlePaymentMethodSelect(method.id as PaymentMethod)}
                                    className="btn btn-light w-100 text-start p-2 d-flex align-items-center border-0 bg-gray-50 hover-bg-gray-100 transition-all rounded-3"
                                >
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

                {paymentStep === 'details' && (
                    <div className="animate__animated animate__fadeIn">
                        <button onClick={() => setPaymentStep('select')} className="btn btn-link text-decoration-none p-0 mb-3 text-primary d-flex align-items-center gap-1 x-small fw-bold">
                            <ArrowLeft size={14} /> {t('back')}
                        </button>
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <div className={`btn-square rounded-pill ${selectedPaymentMethod === 'momo' ? 'bg-warning-subtle text-warning' : (selectedPaymentMethod === 'bank' ? 'bg-primary-subtle text-primary' : 'bg-success-subtle text-success')}`} style={{ width: '32px', height: '32px' }}>
                                {selectedPaymentMethod === 'momo' ? <Smartphone size={16} /> : (selectedPaymentMethod === 'bank' ? <CreditCard size={16} /> : <Wallet size={16} />)}
                            </div>
                            <h6 className="mb-0 fw-bold small">{t('paymentDetails')}</h6>
                        </div>

                        <form onSubmit={handlePaymentSubmit} className="row g-2">
                            <div className="col-12">
                                <label className="form-label mb-1 fw-bold text-muted text-uppercase" style={{ fontSize: '9px' }}>{t('fullName')}</label>
                                <input type="text" className="form-control form-control-sm" required value={paymentData.fullName} onChange={e => setPaymentData({ ...paymentData, fullName: e.target.value })} placeholder="Full name" />
                            </div>
                            {selectedPaymentMethod === 'momo' && (
                                <div className="col-12">
                                    <label className="form-label mb-1 fw-bold text-muted text-uppercase" style={{ fontSize: '9px' }}>{t('mobileMoneyNumber')}</label>
                                    <div className="input-group input-group-sm">
                                        <span className="input-group-text bg-light"><Phone size={12} className="text-muted" /></span>
                                        <input type="tel" className="form-control" required value={paymentData.phoneNumber} onChange={e => setPaymentData({ ...paymentData, phoneNumber: e.target.value })} placeholder="+250 7XX XXX XXX" />
                                    </div>
                                </div>
                            )}
                            {selectedPaymentMethod === 'bank' && (
                                <>
                                    <div className="col-12">
                                        <label className="form-label mb-1 fw-bold text-muted text-uppercase" style={{ fontSize: '9px' }}>{t('cardNumber')}</label>
                                        <input type="text" className="form-control form-control-sm" required placeholder="0000 0000 0000 0000" />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label mb-1 fw-bold text-muted text-uppercase" style={{ fontSize: '9px' }}>EXP</label>
                                        <input type="text" className="form-control form-control-sm" required placeholder="MM/YY" />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label mb-1 fw-bold text-muted text-uppercase" style={{ fontSize: '9px' }}>CVV</label>
                                        <input type="text" className="form-control form-control-sm" required placeholder="123" />
                                    </div>
                                </>
                            )}
                            {selectedPaymentMethod === 'cash' && (
                                <div className="col-12">
                                    <div className="alert alert-info border-0 py-2 px-3 small mb-0">
                                        <div className="d-flex gap-2">
                                            <MapPin size={14} className="flex-shrink-0 mt-1" />
                                            <div style={{ fontSize: '11px' }}>{t('cashPaymentInstructions')}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="col-12 mt-3 pt-2 border-top">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="small text-muted fw-bold" style={{ fontSize: '11px' }}>{t('amountToPay')}</span>
                                    <span className="text-primary fw-bold">{formatPrice(amount)}</span>
                                </div>
                                <button type="submit" className="btn btn-primary w-100 py-2 fw-bold rounded shadow-sm d-flex align-items-center justify-content-center gap-2">
                                    <Send size={14} />
                                    <span style={{ fontSize: '13px' }}>{t('payNow')}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {paymentStep === 'success' && (
                    <div className="text-center py-4 animate__animated animate__fadeIn">
                        <div className="btn-square bg-success text-white mx-auto mb-3 rounded-circle" style={{ width: '50px', height: '50px' }}>
                            <Check size={28} />
                        </div>
                        <h6 className="fw-bold text-success mb-1">{t('paymentInitiated')}</h6>
                        <p className="text-muted mb-0" style={{ fontSize: '11px' }}>{t('paymentConfirmationMessage')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
