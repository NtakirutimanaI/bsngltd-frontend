import React, { useState, useEffect } from 'react';

const initialProjects = [
  { id: 1, title: 'Kitchen', category: '72 Projects', image: 'img/project-1.jpg' },
  { id: 2, title: 'Bathroom', category: '67 Projects', image: 'img/project-2.jpg' },
  { id: 3, title: 'Bedroom', category: '53 Projects', image: 'img/project-3.jpg' },
  { id: 4, title: 'Living Room', category: '33 Projects', image: 'img/project-4.jpg' },
  { id: 5, title: 'Furniture', category: '87 Projects', image: 'img/project-5.jpg' },
  { id: 6, title: 'Renovation', category: '69 Projects', image: 'img/project-6.jpg' },
];

const initialTestimonials = [
  { id: 1, serviceName: 'House Construction', content: "BSNG built our family home in Kibagabaga and we couldn't be happier. The team was professional, transparent about costs, and delivered the project exactly on schedule.", clientName: 'Marie Claire Uwimana', imageUrl: 'img/testimonial-1.jpg' },
  { id: 2, serviceName: 'Plot Purchase', content: "I purchased a plot through BSNG and the process was smooth and professional. All documents were legally verified, and their team guided me through every step.", clientName: 'Patrick Nzeyimana', imageUrl: 'img/testimonial-2.jpg' },
  { id: 3, serviceName: 'Renovation Services', content: "BSNG transformed our old office building into a modern workspace. The renovation team was skilled, creative, and completed the work within the agreed timeframe.", clientName: 'Solange Mukamana', imageUrl: 'img/testimonial-3.jpg' },
];

export default function Project() {
  const [projectsData, setProjectsData] = useState(initialProjects);
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [cmsData, setCmsData] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bsng_cms_projects')) || {}; } catch { return {}; }
  });
  const [homeCms, setHomeCms] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bsng_cms_home')) || {}; } catch { return {}; }
  });

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    fetch(`${apiUrl}/cms/projects`).then(r => r.json()).then(data => {
      setCmsData(data); try { localStorage.setItem('bsng_cms_projects', JSON.stringify(data)); } catch {}
    }).catch(console.error);
    fetch(`${apiUrl}/cms/home`).then(r => r.json()).then(data => {
      setHomeCms(data); try { localStorage.setItem('bsng_cms_home', JSON.stringify(data)); } catch {}
    }).catch(console.error);

    fetch('http://localhost:4000/api/projects')
      .then(r => r.json())
      .then(data => {
        if (data && data.length > 0) {
          const formatted = data.map(p => ({
            id: p.id,
            title: p.title,
            category: p.description || 'Project',
            image: p.imageUrl || 'img/project-1.jpg'
          }));
          setProjectsData(formatted);
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
                        <a href="/service" className="nav-item nav-link">Services</a>
                        <a href="/project" className="nav-item nav-link active">Projects</a>
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
                    <h1 className="display-1 mb-0 slideInLeft">Projects</h1>
                </div>
                <div className="col-lg-6 slideInRight">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb justify-content-center justify-content-lg-end mb-0">
                            <li className="breadcrumb-item"><a className="text-primary" href="/">Home</a></li>
                            <li className="breadcrumb-item text-secondary active" aria-current="page">Projects</li>
                        </ol>
                    </nav>
                </div>
            </div>
        </div>
    </div>


    <div className="container-fluid py-5">
        <div className="container py-5">
            <div className="row g-0">
                <div className="col-lg-5 fadeIn" data-wow-delay="0.1s">
                    <div className="d-flex flex-column justify-content-center bg-primary h-100 p-5">
                        <h1 className="text-white mb-5">{cmsData.projects_header?.title || <>Our Latest <span className="text-uppercase text-primary bg-light px-2">Projects</span></>}</h1>
                        <h4 className="text-white mb-0"><span className="display-1">{projectsData.length}</span> {cmsData.projects_header?.subtitle || "of our latest projects"}</h4>
                    </div>
                </div>
                <div className="col-lg-7">
                    <div className="row g-0">
                        {projectsData.map((project, i) => (
                            <div key={project.id} className="col-md-6 col-lg-4 fadeIn" data-wow-delay={`0.${(i%6)+2}s`}>
                                <div className="project-item position-relative overflow-hidden">
                                    <img className="img-fluid w-100" src={project.image} alt={project.title} />
                                    <a className="project-overlay text-decoration-none" href="#">
                                        <h4 className="text-white">{project.title}</h4>
                                        <small className="text-white">{project.category}</small>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
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
