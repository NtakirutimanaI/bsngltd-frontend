import { Link } from 'react-router';

export function Contact() {
    return (
        <>
            <div className="container-fluid pb-5 bg-primary hero-header">
                <div className="container py-5">
                    <div className="row g-3 align-items-center">
                        <div className="col-lg-6 text-center text-lg-start">
                            <h1 className="display-1 mb-0 animated slideInLeft">Contact</h1>
                        </div>
                        <div className="col-lg-6 animated slideInRight">
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb justify-content-center justify-content-lg-end mb-0">
                                    <li className="breadcrumb-item"><Link className="text-primary" to="/">Home</Link></li>
                                    <li className="breadcrumb-item active text-secondary" aria-current="page">Contact</li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container-fluid py-5">
                <div className="container py-5">
                    <div className="text-center wow fadeIn" data-wow-delay="0.1s">
                        <h1 className="mb-5">Have Any Query? <span className="text-uppercase text-primary bg-light px-2">Contact Us</span></h1>
                    </div>
                    <div className="row justify-content-center">
                        <div className="col-lg-7">
                            <h4 className="text-center lh-base mb-4">Receive messages instantly with our PHP and Ajax contact form.</h4>
                            <div className="wow fadeIn" data-wow-delay="0.3s">
                                <form>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input type="text" className="form-control" id="name" placeholder="Your Name" />
                                                <label htmlFor="name">Your Name</label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input type="email" className="form-control" id="email" placeholder="Your Email" />
                                                <label htmlFor="email">Your Email</label>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="form-floating">
                                                <input type="text" className="form-control" id="subject" placeholder="Subject" />
                                                <label htmlFor="subject">Subject</label>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="form-floating">
                                                <textarea className="form-control" placeholder="Leave a message here" id="message" style={{ height: '150px' }}></textarea>
                                                <label htmlFor="message">Message</label>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <button className="btn btn-primary w-100 py-3 rounded-pill" type="submit">Send Message</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
