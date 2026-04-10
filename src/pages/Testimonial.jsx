import React, { useEffect } from 'react';
import Breadcrumb from '../components/Breadcrumb';

const Testimonial = () => {
    useEffect(() => {
        if (window.jQuery && window.jQuery.fn.owlCarousel) {
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
            <Breadcrumb title="Testimonial" />
            
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
        </React.Fragment>
    );
};

export default Testimonial;
