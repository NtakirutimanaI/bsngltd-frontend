import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';

const Register = () => {
    return (
        <React.Fragment>
            <Breadcrumb title="Register" />
            
            <div className="container-fluid py-5">
                <div className="container py-5">
                    <div className="row g-5 justify-content-center">
                        <div className="col-lg-6 wow fadeIn" data-wow-delay="0.1s">
                            <h1 className="mb-5 text-center"><span className="text-uppercase text-primary bg-light px-2">Register</span> New Account</h1>
                            <form>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="form-floating">
                                            <input type="text" className="form-control" id="fname" placeholder="First Name" />
                                            <label htmlFor="fname">First Name</label>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-floating">
                                            <input type="text" className="form-control" id="lname" placeholder="Last Name" />
                                            <label htmlFor="lname">Last Name</label>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="form-floating">
                                            <input type="email" className="form-control" id="email" placeholder="Your Email" />
                                            <label htmlFor="email">Your Email</label>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="form-floating">
                                            <input type="password" className="form-control" id="password" placeholder="Password" />
                                            <label htmlFor="password">Password</label>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="form-floating">
                                            <input type="password" className="form-control" id="cpassword" placeholder="Confirm Password" />
                                            <label htmlFor="cpassword">Confirm Password</label>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <button className="btn btn-primary w-100 py-3 mb-3" type="submit">Create Account</button>

                                        <div className="d-flex align-items-center mb-3">
                                            <hr className="flex-grow-1" />
                                            <span className="mx-2 text-muted" style={{ fontSize: '0.75rem' }}>OR</span>
                                            <hr className="flex-grow-1" />
                                        </div>

                                        <a 
                                            href={`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/auth/google`} 
                                            className="btn btn-outline-dark w-100 py-3 d-flex align-items-center justify-content-center"
                                        >
                                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px', marginRight: '10px' }} />
                                            Continue with Google
                                        </a>
                                    </div>
                                    <div className="col-12 text-center">
                                        <p className="mb-0">Already have an account? <Link to="/login" className="text-primary fw-bold">Login here</Link></p>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default Register;
