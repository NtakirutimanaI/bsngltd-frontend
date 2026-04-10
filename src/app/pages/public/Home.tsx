import { useState, useEffect } from 'react';
import { fetchApi } from '@/app/api/client';
import { getImageUrl } from '@/app/api/client';
import { Link } from 'react-router';

export function Home() {
    const [properties, setProperties] = useState<any[]>([]);

    useEffect(() => {
        fetchApi<any[]>('/properties').then(data => setProperties(data.slice(0, 6))).catch(console.error);
    }, []);

    return (
        <>
            {/* Hero Start */}
            <div className="container-fluid pb-5 hero-header bg-light mb-5">
                <div className="container py-5">
                    <div className="row g-5 align-items-center mb-5">
                        <div className="col-lg-6">
                            <h1 className="display-1 mb-4 animated slideInRight">Build <span style={{ color: '#16a085' }}>Strong</span> For Next Generations</h1>
                            <h5 className="d-inline-block border border-2 border-white py-3 px-5 mb-0 animated slideInRight">
                                A Leading Construction Company Since 1990</h5>
                        </div>
                        <div className="col-lg-6">
                            <div className="owl-carousel header-carousel animated fadeIn">
                                <img className="img-fluid" src="/istudio/img/hero-slider-1.jpg" alt="" />
                                <img className="img-fluid" src="/istudio/img/hero-slider-2.jpg" alt="" />
                                <img className="img-fluid" src="/istudio/img/hero-slider-3.jpg" alt="" />
                            </div>
                        </div>
                    </div>
                    <div className="row g-5 animated fadeIn">
                        <div className="col-md-6 col-lg-3">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0 btn-square border border-2 border-white me-3">
                                    <i className="fa fa-hard-hat" style={{ color: '#16a085' }}></i>
                                </div>
                                <h5 className="lh-base mb-0">Structural Excellence</h5>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0 btn-square border border-2 border-white me-3">
                                    <i className="fa fa-building" style={{ color: '#16a085' }}></i>
                                </div>
                                <h5 className="lh-base mb-0">Sustainable Infrastructure</h5>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0 btn-square border border-2 border-white me-3">
                                    <i className="fa fa-drafting-compass" style={{ color: '#16a085' }}></i>
                                </div>
                                <h5 className="lh-base mb-0">Civil Engineering</h5>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0 btn-square border border-2 border-white me-3">
                                    <i className="fa fa-wallet" style={{ color: '#16a085' }}></i>
                                </div>
                                <h5 className="lh-base mb-0">Cost-Effective Builds</h5>
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
                                    <img className="img-fluid" src="/istudio/img/about-1.jpg" alt="" />
                                </div>
                                <div className="col-6 wow fadeIn" data-wow-delay="0.3s">
                                    <img className="img-fluid h-75" src="/istudio/img/about-2.jpg" alt="" />
                                    <div className="h-25 d-flex align-items-center text-center px-4" style={{ backgroundColor: '#16a085' }}>
                                        <h4 className="text-white lh-base mb-0">Premier Construction Since 1990</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 wow fadeIn" data-wow-delay="0.5s">
                            <h1 className="mb-5"><span className="text-uppercase bg-light px-2" style={{ color: '#16a085' }}>History</span> of BSNG LTD</h1>
                            <p className="mb-4">BSNG (Build Strong For Next Generations) started as a small civil engineering firm and grew into a nationwide leader in the construction industry. We pride ourselves on delivering robust, safe, and innovative structures that stand the test of time.</p>
                            <p className="mb-5">Our commitment to excellence and sustainability ensures that every project we undertake contributes positively to the community and the environment for years to come.</p>
                            <div className="row g-3">
                                <div className="col-sm-6">
                                    <h6 className="mb-3"><i className="fa fa-check me-2" style={{ color: '#16a085' }}></i>ISO Certified</h6>
                                    <h6 className="mb-0"><i className="fa fa-check me-2" style={{ color: '#16a085' }}></i>Expert Engineers</h6>
                                </div>
                                <div className="col-sm-6">
                                    <h6 className="mb-3"><i className="fa fa-check me-2" style={{ color: '#16a085' }}></i>On-Site Safety</h6>
                                    <h6 className="mb-0"><i className="fa fa-check me-2" style={{ color: '#16a085' }}></i>Fixed Deadlines</h6>
                                </div>
                            </div>
                            <div className="d-flex align-items-center mt-5">
                                <Link className="btn text-white px-4 me-2" to="/about" style={{ backgroundColor: '#16a085' }}>Learn More</Link>
                                <a className="btn btn-outline-primary btn-square border-2 me-2" href=""><i className="fab fa-facebook-f"></i></a>
                                <a className="btn btn-outline-primary btn-square border-2 me-2" href=""><i className="fab fa-twitter"></i></a>
                                <a className="btn btn-outline-primary btn-square border-2 me-2" href=""><i className="fab fa-instagram"></i></a>
                                <a className="btn btn-outline-primary btn-square border-2" href=""><i className="fab fa-linkedin-in"></i></a>
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
                        <h1 className="mb-5">Why Clients <span className="text-uppercase bg-light px-2" style={{ color: '#16a085' }}>Choose BSNG</span></h1>
                    </div>
                    <div className="row g-5 align-items-center text-center">
                        <div className="col-md-6 col-lg-4 wow fadeIn" data-wow-delay="0.1s">
                            <i className="fa fa-tools fa-5x mb-4" style={{ color: '#16a085' }}></i>
                            <h4>30+ Years Legacy</h4>
                            <p className="mb-0">A rich history of delivering complex infrastructure projects across the region with uncompromised quality.</p>
                        </div>
                        <div className="col-md-6 col-lg-4 wow fadeIn" data-wow-delay="0.3s">
                            <i className="fa fa-city fa-5x mb-4" style={{ color: '#16a085' }}></i>
                            <h4>Structural Integrity</h4>
                            <p className="mb-0">We focus on the core strength of our builds, ensuring they remain safe and functional for multiple generations.</p>
                        </div>
                        <div className="col-md-6 col-lg-4 wow fadeIn" data-wow-delay="0.5s">
                            <i className="fa fa-pencil-ruler fa-5x mb-4" style={{ color: '#16a085' }}></i>
                            <h4>Modern Engineering</h4>
                            <p className="mb-0">Using state-of-the-art BIM and construction technologies to optimize resource usage and site safety.</p>
                        </div>
                        <div className="col-md-6 col-lg-4 wow fadeIn" data-wow-delay="0.1s">
                            <i className="fa fa-handshake fa-5x mb-4" style={{ color: '#16a085' }}></i>
                            <h4>Client Trust</h4>
                            <p className="mb-0">Building long-term relationships through transparency, reliability, and delivering on our promises.</p>
                        </div>
                        <div className="col-md-6 col-lg-4 wow fadeIn" data-wow-delay="0.3s">
                            <i className="fa fa-coins fa-5x mb-4" style={{ color: '#16a085' }}></i>
                            <h4>Value Engineering</h4>
                            <p className="mb-0">Providing the best value for your investment without ever compromising on the quality of materials.</p>
                        </div>
                        <div className="col-md-6 col-lg-4 wow fadeIn" data-wow-delay="0.5s">
                            <i className="fa fa-leaf fa-5x mb-4" style={{ color: '#16a085' }}></i>
                            <h4>Green Building</h4>
                            <p className="mb-0">Advocating for and implementing sustainable construction methods to reduce carbon footprints.</p>
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
                            <div className="d-flex flex-column justify-content-center h-100 p-5" style={{ backgroundColor: '#16a085' }}>
                                <h1 className="text-white mb-5">Our Latest <span className="text-uppercase bg-light px-2" style={{ color: '#16a085' }}>Developments</span></h1>
                                <h4 className="text-white mb-0"><span className="display-1">6</span> Major Site Projects</h4>
                            </div>
                        </div>
                        <div className="col-lg-7">
                            <div className="row g-0">
                                {properties.map((p, i) => (
                                    <div key={p.id} className="col-md-6 col-lg-4 wow fadeIn" data-wow-delay={`${0.2 + (i * 0.1)}s`}>
                                        <div className="project-item position-relative overflow-hidden">
                                            <img className="img-fluid w-100" src={getImageUrl(p.images?.[0] || `/istudio/img/project-${(i % 6) + 1}.jpg`)} alt="" style={{ height: '250px', objectFit: 'cover' }} />
                                            <Link className="project-overlay text-decoration-none" to={`/properties/${p.id}`}>
                                                <h4 className="text-white">{p.title}</h4>
                                                <small className="text-white">{p.status}</small>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
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
                            <h1 className="mb-5">Our Construction <span className="text-uppercase bg-light px-2" style={{ color: '#16a085' }}>Experts</span></h1>
                            <p>From residential complexes to industrial hubs, BSNG provides comprehensive construction solutions tailored to meet the highest safety and quality standards.</p>
                            <div className="d-flex align-items-center bg-light">
                                <div className="btn-square flex-shrink-0" style={{ width: '100px', height: '100px', backgroundColor: '#16a085' }}>
                                    <i className="fa fa-phone fa-2x text-white"></i>
                                </div>
                                <div className="px-3">
                                    <h3>+250 123 456 789</h3>
                                    <span>Contact us for a professional project consultation</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-7">
                            <div className="row g-0">
                                <div className="col-md-6 wow fadeIn" data-wow-delay="0.2s">
                                    <div className="service-item h-100 d-flex flex-column justify-content-center" style={{ backgroundColor: '#16a085' }}>
                                        <div className="service-img position-relative mb-4">
                                            <img className="img-fluid w-100" src="/istudio/img/service-1.jpg" alt="" />
                                            <h3 className="text-white">Structural Design</h3>
                                        </div>
                                        <p className="mb-0 text-white p-3">Engineered for durability, our structural designs ensure stability and safety for every type of building.</p>
                                    </div>
                                </div>
                                <div className="col-md-6 wow fadeIn" data-wow-delay="0.4s">
                                    <div className="service-item h-100 d-flex flex-column justify-content-center bg-light">
                                        <div className="service-img position-relative mb-4">
                                            <img className="img-fluid w-100" src="/istudio/img/service-2.jpg" alt="" />
                                            <h3>Site Management</h3>
                                        </div>
                                        <p className="mb-0 p-3">Our expert site managers oversee every detail to ensure tasks are completed safely and on schedule.</p>
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
                    <h1 className="mb-5">Our Expert <span className="text-uppercase bg-light px-2" style={{ color: '#16a085' }}>Engineers</span></h1>
                    <div className="row g-4">
                        {[1, 2, 3, 4].map((id) => (
                            <div key={id} className="col-md-6 col-lg-3 wow fadeIn" data-wow-delay={`${0.1 * id}s`}>
                                <div className="team-item position-relative overflow-hidden">
                                    <img className="img-fluid w-100" src={`/istudio/img/team-${id}.jpg`} alt="" />
                                    <div className="team-overlay">
                                        <small className="mb-2 text-white" style={{ backgroundColor: '#16a085' }}>Site Engineer</small>
                                        <h4 className="lh-base text-light">Professional Member {id}</h4>
                                        <div className="d-flex justify-content-center">
                                            <a className="btn btn-outline-primary btn-sm-square border-2 me-2" href=""><i className="fab fa-facebook-f"></i></a>
                                            <a className="btn btn-outline-primary btn-sm-square border-2 me-2" href=""><i className="fab fa-twitter"></i></a>
                                            <a className="btn btn-outline-primary btn-sm-square border-2 me-2" href=""><i className="fab fa-instagram"></i></a>
                                            <a className="btn btn-outline-primary btn-sm-square border-2" href=""><i className="fab fa-linkedin-in"></i></a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* Team End */}

            {/* Testimonial Start */}
            <div className="container-xxl py-5">
                <div className="container py-5">
                    <div className="row justify-content-center text-center">
                        <div className="col-md-12 col-lg-9">
                            <h1 className="mb-5">What Our <span className="text-uppercase bg-light px-2" style={{ color: '#16a085' }}>Partners</span> Say</h1>
                            <div className="owl-carousel testimonial-carousel wow fadeIn" data-wow-delay="0.2s">
                                <div className="testimonial-item bg-light p-4 rounded">
                                    <div className="row g-5 align-items-center">
                                        <div className="col-md-6">
                                            <img className="img-fluid" src="/istudio/img/testimonial-1.jpg" alt="" />
                                        </div>
                                        <div className="col-md-6 text-start">
                                            <h3>Structural Reliability</h3>
                                            <p>BSNG's commitment to building strong for the next generations is evident in every brick laid and every beam raised.</p>
                                            <h5 className="mb-0">Johnathan Doe</h5>
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
            <div className="container-fluid newsletter p-0 bg-light" style={{ borderLeft: '10px solid #16a085' }}>
                <div className="container p-0">
                    <div className="row g-0 align-items-center">
                        <div className="col-md-5 ps-lg-0 text-start wow fadeIn" data-wow-delay="0.2s">
                            <img className="img-fluid w-100" src="/istudio/img/newsletter.jpg" alt="" style={{ height: '400px', objectFit: 'cover' }} />
                        </div>
                        <div className="col-md-7 py-5 newsletter-text wow fadeIn" data-wow-delay="0.5s">
                            <div className="p-5">
                                <h1 className="mb-5">Get the Latest <span className="text-uppercase text-white px-2" style={{ backgroundColor: '#16a085' }}>Project Updates</span></h1>
                                <div className="position-relative w-100 mb-2">
                                    <input className="form-control border-0 w-100 ps-4 pe-5" type="text"
                                        placeholder="Enter Your Email" style={{ height: '60px' }} />
                                    <button type="button" className="btn shadow-none position-absolute top-0 end-0 mt-2 me-2"><i
                                        className="fa fa-paper-plane fs-4" style={{ color: '#16a085' }}></i></button>
                                </div>
                                <p className="mb-0">Stay updated on our latest infrastructural developments and community projects.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Newsletter End */}
        </>
    );
}
