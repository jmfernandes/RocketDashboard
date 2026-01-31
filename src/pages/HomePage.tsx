import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="row justify-content-center">
      <div className="col-md-8 text-center">
        <div className="py-5">
          <h1 className="display-4 fw-bold mb-4">
            <i className="fas fa-atom text-primary me-3"></i>
            Welcome to RocketDashboard
          </h1>
          <p className="lead text-muted mb-4">
            Monitor satellite telemetry data in real time. View health statuses,
            track altitude and velocity, and manage your satellite fleet.
          </p>
          <Link to="/telemetry/" className="btn btn-primary btn-lg">
            <i className="fas fa-satellite me-2"></i>View Telemetry
          </Link>
        </div>
      </div>
    </div>
  )
}
