import React from 'react';
import Breadcrumb from '../components/Breadcrumb';

const Team = () => {
    return (
        <React.Fragment>
            <Breadcrumb title="Our Team" />
            
            {/* Team Start */}
            <div className="container-fluid bg-light py-5">
                <div className="container py-5">
                    <h1 className="mb-5">Our Professional <span className="text-uppercase text-primary bg-light px-2">Designers</span></h1>
                    <div className="row g-4">
                        <div className="col-md-6 col-lg-3 wow fadeIn" data-wow-delay="0.1s">
                            <div className="team-item position-relative overflow-hidden">
                                <img className="img-fluid w-100" src="/img/team-1.jpg" alt="" />
                                <div className="team-overlay">
                                    <small className="mb-2">Architect</small>
                                    <h4 className="lh-base text-light">Boris Johnson</h4>
                                    <div className="d-flex justify-content-center">
                                        <a className="btn btn-outline-primary btn-sm-square border-2 me-2" href="#"><i className="fab fa-facebook-f"></i></a>
                                        <a className="btn btn-outline-primary btn-sm-square border-2 me-2" href="#"><i className="fab fa-twitter"></i></a>
                                        <a className="btn btn-outline-primary btn-sm-square border-2 me-2" href="#"><i className="fab fa-instagram"></i></a>
                                        <a className="btn btn-outline-primary btn-sm-square border-2 me-2" href="#"><i className="fab fa-linkedin-in"></i></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-3 wow fadeIn" data-wow-delay="0.3s">
                            <div className="team-item position-relative overflow-hidden">
                                <img className="img-fluid w-100" src="/img/team-2.jpg" alt="" />
                                <div className="team-overlay">
                                    <small className="mb-2">Architect</small>
                                    <h4 className="lh-base text-light">Donald Pakura</h4>
                                    <div className="d-flex justify-content-center">
                                        <a className="btn btn-outline-primary btn-sm-square border-2 me-2" href="#"><i className="fab fa-facebook-f"></i></a>
                                        <a className="btn btn-outline-primary btn-sm-square border-2 me-2" href="#"><i className="fab fa-twitter"></i></a>
                                        <a className="btn btn-outline-primary btn-sm-square border-2 me-2" href="#"><i className="fab fa-instagram"></i></a>
                                        <a className="btn btn-outline-primary btn-sm-square border-2 me-2" href="#"><i className="fab fa-linkedin-in"></i></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-3 wow fadeIn" data-wow-delay="0.5s">
                            <div className="team-item position-relative overflow-hidden">
                                <img className="img-fluid w-100" src="/img/team-3.jpg" alt="" />
                                <div className="team-overlay">
                                    <small className="mb-2">Architect</small>
                                    <h4 className="lh-base text-light">Bradley Gordon</h4>
                                    <div className="d-flex justify-content-center">
                                        <a className="btn btn-outline-primary btn-sm-square border-2 me-2" href="#"><i className="fab fa-facebook-f"></i></a>
                                        <a className="btn btn-outline-primary btn-sm-square border-2 me-2" href="#"><i className="fab fa-twitter"></i></a>
                                        <a className="btn btn-outline-primary btn-sm-square border-2 me-2" href="#"><i className="fab fa-instagram"></i></a>
                                        <a className="btn btn-outline-primary btn-sm-square border-2 me-2" href="#"><i className="fab fa-linkedin-in"></i></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-3 wow fadeIn" data-wow-delay="0.7s">
                            <div className="team-item position-relative overflow-hidden">
                                <img className="img-fluid w-100" src="/img/team-4.jpg" alt="" />
                                <div className="team-overlay">
                                    <small className="mb-2">Architect</small>
                                    <h4 className="lh-base text-light">Alexander Bell</h4>
                                    <div className="d-flex justify-content-center">
                                        <a className="btn btn-outline-primary btn-sm-square border-2 me-2" href="#"><i className="fab fa-facebook-f"></i></a>
                                        <a className="btn btn-outline-primary btn-sm-square border-2 me-2" href="#"><i className="fab fa-twitter"></i></a>
                                        <a className="btn btn-outline-primary btn-sm-square border-2 me-2" href="#"><i className="fab fa-instagram"></i></a>
                                        <a className="btn btn-outline-primary btn-sm-square border-2 me-2" href="#"><i className="fab fa-linkedin-in"></i></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Team End */}
        </React.Fragment>
    );
};

export default Team;
