import { Link } from 'react-router';

export function Services() {
    return (
        <>
            <div className="container-fluid pb-5 bg-primary hero-header">
                <div className="container py-5">
                    <div className="row g-3 align-items-center">
                        <div className="col-lg-6 text-center text-lg-start">
                            <h1 className="display-1 mb-0 animated slideInLeft">Services</h1>
                        </div>
                        <div className="col-lg-6 animated slideInRight">
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb justify-content-center justify-content-lg-end mb-0">
                                    <li className="breadcrumb-item"><Link className="text-primary" to="/">Home</Link></li>
                                    <li className="breadcrumb-item active text-secondary" aria-current="page">Services</li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container-fluid py-5">
                <div className="container py-5">
                    <div className="row g-5 align-items-center">
                        <div className="col-lg-5 wow fadeIn" data-wow-delay="0.1s">
                            <h1 className="mb-5">Our Creative <span className="text-uppercase text-primary bg-light px-2">Services</span></h1>
                            <p>Aliqu diam amet diam et eos labore. Clita erat ipsum et lorem et sit, sed stet no labore lorem sit. Sanctus clita duo justo et tempor eirmod magna dolore erat amet</p>
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
                                            <img className="img-fluid w-100" src="/istudio/img/service-1.jpg" alt="" />
                                            <h3>Interior Design</h3>
                                        </div>
                                        <p className="mb-0 text-white p-3">Erat ipsum justo amet duo et elitr dolor, est duo duo eos lorem sed diam stet diam sed stet lorem.</p>
                                    </div>
                                </div>
                                <div className="col-md-6 wow fadeIn" data-wow-delay="0.4s">
                                    <div className="service-item h-100 d-flex flex-column justify-content-center bg-light">
                                        <div className="service-img position-relative mb-4">
                                            <img className="img-fluid w-100" src="/istudio/img/service-2.jpg" alt="" />
                                            <h3>Implement</h3>
                                        </div>
                                        <p className="mb-0 p-3">Erat ipsum justo amet duo et elitr dolor, est duo duo eos lorem sed diam stet diam sed stet lorem.</p>
                                    </div>
                                </div>
                                <div className="col-md-6 wow fadeIn" data-wow-delay="0.6s">
                                    <div className="service-item h-100 d-flex flex-column justify-content-center bg-light">
                                        <div className="service-img position-relative mb-4">
                                            <img className="img-fluid w-100" src="/istudio/img/service-3.jpg" alt="" />
                                            <h3>Renovation</h3>
                                        </div>
                                        <p className="mb-0 p-3">Erat ipsum justo amet duo et elitr dolor, est duo duo eos lorem sed diam stet diam sed stet lorem.</p>
                                    </div>
                                </div>
                                <div className="col-md-6 wow fadeIn" data-wow-delay="0.8s">
                                    <div className="service-item h-100 d-flex flex-column justify-content-center bg-primary">
                                        <div className="service-img position-relative mb-4">
                                            <img className="img-fluid w-100" src="/istudio/img/service-4.jpg" alt="" />
                                            <h3>Commercial</h3>
                                        </div>
                                        <p className="mb-0 text-white p-3">Erat ipsum justo amet duo et elitr dolor, est duo duo eos lorem sed diam stet diam sed stet lorem.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
