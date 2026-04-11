import { Link } from 'react-router';

export function Features() {
    return (
        <div className="container-fluid py-5">
            <div className="container py-5">
                <h1 className="mb-5 text-center">Elite <span className="text-uppercase text-primary bg-light px-2">Features</span></h1>
                <div className="row g-5 align-items-center text-center">
                    <div className="col-md-6 col-lg-4 wow fadeIn" data-wow-delay="0.1s">
                        <i className="fa fa-calendar-alt fa-5x text-primary mb-4"></i>
                        <h4>25+ Years Experience</h4>
                    </div>
                </div>
            </div>
        </div>
    );
}
