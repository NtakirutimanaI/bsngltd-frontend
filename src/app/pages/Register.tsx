import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { ScrollReveal } from '@/app/components/ScrollReveal';
import { useLanguage } from '@/app/context/LanguageContext';
import logo from '@/assets/logo.png';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { validateEmail } from '@/app/utils/emailValidator';

export function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        age: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();

    const from = (location.state as any)?.from?.pathname || '/dashboard';

    // Handle Google Login/Signup Callback
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const userStr = params.get('user');

        if (token && userStr) {
            try {
                const userData = JSON.parse(userStr);
                localStorage.setItem('bsng_user', JSON.stringify(userData));
                localStorage.setItem('bsng_token', token);

                // Use a small timeout to ensure storage is committed and redirect
                setTimeout(() => {
                    window.location.href = from;
                }, 100);
            } catch (err) {
                console.error('Failed to parse user from Google login', err);
                setError('Google login failed. Please try again.');
            }
        }
    }, [location.search, from]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate email
        const emailValidation = validateEmail(formData.email);
        if (!emailValidation.isValid) {
            setError(emailValidation.error || 'Invalid email');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    fullName: formData.name,
                    phone: formData.phone,
                    address: formData.address,
                    age: formData.age,
                    password: formData.password
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Registration failed');
            }

            setSuccess(t('registrationSuccess'));

            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.message || 'Registration failed. Please try again.');
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
                                    <h4 className="card-title fw-bold text-center mb-3 text-dark fs-5">{t('createAccount')}</h4>

                                    {error && (
                                        <div className="alert alert-danger py-1 px-2 text-center small mb-3" role="alert">
                                            {error}
                                        </div>
                                    )}

                                    {success && (
                                        <div className="alert alert-success py-1 px-2 text-center small mb-3" role="alert">
                                            {success}
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="d-flex flex-column gap-2">
                                        <div>
                                            <label className="form-label small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>{t('fullName')}</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm py-2"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="John Doe"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="form-label small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>{t('emailAddress')}</label>
                                            <input
                                                type="email"
                                                className="form-control form-control-sm py-2"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="john@example.com"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="form-label small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>{t('phone')}</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm py-2"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="+250..."
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="form-label small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>{t('address')}</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm py-2"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                placeholder="Kigali, Rwanda"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="form-label small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>{t('age')}</label>
                                            <input
                                                type="number"
                                                className="form-control form-control-sm py-2"
                                                value={formData.age}
                                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                                placeholder="25"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="form-label small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>{t('password')}</label>
                                            <div className="position-relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    className="form-control form-control-sm py-2 pe-5"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                    placeholder="••••••••"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-muted p-0 me-3"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    style={{ zIndex: 5, marginTop: '2px' }}
                                                >
                                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="form-label small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>{t('confirmPassword')}</label>
                                            <div className="position-relative">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    className="form-control form-control-sm py-2 pe-5"
                                                    value={formData.confirmPassword}
                                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                    placeholder="••••••••"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-muted p-0 me-3"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    style={{ zIndex: 5, marginTop: '2px' }}
                                                >
                                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="btn btn-primary w-100 py-2 fw-bold mt-2 text-uppercase mb-1 shadow-sm fs-6"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    {t('loading')}
                                                </>
                                            ) : (
                                                t('signUp')
                                            )}
                                        </button>
                                    </form>

                                    <div className="position-relative my-3 text-center">
                                        <hr className="text-muted opacity-25" />
                                        <span className="position-absolute top-50 start-50 translate-middle bg-white px-2 text-muted" style={{ fontSize: '0.7rem' }}>
                                            {t('orContinueWith')}
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/google`}
                                        className="btn btn-outline-secondary btn-sm w-100 py-2 d-flex align-items-center justify-content-center gap-2 hover-shadow transition-all"
                                    >
                                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width="16" height="16" />
                                        <span className="fw-medium">{t('signUpWithGoogle') || 'Sign up with Google'}</span>
                                    </button>

                                    <div className="text-center mt-3 pt-1">
                                        <p className="text-muted small mb-0" style={{ fontSize: '0.8rem' }}>
                                            {t('alreadyHaveAccount')}{' '}
                                            <button
                                                onClick={() => navigate('/login')}
                                                className="btn btn-link p-0 text-primary fw-bold text-decoration-none align-baseline"
                                                style={{ fontSize: 'inherit' }}
                                            >
                                                {t('signIn')}
                                            </button>
                                        </p>
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
