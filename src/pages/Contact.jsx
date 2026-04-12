import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function Contact() {
  const [cmsData, setCmsData] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bsng_cms_contact')) || {}; } catch { return {}; }
  });
  const [homeCms, setHomeCms] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bsng_cms_home')) || {}; } catch { return {}; }
  });

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    fetch(`${apiUrl}/cms/contact`).then(r => r.json()).then(data => {
      setCmsData(data); try { localStorage.setItem('bsng_cms_contact', JSON.stringify(data)); } catch {}
    }).catch(console.error);
    fetch(`${apiUrl}/cms/home`).then(r => r.json()).then(data => {
      setHomeCms(data); try { localStorage.setItem('bsng_cms_home', JSON.stringify(data)); } catch {}
    }).catch(console.error);
  }, []);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', service: '', subject: '', message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiUrl}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        toast.success('Your message has been sent successfully!');
        setFormData({ name: '', email: '', phone: '', service: '', subject: '', message: '' });
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Network error. Please try again later.');
    }
    setIsSubmitting(false);
  };

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
                        <a href="/project" className="nav-item nav-link">Projects</a>
                        <a href="/updates" className="nav-item nav-link">Updates</a>
                        <a href="/contact" className="nav-item nav-link active">Contact</a>
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
                    <h1 className="display-1 mb-0 slideInLeft">Contact Us</h1>
                </div>
                <div className="col-lg-6 slideInRight">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb justify-content-center justify-content-lg-end mb-0">
                            <li className="breadcrumb-item"><a className="text-primary" href="/">Home</a></li>
                            <li className="breadcrumb-item text-secondary active" aria-current="page">Contact</li>
                        </ol>
                    </nav>
                </div>
            </div>
        </div>
    </div>


    <div className="container-fluid py-4">
        <div className="container py-3">
            <div className="row g-3">
                <div className="col-lg-5 fadeIn" data-wow-delay="0.1s">
                    <h5 className="mb-2">{cmsData.contact_info?.title ? cmsData.contact_info.title.split(' ')[0] : "Get In"} <span className="text-uppercase text-primary bg-light px-2">{cmsData.contact_info?.title ? cmsData.contact_info.title.substring(cmsData.contact_info.title.indexOf(' ')+1) : "Touch"}</span></h5>
                    <p className="mb-3" style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>{cmsData.contact_info?.desc || "We are always ready to hear from you. Whether you have a project in mind, need a consultation, or want to rent or buy a property, our team is here to help."}</p>
                    <div className="d-flex align-items-center mb-2">
                        <div className="btn-square flex-shrink-0 bg-primary me-2" style={{ width: '30px', height: '30px' }}>
                            <i className="fa fa-map-marker-alt text-white" style={{ fontSize: '0.75rem' }}></i>
                        </div>
                        <div>
                            <h6 className="mb-0" style={{ fontSize: '0.82rem' }}>Our Office Location</h6>
                            <span style={{ fontSize: '0.78rem' }}>{cmsData.contact_info?.address || "Kibagabaga, Kigali, Rwanda"}</span>
                        </div>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                        <div className="btn-square flex-shrink-0 bg-primary me-2" style={{ width: '30px', height: '30px' }}>
                            <i className="fa fa-phone-alt text-white" style={{ fontSize: '0.75rem' }}></i>
                        </div>
                        <div>
                            <h6 className="mb-0" style={{ fontSize: '0.82rem' }}>Call Us Anytime</h6>
                            <span style={{ fontSize: '0.78rem' }}>{cmsData.contact_info?.phone || "+250 737 213 060"}</span>
                        </div>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                        <div className="btn-square flex-shrink-0 bg-primary me-2" style={{ width: '30px', height: '30px' }}>
                            <i className="fa fa-envelope text-white" style={{ fontSize: '0.75rem' }}></i>
                        </div>
                        <div>
                            <h6 className="mb-0" style={{ fontSize: '0.82rem' }}>Send Us an Email</h6>
                            <span style={{ fontSize: '0.78rem' }}>{cmsData.contact_info?.email || "info.buildstronggenerations@gmail.com"}</span>
                        </div>
                    </div>
                    <div className="d-flex align-items-center">
                        <div className="btn-square flex-shrink-0 bg-primary me-2" style={{ width: '30px', height: '30px' }}>
                            <i className="fa fa-clock text-white" style={{ fontSize: '0.75rem' }}></i>
                        </div>
                        <div>
                            <h6 className="mb-0" style={{ fontSize: '0.82rem' }}>Working Hours</h6>
                            <span style={{ fontSize: '0.78rem' }}>{cmsData.contact_info?.hours || "Monday – Saturday: 7:00 AM – 6:00 PM"}</span>
                        </div>
                    </div>
                </div>
                <div className="col-lg-7 fadeIn" data-wow-delay="0.3s">
                    <h5 className="mb-2">{cmsData.contact_info?.form_title || <>Have Any <span className="text-uppercase text-primary bg-light px-2">Query?</span> Contact Us</>}</h5>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-2">
                            <div className="col-md-6">
                                <div className="form-floating form-floating-sm">
                                    <input type="text" className="form-control" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Your Name" style={{ height: '42px', fontSize: '0.82rem' }} required />
                                    <label htmlFor="name" style={{ fontSize: '0.78rem' }}>Your Full Name</label>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-floating form-floating-sm">
                                    <input type="email" className="form-control" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="Your Email" style={{ height: '42px', fontSize: '0.82rem' }} required />
                                    <label htmlFor="email" style={{ fontSize: '0.78rem' }}>Your Email Address</label>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-floating form-floating-sm">
                                    <input type="tel" className="form-control" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="Your Phone" style={{ height: '42px', fontSize: '0.82rem' }} />
                                    <label htmlFor="phone" style={{ fontSize: '0.78rem' }}>Your Phone Number</label>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-floating form-floating-sm">
                                    <select className="form-select" id="service" name="service" value={formData.service} onChange={handleChange} style={{ height: '42px', fontSize: '0.82rem' }}>
                                        <option value="">Select a service...</option>
                                        <option value="construction">House Construction</option>
                                        <option value="plot">Plot Sales</option>
                                        <option value="rental">Property Rental</option>
                                        <option value="renovation">Renovation</option>
                                        <option value="brokerage">Brokerage</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <label htmlFor="service" style={{ fontSize: '0.78rem' }}>Service of Interest</label>
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="form-floating form-floating-sm">
                                    <input type="text" className="form-control" id="subject" name="subject" value={formData.subject} onChange={handleChange} placeholder="Subject" style={{ height: '42px', fontSize: '0.82rem' }} required />
                                    <label htmlFor="subject" style={{ fontSize: '0.78rem' }}>Subject</label>
                                </div>
                            </div>
                            <div className="col-12">
                                <div className="form-floating form-floating-sm">
                                    <textarea className="form-control" placeholder="Tell us about your project or inquiry" id="message" name="message" value={formData.message} onChange={handleChange} style={{ height: '90px', fontSize: '0.82rem' }} required></textarea>
                                    <label htmlFor="message" style={{ fontSize: '0.78rem' }}>Your Message</label>
                                </div>
                            </div>
                            <div className="col-12">
                                <button className="btn btn-primary w-100 py-2" type="submit" disabled={isSubmitting} style={{ fontSize: '0.85rem' }}>
                                    {isSubmitting ? 'Sending...' : 'Send Message'} &nbsp;<i className="fa fa-paper-plane"></i>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>


    <div className="container-fluid py-0 px-0">
        <iframe
            title="BSNG Office Location - Kibagabaga, Kigali"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.4814706043326!2d30.11329!3d-1.93545!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca7b2a4d10d0b%3A0x5f9b7d4e4c44a08c!2sKibagabaga%2C%20Kigali%2C%20Rwanda!5e0!3m2!1sen!2srw!4v1712800000000"
            style={{ width: '100%', height: '450px', border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade">
        </iframe>
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
