import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { ScrollReveal } from '@/app/components/ScrollReveal';
import { useLanguage } from '@/app/context/LanguageContext';
import logo from '@/assets/logo.png';
import { ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react';

export function ResetPassword() {
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { t } = useLanguage();

    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setError('Invalid reset link. Please request a new password reset.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (!token) {
            setError('Invalid reset token');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to reset password');
            }

            setSuccess(data.message);

            // Redirect to login after successful reset
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err: any) {
            console.error('Reset password error:', err);
            setError(err.message || 'Failed to reset password. Please try again.');
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
                                    <h4 className="card-title fw-bold text-center mb-2 text-dark fs-5">Reset Password</h4>
                                    <p className="text-center text-muted small mb-4">
                                        Enter your new password below.
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
                                            <label htmlFor="password" className="form-label small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>
                                                New Password
                                            </label>
                                            <div className="position-relative">
                                                <input
                                                    id="password"
                                                    type={showPassword ? "text" : "password"}
                                                    className="form-control form-control-sm py-2 ps-5 pe-5"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="Enter new password"
                                                    required
                                                />
                                                <Lock className="position-absolute top-50 translate-middle-y text-muted ms-3" size={16} style={{ left: '0' }} />
                                                <button
                                                    type="button"
                                                    className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-muted p-0 me-3"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    style={{ zIndex: 5 }}
                                                >
                                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="confirmPassword" className="form-label small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>
                                                Confirm Password
                                            </label>
                                            <div className="position-relative">
                                                <input
                                                    id="confirmPassword"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    className="form-control form-control-sm py-2 ps-5 pe-5"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="Confirm new password"
                                                    required
                                                />
                                                <Lock className="position-absolute top-50 translate-middle-y text-muted ms-3" size={16} style={{ left: '0' }} />
                                                <button
                                                    type="button"
                                                    className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-muted p-0 me-3"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    style={{ zIndex: 5 }}
                                                >
                                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading || !token}
                                            className="btn btn-sm bg-orange-600 border-orange-600 text-white w-100 py-2 fw-bold text-uppercase shadow-sm fs-6 hover:bg-orange-700 transition-all"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Resetting...
                                                </>
                                            ) : (
                                                'Reset Password'
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
