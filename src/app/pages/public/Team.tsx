import { Link } from 'react-router';

export function Team() {
    return (
        <div className="container-fluid bg-light py-5">
            <div className="container py-5">
                <h1 className="mb-5 text-center">Our professional <span className="text-uppercase text-primary bg-light px-2">Designers</span></h1>
                <div className="row g-4 text-center">
                    <div className="col-md-6 col-lg-3">
                        <img className="img-fluid rounded mb-3" src="/istudio/img/team-1.jpg" alt="" />
                        <h4>Team Member</h4>
                        <p>Architect</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
