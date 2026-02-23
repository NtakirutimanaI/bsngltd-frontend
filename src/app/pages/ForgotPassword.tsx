import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ScrollReveal } from '@/app/components/ScrollReveal';
import { useLanguage } from '@/app/context/LanguageContext';
import logo from '@/assets/logo.png';
import { ArrowLeft, Mail } from 'lucide-react';
import { validateEmail } from '@/app/utils/emailValidator';

export function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { t } = useLanguage();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate email
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            setError(emailValidation.error || 'Invalid email');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send reset email');
            }

            setSuccess(data.message);

            // For development: if token is returned, redirect to reset page
            if (data.resetToken) {
                setTimeout(() => {
                    navigate(`/reset-password?token=${data.resetToken}`);
                }, 2000);
            }
        } catch (err: any) {
            console.error('Forgot password error:', err);
            setError(err.message || 'Failed to send reset email. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light" style={{ paddingTop: '120px' }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-5 col-lg-4">
                        <ScrollReveal>
                            <div className="text-center mb-3" style={{ marginTop: '25px' }}>
                                <Link to="/" className="d-inline-block text-decoration-none">
                                    <div className="bg-black p-0 rounded-circle shadow-sm d-inline-flex align-items-center justify-content-center overflow-hidden" style={{ width: '65px', height: '65px' }}>
                                        <img src={logo} alt="BSNG Logo" className="img-fluid" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', transform: 'scale(1.35)', transformOrigin: 'center', marginTop: '4px' }} />
                                    </div>
                                </Link>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal delay={0.1}>
                            <div className="card border-0 shadow-lg">
                                <div className="card-body p-4">
                                    <h4 className="card-title fw-bold text-center mb-2 text-dark fs-5">Forgot Password?</h4>
                                    <p className="text-center text-muted small mb-4">
                                        Enter your email address and we'll send you instructions to reset your password.
                                    </p>

                                    {error && (
                                        <div className="alert alert-danger py-2 px-3 text-center small mb-3" role="alert">
                                            {error}
                                        </div>
                                    )}

                                    {success && (
                                        <div className="alert alert-success py-2 px-3 text-center small mb-3" role="alert">
                                            {success}
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                                        <div>
                                            <label htmlFor="email" className="form-label small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>
                                                Email Address
                                            </label>
                                            <div className="position-relative">
                                                <input
                                                    id="email"
                                                    type="email"
                                                    className="form-control form-control-sm py-2 ps-5"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="Enter your email"
                                                    required
                                                />
                                                <Mail className="position-absolute top-50 translate-middle-y text-muted ms-3" size={16} style={{ left: '0' }} />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="btn btn-primary w-100 py-2 fw-bold text-uppercase shadow-sm fs-6"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Sending...
                                                </>
                                            ) : (
                                                'Send Reset Link'
                                            )}
                                        </button>
                                    </form>

                                    <div className="text-center mt-4">
                                        <Link to="/login" className="text-primary text-decoration-none small fw-medium">
                                            <ArrowLeft size={14} className="me-1" />
                                            Back to Login
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal delay={0.2} className="text-center mt-3">
                            <Link to="/" className="text-muted text-decoration-none small d-inline-flex align-items-center gap-1 hover-text-primary transition-colors">
                                <ArrowLeft size={14} />
                                {t('backToHome')}
                            </Link>
                        </ScrollReveal>
                    </div>
                </div>
            </div>
        </div>
    );
}
