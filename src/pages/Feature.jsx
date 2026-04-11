import React from 'react';

export default function Feature() {
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
                    <h1 className="display-1 mb-0 slideInLeft">Our Features</h1>
                </div>
                <div className="col-lg-6 slideInRight">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb justify-content-center justify-content-lg-end mb-0">
                            <li className="breadcrumb-item"><a className="text-primary" href="/">Home</a></li>
                            <li className="breadcrumb-item"><a className="text-primary" href="#">Pages</a></li>
                            <li className="breadcrumb-item text-secondary active" aria-current="page">Features</li>
                        </ol>
                    </nav>
                </div>
            </div>
        </div>
    </div>


    <div className="container-fluid py-5">
        <div className="container py-5">
            <div className="text-center fadeIn" data-wow-delay="0.1s">
                <h1 className="mb-2">Why People <span className="text-uppercase text-primary bg-light px-2">Choose BSNG</span></h1>
                <p className="mb-5">We stand apart from the rest through our unwavering commitment to quality, transparency, and client satisfaction.</p>
            </div>
            <div className="row g-5 align-items-center text-center">
                <div className="col-md-6 col-lg-4 fadeIn" data-wow-delay="0.1s">
                    <i className="fa fa-calendar-alt fa-5x text-primary mb-4"></i>
                    <h4>Years of Experience</h4>
                    <p className="mb-0">With years of hands-on experience in Rwanda's construction industry, BSNG has the expertise to handle projects of any scale — from individual homes to large commercial developments.</p>
                </div>
                <div className="col-md-6 col-lg-4 fadeIn" data-wow-delay="0.3s">
                    <i className="fa fa-tasks fa-5x text-primary mb-4"></i>
                    <h4>Best House Construction</h4>
                    <p className="mb-0">We design and build modern, durable, and beautiful homes tailored to each client's unique vision and budget. Our construction quality is built to last for generations.</p>
                </div>
                <div className="col-md-6 col-lg-4 fadeIn" data-wow-delay="0.5s">
                    <i className="fa fa-pencil-ruler fa-5x text-primary mb-4"></i>
                    <h4>Expert Renovation</h4>
                    <p className="mb-0">We breathe new life into old spaces. Whether it's a partial makeover or a complete building renovation, our team delivers outstanding results on schedule and within budget.</p>
                </div>
                <div className="col-md-6 col-lg-4 fadeIn" data-wow-delay="0.1s">
                    <i className="fa fa-user fa-5x text-primary mb-4"></i>
                    <h4>Client Satisfaction</h4>
                    <p className="mb-0">Every project we undertake is driven by our commitment to exceeding client expectations. We maintain open communication throughout every phase of the work, so you are never left in the dark.</p>
                </div>
                <div className="col-md-6 col-lg-4 fadeIn" data-wow-delay="0.3s">
                    <i className="fa fa-hand-holding-usd fa-5x text-primary mb-4"></i>
                    <h4>Property Rental</h4>
                    <p className="mb-0">Looking for a property to rent? BSNG manages a portfolio of high-quality residential and commercial rental properties at competitive rates in Kigali, Rwanda.</p>
                </div>
                <div className="col-md-6 col-lg-4 fadeIn" data-wow-delay="0.5s">
                    <i className="fa fa-map-marked-alt fa-5x text-primary mb-4"></i>
                    <h4>Plot Sales</h4>
                    <p className="mb-0">We offer verified and legally cleared plots in prime locations across Rwanda, helping clients invest wisely in land and secure their real estate assets for the future.</p>
                </div>
            </div>
        </div>
    </div>


    <div className="container-fluid py-5 bg-light">
        <div className="container py-5">
            <div className="text-center mb-5 fadeIn" data-wow-delay="0.1s">
                <h1>What Sets <span className="text-uppercase text-primary bg-light px-2">BSNG Apart</span></h1>
            </div>
            <div className="row g-4">
                <div className="col-md-6 fadeIn" data-wow-delay="0.1s">
                    <div className="d-flex align-items-start p-4 bg-white shadow-sm h-100">
                        <i className="fa fa-shield-alt fa-3x text-primary me-4 mt-1"></i>
                        <div>
                            <h5>Licensed & Certified</h5>
                            <p className="mb-0">BSNG Construction operates fully within Rwanda's regulatory framework. Every project is compliant with local building codes and environmental standards, giving you complete peace of mind.</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 fadeIn" data-wow-delay="0.2s">
                    <div className="d-flex align-items-start p-4 bg-white shadow-sm h-100">
                        <i className="fa fa-clock fa-3x text-primary me-4 mt-1"></i>
                        <div>
                            <h5>On-Time Delivery</h5>
                            <p className="mb-0">We understand that time is valuable. BSNG commits to clearly defined timelines and delivers every project on schedule through efficient planning and project management.</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 fadeIn" data-wow-delay="0.3s">
                    <div className="d-flex align-items-start p-4 bg-white shadow-sm h-100">
                        <i className="fa fa-dollar-sign fa-3x text-primary me-4 mt-1"></i>
                        <div>
                            <h5>Transparent Pricing</h5>
                            <p className="mb-0">No hidden fees, no surprises. We provide detailed and transparent cost estimates before any project begins, and we stick to agreed budgets throughout the construction process.</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 fadeIn" data-wow-delay="0.4s">
                    <div className="d-flex align-items-start p-4 bg-white shadow-sm h-100">
                        <i className="fa fa-headset fa-3x text-primary me-4 mt-1"></i>
                        <div>
                            <h5>24/7 Client Support</h5>
                            <p className="mb-0">Our dedicated support team is available around the clock. Whether you have questions about an ongoing project or want to explore a new service, we're always just a call away.</p>
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
