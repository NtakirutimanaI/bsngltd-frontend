import React, { useState } from 'react';

const updates = [
  {
    id: 1,
    category: 'Project News',
    badge: 'bg-primary',
    icon: 'fa-hard-hat',
    date: 'April 10, 2026',
    title: 'New Residential Complex Break-ground in Kibagabaga',
    summary:
      'BSNG Construction officially broke ground on our newest residential complex located in Kibagabaga, Kigali. The development will feature 24 modern units with all amenities, scheduled for completion in late 2026.',
    image: 'img/project-1.jpg',
  },
  {
    id: 2,
    category: 'Plot Sales',
    badge: 'bg-success',
    icon: 'fa-map-marked-alt',
    date: 'March 28, 2026',
    title: '10 New Plots Available in Gasabo District',
    summary:
      'We are pleased to announce 10 new prime plots are now available for sale in the Gasabo District, Kigali. All plots are legally cleared with full ownership documentation. Contact us today to schedule a viewing.',
    image: 'img/project-2.jpg',
  },
  {
    id: 3,
    category: 'Renovation',
    badge: 'bg-warning text-dark',
    icon: 'fa-tools',
    date: 'March 15, 2026',
    title: 'Commercial Office Renovation Completed for Client in Nyarugenge',
    summary:
      'Our team successfully completed the full renovation of a 3-floor commercial office building in Nyarugenge. The project was delivered on time and the client expressed exceptional satisfaction with the results.',
    image: 'img/project-3.jpg',
  },
  {
    id: 4,
    category: 'Company News',
    badge: 'bg-info text-dark',
    icon: 'fa-building',
    date: 'March 5, 2026',
    title: 'BSNG Expands Services to Include Full Interior Design',
    summary:
      'We are excited to announce the expansion of our service offerings to include comprehensive interior design. This new capability allows BSNG to provide complete turn-key solutions — from construction to furnished interiors.',
    image: 'img/about-1.jpg',
  },
  {
    id: 5,
    category: 'Property Rental',
    badge: 'bg-danger',
    icon: 'fa-key',
    date: 'February 20, 2026',
    title: '5 Properties Now Available for Rent in Kigali',
    summary:
      'BSNG now has 5 high-quality residential properties available for immediate rental in Kigali. Units range from 2-bedroom apartments to 4-bedroom family homes. All properties are fully furnished upon request.',
    image: 'img/project-4.jpg',
  },
  {
    id: 6,
    category: 'Achievement',
    badge: 'bg-secondary',
    icon: 'fa-award',
    date: 'February 8, 2026',
    title: 'BSNG Recognized as a Top Construction Company in Rwanda',
    summary:
      'We are proud to share that Build Strong For Next Generations (BSNG) has been recognized among Rwanda\'s top emerging construction firms. This recognition reflects our team\'s dedication to quality, client satisfaction, and national development.',
    image: 'img/about-2.jpg',
  },
];

const categories = ['All', 'Project News', 'Plot Sales', 'Renovation', 'Company News', 'Property Rental', 'Achievement'];

const SharedNav = () => (
  <div className="container-fluid sticky-top">
    <div className="container">
      <nav className="navbar navbar-expand-lg navbar-light border-bottom border-2 border-white">
        <a href="/" className="navbar-brand">
          <h1 className="d-flex align-items-center m-0"><img src="/img/logo.png" alt="BSNG Logo" style={{ height: '45px', marginRight: '10px' }} />BSNG</h1>
        </a>
        <button type="button" className="navbar-toggler ms-auto me-0" data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarCollapse">
          <div className="navbar-nav ms-auto">
            <a href="/" className="nav-item nav-link">Home</a>
            <a href="/about" className="nav-item nav-link">About</a>
            <a href="/service" className="nav-item nav-link">Services</a>
            <a href="/project" className="nav-item nav-link">Projects</a>
            <a href="/updates" className="nav-item nav-link active">Updates</a>
            <a href="/contact" className="nav-item nav-link">Contact</a>
          </div>
        </div>
      </nav>
    </div>
  </div>
);

