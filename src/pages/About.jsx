import React, { useState, useEffect } from 'react';

export default function About() {
  const [cmsData, setCmsData] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bsng_cms_about')) || {}; } catch { return {}; }
  });
  const [homeCms, setHomeCms] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bsng_cms_home')) || {}; } catch { return {}; }
  });

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    fetch(`${apiUrl}/cms/about`).then(r => r.json()).then(data => {
      setCmsData(data); try { localStorage.setItem('bsng_cms_about', JSON.stringify(data)); } catch {}
    }).catch(console.error);
    fetch(`${apiUrl}/cms/home`).then(r => r.json()).then(data => {
      setHomeCms(data); try { localStorage.setItem('bsng_cms_home', JSON.stringify(data)); } catch {}
    }).catch(console.error);
  }, []);

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
                        <a href="/about" className="nav-item nav-link active">About</a>
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
                    <h1 className="display-1 mb-0 slideInLeft">About Us</h1>
                </div>
                <div className="col-lg-6 slideInRight">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb justify-content-center justify-content-lg-end mb-0">
                            <li className="breadcrumb-item"><a className="text-primary" href="/">Home</a></li>
                            <li className="breadcrumb-item text-secondary active" aria-current="page">About</li>
                        </ol>
                    </nav>
                </div>
            </div>
        </div>
    </div>


    <div className="container-fluid py-5">
        <div className="container py-5">
            <div className="row g-5">
                <div className="col-lg-6">
                    <div className="row">
                        <div className="col-6 fadeIn" data-wow-delay="0.1s">
                            <img className="img-fluid" src={cmsData.who_we_are?.image_1 || "img/about-1.jpg"} alt="BSNG Construction Site" />
                        </div>
                        <div className="col-6 fadeIn" data-wow-delay="0.3s">
                            <img className="img-fluid h-75" src={cmsData.who_we_are?.image_2 || "img/about-2.jpg"} alt="BSNG Building" />
                            <div className="h-25 d-flex align-items-center text-center bg-primary px-4">
                                <h4 className="text-white lh-base mb-0">Build Strong For Next Generations</h4>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-6 fadeIn" data-wow-delay="0.5s">
                    <h1 className="mb-5">{cmsData.who_we_are?.title ? cmsData.who_we_are.title.split(' ')[0] : <span className="text-uppercase text-primary bg-light px-2">Who We</span>} <span className="text-uppercase text-primary bg-light px-2">{cmsData.who_we_are?.title ? cmsData.who_we_are.title.substring(cmsData.who_we_are.title.indexOf(' ')+1) : 'Are'}</span></h1>
                    <p className="mb-4">{cmsData.who_we_are?.desc1 || "Build Strong For Next Generations (BSNG) is a Kigali-based construction and real estate company dedicated to delivering excellence across all aspects of construction, property sales, and management. We are located in Kibagabaga, Kigali, Rwanda, and serve clients across the entire country."}</p>
                    <p className="mb-5">{cmsData.who_we_are?.desc2 || "Our company was established with a bold mission: to provide construction services that are not only structurally superior, but also built with integrity and long-term value in mind. Every project we take on carries our promise — to build strong, build right, and build for the generations that follow."}</p>
                    <div className="row g-3">
                        <div className="col-sm-6">
                            <h6 className="mb-3"><i className="fa fa-check text-primary me-2"></i>{cmsData.who_we_are?.feature_1 || "Quality Craftsmanship"}</h6>
                            <h6 className="mb-0"><i className="fa fa-check text-primary me-2"></i>{cmsData.who_we_are?.feature_2 || "Expert Professional Team"}</h6>
                        </div>
                        <div className="col-sm-6">
                            <h6 className="mb-3"><i className="fa fa-check text-primary me-2"></i>{cmsData.who_we_are?.feature_3 || "24/7 Client Support"}</h6>
                            <h6 className="mb-0"><i className="fa fa-check text-primary me-2"></i>{cmsData.who_we_are?.feature_4 || "Competitive Pricing"}</h6>
                        </div>
                    </div>
                    <div className="d-flex align-items-center mt-5">
                        <a className="btn btn-primary px-4 me-2" href="/service">Our Services</a>
                        <a className="btn btn-outline-primary btn-square border-2 me-2" href="#"><i className="fab fa-facebook-f"></i></a>
                        <a className="btn btn-outline-primary btn-square border-2 me-2" href="#"><i className="fab fa-twitter"></i></a>
                        <a className="btn btn-outline-primary btn-square border-2 me-2" href="#"><i className="fab fa-instagram"></i></a>
                        <a className="btn btn-outline-primary btn-square border-2" href="#"><i className="fab fa-linkedin-in"></i></a>
                    </div>
                </div>
            </div>
        </div>
    </div>


    <div className="container-fluid py-5 bg-light">
        <div className="container py-5">
            <div className="text-center fadeIn" data-wow-delay="0.1s">
                <h1 className="mb-5">{cmsData.mission_vision?.title || <>Our <span className="text-uppercase text-primary bg-light px-2">Mission & Vision</span></>}</h1>
            </div>
            <div className="row g-5">
                <div className="col-md-6 fadeIn" data-wow-delay="0.1s">
                    <div className="d-flex align-items-start">
                        <i className="fa fa-bullseye fa-3x text-primary me-4 mt-1"></i>
                        <div>
                            <h4>Our Mission</h4>
                            <p className="mb-0">{cmsData.mission_vision?.mission || "To provide reliable, high-quality construction and real estate services to our clients in Rwanda, helping individuals, families, and businesses achieve their property goals through transparent, professional, and client-focused service delivery."}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 fadeIn" data-wow-delay="0.3s">
                    <div className="d-flex align-items-start">
                        <i className="fa fa-eye fa-3x text-primary me-4 mt-1"></i>
                        <div>
                            <h4>Our Vision</h4>
                            <p className="mb-0">{cmsData.mission_vision?.vision || "To become Rwanda's leading construction and property management company, known for building durable, innovative, and affordable structures that stand as a legacy for future generations."}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 fadeIn" data-wow-delay="0.5s">
                    <div className="d-flex align-items-start">
                        <i className="fa fa-handshake fa-3x text-primary me-4 mt-1"></i>
                        <div>
                            <h4>Our Values</h4>
                            <p className="mb-0">{cmsData.mission_vision?.values || "Integrity, quality, and excellence guide every project we undertake. We believe in honest communication, skilled workmanship, and sustainable building practices that benefit our clients and Rwanda's development."}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 fadeIn" data-wow-delay="0.7s">
                    <div className="d-flex align-items-start">
                        <i className="fa fa-award fa-3x text-primary me-4 mt-1"></i>
                        <div>
                            <h4>Our Commitment</h4>
                            <p className="mb-0">{cmsData.mission_vision?.commitment || "We are committed to delivering every project on time, within budget, and beyond expectation. Your satisfaction is our success, and we back every project with our full professional commitment and after-service support."}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>


    <div className="container-fluid bg-light py-5">
        <div className="container py-5">
            <h1 className="mb-5">Our Professional <span className="text-uppercase text-primary bg-light px-2">Team</span>
            </h1>
            <div className="row g-4">
                <div className="col-md-6 col-lg-3 fadeIn" data-wow-delay="0.1s">
                    <div className="team-item position-relative overflow-hidden">
                        <img className="img-fluid w-100" src="img/team-1.jpg" alt="Lead Architect" />
                        <div className="team-overlay">
                            <small className="mb-2">Lead Architect</small>
                            <h4 className="lh-base text-light">Jean Pierre Nkurunziza</h4>
                            <div className="d-flex justify-content-center">
                                <a className="btn btn-outline-primary btn-sm-square border-2 me-2" href="#">
                                    <i className="fab fa-facebook-f"></i>
                                </a>
                                <a className="btn btn-outline-primary btn-sm-square border-2 me-2" href="#">
                                    <i className="fab fa-twitter"></i>
                                </a>
                                <a className="btn btn-outline-primary btn-sm-square border-2 me-2" href="#">
                                    <i className="fab fa-instagram"></i>
                                </a>
                                <a className="btn btn-outline-primary btn-sm-square border-2 me-2" href="#">
                                    <i className="fab fa-linkedin-in"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 col-lg-3 fadeIn" data-wow-delay="0.3s">
                    <div className="team-item position-relative overflow-hidden">
                        <img className="img-fluid w-100" src="img/team-2.jpg" alt="Site Manager" />
                        <div className="team-overlay">
                            <small className="mb-2">Site Manager</small>
                            <h4 className="lh-base text-light">Emmanuel Habimana</h4>
                            <div className="d-flex justify-content-center">
                                <a className="btn btn-outline-primary btn-sm-square border-2 me-2" href="#">
                                    <i className="fab fa-facebook-f"></i>
                                </a>
                                <a className="btn btn-outline-primary btn-sm-square border-2 me-2" href="#">
                                    <i className="fab fa-twitter"></i>
                                </a>
                                <a className="btn btn-outline-primary btn-sm-square border-2 me-2" href="#">
                                    <i className="fab fa-instagram"></i>
                                </a>
                                <a className="btn btn-outline-primary btn-sm-square border-2 me-2" href="#">
                                    <i className="fab fa-linkedin-in"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 col-lg-3 fadeIn" data-wow-delay="0.5s">
                    <div className="team-item position-relative overflow-hidden">
                        <img className="img-fluid w-100" src="img/team-3.jpg" alt="Civil Engineer" />
                        <div className="team-overlay">
                            <small className="mb-2">Civil Engineer</small>
                            <h4 className="lh-base text-light">Diane Uwase</h4>
                            <div className="d-flex justify-content-center">
                                <a className="btn btn-outline-primary btn-sm-square border-2 me-2" href="#">
                                    <i className="fab fa-facebook-f"></i>
                                </a>
                                <a className="btn btn-outline-primary btn-sm-square border-2 me-2" href="#">
                                    <i className="fab fa-twitter"></i>
                                </a>
                                <a className="btn btn-outline-primary btn-sm-square border-2 me-2" href="#">
                                    <i className="fab fa-instagram"></i>
                                </a>
                                <a className="btn btn-outline-primary btn-sm-square border-2 me-2" href="#">
                                    <i className="fab fa-linkedin-in"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 col-lg-3 fadeIn" data-wow-delay="0.7s">
                    <div className="team-item position-relative overflow-hidden">
                        <img className="img-fluid w-100" src="img/team-4.jpg" alt="Property Manager" />
                        <div className="team-overlay">
                            <small className="mb-2">Property Manager</small>
                            <h4 className="lh-base text-light">Eric Mugisha</h4>
                            <div className="d-flex justify-content-center">
                                <a className="btn btn-outline-primary btn-sm-square border-2 me-2" href="#">
                                    <i className="fab fa-facebook-f"></i>
                                </a>
                                <a className="btn btn-outline-primary btn-sm-square border-2 me-2" href="#">
                                    <i className="fab fa-twitter"></i>
                                </a>
                                <a className="btn btn-outline-primary btn-sm-square border-2 me-2" href="#">
                                    <i className="fab fa-instagram"></i>
                                </a>
                                <a className="btn btn-outline-primary btn-sm-square border-2 me-2" href="#">
                                    <i className="fab fa-linkedin-in"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>


    <div className="container-fluid py-5">
        <div className="container py-5">
            <div className="text-center fadeIn" data-wow-delay="0.1s">
                <h1 className="mb-5">Why People <span className="text-uppercase text-primary bg-light px-2">Choose Us</span></h1>
            </div>
            <div className="row g-5 align-items-center text-center">
                <div className="col-md-6 col-lg-4 fadeIn" data-wow-delay="0.1s">
                    <i className="fa fa-calendar-alt fa-5x text-primary mb-4"></i>
                    <h4>Years of Experience</h4>
                    <p className="mb-0">With years of hands-on experience in Rwanda's construction industry, BSNG has the expertise to handle projects of any scale — from single homes to large commercial developments.</p>
                </div>
                <div className="col-md-6 col-lg-4 fadeIn" data-wow-delay="0.3s">
                    <i className="fa fa-tasks fa-5x text-primary mb-4"></i>
                    <h4>Best House Construction</h4>
                    <p className="mb-0">We design and build modern, durable, and beautiful homes tailored to each client's unique vision and budget. Our construction quality is built to last for generations.</p>
                </div>
                <div className="col-md-6 col-lg-4 fadeIn" data-wow-delay="0.5s">
                    <i className="fa fa-pencil-ruler fa-5x text-primary mb-4"></i>
                    <h4>Expert Renovation</h4>
                    <p className="mb-0">We breathe new life into old spaces. Whether it's a partial makeover or a complete building renovation, our team delivers outstanding results every time.</p>
                </div>
                <div className="col-md-6 col-lg-4 fadeIn" data-wow-delay="0.1s">
                    <i className="fa fa-user fa-5x text-primary mb-4"></i>
                    <h4>Client Satisfaction</h4>
                    <p className="mb-0">Every project we undertake is driven by our commitment to exceeding client expectations. We maintain open communication throughout every phase of the work.</p>
                </div>
                <div className="col-md-6 col-lg-4 fadeIn" data-wow-delay="0.3s">
                    <i className="fa fa-hand-holding-usd fa-5x text-primary mb-4"></i>
                    <h4>Property Rental</h4>
                    <p className="mb-0">Looking for a property to rent? BSNG manages a portfolio of high-quality residential and commercial properties available for rent at competitive rates in Kigali.</p>
                </div>
                <div className="col-md-6 col-lg-4 fadeIn" data-wow-delay="0.5s">
                    <i className="fa fa-map-marked-alt fa-5x text-primary mb-4"></i>
                    <h4>Plot Sales</h4>
                    <p className="mb-0">We offer verified and legally cleared plots in prime locations across Rwanda, helping clients invest wisely in land and secure their future real estate assets.</p>
                </div>
            </div>
        </div>
    </div>


    <div className="container-fluid bg-primary newsletter p-0">
        <div className="container p-0">
            <div className="row g-0 align-items-center">
                <div className="col-md-5 ps-lg-0 text-start fadeIn" data-wow-delay="0.2s">
                    <img className="img-fluid w-100" src={homeCms.newsletter?.bg_image || "img/newsletter.jpg"} alt="BSNG Newsletter" />
                </div>
                <div className="col-md-7 py-5 newsletter-text fadeIn" data-wow-delay="0.5s">
                    <div className="p-5">
                        <h1 className="mb-5">{homeCms.newsletter?.title || <>Subscribe to Our <span className="text-uppercase text-primary bg-white px-2">Newsletter</span></>}</h1>
                        <div className="position-relative w-100 mb-2">
                            <input className="form-control border-0 w-100 ps-4 pe-5" type="email"
                                placeholder="Enter Your Email Address" style={{ height: '60px' }} />
                            <button type="button" className="btn shadow-none position-absolute top-0 end-0 mt-2 me-2"><i
                                    className="fa fa-paper-plane text-primary fs-4"></i></button>
                        </div>
                        <p className="mb-0">{homeCms.newsletter?.desc || "Stay updated with our latest projects, property listings, and construction tips."}</p>
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
                    <p className="mb-4">{homeCms.footer?.tagline || "Build Strong For Next Generations (BSNG) — Your trusted partner in construction, real estate, and property management in Rwanda."}</p>
                    <a className="btn btn-primary border-2 px-4" href="/contact">Contact Us</a>
                </div>
                <div className="col-md-6 col-lg-4 fadeIn" data-wow-delay="0.3s">
                    <h5 className="text-white mb-4">Get In Touch</h5>
                    <p><i className="fa fa-map-marker-alt me-3"></i>{homeCms.footer?.address || "Kibagabaga, Kigali, Rwanda"}</p>
                    <p><i className="fa fa-phone-alt me-3"></i>{homeCms.footer?.phone || "+250 737 213 060"}</p>
                    <p className="d-flex align-items-center"><i className="fa fa-envelope me-2 flex-shrink-0"></i><span>{homeCms.footer?.email || "info.buildstronggenerations@gmail.com"}</span></p>
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
