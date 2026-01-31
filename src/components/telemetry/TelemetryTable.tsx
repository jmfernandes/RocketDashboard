import { TelemetryEntry, SortConfig } from '../../types'
import TelemetryRow from './TelemetryRow'

const SORTABLE_COLUMNS: { field: string; label: string }[] = [
  { field: 'satellite_id', label: 'Satellite ID' },
  { field: 'timestamp', label: 'Timestamp' },
  { field: 'altitude', label: 'Altitude (km)' },
  { field: 'velocity', label: 'Velocity (km/s)' },
  { field: 'status', label: 'Health Status' },
]

interface TelemetryTableProps {
  entries: TelemetryEntry[]
  loading: boolean
  editingId: number | null
  sortConfig: SortConfig
  onSort: (field: string) => void
  onStartEdit: (id: number) => void
  onSaveEdit: (id: number, data: Omit<TelemetryEntry, 'id'>) => Promise<void>
  onCancelEdit: () => void
  onDelete: (id: number) => void
}

export default function TelemetryTable({
  entries,
  loading,
  editingId,
  sortConfig,
  onSort,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}: TelemetryTableProps) {
  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover align-middle">
        <thead className="table-dark">
          <tr>
            {SORTABLE_COLUMNS.map(({ field, label }) => (
              <th
                key={field}
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => onSort(field)}
                aria-sort={
                  sortConfig.field === field
                    ? sortConfig.direction === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                }
              >
                {label}{' '}
                {sortConfig.field === field
                  ? sortConfig.direction === 'asc'
                    ? '▲'
                    : '▼'
                  : ''}
              </th>
            ))}
            <th className="text-center" style={{ width: 140 }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} className="text-center text-muted py-4">
                <i className="fas fa-spinner fa-spin me-2"></i>Loading telemetry
                data...
              </td>
            </tr>
          ) : entries.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center text-muted py-4">
                <i className="fas fa-inbox me-2"></i>No telemetry data found.
              </td>
            </tr>
          ) : (
            entries.map((entry) => (
              <TelemetryRow
                key={entry.id}
                entry={entry}
                isEditing={editingId === entry.id}
                onStartEdit={onStartEdit}
                onSaveEdit={onSaveEdit}
                onCancelEdit={onCancelEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
