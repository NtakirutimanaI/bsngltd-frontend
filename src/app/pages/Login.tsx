import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { useAuth } from '@/app/context/AuthContext';
import { useLanguage } from '@/app/context/LanguageContext';
import { ScrollReveal } from '@/app/components/ScrollReveal';
import logo from '@/assets/logo.png';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
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

    // Validate email format
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
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light" style={{ paddingTop: '120px' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5 col-lg-4"> {/* Kept standard grid but logic inside card will make it feel smaller */}
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
                <div className="card-body p-4"> {/* Reduced padding */}
                  <h4 className="card-title fw-bold text-center mb-3 text-dark fs-5">{t('signInToDashboard')}</h4> {/* Reduced margin and font size */}

                  {error && (
                    <div className="alert alert-danger py-1 px-2 text-center small mb-3" role="alert">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="d-flex flex-column gap-2"> {/* Reduced gap */}
                    <div>
                      <label htmlFor="email" className="form-label small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>{t('emailAddress')}</label>
                      <input
                        id="email"
                        type="email"
                        className="form-control form-control-sm py-2"
                        value={email}
                        onChange={(e) => {
                          const val = e.target.value;
                          const clean = val.replace(/^(?:-\s*)?Email:\s*/i, '').trim();
                          setEmail(clean);
                        }}
                        placeholder={t('enterYourEmail')}
                        required
                      />
                    </div>

                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <label htmlFor="password" className="form-label small fw-bold text-muted text-uppercase mb-0" style={{ fontSize: '0.7rem' }}>{t('password')}</label>
                        <Link to="/forgot-password" className="small text-primary text-decoration-none fw-medium" style={{ fontSize: '0.75rem' }}>Forgot?</Link>
                      </div>
                      <div className="position-relative">
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          className="form-control form-control-sm py-2 pe-5"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={t('enterYourPassword')}
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
                        t('signIn')
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
                    <span className="fw-medium">{t('signInWithGoogle')}</span>
                  </button>

                  <div className="text-center mt-3 pt-1">
                    <p className="text-muted small mb-0" style={{ fontSize: '0.8rem' }}>
                      Don't have an account? <Link to="/register" className="text-primary fw-bold text-decoration-none">Sign up</Link>
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