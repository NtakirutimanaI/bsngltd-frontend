import { useState, useRef, useEffect } from 'react';
import { X, Users, Mail, Phone, Calendar, Send, Check, GripVertical } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import { fetchApi } from '@/app/api/client';

interface BookingFloatingFormProps {
    propertyId: string;
    propertyTitle: string;
    onClose: () => void;
}

export function BookingFloatingForm({ propertyId, propertyTitle, onClose }: BookingFloatingFormProps) {
    const { t } = useLanguage();
    const [isBookingSubmitted, setIsBookingSubmitted] = useState(false);
    const [bookingData, setBookingData] = useState({
        name: '',
        email: '',
        phone: '',
        date: '',
        message: '',
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
                // Keep within bounds
                const newX = Math.max(20, Math.min(window.innerWidth - 350, e.clientX - dragOffset.x));
                const newY = Math.max(100, Math.min(window.innerHeight - 400, e.clientY - dragOffset.y));
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
            await fetchApi('/bookings', {
                method: 'POST',
                body: JSON.stringify({
                    ...bookingData,
                    propertyId,
                }),
            });
            setIsBookingSubmitted(true);
            setTimeout(() => {
                onClose();
            }, 3000);
        } catch (error) {
            console.error("Booking failed", error);
            alert("Booking failed. Please try again.");
        }
    };

    return (
        <div
            ref={formRef}
            className={`position-fixed shadow-lg bg-white rounded-3 border-0 wow fadeIn`}
            style={{
                width: '320px',
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
                    <span className="small fw-bold">Book Viewing</span>
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
                <div className="mb-3">
                    <p className="text-muted small mb-0 fw-bold text-truncate" style={{ fontSize: '11px' }}>{propertyTitle}</p>
                </div>

                {isBookingSubmitted ? (
                    <div className="text-center py-4 bg-success-subtle rounded animate__animated animate__fadeIn">
                        <div className="btn-square bg-success text-white mx-auto mb-2 rounded-circle" style={{ width: '40px', height: '40px' }}>
                            <Check size={20} />
                        </div>
                        <p className="fw-bold mb-1 small text-success">{t('requestSubmitted')}</p>
                        <p className="text-muted mb-0" style={{ fontSize: '10px' }}>{t('paymentConfirmationMessage')}</p>
                    </div>
                ) : (
                    <form onSubmit={handleBookingSubmit} className="row g-2">
                        <div className="col-12">
                            <label className="form-label mb-1 fw-bold text-muted text-uppercase" style={{ fontSize: '9px' }}>{t('fullName')}</label>
                            <div className="input-group input-group-sm">
                                <span className="input-group-text bg-light border-end-0"><Users size={12} className="text-primary" /></span>
                                <input
                                    type="text"
                                    className="form-control border-start-0 ps-0"
                                    placeholder="Enter name"
                                    value={bookingData.name}
                                    onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="col-12">
                            <label className="form-label mb-1 fw-bold text-muted text-uppercase" style={{ fontSize: '9px' }}>{t('emailAddress')}</label>
                            <div className="input-group input-group-sm">
                                <span className="input-group-text bg-light border-end-0"><Mail size={12} className="text-primary" /></span>
                                <input
                                    type="email"
                                    className="form-control border-start-0 ps-0"
                                    placeholder="email@example.com"
                                    value={bookingData.email}
                                    onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="col-12">
                            <label className="form-label mb-1 fw-bold text-muted text-uppercase" style={{ fontSize: '9px' }}>{t('phone')}</label>
                            <div className="input-group input-group-sm">
                                <span className="input-group-text bg-light border-end-0"><Phone size={12} className="text-primary" /></span>
                                <input
                                    type="tel"
                                    className="form-control border-start-0 ps-0"
                                    placeholder="+250 7XX XXX XXX"
                                    value={bookingData.phone}
                                    onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="col-12">
                            <label className="form-label mb-1 fw-bold text-muted text-uppercase" style={{ fontSize: '9px' }}>{t('preferredDate')}</label>
                            <div className="input-group input-group-sm">
                                <span className="input-group-text bg-light border-end-0"><Calendar size={12} className="text-primary" /></span>
                                <input
                                    type="date"
                                    className="form-control border-start-0 ps-0"
                                    min={new Date().toISOString().split('T')[0]}
                                    value={bookingData.date}
                                    onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="col-12">
                            <label className="form-label mb-1 fw-bold text-muted text-uppercase" style={{ fontSize: '9px' }}>{t('messageOptional')}</label>
                            <textarea
                                className="form-control"
                                placeholder="Tell us more about your interest..."
                                rows={2}
                                style={{ fontSize: '12px', resize: 'none' }}
                                value={bookingData.message}
                                onChange={(e) => setBookingData({ ...bookingData, message: e.target.value })}
                            ></textarea>
                        </div>
                        <div className="col-12 mt-2">
                            <button className="btn btn-primary w-100 py-2 fw-bold rounded shadow-sm d-flex align-items-center justify-content-center gap-2" type="submit">
                                <Send size={14} />
                                <span style={{ fontSize: '13px' }}>{t('submitRequest')}</span>
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
