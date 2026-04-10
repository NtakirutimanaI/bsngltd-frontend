import React from 'react';
import Breadcrumb from '../components/Breadcrumb';

const Project = () => {
    return (
        <React.Fragment>
            <Breadcrumb title="Projects" />
            
            {/* Project Start */}
            <div className="container-fluid py-5">
                <div className="container py-5">
                    <div className="row g-0">
                        <div className="col-lg-5 wow fadeIn" data-wow-delay="0.1s">
                            <div className="d-flex flex-column justify-content-center bg-primary h-100 p-5">
                                <h1 className="text-white mb-5">Our Latest <span className="text-uppercase text-primary bg-light px-2">Projects</span></h1>
                                <h4 className="text-white mb-0"><span className="display-1">6</span> of our latest projects</h4>
                            </div>
                        </div>
                        <div className="col-lg-7">
                            <div className="row g-0">
                                <div className="col-md-6 col-lg-4 wow fadeIn" data-wow-delay="0.2s">
                                    <div className="project-item position-relative overflow-hidden">
                                        <img className="img-fluid w-100" src="/img/project-1.jpg" alt="" />
                                        <a className="project-overlay text-decoration-none" href="#">
                                            <h4 className="text-white">Kitchen</h4>
                                            <small className="text-white">72 Projects</small>
                                        </a>
                                    </div>
                                </div>
                                <div className="col-md-6 col-lg-4 wow fadeIn" data-wow-delay="0.3s">
                                    <div className="project-item position-relative overflow-hidden">
                                        <img className="img-fluid w-100" src="/img/project-2.jpg" alt="" />
                                        <a className="project-overlay text-decoration-none" href="#">
                                            <h4 className="text-white">Bathroom</h4>
                                            <small className="text-white">67 Projects</small>
                                        </a>
                                    </div>
                                </div>
                                <div className="col-md-6 col-lg-4 wow fadeIn" data-wow-delay="0.4s">
                                    <div className="project-item position-relative overflow-hidden">
                                        <img className="img-fluid w-100" src="/img/project-3.jpg" alt="" />
                                        <a className="project-overlay text-decoration-none" href="#">
                                            <h4 className="text-white">Bedroom</h4>
                                            <small className="text-white">53 Projects</small>
                                        </a>
                                    </div>
                                </div>
                                <div className="col-md-6 col-lg-4 wow fadeIn" data-wow-delay="0.5s">
                                    <div className="project-item position-relative overflow-hidden">
                                        <img className="img-fluid w-100" src="/img/project-4.jpg" alt="" />
                                        <a className="project-overlay text-decoration-none" href="#">
                                            <h4 className="text-white">Living Room</h4>
                                            <small className="text-white">33 Projects</small>
                                        </a>
                                    </div>
                                </div>
                                <div className="col-md-6 col-lg-4 wow fadeIn" data-wow-delay="0.6s">
                                    <div className="project-item position-relative overflow-hidden">
                                        <img className="img-fluid w-100" src="/img/project-5.jpg" alt="" />
                                        <a className="project-overlay text-decoration-none" href="#">
                                            <h4 className="text-white">Furniture</h4>
                                            <small className="text-white">87 Projects</small>
                                        </a>
                                    </div>
                                </div>
                                <div className="col-md-6 col-lg-4 wow fadeIn" data-wow-delay="0.7s">
                                    <div className="project-item position-relative overflow-hidden">
                                        <img className="img-fluid w-100" src="/img/project-6.jpg" alt="" />
                                        <a className="project-overlay text-decoration-none" href="#">
                                            <h4 className="text-white">Rennovation</h4>
                                            <small className="text-white">69 Projects</small>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Project End */}
        </React.Fragment>
    );
};

export default Project;
