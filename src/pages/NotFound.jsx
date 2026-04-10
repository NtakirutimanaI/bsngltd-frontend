import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';

const NotFound = () => {
    return (
        <React.Fragment>
            <Breadcrumb title="404 Error" />
            
            {/* 404 Start */}
            <div className="container-fluid py-5 wow fadeIn" data-wow-delay="0.1s">
                <div className="container text-center py-5">
                    <div className="row justify-content-center">
                        <div className="col-lg-6">
                            <i className="bi bi-exclamation-triangle display-1 text-primary"></i>
                            <h1 className="display-1">404</h1>
                            <h1 className="mb-4">Page Not Found</h1>
                            <p className="mb-4">We’re sorry, the page you have looked for does not exist in our website! Maybe go to our home page or try to use a search?</p>
                            <Link className="btn btn-primary py-3 px-4" to="/">Go Back To Home</Link>
                        </div>
                    </div>
                </div>
            </div>
            {/* 404 End */}
        </React.Fragment>
    );
};

export default NotFound;