export default function Updates() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [updatesData, setUpdatesData] = useState(updates);

  React.useEffect(() => {
    fetch('http://localhost:4000/api/updates')
      .then(r => r.json())
      .then(data => {
        if (data && data.length > 0) {
          // Normalize backend fields if needed
          const formatted = data.map(update => ({
            id: update.id,
            category: update.category || 'Company News',
            badge: 'bg-primary',
            icon: 'fa-building',
            date: update.date ? new Date(update.date).toLocaleDateString() : 'Recent',
            title: update.title,
            summary: update.content || update.summary,
            image: update.imageUrl || 'img/about-1.jpg',
          }));
          setUpdatesData(formatted);
        }
      })
      .catch(console.error);
  }, []);

  const filtered = activeCategory === 'All'
    ? updatesData
    : updatesData.filter(u => u.category === activeCategory);

  return (
    <>
      <SharedNav />

      {/* Hero Header */}
      <div className="container-fluid pb-5 bg-primary hero-header" style={{ paddingTop: '80px' }}>
        <div className="container py-5">
          <div className="row g-3 align-items-center">
            <div className="col-lg-6 text-center text-lg-start">
              <h1 className="display-1 mb-0 slideInLeft">Updates</h1>
            </div>
            <div className="col-lg-6 slideInRight">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb justify-content-center justify-content-lg-end mb-0">
                  <li className="breadcrumb-item"><a className="text-primary" href="/">Home</a></li>
                  <li className="breadcrumb-item text-secondary active" aria-current="page">Updates</li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Updates Section */}
      <div className="container-fluid py-5">
        <div className="container py-5">

          {/* Section Header */}
          <div className="text-center mb-5 fadeIn">
            <h1 className="mb-3">
              Latest <span className="text-uppercase text-primary bg-light px-2">News &amp; Updates</span>
            </h1>
            <p className="text-muted" style={{ maxWidth: '600px', margin: '0 auto' }}>
              Stay informed about our latest projects, new property listings, company milestones, and construction insights from the BSNG team.
            </p>
          </div>

          {/* Category Filter */}
          <div className="d-flex flex-wrap justify-content-center gap-2 mb-5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`btn btn-sm rounded-pill px-4 py-2 fw-semibold border-2 ${
                  activeCategory === cat
                    ? 'btn-primary'
                    : 'btn-outline-primary'
                }`}
                style={{ transition: 'all 0.25s ease' }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Update Cards */}
          <div className="row g-4">
            {filtered.map((item, idx) => (
              <div className="col-md-6 col-lg-4 fadeIn" key={item.id} data-wow-delay={`${0.1 * (idx + 1)}s`}>
                <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
                  }}
                >
                  {/* Card Image */}
                  <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-100 h-100"
                      style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
                    />
                    {/* Category Badge */}
                    <span className={`badge ${item.badge} position-absolute`} style={{ top: '12px', left: '12px', fontSize: '0.75rem', padding: '6px 12px', borderRadius: '20px' }}>
                      <i className={`fa ${item.icon} me-1`}></i> {item.category}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <i className="fa fa-calendar-alt text-primary me-2" style={{ fontSize: '0.85rem' }}></i>
                      <small className="text-muted">{item.date}</small>
                    </div>
                    <h5 className="card-title fw-bold mb-3" style={{ lineHeight: '1.4', color: '#1a1a2e' }}>
                      {item.title}
                    </h5>
                    <p className="card-text text-muted mb-0" style={{ fontSize: '0.93rem', lineHeight: '1.65' }}>
                      {item.summary}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="card-footer bg-transparent border-0 px-4 pb-4">
                    <a href="/contact" className="btn btn-outline-primary btn-sm rounded-pill px-4">
                      Learn More <i className="fa fa-arrow-right ms-1"></i>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filtered.length === 0 && (
            <div className="text-center py-5">
              <i className="fa fa-inbox fa-4x text-muted mb-3"></i>
              <h5 className="text-muted">No updates in this category yet.</h5>
              <p className="text-muted">Check back soon for more news from BSNG Construction.</p>
            </div>
          )}

          {/* CTA Banner */}
          <div className="row mt-5">
            <div className="col-12">
              <div className="p-5 rounded-3 text-white text-center" style={{ background: 'linear-gradient(135deg, #f77f00 0%, #d62828 100%)' }}>
                <h3 className="fw-bold mb-2">Have a Project or Inquiry?</h3>
                <p className="mb-4 opacity-75">Our team is ready to help you build, renovate, or find the perfect property in Rwanda.</p>
                <div className="d-flex justify-content-center gap-3 flex-wrap">
                  <a href="/contact" className="btn btn-light text-primary fw-semibold px-4 py-2 rounded-pill">
                    <i className="fa fa-envelope me-2"></i>Contact Us
                  </a>
                  <a href="tel:+250737213060" className="btn btn-outline-light fw-semibold px-4 py-2 rounded-pill">
                    <i className="fa fa-phone me-2"></i>+250 737 213 060
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Newsletter */}
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
                  <button type="button" className="btn shadow-none position-absolute top-0 end-0 mt-2 me-2">
                    <i className="fa fa-paper-plane text-primary fs-4"></i>
                  </button>
                </div>
                <p className="mb-0">Stay updated with our latest projects, property listings, and construction tips.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
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
