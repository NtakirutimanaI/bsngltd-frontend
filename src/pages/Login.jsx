import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';

const Login = () => {
    return (
        <React.Fragment>
            <Breadcrumb title="Login" />
            
            <div className="container-fluid py-5">
                <div className="container py-5">
                    <div className="row g-5 justify-content-center">
                        <div className="col-lg-6 wow fadeIn" data-wow-delay="0.1s">
                            <h1 className="mb-5 text-center"><span className="text-uppercase text-primary bg-light px-2">Login</span> To Your Account</h1>
                            <form>
                                <div className="row g-3">
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
                                        <button className="btn btn-primary w-100 py-3" type="submit">Login</button>
                                    </div>
                                    <div className="col-12 text-center">
                                        <p className="mb-0">Don't have an account? <Link to="/register" className="text-primary fw-bold">Register here</Link></p>
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

export default Login;
