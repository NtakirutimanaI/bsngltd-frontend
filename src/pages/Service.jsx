import React, { useState, useEffect } from 'react';

const initialServiceAreas = [
  { id: 1, title: 'Residential Construction', description: 'Full design and construction of single-family homes, duplexes, and apartment buildings. We handle everything from architectural plans to final finishing.', icon: 'fa-home', delay: '0.1s' },
  { id: 2, title: 'Commercial Construction', description: 'Office buildings, retail spaces, warehouses, and mixed-use developments. We build commercial properties that serve businesses and communities effectively.', icon: 'fa-building', delay: '0.2s' },
  { id: 3, title: 'Plot Sales', description: 'We offer verified and legally cleared plots in prime locations across Rwanda, helping clients invest wisely in land for residential or commercial development.', icon: 'fa-map-marked-alt', delay: '0.3s' },
  { id: 4, title: 'Renovation & Remodeling', description: 'We breathe new life into old spaces. Whether it\'s a partial makeover or a complete building renovation, our team delivers outstanding results every time.', icon: 'fa-tools', delay: '0.4s' },
  { id: 5, title: 'Property Rental', description: 'We manage a portfolio of high-quality residential and commercial properties available for rent. We connect the right tenants with the right properties at competitive rates.', icon: 'fa-key', delay: '0.5s' },
  { id: 6, title: 'Real Estate Brokerage', description: 'Professional brokerage services to guide buyers and sellers through smooth, legally compliant property transactions. We represent your interests with expertise and integrity.', icon: 'fa-handshake', delay: '0.6s' },
];

const initialTestimonials = [
  { id: 1, serviceName: 'House Construction', content: "BSNG built our family home in Kibagabaga and we couldn't be happier. The team was professional, transparent about costs, and delivered the project exactly on schedule. The quality of the work is exceptional!", clientName: 'Marie Claire Uwimana', imageUrl: 'img/testimonial-1.jpg' },
  { id: 2, serviceName: 'Plot Purchase', content: "I purchased a plot through BSNG and the process was smooth and professional. All documents were legally verified, and their team guided me through every step. I strongly recommend their services.", clientName: 'Patrick Nzeyimana', imageUrl: 'img/testimonial-2.jpg' },
  { id: 3, serviceName: 'Renovation Services', content: "BSNG transformed our old office building into a modern workspace. The renovation team was skilled, creative, and completed the work within the agreed timeframe. Truly world-class service in Rwanda.", clientName: 'Solange Mukamana', imageUrl: 'img/testimonial-3.jpg' },
];

