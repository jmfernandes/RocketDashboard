import { TelemetryFilters } from '../../types'

interface FilterBarProps {
  filters: TelemetryFilters
  satelliteIds: string[]
  onFilterChange: (filters: TelemetryFilters) => void
  onClear: () => void
}

export default function FilterBar({
  filters,
  satelliteIds,
  onFilterChange,
  onClear,
}: FilterBarProps) {
  return (
    <div className="card mb-4">
      <div className="card-body">
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label htmlFor="filterSatelliteId" className="form-label fw-bold">
              Satellite ID
            </label>
            <select
              id="filterSatelliteId"
              className="form-select"
              value={filters.satellite_id}
              onChange={(e) =>
                onFilterChange({ ...filters, satellite_id: e.target.value })
              }
            >
              <option value="">All Satellites</option>
              {satelliteIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label htmlFor="filterStatus" className="form-label fw-bold">
              Health Status
            </label>
            <select
              id="filterStatus"
              className="form-select"
              value={filters.status}
              onChange={(e) =>
                onFilterChange({ ...filters, status: e.target.value })
              }
            >
              <option value="">All Statuses</option>
              <option value="healthy">Healthy</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div className="col-md-4">
            <button onClick={onClear} className="btn btn-outline-secondary">
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
