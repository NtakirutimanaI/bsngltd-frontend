import { Link } from 'react-router';

export function About() {
    return (
        <>
            <div className="container-fluid pb-5 bg-primary hero-header">
                <div className="container py-5">
                    <div className="row g-3 align-items-center">
                        <div className="col-lg-6 text-center text-lg-start">
                            <h1 className="display-1 mb-0 animated slideInLeft">About</h1>
                        </div>
                        <div className="col-lg-6 animated slideInRight">
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb justify-content-center justify-content-lg-end mb-0">
                                    <li className="breadcrumb-item"><Link className="text-primary" to="/">Home</Link></li>
                                    <li className="breadcrumb-item active text-secondary" aria-current="page">About</li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container-fluid py-5">
                <div className="container py-5">
                    <div className="row g-5">
                        <div className="col-lg-6">
                            <div className="row">
                                <div className="col-6 wow fadeIn" data-wow-delay="0.1s">
                                    <img className="img-fluid" src="/istudio/img/about-1.jpg" alt="" />
                                </div>
                                <div className="col-6 wow fadeIn" data-wow-delay="0.3s">
                                    <img className="img-fluid h-75" src="/istudio/img/about-2.jpg" alt="" />
                                    <div className="h-25 d-flex align-items-center text-center bg-primary px-4">
                                        <h4 className="text-white lh-base mb-0">Premier Construction Since 1990</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 wow fadeIn" data-wow-delay="0.5s">
                            <h1 className="mb-5"><span className="text-uppercase text-primary bg-light px-2">History</span> of BSNG LTD</h1>
                            <p className="mb-4">BSNG (Build Strong For Next Generations) was founded with a vision to revolutionize the construction landscape by combining traditional robustness with modern engineering innovation. Over the decades, we have successfully delivered hundreds of landmark projects, earning a reputation for reliability and excellence.</p>
                            <p className="mb-5">Our journey is defined by a relentless pursuit of quality, safety, and sustainability, ensuring that every structure we build serves its community for generations to come.</p>
                            <div className="row g-3">
                                <div className="col-sm-6">
                                    <h6 className="mb-3"><i className="fa fa-check text-primary me-2"></i>ISO Certified Excellence</h6>
                                    <h6 className="mb-0"><i className="fa fa-check text-primary me-2"></i>Senior Site Engineers</h6>
                                </div>
                                <div className="col-sm-6">
                                    <h6 className="mb-3"><i className="fa fa-check text-primary me-2"></i>Uncompromising Safety</h6>
                                    <h6 className="mb-0"><i className="fa fa-check text-primary me-2"></i>Transparent Budgeting</h6>
                                </div>
                            </div>
                            <div className="d-flex align-items-center mt-5">
                                <a className="btn btn-primary px-4 me-2" href="">Get Started</a>
                                <a className="btn btn-outline-primary btn-square border-2 me-2" href=""><i className="fab fa-facebook-f"></i></a>
                                <a className="btn btn-outline-primary btn-square border-2 me-2" href=""><i className="fab fa-twitter"></i></a>
                                <a className="btn btn-outline-primary btn-square border-2 me-2" href=""><i className="fab fa-instagram"></i></a>
                                <a className="btn btn-outline-primary btn-square border-2" href=""><i className="fab fa-linkedin-in"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container-fluid bg-light py-5">
                <div className="container py-5">
                    <h1 className="mb-5">Our Expert <span className="text-uppercase text-primary bg-light px-2">Engineers</span></h1>
                    <div className="row g-4 text-center">
                        <div className="col-md-6 col-lg-3">
                            <img className="img-fluid rounded mb-3" src="/istudio/img/team-1.jpg" alt="" />
                            <h4>David Miller</h4>
                            <p>Senior Civil Engineer</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
