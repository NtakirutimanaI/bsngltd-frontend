import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', phone: '', email: '', password: '', confirmPassword: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRegister && formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match!");
    }
    
    setIsSubmitting(true);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    const endpoint = isRegister ? '/auth/register' : '/auth/login';
    
    const createPayload = () => {
      if (isRegister) {
        const { confirmPassword, ...rest } = formData;
        return rest;
      }
      return { email: formData.email, password: formData.password };
    };

    const payload = createPayload();
    
    try {
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || 'Success!');
        if (data.accessToken) {
          localStorage.setItem('token', data.accessToken);
          navigate('/admin'); // redirect to dashboard or home
        }
      } else {
        toast.error(data.message || 'Authentication failed. Please try again.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Network error. Please try again later.');
    }
    setIsSubmitting(false);
  };

  return (
    <>

    <div className="container-fluid sticky-top">
        <div className="container">
            <nav className="navbar navbar-expand-lg navbar-light border-bottom border-2 border-white">
                <a href="/" className="navbar-brand">
                    <h1 className="d-flex align-items-center m-0"><img src="/img/logo.png" alt="BSNG Logo" style={{ height: '45px', marginRight: '10px' }} />BSNG</h1>
                </a>
                <button type="button" className="navbar-toggler ms-auto me-0" data-bs-toggle="collapse"
                    data-bs-target="#navbarCollapse">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarCollapse">
                    <div className="navbar-nav ms-auto">
                        <a href="/" className="nav-item nav-link">Home</a>
                        <a href="/about" className="nav-item nav-link">About</a>
                        <a href="/service" className="nav-item nav-link">Services</a>
                        <a href="/project" className="nav-item nav-link">Projects</a>
                        <a href="/updates" className="nav-item nav-link">Updates</a>
                        <a href="/contact" className="nav-item nav-link">Contact</a>
                        <a href="/login" className="nav-item nav-link btn-login-nav active">
                            <i className="fa fa-user me-1"></i>Login
                        </a>
                    </div>
                </div>
            </nav>
        </div>
    </div>


    <div className="container-fluid pb-5 bg-primary hero-header" style={{ paddingTop: '80px' }}>
        <div className="container py-5">
            <div className="row g-3 align-items-center">
                <div className="col-lg-6 text-center text-lg-start">
                    <h1 className="display-1 mb-0 slideInLeft">{isRegister ? 'Register' : 'Sign In'}</h1>
                </div>
                <div className="col-lg-6 slideInRight">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb justify-content-center justify-content-lg-end mb-0">
                            <li className="breadcrumb-item"><a className="text-primary" href="/">Home</a></li>
                            <li className="breadcrumb-item text-secondary active" aria-current="page">
                                {isRegister ? 'Register' : 'Login'}
                            </li>
                        </ol>
                    </nav>
                </div>
            </div>
        </div>
    </div>


    <div className="container-fluid py-4">
        <div className="container py-3">
            <div className="row justify-content-center">
                <div className="col-lg-5 col-md-7 col-sm-10 fadeIn" data-wow-delay="0.1s">

                    {/* Mode Toggle */}
                    <div className="d-flex justify-content-center mb-3">
                        <div className="auth-toggle-wrapper">
                            <button
                                className={`btn btn-sm auth-toggle-btn ${!isRegister ? 'active' : ''}`}
                                onClick={() => setIsRegister(false)}
                                style={{ fontSize: '0.82rem' }}
                            >
                                <i className="fa fa-sign-in-alt me-1"></i>Login
                            </button>
                            <button
                                className={`btn btn-sm auth-toggle-btn ${isRegister ? 'active' : ''}`}
                                onClick={() => setIsRegister(true)}
                                style={{ fontSize: '0.82rem' }}
                            >
                                <i className="fa fa-user-plus me-1"></i>Register
                            </button>
                        </div>
                    </div>

                    <div className="auth-card" style={{ padding: '1.5rem' }}>
                        <div className="text-center mb-3">
                            <div className="auth-icon-circle mx-auto mb-2" style={{ width: '50px', height: '50px' }}>
                                <i className={`fa ${isRegister ? 'fa-user-plus' : 'fa-lock'} text-primary`} style={{ fontSize: '1.2rem' }}></i>
                            </div>
                            <h5 className="mb-1">{isRegister ? 'Create Your Account' : 'Welcome Back'}</h5>
                            <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>
                                {isRegister
                                    ? 'Join BSNG and start managing your projects'
                                    : 'Sign in to access your dashboard and projects'
                                }
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="row g-2">
                                {isRegister && (
                                    <>
                                    <div className="col-md-6">
                                        <div className="form-floating form-floating-sm">
                                            <input type="text" className="form-control" id="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" style={{ height: '42px', fontSize: '0.82rem' }} required={isRegister} />
                                            <label htmlFor="firstName" style={{ fontSize: '0.78rem' }}>First Name</label>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-floating form-floating-sm">
                                            <input type="text" className="form-control" id="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" style={{ height: '42px', fontSize: '0.82rem' }} required={isRegister} />
                                            <label htmlFor="lastName" style={{ fontSize: '0.78rem' }}>Last Name</label>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="form-floating form-floating-sm">
                                            <input type="tel" className="form-control" id="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" style={{ height: '42px', fontSize: '0.82rem' }} />
                                            <label htmlFor="phone" style={{ fontSize: '0.78rem' }}>Phone Number</label>
                                        </div>
                                    </div>
                                    </>
                                )}
                                <div className="col-12">
                                    <div className="form-floating form-floating-sm">
                                        <input type="email" className="form-control" id="email" value={formData.email} onChange={handleChange} placeholder="Email Address" style={{ height: '42px', fontSize: '0.82rem' }} required />
                                        <label htmlFor="email" style={{ fontSize: '0.78rem' }}>Email Address</label>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="form-floating form-floating-sm position-relative">
                                        <input type={showPassword ? 'text' : 'password'} className="form-control" id="password" value={formData.password} onChange={handleChange} placeholder="Password" style={{ height: '42px', fontSize: '0.82rem', paddingRight: '2.5rem' }} required minLength={6} />
                                        <label htmlFor="password" style={{ fontSize: '0.78rem' }}>Password</label>
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="btn btn-sm p-0 position-absolute"
                                            style={{ top: '50%', right: '10px', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6c757d', zIndex: 10 }}
                                            tabIndex={-1}
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} style={{ fontSize: '0.9rem' }}></i>
                                        </button>
                                    </div>
                                </div>
                                {isRegister && (
                                    <div className="col-12">
                                        <div className="form-floating form-floating-sm position-relative">
                                            <input type={showConfirmPassword ? 'text' : 'password'} className="form-control" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm Password" style={{ height: '42px', fontSize: '0.82rem', paddingRight: '2.5rem' }} required={isRegister} />
                                            <label htmlFor="confirmPassword" style={{ fontSize: '0.78rem' }}>Confirm Password</label>
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="btn btn-sm p-0 position-absolute"
                                                style={{ top: '50%', right: '10px', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6c757d', zIndex: 10 }}
                                                tabIndex={-1}
                                                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                                            >
                                                <i className={`fa ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`} style={{ fontSize: '0.9rem' }}></i>
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {!isRegister && (
                                    <div className="col-12">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="form-check">
                                                <input className="form-check-input" type="checkbox" id="rememberMe" />
                                                <label className="form-check-label" htmlFor="rememberMe" style={{ fontSize: '0.8rem' }}>Remember me</label>
                                            </div>
                                            <a href="#" onClick={() => toast.info('Forgot Password functionality is available via backend API.')} className="text-primary text-decoration-none" style={{ fontSize: '0.8rem' }}>Forgot Password?</a>
                                        </div>
                                    </div>
                                )}
                                <div className="col-12">
                                    <button className="btn btn-primary w-100 py-2 mb-3" type="submit" disabled={isSubmitting} style={{ fontSize: '0.85rem' }}>
                                        {isSubmitting ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')} &nbsp;
                                        <i className={`fa ${isRegister ? 'fa-user-plus' : 'fa-arrow-right'}`}></i>
                                    </button>

                                    <div className="d-flex align-items-center mb-3">
                                        <hr className="flex-grow-1" />
                                        <span className="mx-2 text-muted" style={{ fontSize: '0.75rem' }}>OR</span>
                                        <hr className="flex-grow-1" />
                                    </div>

                                    <a 
                                        href={`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/auth/google`} 
                                        className="btn btn-outline-dark w-100 py-2 d-flex align-items-center justify-content-center"
                                        style={{ fontSize: '0.85rem' }}
                                    >
                                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px', marginRight: '10px' }} />
                                        Continue with Google
                                    </a>
                                </div>
                            </div>
                        </form>

                        <div className="text-center mt-3">
                            <p className="mb-0" style={{ fontSize: '0.82rem' }}>
                                {isRegister ? 'Already have an account? ' : "Don't have an account? "}
                                <button
                                    onClick={() => setIsRegister(!isRegister)}
                                    className="btn btn-link p-0 text-primary fw-semibold text-decoration-none"
                                    style={{ fontSize: '0.82rem' }}
                                >
                                    {isRegister ? 'Sign In' : 'Register Now'}
                                </button>
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>


    <div className="container-fluid bg-primary newsletter p-0">
        <div className="container p-0">
            <div className="row g-0 align-items-center">
                <div className="col-md-5 ps-lg-0 text-start fadeIn" data-wow-delay="0.2s">
                    <img className="img-fluid w-100" src="img/newsletter.jpg" alt="BSNG Newsletter" />
                </div>
                <div className="col-md-7 py-5 newsletter-text fadeIn" data-wow-delay="0.5s">
                    <div className="p-5">
                        <h1 className="mb-5">Subscribe to Our <span className="text-uppercase text-primary bg-white px-2">Newsletter</span></h1>
                        <div className="position-relative w-100 mb-2">
                            <input className="form-control border-0 w-100 ps-4 pe-5" type="email"
                                placeholder="Enter Your Email Address" style={{ height: '60px' }} />
                            <button type="button" className="btn shadow-none position-absolute top-0 end-0 mt-2 me-2"><i
                                    className="fa fa-paper-plane text-primary fs-4"></i></button>
                        </div>
                        <p className="mb-0">Stay updated with our latest projects, property listings, and construction tips.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>


    <div className="container-fluid bg-dark text-white-50 footer pt-5">
        <div className="container py-5">
            <div className="row g-5">
                <div className="col-md-6 col-lg-3 fadeIn" data-wow-delay="0.1s">
                    <a href="/" className="d-inline-block mb-3">
                        <h1 className="text-white d-flex align-items-center m-0"><img src="/img/logo.png" alt="BSNG Logo" style={{ height: '45px', marginRight: '10px' }} />BSNG</h1>
                    </a>
                    <p className="mb-4">Build Strong For Next Generations (BSNG) — Your trusted partner in construction, real estate, and property management in Rwanda.</p>
                    <a className="btn btn-primary border-2 px-4" href="/contact">Contact Us</a>
                </div>
                <div className="col-md-6 col-lg-4 fadeIn" data-wow-delay="0.3s">
                    <h5 className="text-white mb-4">Get In Touch</h5>
                    <p><i className="fa fa-map-marker-alt me-3"></i>Kibagabaga, Kigali, Rwanda</p>
                    <p><i className="fa fa-phone-alt me-3"></i>+250 737 213 060</p>
                    <p className="d-flex align-items-center"><i className="fa fa-envelope me-2 flex-shrink-0"></i><span>info.buildstronggenerations@gmail.com</span></p>
                    <div className="d-flex pt-2">
                        <a className="btn btn-outline-primary btn-square border-2 me-2" href="#"><i className="fab fa-twitter"></i></a>
                        <a className="btn btn-outline-primary btn-square border-2 me-2" href="#"><i className="fab fa-facebook-f"></i></a>
                        <a className="btn btn-outline-primary btn-square border-2 me-2" href="#"><i className="fab fa-youtube"></i></a>
                        <a className="btn btn-outline-primary btn-square border-2 me-2" href="#"><i className="fab fa-instagram"></i></a>
                        <a className="btn btn-outline-primary btn-square border-2 me-2" href="#"><i className="fab fa-linkedin-in"></i></a>
                    </div>
                </div>
                <div className="col-md-6 col-lg-2 ms-auto fadeIn" data-wow-delay="0.5s">
                    <h5 className="text-white mb-4">Quick Links</h5>
                    <a className="btn btn-link" href="/about">About Us</a>
                    <a className="btn btn-link" href="/contact">Contact Us</a>
                    <a className="btn btn-link" href="/service">Our Services</a>
                    <a className="btn btn-link" href="/project">Our Projects</a>
                    <a className="btn btn-link" href="/updates">Updates</a>
                </div>
                <div className="col-md-6 col-lg-2 fadeIn" data-wow-delay="0.7s">
                    <h5 className="text-white mb-4">Our Services</h5>
                    <a className="btn btn-link" href="/service">House Construction</a>
                    <a className="btn btn-link" href="/service">Plot Sales</a>
                    <a className="btn btn-link" href="/service">Renovation</a>
                    <a className="btn btn-link" href="/service">Property Rental</a>
                    <a className="btn btn-link" href="/service">Brokerage</a>
                </div>
            </div>
        </div>
        <div className="container fadeIn" data-wow-delay="0.1s">
            <div className="copyright">
                <div className="row">
                    <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
                        &copy; <a className="border-bottom" href="/">BSNG</a>, All Rights Reserved.
                        &nbsp;Designed &amp; Developed by <a className="border-bottom" href="#">MAKE IT Solutions</a>
                    </div>
                    <div className="col-md-6 text-center text-md-end">
                        <div className="footer-menu">
                            <a href="/">Home</a>
                            <a href="/about">About</a>
                            <a href="/service">Services</a>
                            <a href="/contact">Contact</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>


    <a href="#" className="btn btn-lg btn-primary btn-lg-square back-to-top"><i className="bi bi-arrow-up"></i></a>

    </>
  );
}
