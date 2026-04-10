import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../app/context/AuthContext';

const Navbar = () => {
    const location = useLocation();
    const { user } = useAuth();
    
    const isActive = (path) => location.pathname === path ? "active" : "";

    return (
        <div className="container-fluid sticky-top">
            <div className="container">
                <nav className="navbar navbar-expand-lg navbar-light border-bottom border-2 border-white">
                    <Link to="/" className="navbar-brand">
                        <h1 className="m-0">BSNG</h1>
                    </Link>
                    <button type="button" className="navbar-toggler ms-auto me-0" data-bs-toggle="collapse"
                        data-bs-target="#navbarCollapse">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse show" id="navbarCollapse">
                        <div className="navbar-nav ms-auto">
                            <Link to="/" className={`nav-item nav-link ${isActive('/')} text-dark`}>Home</Link>
                            <Link to="/about" className={`nav-item nav-link ${isActive('/about')} text-dark`}>About</Link>
                            <Link to="/service" className={`nav-item nav-link ${isActive('/service')} text-dark`}>Services</Link>
                            <Link to="/project" className={`nav-item nav-link ${isActive('/project')} text-dark`}>Projects</Link>
                            <Link to="/updates" className={`nav-item nav-link ${isActive('/updates')} text-dark`}>Updates</Link>
                            <div className="nav-item dropdown">
                                <a href="#" className="nav-link dropdown-toggle" data-bs-toggle="dropdown">Pages</a>
                                <div className="dropdown-menu bg-light mt-2">
                                    <Link to="/feature" className="dropdown-item">Features</Link>
                                    <Link to="/team" className="dropdown-item">Our Team</Link>
                                    <Link to="/testimonial" className="dropdown-item">Testimonial</Link>
                                    <Link to="/register" className="dropdown-item">Register</Link>
                                </div>
                            </div>
                            <Link to="/contact" className={`nav-item nav-link ${isActive('/contact')} text-dark`}>Contact</Link>
                            {user ? (
                                <Link to="/dashboard" className="nav-item nav-link btn btn-primary text-white py-2 px-4 ms-lg-5 d-none d-lg-block" style={{ borderRadius: '0' }}>Dashboard</Link>
                            ) : (
                                <Link to="/login" className="nav-item nav-link btn btn-primary text-white py-2 px-4 ms-lg-5 d-none d-lg-block" style={{ borderRadius: '0' }}>Login</Link>
                            )}
                            {user ? (
                                <Link to="/dashboard" className="nav-item nav-link d-lg-none">Dashboard</Link>
                            ) : (
                                <Link to="/login" className="nav-item nav-link d-lg-none">Login</Link>
                            )}
                        </div>
                    </div>
                </nav>
            </div>
        </div>
    );
};

export default Navbar;
