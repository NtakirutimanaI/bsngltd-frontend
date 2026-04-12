import React, { useState, useEffect } from 'react';

const initialHomeProjects = [
    { id: 1, title: 'Modern Kitchen', category: 'Interior Finishing', image: 'img/project-1.jpg' },
    { id: 2, title: 'Luxury Bathroom', category: 'Renovation', image: 'img/project-2.jpg' },
    { id: 3, title: 'Master Bedroom', category: 'House Construction', image: 'img/project-3.png' },
    { id: 4, title: 'Living Room', category: 'Interior Design', image: 'img/project-4.jpg' },
    { id: 5, title: 'Residential Villa', category: 'New Build', image: 'img/project-5.png' },
    { id: 6, title: 'Full Renovation', category: 'Renovation', image: 'img/project-6.png' },
];

const initialTestimonials = [
    { id: 1, serviceName: 'House Construction', content: "BSNG built our family home in Kibagabaga and we couldn't be happier. The team was professional, transparent about costs, and delivered the project exactly on schedule. The quality of the work is exceptional!", clientName: 'Marie Claire Uwimana', imageUrl: 'img/testimonial-1.jpg' },
    { id: 2, serviceName: 'Plot Purchase', content: "I purchased a plot through BSNG and the process was smooth and professional. All documents were legally verified, and their team guided me through every step. I strongly recommend their services.", clientName: 'Patrick Nzeyimana', imageUrl: 'img/testimonial-2.jpg' },
    { id: 3, serviceName: 'Renovation Services', content: "BSNG transformed our old office building into a modern workspace. The renovation team was skilled, creative, and completed the work within the agreed timeframe. Truly world-class service in Rwanda.", clientName: 'Solange Mukamana', imageUrl: 'img/testimonial-3.jpg' },
];

