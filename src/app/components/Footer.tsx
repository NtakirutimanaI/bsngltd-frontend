import { Link } from 'react-router';

export function Footer() {
    return (
        <div className="container-fluid bg-dark text-white-50 footer pt-5">
            <div className="container py-5">
                <div className="row g-5">
                    <div className="col-md-6 col-lg-3 wow fadeIn" data-wow-delay="0.1s">
                        <Link to="/" className="d-inline-block mb-3">
                            <h1 className="text-white">BSNG</h1>
                        </Link>
                        <p className="mb-4">BSNG: Build Strong For Next Generations. A leading construction company dedicated to creating durable and sustainable structures for a better tomorrow.</p>
                        <Link className="btn text-white border-2 px-4" to="/contact" style={{ backgroundColor: '#16a085', borderColor: '#16a085' }}>Get a Quote</Link>
                    </div>
                    <div className="col-md-6 col-lg-3 wow fadeIn" data-wow-delay="0.3s">
                        <h5 className="text-white mb-4">Get In Touch</h5>
                        <p><i className="fa fa-map-marker-alt me-3" style={{ color: '#16a085' }}></i>123 Street, New York, USA</p>
                        <p><i className="fa fa-phone-alt me-3" style={{ color: '#16a085' }}></i>+012 345 67890</p>
                        <p><i className="fa fa-envelope me-3" style={{ color: '#16a085' }}></i>info@example.com</p>
                        <div className="d-flex pt-2">
                            <a className="btn btn-outline-light btn-square border-2 me-2" href=""><i className="fab fa-twitter"></i></a>
                            <a className="btn btn-outline-light btn-square border-2 me-2" href=""><i className="fab fa-facebook-f"></i></a>
                            <a className="btn btn-outline-light btn-square border-2 me-2" href=""><i className="fab fa-youtube"></i></a>
                            <a className="btn btn-outline-light btn-square border-2 me-2" href=""><i className="fab fa-instagram"></i></a>
                            <a className="btn btn-outline-light btn-square border-2 me-2" href=""><i className="fab fa-linkedin-in"></i></a>
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-3 wow fadeIn" data-wow-delay="0.5s">
                        <h5 className="text-white mb-4">Popular Link</h5>
                        <Link className="btn btn-link" to="/about">About Us</Link>
                        <Link className="btn btn-link" to="/contact">Contact Us</Link>
                        <Link className="btn btn-link" to="#">Privacy Policy</Link>
                        <Link className="btn btn-link" to="#">Terms & Condition</Link>
                        <Link className="btn btn-link" to="#">Career</Link>
                    </div>
                    <div className="col-md-6 col-lg-3 wow fadeIn" data-wow-delay="0.7s">
                        <h5 className="text-white mb-4">Our Expertise</h5>
                        <Link className="btn btn-link" to="/service">Structural Engineering</Link>
                        <Link className="btn btn-link" to="/service">Civil Infrastructure</Link>
                        <Link className="btn btn-link" to="/service">Site Development</Link>
                        <Link className="btn btn-link" to="/service">Project Oversight</Link>
                        <Link className="btn btn-link" to="/service">Sustainable Building</Link>
                    </div>
                </div>
            </div>
            <div className="container wow fadeIn" data-wow-delay="0.1s">
                <div className="copyright">
                    <div className="row">
                        <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
                            &copy; <Link className="border-bottom" to="/" style={{ color: '#16a085' }}>BSNG LTD</Link>, All Right Reserved.
                        </div>
                        <div className="col-md-6 text-center text-md-end">
                            <div className="footer-menu">
                                <Link to="/">Home</Link>
                                <Link to="#">Cookies</Link>
                                <Link to="#">Help</Link>
                                <Link to="#">FAQs</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
