import { Link } from 'react-router';

export function Testimonial() {
    return (
        <div className="container-xxl py-5">
            <div className="container py-5">
                <div className="row justify-content-center text-center">
                    <div className="col-md-8">
                        <h1 className="mb-5">What Our <span className="text-uppercase text-primary bg-light px-2">Clients</span> Say</h1>
                        <div className="testimonial-item bg-light p-4 rounded">
                            <p className="fs-5 italic">"Excellent work and professional service in every step of the design process."</p>
                            <h5 className="mt-3">- Client Name</h5>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
