import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <React.Fragment>
            <div className="container-fluid bg-dark text-white-50 footer pt-5">
                <div className="container py-5">
                    <div className="row g-5">
                        <div className="col-md-6 col-lg-3 wow fadeIn" data-wow-delay="0.1s">
                            <Link to="/" className="d-inline-block mb-3">
                                <h1 className="text-white">iSTUDIO</h1>
                            </Link>
                            <p className="mb-4">Tempor erat elitr rebum at clita. Diam dolor diam ipsum et tempor sit. Aliqu diam amet diam et eos labore.</p>
                            <a className="btn btn-primary border-2 px-4" href="#">Buy Pro Version</a>
                        </div>
                        <div className="col-md-6 col-lg-3 wow fadeIn" data-wow-delay="0.3s">
                            <h5 className="text-white mb-4">Get In Touch</h5>
                            <p><i className="fa fa-map-marker-alt me-3"></i>123 Street, New York, USA</p>
                            <p><i className="fa fa-phone-alt me-3"></i>+012 345 67890</p>
                            <p><i className="fa fa-envelope me-3"></i>info@example.com</p>
                            <div className="d-flex pt-2">
                                <a className="btn btn-outline-primary btn-square border-2 me-2" href=""><i className="fab fa-twitter"></i></a>
                                <a className="btn btn-outline-primary btn-square border-2 me-2" href=""><i className="fab fa-facebook-f"></i></a>
                                <a className="btn btn-outline-primary btn-square border-2 me-2" href=""><i className="fab fa-youtube"></i></a>
                                <a className="btn btn-outline-primary btn-square border-2 me-2" href=""><i className="fab fa-instagram"></i></a>
                                <a className="btn btn-outline-primary btn-square border-2 me-2" href=""><i className="fab fa-linkedin-in"></i></a>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-3 wow fadeIn" data-wow-delay="0.5s">
                            <h5 className="text-white mb-4">Popular Link</h5>
                            <Link className="btn btn-link" to="/about">About Us</Link>
                            <Link className="btn btn-link" to="/contact">Contact Us</Link>
                            <a className="btn btn-link" href="">Privacy Policy</a>
                            <a className="btn btn-link" href="">Terms & Condition</a>
                            <a className="btn btn-link" href="">Career</a>
                        </div>
                        <div className="col-md-6 col-lg-3 wow fadeIn" data-wow-delay="0.7s">
                            <h5 className="text-white mb-4">Our Services</h5>
                            <Link className="btn btn-link" to="/service">Interior Design</Link>
                            <Link className="btn btn-link" to="/project">Project Planning</Link>
                            <a className="btn btn-link" href="">Renovation</a>
                            <a className="btn btn-link" href="">Implement</a>
                            <a className="btn btn-link" href="">Landscape Design</a>
                        </div>
                    </div>
                </div>
                <div className="container wow fadeIn" data-wow-delay="0.1s">
                    <div className="copyright">
                        <div className="row">
                            <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
                                &copy; <a className="border-bottom" href="#">Your Site Name</a>, All Right Reserved.
                                Designed By <a className="border-bottom" href="https://htmlcodex.com">HTML Codex</a>
                            </div>
                            <div className="col-md-6 text-center text-md-end">
                                <div className="footer-menu">
                                    <Link to="/">Home</Link>
                                    <a href="">Cookies</a>
                                    <a href="">Help</a>
                                    <a href="">FAQs</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <a href="#" className="btn btn-lg btn-primary btn-lg-square back-to-top"><i className="bi bi-arrow-up"></i></a>
        </React.Fragment>
    );
};

export default Footer;
