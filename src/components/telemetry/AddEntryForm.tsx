import { FormEvent, useState } from 'react'
import { HealthStatus } from '../../types'
import AlertBanner from './AlertBanner'

interface AddEntryFormProps {
  onSubmit: (entry: {
    satellite_id: string
    timestamp: string
    altitude: number
    velocity: number
    status: HealthStatus
  }) => Promise<void>
}

export default function AddEntryForm({ onSubmit }: AddEntryFormProps) {
  const [satelliteId, setSatelliteId] = useState('')
  const [timestamp, setTimestamp] = useState('')
  const [altitude, setAltitude] = useState('')
  const [velocity, setVelocity] = useState('')
  const [status, setStatus] = useState<HealthStatus>('healthy')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const isoTimestamp = new Date(timestamp).toISOString()

    try {
      await onSubmit({
        satellite_id: satelliteId.trim(),
        timestamp: isoTimestamp,
        altitude: parseFloat(altitude),
        velocity: parseFloat(velocity),
        status,
      })
      setSatelliteId('')
      setTimestamp('')
      setAltitude('')
      setVelocity('')
      setStatus('healthy')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add entry.')
    }
  }

  return (
    <div className="card mb-4">
      <div className="card-header bg-dark text-white fw-bold">
        <i className="fas fa-plus me-2"></i>Add New Telemetry Entry
      </div>
      <div className="card-body">
        <AlertBanner type="danger" message={error} />
        <form onSubmit={handleSubmit} className="row g-3 align-items-end">
          <div className="col-md-2">
            <label htmlFor="addSatelliteId" className="form-label">
              Satellite ID
            </label>
            <input
              type="text"
              className="form-control"
              id="addSatelliteId"
              placeholder="SAT-001"
              required
              value={satelliteId}
              onChange={(e) => setSatelliteId(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <label htmlFor="addTimestamp" className="form-label">
              Timestamp
            </label>
            <input
              type="datetime-local"
              className="form-control"
              id="addTimestamp"
              step="1"
              required
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <label htmlFor="addAltitude" className="form-label">
              Altitude (km)
            </label>
            <input
              type="number"
              className="form-control"
              id="addAltitude"
              step="0.01"
              min="0"
              placeholder="400.00"
              required
              value={altitude}
              onChange={(e) => setAltitude(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <label htmlFor="addVelocity" className="form-label">
              Velocity (km/s)
            </label>
            <input
              type="number"
              className="form-control"
              id="addVelocity"
              step="0.01"
              min="0"
              placeholder="7.66"
              required
              value={velocity}
              onChange={(e) => setVelocity(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <label htmlFor="addStatus" className="form-label">
              Status
            </label>
            <select
              className="form-select"
              id="addStatus"
              required
              value={status}
              onChange={(e) => setStatus(e.target.value as HealthStatus)}
            >
              <option value="healthy">Healthy</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div className="col-md-1">
            <button type="submit" className="btn btn-success w-100">
              <i className="fas fa-plus"></i>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
