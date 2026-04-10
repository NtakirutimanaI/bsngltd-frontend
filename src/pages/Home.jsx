import React, { useEffect } from 'react';

const Home = () => {
    useEffect(() => {
        // Initialize Owl Carousel for this page specifically
        if (window.jQuery && window.jQuery.fn.owlCarousel) {
            window.jQuery(".header-carousel").owlCarousel({
                autoplay: true,
                smartSpeed: 1000,
                loop: true,
                dots: true,
                items: 1
            });
            
            window.jQuery(".testimonial-carousel").owlCarousel({
                items: 1,
                autoplay: true,
                smartSpeed: 1000,
                animateIn: 'fadeIn',
                animateOut: 'fadeOut',
                dots: true,
                loop: true,
                nav: false
            });
        }
    }, []);

    return (
        <React.Fragment>
            {/* Hero Start */}
            <div className="container-fluid pb-5 hero-header bg-light mb-5">
                <div className="container py-5">
                    <div className="row g-5 align-items-center mb-5">
                        <div className="col-lg-6">
                            <h1 className="display-1 mb-4 animated slideInRight">We Make Your <span className="text-primary">Home</span> Better</h1>
                            <h5 className="d-inline-block border border-2 border-white py-3 px-5 mb-0 animated slideInRight">
                                An Award Winning Studio Since 1990</h5>
                        </div>
                        <div className="col-lg-6">
                            <div className="owl-carousel header-carousel animated fadeIn">
                                <img className="img-fluid" src="/img/hero-slider-1.jpg" alt="" />
                                <img className="img-fluid" src="/img/hero-slider-2.jpg" alt="" />
                                <img className="img-fluid" src="/img/hero-slider-3.jpg" alt="" />
                            </div>
                        </div>
                    </div>
                    <div className="row g-5 animated fadeIn">
                        <div className="col-md-6 col-lg-3">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0 btn-square border border-2 border-white me-3">
                                    <i className="fa fa-robot text-primary"></i>
                                </div>
                                <h5 className="lh-base mb-0">Crafted Furniture</h5>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0 btn-square border border-2 border-white me-3">
                                    <i className="fa fa-robot text-primary"></i>
                                </div>
                                <h5 className="lh-base mb-0">Sustainable Material</h5>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0 btn-square border border-2 border-white me-3">
                                    <i className="fa fa-robot text-primary"></i>
                                </div>
                                <h5 className="lh-base mb-0">Innovative Architects</h5>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0 btn-square border border-2 border-white me-3">
                                    <i className="fa fa-robot text-primary"></i>
                                </div>
                                <h5 className="lh-base mb-0">Budget Friendly</h5>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Hero End */}

            {/* About Start */}
            <div className="container-fluid py-5">
                <div className="container">
                    <div className="row g-5">
                        <div className="col-lg-6">
                            <div className="row">
                                <div className="col-6 wow fadeIn" data-wow-delay="0.1s">
                                    <img className="img-fluid" src="/img/about-1.jpg" alt="" />
                                </div>
                                <div className="col-6 wow fadeIn" data-wow-delay="0.3s">
                                    <img className="img-fluid h-75" src="/img/about-2.jpg" alt="" />
                                    <div className="h-25 d-flex align-items-center text-center bg-primary px-4">
                                        <h4 className="text-white lh-base mb-0">Award Winning Studio Since 1990</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 wow fadeIn" data-wow-delay="0.5s">
                            <h1 className="mb-5"><span className="text-uppercase text-primary bg-light px-2">History</span> of Our Creation</h1>
                            <p className="mb-4">Tempor erat elitr rebum at clita. Diam dolor diam ipsum et tempor sit. Aliqu diam amet diam et eos labore. Clita erat ipsum et lorem et sit, sed stet no labore lorem sit. Sanctus clita duo justo et tempor eirmod magna dolore erat amet</p>
                            <p className="mb-5">Aliqu diam amet diam et eos labore. Clita erat ipsum et lorem et sit, sed stet no labore lorem sit. Sanctus clita duo justo et tempor.</p>
                            <div className="row g-3">
                                <div className="col-sm-6">
                                    <h6 className="mb-3"><i className="fa fa-check text-primary me-2"></i>Award Winning</h6>
                                    <h6 className="mb-0"><i className="fa fa-check text-primary me-2"></i>Professional Staff</h6>
                                </div>
                                <div className="col-sm-6">
                                    <h6 className="mb-3"><i className="fa fa-check text-primary me-2"></i>24/7 Support</h6>
                                    <h6 className="mb-0"><i className="fa fa-check text-primary me-2"></i>Fair Prices</h6>
                                </div>
                            </div>
                            <div className="d-flex align-items-center mt-5">
                                <a className="btn btn-primary px-4 me-2" href="#">Read More</a>
                                <a className="btn btn-outline-primary btn-square border-2 me-2" href="#"><i className="fab fa-facebook-f"></i></a>
                                <a className="btn btn-outline-primary btn-square border-2 me-2" href="#"><i className="fab fa-twitter"></i></a>
                                <a className="btn btn-outline-primary btn-square border-2 me-2" href="#"><i className="fab fa-instagram"></i></a>
                                <a className="btn btn-outline-primary btn-square border-2" href="#"><i className="fab fa-linkedin-in"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* About End */}

            {/* Feature Start */}
            <div className="container-fluid py-5">
                <div className="container">
                    <div className="text-center wow fadeIn" data-wow-delay="0.1s">
                        <h1 className="mb-5">Why People <span className="text-uppercase text-primary bg-light px-2">Choose Us</span></h1>
                    </div>
                    <div className="row g-5 align-items-center text-center">
                        <div className="col-md-6 col-lg-4 wow fadeIn" data-wow-delay="0.1s">
                            <i className="fa fa-calendar-alt fa-5x text-primary mb-4"></i>
                            <h4>25+ Years Experience</h4>
                            <p className="mb-0">Clita erat ipsum et lorem et sit, sed stet no labore lorem sit. Sanctus clita duo justo et tempor eirmod magna dolore erat amet</p>
                        </div>
                        <div className="col-md-6 col-lg-4 wow fadeIn" data-wow-delay="0.3s">
                            <i className="fa fa-tasks fa-5x text-primary mb-4"></i>
                            <h4>Best Interior Design</h4>
                            <p className="mb-0">Clita erat ipsum et lorem et sit, sed stet no labore lorem sit. Sanctus clita duo justo et tempor eirmod magna dolore erat amet</p>
                        </div>
                        <div className="col-md-6 col-lg-4 wow fadeIn" data-wow-delay="0.5s">
                            <i className="fa fa-pencil-ruler fa-5x text-primary mb-4"></i>
                            <h4>Innovative Architects</h4>
                            <p className="mb-0">Clita erat ipsum et lorem et sit, sed stet no labore lorem sit. Sanctus clita duo justo et tempor eirmod magna dolore erat amet</p>
                        </div>
                        <div className="col-md-6 col-lg-4 wow fadeIn" data-wow-delay="0.1s">
                            <i className="fa fa-user fa-5x text-primary mb-4"></i>
                            <h4>Customer Satisfaction</h4>
                            <p className="mb-0">Clita erat ipsum et lorem et sit, sed stet no labore lorem sit. Sanctus clita duo justo et tempor eirmod magna dolore erat amet</p>
                        </div>
                        <div className="col-md-6 col-lg-4 wow fadeIn" data-wow-delay="0.3s">
                            <i className="fa fa-hand-holding-usd fa-5x text-primary mb-4"></i>
                            <h4>Budget Friendly</h4>
                            <p className="mb-0">Clita erat ipsum et lorem et sit, sed stet no labore lorem sit. Sanctus clita duo justo et tempor eirmod magna dolore erat amet</p>
                        </div>
                        <div className="col-md-6 col-lg-4 wow fadeIn" data-wow-delay="0.5s">
                            <i className="fa fa-check fa-5x text-primary mb-4"></i>
                            <h4>Sustainable Material</h4>
                            <p className="mb-0">Clita erat ipsum et lorem et sit, sed stet no labore lorem sit. Sanctus clita duo justo et tempor eirmod magna dolore erat amet</p>
                        </div>
                    </div>
                </div>
            </div>
            {/* Feature End */}

            {/* Project Start */}
            <div className="container-fluid mt-5">
                <div className="container mt-5">
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

            {/* Service Start */}
            <div className="container-fluid py-5">
                <div className="container py-5">
                    <div className="row g-5 align-items-center">
                        <div className="col-lg-5 wow fadeIn" data-wow-delay="0.1s">
                            <h1 className="mb-5">Our Creative <span className="text-uppercase text-primary bg-light px-2">Services</span></h1>
                            <p>Aliqu diam amet diam et eos labore. Clita erat ipsum et lorem et sit, sed stet no labore lorem sit. Sanctus clita duo justo et tempor eirmod magna dolore erat amet</p>
                            <p className="mb-5">Tempor erat elitr rebum at clita. Diam dolor diam ipsum et tempor sit. Aliqu diam amet diam et eos labore. Clita erat ipsum et lorem et sit, sed stet no labore lorem sit. Sanctus clita duo justo et tempor eirmod magna dolore erat amet</p>
                            <div className="d-flex align-items-center bg-light">
                                <div className="btn-square flex-shrink-0 bg-primary" style={{ width: '100px', height: '100px' }}>
                                    <i className="fa fa-phone fa-2x text-white"></i>
                                </div>
                                <div className="px-3">
                                    <h3>+0123456789</h3>
                                    <span>Call us direct 24/7 for get a free consultation</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-7">
                            <div className="row g-0">
                                <div className="col-md-6 wow fadeIn" data-wow-delay="0.2s">
                                    <div className="service-item h-100 d-flex flex-column justify-content-center bg-primary">
                                        <div className="service-img position-relative mb-4">
                                            <img className="img-fluid w-100" src="/img/service-1.jpg" alt="" />
                                            <h3>Interior Design</h3>
                                        </div>
                                        <p className="mb-0">Erat ipsum justo amet duo et elitr dolor, est duo duo eos lorem sed diam stet diam sed stet lorem.</p>
                                    </div>
                                </div>
                                <div className="col-md-6 wow fadeIn" data-wow-delay="0.4s">
                                    <div className="service-item h-100 d-flex flex-column justify-content-center bg-light">
                                        <div className="service-img position-relative mb-4">
                                            <img className="img-fluid w-100" src="/img/service-2.jpg" alt="" />
                                            <h3>Implement</h3>
                                        </div>
                                        <p className="mb-0">Erat ipsum justo amet duo et elitr dolor, est duo duo eos lorem sed diam stet diam sed stet lorem.</p>
                                    </div>
                                </div>
                                <div className="col-md-6 wow fadeIn" data-wow-delay="0.6s">
                                    <div className="service-item h-100 d-flex flex-column justify-content-center bg-light">
                                        <div className="service-img position-relative mb-4">
                                            <img className="img-fluid w-100" src="/img/service-3.jpg" alt="" />
                                            <h3>Renovation</h3>
                                        </div>
                                        <p className="mb-0">Erat ipsum justo amet duo et elitr dolor, est duo duo eos lorem sed diam stet diam sed stet lorem.</p>
                                    </div>
                                </div>
                                <div className="col-md-6 wow fadeIn" data-wow-delay="0.8s">
                                    <div className="service-item h-100 d-flex flex-column justify-content-center bg-primary">
                                        <div className="service-img position-relative mb-4">
                                            <img className="img-fluid w-100" src="/img/service-4.jpg" alt="" />
                                            <h3>Commercial</h3>
                                        </div>
                                        <p className="mb-0">Erat ipsum justo amet duo et elitr dolor, est duo duo eos lorem sed diam stet diam sed stet lorem.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Service End */}

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

            {/* Testimonial Start */}
            <div className="container-xxl py-5">
                <div className="container py-5">
                    <div className="row justify-content-center">
                        <div className="col-md-12 col-lg-9">
                            <div className="owl-carousel testimonial-carousel wow fadeIn" data-wow-delay="0.2s">
                                <div className="testimonial-item">
                                    <div className="row g-5 align-items-center">
                                        <div className="col-md-6">
                                            <div className="testimonial-img">
                                                <img className="img-fluid" src="/img/testimonial-1.jpg" alt="" />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="testimonial-text pb-5 pb-md-0">
                                                <h3>Sustainable Material</h3>
                                                <p>Aliqu diam amet diam et eos labore. Clita erat ipsum et lorem et sit, sed stet no labore lorem sit. Sanctus clita duo justo et tempor eirmod magna dolore erat amet</p>
                                                <h5 className="mb-0">Boris Johnson</h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="testimonial-item">
                                    <div className="row g-5 align-items-center">
                                        <div className="col-md-6">
                                            <div className="testimonial-img">
                                                <img className="img-fluid" src="/img/testimonial-2.jpg" alt="" />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="testimonial-text pb-5 pb-md-0">
                                                <h3>Customer Satisfaction</h3>
                                                <p>Clita erat ipsum et lorem et sit, sed stet no labore lorem sit. Sanctus clita duo justo et tempor eirmod magna dolore erat amet</p>
                                                <h5 className="mb-0">Alexander Bell</h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="testimonial-item">
                                    <div className="row g-5 align-items-center">
                                        <div className="col-md-6">
                                            <div className="testimonial-img">
                                                <img className="img-fluid" src="/img/testimonial-3.jpg" alt="" />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="testimonial-text pb-5 pb-md-0">
                                                <h3>Budget Friendly</h3>
                                                <p>Diam amet diam et eos labore. Clita erat ipsum et lorem et sit, sed stet no labore lorem sit. Sanctus clita duo justo et tempor eirmod magna dolore erat amet</p>
                                                <h5 className="mb-0">Bradley Gordon</h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Testimonial End */}

            {/* Newsletter Start */}
            <div className="container-fluid bg-primary newsletter p-0">
                <div className="container p-0">
                    <div className="row g-0 align-items-center">
                        <div className="col-md-5 ps-lg-0 text-start wow fadeIn" data-wow-delay="0.2s">
                            <img className="img-fluid w-100" src="/img/newsletter.jpg" alt="" />
                        </div>
                        <div className="col-md-7 py-5 newsletter-text wow fadeIn" data-wow-delay="0.5s">
                            <div className="p-5">
                                <h1 className="mb-5">Subscribe the <span className="text-uppercase text-primary bg-white px-2">Newsletter</span></h1>
                                <div className="position-relative w-100 mb-2">
                                    <input className="form-control border-0 w-100 ps-4 pe-5" type="text" placeholder="Enter Your Email" style={{ height: '60px' }} />
                                    <button type="button" className="btn shadow-none position-absolute top-0 end-0 mt-2 me-2"><i className="fa fa-paper-plane text-primary fs-4"></i></button>
                                </div>
                                <p className="mb-0">Diam sed sed dolor stet amet eirmod</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Newsletter End */}
        </React.Fragment>
    );
};

export default Home;
