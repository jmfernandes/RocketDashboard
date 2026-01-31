import { Link, useLocation } from 'react-router-dom'

export default function NotFoundPage() {
  const location = useLocation()

  return (
    <div className="row justify-content-center">
      <div className="col-md-8 text-center">
        <div className="py-5">
          <h1 className="display-1 fw-bold text-muted">404</h1>
          <h2 className="mb-4">
            <i className="fas fa-satellite text-danger me-2"></i>
            Signal Lost
          </h2>
          <p className="lead text-muted mb-4">
            Houston, we have a problem. The page you're looking for has drifted
            out of orbit and cannot be reached by any of our ground stations.
          </p>
          <hr className="my-4" />
          <p className="text-muted">
            Last known coordinates: <code>{location.pathname}</code>
          </p>
          <Link to="/" className="btn btn-primary mt-3">
            <i className="fas fa-rocket me-2"></i>Return to Mission Control
          </Link>
        </div>
      </div>
    </div>
  )
}
