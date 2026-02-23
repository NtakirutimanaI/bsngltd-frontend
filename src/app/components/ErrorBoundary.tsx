import { useRouteError, Link, isRouteErrorResponse } from "react-router";
import { Home, AlertCircle, RefreshCcw } from "lucide-react";

export function ErrorBoundary() {
    const error = useRouteError();
    console.error(error);

    let title = "Unexpected Error";
    let message = "Something went wrong on our end. Please try again later.";
    let status = "500";

    if (isRouteErrorResponse(error)) {
        status = error.status.toString();
        if (error.status === 404) {
            title = "Page Not Found";
            message = "The page you are looking for doesn't exist or has been moved.";
        } else if (error.status === 401) {
            title = "Unauthorized";
            message = "You don't have permission to access this page.";
        } else if (error.status === 503) {
            title = "Service Unavailable";
            message = "Looks like our servers are having a moment. Try again shortly.";
        }
    }

    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-6 text-center">
                        <div className="mb-4">
                            <span className="display-1 fw-bold text-primary opacity-25">{status}</span>
                        </div>
                        <div className="bg-white p-5 rounded-4 shadow-sm">
                            <div className="mb-4 d-inline-block p-4 bg-light rounded-circle text-primary">
                                <AlertCircle size={48} />
                            </div>
                            <h1 className="display-5 fw-bold mb-3">{title}</h1>
                            <p className="lead text-muted mb-5">{message}</p>

                            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                                <Link to="/" className="btn btn-primary px-5 py-3 rounded-pill d-flex align-items-center justify-content-center gap-2">
                                    <Home size={20} />
                                    Back to Home
                                </Link>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="btn btn-outline-primary px-5 py-3 rounded-pill d-flex align-items-center justify-content-center gap-2"
                                >
                                    <RefreshCcw size={20} />
                                    Try Again
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
