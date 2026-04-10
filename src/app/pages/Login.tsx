import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { useAuth } from '@/app/context/AuthContext';
import { useLanguage } from '@/app/context/LanguageContext';
import { ScrollReveal } from '@/app/components/ScrollReveal';
import Breadcrumb from '../../components/Breadcrumb';
import { ArrowLeft, Eye, EyeOff, Lock, User, Globe, ShieldCheck } from 'lucide-react';
import { validateEmail } from '@/app/utils/emailValidator';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { t } = useLanguage();

  const from = (location.state as any)?.from?.pathname || (location.state as any)?.returnUrl || '/dashboard';

  // Handle Google Login Callback
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

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error || 'Invalid email');
      return;
    }

    setIsLoading(true);

    try {
      const cleanEmail = email.replace(/^(?:-\s*)?Email:\s*/i, '').trim();
      const success = await login(cleanEmail, password);
      if (success) {
        navigate(from, { replace: true });
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white">
      <Breadcrumb title="Login" />
      
      <div className="container-fluid py-5">
        <div className="container py-5">
          <div className="row g-5">
            <div className="col-lg-6 wow fadeIn" data-wow-delay="0.1s">
              <h1 className="mb-5">
                <span className="text-uppercase text-primary bg-light px-2">Login</span> To Your Account
              </h1>
              <p className="mb-4 text-muted">Access your personalized dashboard to manage projects, view analytics, and track your progress with BSNG.</p>
              
              {error && (
                <div className="alert alert-danger py-2 px-3 mb-4 rounded-3 d-flex align-items-center gap-2" role="alert">
                  <Lock size={18} />
                  <span className="small">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-12">
                    <div className="form-floating">
                      <input 
                        type="email" 
                        className="form-control" 
                        id="email" 
                        placeholder="Your Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <label htmlFor="email">Email Address</label>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-floating position-relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        className="form-control" 
                        id="password" 
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <label htmlFor="password">Password</label>
                      <button
                        type="button"
                        className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-muted p-0 me-3 mt-0"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ border: 'none', background: 'none' }}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  <div className="col-12">
                    <button className="btn btn-primary w-100 py-3 fw-bold text-uppercase" type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      ) : null}
                      {isLoading ? 'Signing In...' : 'Login'}
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
                      <span className="fw-bold">Sign in with Google</span>
                    </button>

                    <p className="mt-4 mb-0 text-muted">
                      Don't have an account? <Link to="/register" className="text-primary fw-bold text-decoration-none">Register here</Link>
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
                    <ShieldCheck className="text-white" size={30} />
                  </div>
                  <h3 className="mb-3">Secure Access</h3>
                  <p className="mb-0">Your data is protected with industry-standard encryption and secure authentication protocols.</p>
                </div>
                <div className="mb-4">
                  <div className="btn-square bg-primary rounded-circle mb-3" style={{ width: '60px', height: '60px' }}>
                    <Globe className="text-white" size={30} />
                  </div>
                  <h3 className="mb-3">Global Management</h3>
                  <p className="mb-0">Access your projects and sites from anywhere in the world on any device.</p>
                </div>
                <div className="mb-0">
                  <div className="btn-square bg-primary rounded-circle mb-3" style={{ width: '60px', height: '60px' }}>
                    <User className="text-white" size={30} />
                  </div>
                  <h3 className="mb-3">Team Collaboration</h3>
                  <p className="mb-0">Connect with your team members in real-time through our integrated communication hub.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
