import { Link, useLocation } from 'react-router';

export function PublicHeader() {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path ? 'active' : '';

    return (
        <div className="container-fluid sticky-top bg-white shadow-sm">
            <div className="container">
                <nav className="navbar navbar-expand-md navbar-light border-bottom border-2 border-white">
                    <Link to="/" className="navbar-brand">
                        <h1>BSNG</h1>
                    </Link>
                    <button type="button" className="navbar-toggler ms-auto me-0" data-bs-toggle="collapse"
                        data-bs-target="#navbarCollapse">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse show" id="navbarCollapse">
                        <div className="navbar-nav ms-auto py-0">
                            <Link to="/" className={`nav-item nav-link ${isActive('/')}`} style={{ color: '#2c3e50', fontWeight: 'bold' }}>Home</Link>
                            <Link to="/about" className={`nav-item nav-link ${isActive('/about')}`} style={{ color: '#2c3e50', fontWeight: 'bold' }}>About</Link>
                            <Link to="/service" className={`nav-item nav-link ${isActive('/service')}`} style={{ color: '#2c3e50', fontWeight: 'bold' }}>Services</Link>
                            <Link to="/project" className={`nav-item nav-link ${isActive('/project')}`} style={{ color: '#2c3e50', fontWeight: 'bold' }}>Projects</Link>
                            <Link to="/updates" className={`nav-item nav-link ${isActive('/updates')}`} style={{ color: '#2c3e50', fontWeight: 'bold' }}>Updates</Link>
                            <div className="nav-item dropdown">
                                <a href="#" className={`nav-link dropdown-toggle ${location.pathname.includes('/feature') || location.pathname.includes('/team') || location.pathname.includes('/testimonial') ? 'active' : ''}`} data-bs-toggle="dropdown">Pages</a>
                                <div className="dropdown-menu bg-light mt-2">
                                    <Link to="/feature" className="dropdown-item">Features</Link>
                                    <Link to="/team" className="dropdown-item">Our Team</Link>
                                    <Link to="/testimonial" className="dropdown-item">Testimonial</Link>
                                    <Link to="/register" className="dropdown-item">Register</Link>
                                    <Link to="/404" className="dropdown-item">404 Page</Link>
                                </div>
                            </div>
                            <Link to="/contact" className={`nav-item nav-link ${isActive('/contact')}`} style={{ color: '#2c3e50', fontWeight: 'bold' }}>Contact</Link>
                            <Link to="/login" className="nav-item nav-link fw-bold btn btn-primary text-white px-4 ms-lg-5" style={{ borderRadius: '0' }}>Login</Link>
                        </div>
                    </div>
                </nav>
            </div>
        </div>
    );
}
