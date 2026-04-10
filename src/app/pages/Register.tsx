import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { ScrollReveal } from '@/app/components/ScrollReveal';
import { useLanguage } from '@/app/context/LanguageContext';
import Breadcrumb from '../../components/Breadcrumb';
import { ArrowLeft, Eye, EyeOff, UserPlus, FileText, CheckCircle2 } from 'lucide-react';
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
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://bsng-backend-4g7x.vercel.app'}/auth/register`, {
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
        <div className="bg-white">
            <Breadcrumb title="Register" />
            
            <div className="container-fluid py-5">
                <div className="container py-5">
                    <div className="row g-5">
                        <div className="col-lg-6 wow fadeIn" data-wow-delay="0.1s">
                            <h1 className="mb-5">
                                <span className="text-uppercase text-primary bg-light px-2">Register</span> Create New Account
                            </h1>
                            <p className="mb-4 text-muted">Join our platform today to get started with professional project management and data-driven insights.</p>
                            
                            {error && (
                                <div className="alert alert-danger py-2 px-3 mb-4 rounded-3 d-flex align-items-center gap-2" role="alert">
                                    <span className="small">{error}</span>
                                </div>
                            )}

                            {success && (
                                <div className="alert alert-success py-2 px-3 mb-4 rounded-3 d-flex align-items-center gap-2" role="alert">
                                    <span className="small">{success}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="form-floating">
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                id="name" 
                                                placeholder="Full Name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                            <label htmlFor="name">Full Name</label>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-floating">
                                            <input 
                                                type="email" 
                                                className="form-control" 
                                                id="email" 
                                                placeholder="Email Address"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                            />
                                            <label htmlFor="email">Email Address</label>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-floating">
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                id="phone" 
                                                placeholder="Phone Number"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                required
                                            />
                                            <label htmlFor="phone">Phone Number</label>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-floating">
                                            <input 
                                                type="number" 
                                                className="form-control" 
                                                id="age" 
                                                placeholder="Age"
                                                value={formData.age}
                                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                                required
                                            />
                                            <label htmlFor="age">Age</label>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="form-floating">
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                id="address" 
                                                placeholder="Address"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                required
                                            />
                                            <label htmlFor="address">Address</label>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-floating position-relative">
                                            <input 
                                                type={showPassword ? "text" : "password"} 
                                                className="form-control" 
                                                id="password" 
                                                placeholder="Password"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                required
                                            />
                                            <label htmlFor="password">Password</label>
                                            <button
                                                type="button"
                                                className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-muted p-0 me-3"
                                                onClick={() => setShowPassword(!showPassword)}
                                                style={{ border: 'none', background: 'none' }}
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-floating position-relative">
                                            <input 
                                                type={showConfirmPassword ? "text" : "password"} 
                                                className="form-control" 
                                                id="confirmPassword" 
                                                placeholder="Confirm Password"
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                required
                                            />
                                            <label htmlFor="confirmPassword">Confirm Password</label>
                                            <button
                                                type="button"
                                                className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-muted p-0 me-3"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                style={{ border: 'none', background: 'none' }}
                                            >
                                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <button className="btn btn-primary w-100 py-3 fw-bold text-uppercase" type="submit" disabled={isLoading}>
                                            {isLoading ? (
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            ) : null}
                                            {isLoading ? 'Creating Account...' : 'Register'}
                                        </button>
                                    </div>
                                    <div className="col-12 text-center mt-3">
                                        <div className="position-relative my-4">
                                            <hr className="text-muted opacity-25" />
                                            <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">OR</span>
                                        </div>
                                        
                                        <button
                                            type="button"
                                            onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'https://bsng-backend-4g7x.vercel.app'}/auth/google`}
                                            className="btn btn-outline-dark w-100 py-3 d-flex align-items-center justify-content-center gap-2 transition-all"
                                        >
                                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width="20" height="20" />
                                            <span className="fw-bold">Sign up with Google</span>
                                        </button>

                                        <p className="mt-4 mb-0 text-muted">
                                            Already have an account? <Link to="/login" className="text-primary fw-bold text-decoration-none">Login here</Link>
                                        </p>
                                        <Link to="/" className="d-inline-flex align-items-center gap-2 text-muted mt-3 text-decoration-none small hover-text-primary">
                                            <ArrowLeft size={16} /> Back to Homepage
                                        </Link>
                                    </div>
                                </div>
                            </form>
                        </div>
                        
                        <div className="col-lg-6 wow fadeIn" data-wow-delay="0.5s">
                            <div className="h-100 bg-light p-5 rounded-3 d-flex flex-column justify-content-center border border-1 border-white shadow-sm">
                                <div className="mb-4">
                                    <div className="btn-square bg-primary rounded-circle mb-3" style={{ width: '60px', height: '60px' }}>
                                        <UserPlus className="text-white" size={30} />
                                    </div>
                                    <h3 className="mb-3">Quick Registration</h3>
                                    <p className="mb-0">Create your account in seconds and gain immediate access to our platform's core features.</p>
                                </div>
                                <div className="mb-4">
                                    <div className="btn-square bg-primary rounded-circle mb-3" style={{ width: '60px', height: '60px' }}>
                                        <FileText className="text-white" size={30} />
                                    </div>
                                    <h3 className="mb-3">Rich Management</h3>
                                    <p className="mb-0">Manage employees, track attendance, and oversee finance with our comprehensive toolset.</p>
                                </div>
                                <div className="mb-0">
                                    <div className="btn-square bg-primary rounded-circle mb-3" style={{ width: '60px', height: '60px' }}>
                                        <CheckCircle2 className="text-white" size={30} />
                                    </div>
                                    <h3 className="mb-3">Verified Experience</h3>
                                    <p className="mb-0">Join a network of verified sites and professionals using BSNG for their daily operations.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
