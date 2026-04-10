import React from 'react';
import Breadcrumb from '../components/Breadcrumb';

const Feature = () => {
    return (
        <React.Fragment>
            <Breadcrumb title="Features" />
            
            {/* Feature Start */}
            <div className="container-fluid py-5">
                <div className="container py-5">
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
        </React.Fragment>
    );
};

export default Feature;