export default function Service() {
  const [serviceAreas, setServiceAreas] = useState(initialServiceAreas);
  const [testimonials, setTestimonials] = useState(initialTestimonials);

  useEffect(() => {
    fetch('http://localhost:4000/api/services')
      .then(r => r.json())
      .then(data => {
        if (data && data.length > 0) {
          const formatted = data.map((s, i) => ({
            id: s.id,
            title: s.title || s.name,
            description: s.description || s.summary,
            icon: s.icon || initialServiceAreas[i % 6].icon || 'fa-star',
            delay: `0.${(i % 6) + 1}s`
          }));
          setServiceAreas(formatted);
        }
      })
      .catch(console.error);

    fetch('http://localhost:4000/api/testimonials')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setTestimonials(data.map((t, i) => ({
            ...t,
            imageUrl: t.imageUrl || initialTestimonials[i % 3].imageUrl
          })));
        }
      })
      .catch(console.error);
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
                        <a href="/about" className="nav-item nav-link">About</a>
                        <a href="/service" className="nav-item nav-link active">Services</a>
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
                    <h1 className="display-1 mb-0 slideInLeft">Our Services</h1>
                </div>
                <div className="col-lg-6 slideInRight">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb justify-content-center justify-content-lg-end mb-0">
                            <li className="breadcrumb-item"><a className="text-primary" href="/">Home</a></li>
                            <li className="breadcrumb-item text-secondary active" aria-current="page">Services</li>
                        </ol>
                    </nav>
                </div>
            </div>
        </div>
    </div>


    <div className="container-fluid py-5">
        <div className="container py-5">
            <div className="row g-5 align-items-center">
                <div className="col-lg-5 fadeIn" data-wow-delay="0.1s">
                    <h1 className="mb-5">Our Complete <span
                            className="text-uppercase text-primary bg-light px-2">Construction</span> Services</h1>
                    <p>At BSNG Construction, we offer a full spectrum of construction and real estate services tailored to meet the needs of individuals, businesses, and investors across Rwanda. Our services are built on a foundation of quality, reliability, and genuine care for our clients.</p>
                    <p className="mb-5">Whether you're looking to build your dream home, renovate an existing property, purchase a plot of land, or find tenants for your property, BSNG has the expertise and dedication to deliver exceptional results from start to finish.</p>
                    <div className="d-flex align-items-center bg-light">
                        <div className="btn-square flex-shrink-0 bg-primary" style={{ width: '100px', height: '100px' }}>
                            <i className="fa fa-phone fa-2x text-white"></i>
                        </div>
                        <div className="px-3">
                            <h3>+250 737 213 060</h3>
                            <span>Call us directly for a free consultation — 24/7</span>
                        </div>
                    </div>
                </div>
                <div className="col-lg-7">
                    <div className="row g-0">
                        <div className="col-md-6 fadeIn" data-wow-delay="0.2s">
                            <div className="service-item h-100 d-flex flex-column justify-content-center bg-primary">
                                <a href="#" className="service-img position-relative mb-4">
                                    <img className="img-fluid w-100" src="img/service-1.jpg" alt="House Construction" />
                                    <h3>House Construction</h3>
                                </a>
                                <p className="mb-0">We design and build modern, durable houses tailored to your needs and budget. Our team ensures the highest standards of materials and workmanship from foundation to roof.</p>
                            </div>
                        </div>
                        <div className="col-md-6 fadeIn" data-wow-delay="0.4s">
                            <div className="service-item h-100 d-flex flex-column justify-content-center bg-light">
                                <a href="#" className="service-img position-relative mb-4">
                                    <img className="img-fluid w-100" src="img/service-2.jpg" alt="Property Rental" />
                                    <h3>Property Rental</h3>
                                </a>
                                <p className="mb-0">BSNG manages a growing portfolio of residential and commercial rental properties in Kigali. We help landlords and tenants connect with ease and confidence.</p>
                            </div>
                        </div>
                        <div className="col-md-6 fadeIn" data-wow-delay="0.6s">
                            <div className="service-item h-100 d-flex flex-column justify-content-center bg-light">
                                <a href="#" className="service-img position-relative mb-4">
                                    <img className="img-fluid w-100" src="img/service-3.jpg" alt="Renovation Services" />
                                    <h3>Renovation</h3>
                                </a>
                                <p className="mb-0">Transform your existing space with our expert renovation services. From kitchens and bathrooms to entire buildings, we revitalize properties with precision and style.</p>
                            </div>
                        </div>
                        <div className="col-md-6 fadeIn" data-wow-delay="0.8s">
                            <div className="service-item h-100 d-flex flex-column justify-content-center bg-primary">
                                <a href="#" className="service-img position-relative mb-4">
                                    <img className="img-fluid w-100" src="img/service-4.jpg" alt="Plot Sales and Brokerage" />
                                    <h3>Plot Sales & Brokerage</h3>
                                </a>
                                <p className="mb-0">We sell verified plots of land in prime locations across Rwanda and provide professional brokerage services to guide buyers and sellers toward the best real estate deals.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>


    <div className="container-fluid py-5 bg-light">
        <div className="container py-5">
            <div className="text-center mb-5 fadeIn" data-wow-delay="0.1s">
                <h1>All Our <span className="text-uppercase text-primary bg-light px-2">Service Areas</span></h1>
                <p className="mt-3">BSNG Construction covers every aspect of construction and real estate you need in Rwanda</p>
            </div>
            <div className="row g-4">
                {serviceAreas.map(service => (
                    <div key={service.id} className="col-md-6 col-lg-4 fadeIn" data-wow-delay={service.delay}>
                        <div className="d-flex align-items-start p-4 bg-white shadow-sm h-100">
                            <i className={`fa ${service.icon} fa-3x text-primary me-4 mt-1`}></i>
                            <div>
                                <h5>{service.title}</h5>
                                <p className="mb-0">{service.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>


    <div className="container-xxl pb-5">
        <div className="container pb-5">
            <div className="row justify-content-center">
                <div className="col-md-12 col-lg-9">
                    <div className="owl-carousel testimonial-carousel fadeIn" data-wow-delay="0.2s">
                        {testimonials.map((testimonial, i) => (
                            <div key={testimonial.id || i} className="testimonial-item">
                                <div className="row g-5 align-items-center">
                                    <div className="col-md-6">
                                        <div className="testimonial-img">
                                            <img className="img-fluid" src={testimonial.imageUrl} alt={testimonial.clientName} />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="testimonial-text pb-5 pb-md-0">
                                            <h3>{testimonial.serviceName}</h3>
                                            <p>{testimonial.content}</p>
                                            <h5 className="mb-0">{testimonial.clientName}</h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>


    <div className="container-fluid bg-primary newsletter p-0">
        <div className="container p-0">
            <div className="row g-0 align-items-center">
                <div className="col-md-5 ps-lg-0 text-start fadeIn" data-wow-delay="0.2s">
                    <img className="img-fluid w-100" src="img/newsletter.jpg" alt="BSNG Newsletter" />
                </div>
                <div className="col-md-7 py-5 newsletter-text fadeIn" data-wow-delay="0.5s">
                    <div className="p-5">
                        <h1 className="mb-5">Subscribe to Our <span className="text-uppercase text-primary bg-white px-2">Newsletter</span></h1>
                        <div className="position-relative w-100 mb-2">
                            <input className="form-control border-0 w-100 ps-4 pe-5" type="email"
                                placeholder="Enter Your Email Address" style={{ height: '60px' }} />
                            <button type="button" className="btn shadow-none position-absolute top-0 end-0 mt-2 me-2"><i
                                    className="fa fa-paper-plane text-primary fs-4"></i></button>
                        </div>
                        <p className="mb-0">Stay updated with our latest projects, property listings, and construction tips.</p>
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
                    <p className="mb-4">Build Strong For Next Generations (BSNG) — Your trusted partner in construction, real estate, and property management in Rwanda.</p>
                    <a className="btn btn-primary border-2 px-4" href="/contact">Contact Us</a>
                </div>
                <div className="col-md-6 col-lg-4 fadeIn" data-wow-delay="0.3s">
                    <h5 className="text-white mb-4">Get In Touch</h5>
                    <p><i className="fa fa-map-marker-alt me-3"></i>Kibagabaga, Kigali, Rwanda</p>
                    <p><i className="fa fa-phone-alt me-3"></i>+250 737 213 060</p>
                    <p className="d-flex align-items-center"><i className="fa fa-envelope me-2 flex-shrink-0"></i><span>info.buildstronggenerations@gmail.com</span></p>
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