export default function Home() {
    const [homeProjects, setHomeProjects] = useState(initialHomeProjects);
    const [testimonials, setTestimonials] = useState(initialTestimonials);

    // ── Load CMS data: use localStorage cache first so there is ZERO flash of
    //    default images on page reload. The API fetch runs in the background and
    //    silently updates both state and the cache for next time.
    const [cmsData, setCmsData] = useState(() => {
        try {
            const cached = localStorage.getItem('bsng_cms_home');
            return cached ? JSON.parse(cached) : {};
        } catch {
            return {};
        }
    });

    useEffect(() => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
        // Fetch CMS content — update state AND cache so next load is instant
        fetch(`${apiUrl}/cms/home`)
            .then(r => r.json())
            .then(data => {
                setCmsData(data);
                try { localStorage.setItem('bsng_cms_home', JSON.stringify(data)); } catch { }
            })
            .catch(console.error);

        fetch(`${apiUrl}/projects`)
            .then(r => r.json())
            .then(data => {
                if (data && data.length > 0) {
                    const formatted = data.slice(0, 6).map(p => ({
                        id: p.id,
                        title: p.title,
                        category: p.description || 'Project',
                        image: p.imageUrl || 'img/project-1.jpg'
                    }));
                    setHomeProjects(formatted);
                }
            })
            .catch(console.error);

        fetch(`${apiUrl}/testimonials`)
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
                            <h1 className="d-flex align-items-center m-0"><img src="/img/logo.png" alt="BSNG Logo" style={{ height: '45px', marginRight: '10px', marginLeft: '-10px' }} />BSNG</h1>
                        </a>
                        <button type="button" className="navbar-toggler ms-auto me-0" data-bs-toggle="collapse"
                            data-bs-target="#navbarCollapse">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse" id="navbarCollapse">
                            <div className="navbar-nav ms-auto">
                                <a href="/" className="nav-item nav-link active">Home</a>
                                <a href="/about" className="nav-item nav-link">About</a>
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


            <div className="container-fluid pb-5 hero-header bg-light mb-5">
                <div className="container py-5">
                    <div className="row g-5 align-items-center mb-5">
                        <div className="col-lg-6">
                            <h1 className="display-1 mb-4 slideInRight">{cmsData.hero?.title || <>We Build Your <span className="text-primary">Dream</span> Home</>}</h1>
                            <h5 className="d-inline-block border border-2 border-white py-3 px-5 mb-0 slideInRight">
                                {cmsData.hero?.subtitle || 'Build Strong For Next Generations'}</h5>
                        </div>
                        <div className="col-lg-6">
                            <div className="owl-carousel header-carousel fadeIn">
                                <img className="img-fluid" src={cmsData.hero?.slider_1 || "img/hero-slider-1.png"} alt="BSNG Construction Project" />
                                <img className="img-fluid" src={cmsData.hero?.slider_2 || "img/hero-slider-2.png"} alt="BSNG Plot Sales" />
                                <img className="img-fluid" src={cmsData.hero?.slider_3 || "img/hero-slider-3.png"} alt="BSNG Renovation" />
                            </div>
                        </div>
                    </div>
                    <div className="row g-5 fadeIn">
                        <div className="col-md-6 col-lg-3">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0 btn-square border border-2 border-white me-3">
                                    <i className="fa fa-home text-primary"></i>
                                </div>
                                <h5 className="lh-base mb-0">House Construction</h5>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0 btn-square border border-2 border-white me-3">
                                    <i className="fa fa-map-marked-alt text-primary"></i>
                                </div>
                                <h5 className="lh-base mb-0">Plot Sales</h5>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0 btn-square border border-2 border-white me-3">
                                    <i className="fa fa-tools text-primary"></i>
                                </div>
                                <h5 className="lh-base mb-0">Renovation</h5>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0 btn-square border border-2 border-white me-3">
                                    <i className="fa fa-key text-primary"></i>
                                </div>
                                <h5 className="lh-base mb-0">Property Rental</h5>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <div className="container-fluid py-5">
                <div className="container">
                    <div className="row g-5">
                        <div className="col-lg-6">
                            <div className="row">
                                <div className="col-6 fadeIn" data-wow-delay="0.1s">
                                    <img className="img-fluid" src={cmsData.about?.image_1 || "img/about-1.png"} alt="BSNG Construction Site" />
                                </div>
                                <div className="col-6 fadeIn" data-wow-delay="0.3s">
                                    <img className="img-fluid h-75" src={cmsData.about?.image_2 || "img/about-2.png"} alt="BSNG Building Works" />
                                    <div className="h-25 d-flex align-items-center text-center bg-primary px-4">
                                        <h4 className="text-white lh-base mb-0">Build Strong For Next Generations</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 fadeIn" data-wow-delay="0.5s">
                            <h1 className="mb-5"><span className="text-uppercase text-primary bg-light px-2">History</span> {cmsData.about?.title ? cmsData.about.title.replace('History', '') : 'of Our Creation'}</h1>
                            <p className="mb-4">{cmsData.about?.history || "Build Strong For Next Generations (BSNG) was founded with a clear vision: to deliver world-class construction services in Rwanda. From humble beginnings in Kigali, we have grown into one of the most trusted names in residential and commercial construction, plot sales, and property management."}</p>
                            <p className="mb-5">{cmsData.about?.mission || "Our team of skilled architects, engineers, and construction professionals is committed to delivering every project on time, within budget, and to the highest quality standards. We build more than structures — we build futures for generations to come."}</p>
                            <div className="row g-3">
                                <div className="col-sm-6">
                                    <h6 className="mb-3"><i className="fa fa-check text-primary me-2"></i>Quality Craftsmanship</h6>
                                    <h6 className="mb-0"><i className="fa fa-check text-primary me-2"></i>Expert Professional Team</h6>
                                </div>
                                <div className="col-sm-6">
                                    <h6 className="mb-3"><i className="fa fa-check text-primary me-2"></i>24/7 Client Support</h6>
                                    <h6 className="mb-0"><i className="fa fa-check text-primary me-2"></i>Competitive Pricing</h6>
                                </div>
                            </div>
                            <div className="d-flex align-items-center mt-5">
                                <a className="btn btn-primary px-4 me-2" href="/about">Read More</a>
                                <a className="btn btn-outline-primary btn-square border-2 me-2" href="#"><i className="fab fa-facebook-f"></i></a>
                                <a className="btn btn-outline-primary btn-square border-2 me-2" href="#"><i className="fab fa-twitter"></i></a>
                                <a className="btn btn-outline-primary btn-square border-2 me-2" href="#"><i className="fab fa-instagram"></i></a>
                                <a className="btn btn-outline-primary btn-square border-2" href="#"><i className="fab fa-linkedin-in"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <div className="container-fluid py-5">
                <div className="container">
                    <div className="text-center fadeIn" data-wow-delay="0.1s">
                        <h1 className="mb-5">{cmsData.why_choose_us?.title || <>Why People <span className="text-uppercase text-primary bg-light px-2">Choose Us</span></>}</h1>
                    </div>
                    <div className="row g-5 align-items-center text-center">
                        <div className="col-md-6 col-lg-4 fadeIn" data-wow-delay="0.1s">
                            <i className="fa fa-calendar-alt fa-5x text-primary mb-4"></i>
                            <h4>{cmsData.why_choose_us?.item_1_title || "Years of Experience"}</h4>
                            <p className="mb-0">{cmsData.why_choose_us?.item_1_desc || "With years of hands-on experience in Rwanda's construction industry, BSNG has the expertise to handle projects of any scale — from single homes to large commercial developments."}</p>
                        </div>
                        <div className="col-md-6 col-lg-4 fadeIn" data-wow-delay="0.3s">
                            <i className="fa fa-tasks fa-5x text-primary mb-4"></i>
                            <h4>{cmsData.why_choose_us?.item_2_title || "Best House Construction"}</h4>
                            <p className="mb-0">{cmsData.why_choose_us?.item_2_desc || "We design and build modern, durable, and beautiful homes tailored to each client's unique vision and budget. Our construction quality is built to last for generations."}</p>
                        </div>
                        <div className="col-md-6 col-lg-4 fadeIn" data-wow-delay="0.5s">
                            <i className="fa fa-pencil-ruler fa-5x text-primary mb-4"></i>
                            <h4>{cmsData.why_choose_us?.item_3_title || "Expert Renovation"}</h4>
                            <p className="mb-0">{cmsData.why_choose_us?.item_3_desc || "We breathe new life into old spaces. Whether it's a partial makeover or a complete building renovation, our team delivers outstanding results every time."}</p>
                        </div>
                        <div className="col-md-6 col-lg-4 fadeIn" data-wow-delay="0.1s">
                            <i className="fa fa-user fa-5x text-primary mb-4"></i>
                            <h4>{cmsData.why_choose_us?.item_4_title || "Client Satisfaction"}</h4>
                            <p className="mb-0">{cmsData.why_choose_us?.item_4_desc || "Every project we undertake is driven by our commitment to exceeding client expectations. We maintain open communication throughout every phase of the work."}</p>
                        </div>
                        <div className="col-md-6 col-lg-4 fadeIn" data-wow-delay="0.3s">
                            <i className="fa fa-hand-holding-usd fa-5x text-primary mb-4"></i>
                            <h4>{cmsData.why_choose_us?.item_5_title || "Property Rental"}</h4>
                            <p className="mb-0">{cmsData.why_choose_us?.item_5_desc || "Looking for a property to rent? BSNG manages a portfolio of high-quality residential and commercial properties available for rent at competitive rates in Kigali."}</p>
                        </div>
                        <div className="col-md-6 col-lg-4 fadeIn" data-wow-delay="0.5s">
                            <i className="fa fa-map-marked-alt fa-5x text-primary mb-4"></i>
                            <h4>{cmsData.why_choose_us?.item_6_title || "Plot Sales"}</h4>
                            <p className="mb-0">{cmsData.why_choose_us?.item_6_desc || "We offer verified and legally cleared plots in prime locations across Rwanda, helping clients invest wisely in land and secure their future real estate assets."}</p>
                        </div>
                    </div>
                </div>
            </div>


            <div className="container-fluid mt-5">
                <div className="container mt-5">
                    <div className="row g-0">
                        <div className="col-lg-5 fadeIn" data-wow-delay="0.1s">
                            <div className="d-flex flex-column justify-content-center bg-primary h-100 p-5">
                                <h1 className="text-white mb-5">Our Latest <span
                                    className="text-uppercase text-primary bg-light px-2">Projects</span></h1>
                                <h4 className="text-white mb-0"><span className="display-1">{homeProjects.length}</span> of our latest completed projects</h4>
                            </div>
                        </div>
                        <div className="col-lg-7">
                            <div className="row g-0">
                                {homeProjects.map((project, i) => (
                                    <div key={project.id} className="col-md-6 col-lg-4 fadeIn" data-wow-delay={`0.${(i % 6) + 2}s`}>
                                        <div className="project-item position-relative overflow-hidden">
                                            <img className="img-fluid w-100" src={project.image} alt={project.title} />
                                            <a className="project-overlay text-decoration-none" href="/project">
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


            <div className="container-fluid py-5">
                <div className="container py-5">
                    <div className="row g-5 align-items-center">
                        <div className="col-lg-5 fadeIn" data-wow-delay="0.1s">
                            <h1 className="mb-5">{cmsData.services_header?.title || <>Our Professional <span
                                className="text-uppercase text-primary bg-light px-2">Services</span></>}</h1>
                            <p>{cmsData.services_header?.desc1 || "At BSNG Construction, we offer a comprehensive range of construction and real estate services. Whether you need a brand new home, a plot of land, or a reliable property manager, we have the skills and resources to serve you."}</p>
                            <p className="mb-5">{cmsData.services_header?.desc2 || "From the first consultation to project handover, our dedicated team ensures a seamless, transparent, and satisfying experience. Trust BSNG to bring your vision to life — with quality that stands for generations."}</p>
                            <div className="d-flex align-items-center bg-light">
                                <div className="btn-square flex-shrink-0 bg-primary" style={{ width: '100px', height: '100px' }}>
                                    <i className="fa fa-phone fa-2x text-white"></i>
                                </div>
                                <div className="px-3">
                                    <h3>{cmsData.services_header?.phone || "+250 737 213 060"}</h3>
                                    <span>Call us directly for a free consultation — 24/7</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-7">
                            <div className="row g-0">
                                <div className="col-md-6 fadeIn" data-wow-delay="0.2s">
                                    <div className="service-item h-100 d-flex flex-column justify-content-center bg-primary">
                                        <a href="/service" className="service-img position-relative mb-4">
                                            <img className="img-fluid w-100" src="img/service-1.png" alt="House Construction" />
                                            <h3>House Construction</h3>
                                        </a>
                                        <p className="mb-0">We design and build modern, durable, houses tailored to your needs and budget. Our team ensures the highest standards of materials and workmanship from foundation to roof.</p>
                                    </div>
                                </div>
                                <div className="col-md-6 fadeIn" data-wow-delay="0.4s">
                                    <div className="service-item h-100 d-flex flex-column justify-content-center bg-light">
                                        <a href="/service" className="service-img position-relative mb-4">
                                            <img className="img-fluid w-100" src="img/service-2.png" alt="Property Rental" />
                                            <h3>Property Rental</h3>
                                        </a>
                                        <p className="mb-0">BSNG manages a growing portfolio of residential and commercial rental properties in Kigali. We help landlords and tenants connect with ease and confidence.</p>
                                    </div>
                                </div>
                                <div className="col-md-6 fadeIn" data-wow-delay="0.6s">
                                    <div className="service-item h-100 d-flex flex-column justify-content-center bg-light">
                                        <a href="/service" className="service-img position-relative mb-4">
                                            <img className="img-fluid w-100" src="img/service-3.png" alt="Renovation Services" />
                                            <h3>Renovation</h3>
                                        </a>
                                        <p className="mb-0">Transform your existing space with our expert renovation services. From kitchens and bathrooms to entire buildings, we revitalize properties with precision and style.</p>
                                    </div>
                                </div>
                                <div className="col-md-6 fadeIn" data-wow-delay="0.8s">
                                    <div className="service-item h-100 d-flex flex-column justify-content-center bg-primary">
                                        <a href="/service" className="service-img position-relative mb-4">
                                            <img className="img-fluid w-100" src="img/service-4.png" alt="Plot Sales and Brokerage" />
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


            <div className="container-fluid bg-light py-5">
                <div className="container py-5">
                    <h1 className="mb-5">Our Professional <span className="text-uppercase text-primary bg-light px-2">Team</span>
                    </h1>
                    <div className="row g-4">
                        <div className="col-md-6 col-lg-3 fadeIn" data-wow-delay="0.1s">
                            <div className="team-item position-relative overflow-hidden">
                                <img className="img-fluid w-100" src="img/team-1.png" alt="Lead Architect" />
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
                                <img className="img-fluid w-100" src="img/team-2.png" alt="Site Manager" />
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
                                <img className="img-fluid w-100" src="img/team-3.png" alt="Civil Engineer" />
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
                                <img className="img-fluid w-100" src="img/team-4.png" alt="Property Manager" />
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


            <div className="container-xxl py-5">
                <div className="container py-5">
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
                            <img className="img-fluid w-100" src={cmsData.newsletter?.bg_image || "img/newsletter.jpg"} alt="BSNG Newsletter" />
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
                                <h1 className="text-white d-flex align-items-center m-0"><img src="/img/logo.png" alt="BSNG Logo" style={{ height: '45px', marginRight: '10px', marginLeft: '-10px' }} />BSNG</h1>
                            </a>
                            <p className="mb-4">{cmsData.footer?.tagline || "Build Strong For Next Generations (BSNG) — Your trusted partner in construction, real estate, and property management in Rwanda."}</p>
                            <a className="btn btn-primary border-2 px-4" href="/contact">Contact Us</a>
                        </div>
                        <div className="col-md-6 col-lg-4 fadeIn" data-wow-delay="0.3s">
                            <h5 className="text-white mb-4">Get In Touch</h5>
                            <p><i className="fa fa-map-marker-alt me-3"></i>{cmsData.footer?.address || "Kibagabaga, Kigali, Rwanda"}</p>
                            <p><i className="fa fa-phone-alt me-3"></i>{cmsData.footer?.phone || "+250 737 213 060"}</p>
                            <p className="d-flex align-items-center"><i className="fa fa-envelope me-2 flex-shrink-0"></i><span>{cmsData.footer?.email || "info.buildstronggenerations@gmail.com"}</span></p>
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
