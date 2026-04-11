import React from 'react';

export default function NotFound() {
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
                        <a href="/login" className="nav-item nav-link btn-login-nav">
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
                    <h1 className="display-1 mb-0 slideInLeft">404 Error</h1>
                </div>
                <div className="col-lg-6 slideInRight">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb justify-content-center justify-content-lg-end mb-0">
                            <li className="breadcrumb-item"><a className="text-primary" href="/">Home</a></li>
                            <li className="breadcrumb-item text-secondary active" aria-current="page">404 Error</li>
                        </ol>
                    </nav>
                </div>
            </div>
        </div>
    </div>
    


    
    <div className="container-fluid py-5 fadeIn" data-wow-delay="0.1s">
        <div className="container text-center py-5">
            <div className="row justify-content-center">
                <div className="col-lg-6">
                    <i className="bi bi-exclamation-triangle display-1 text-primary"></i>
                    <h1 className="display-1">404</h1>
                    <h1 className="mb-4">Page Not Found</h1>
                    <p className="mb-4">We’re sorry, the page you have looked for does not exist in our website! Maybe go to our home page or try to use a search?</p>
                    <a className="btn btn-primary py-3 px-4" href="/">Go Back To Home</a>
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
