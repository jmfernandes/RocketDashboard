import { TelemetryEntry } from '../../types'
import TelemetryRow from './TelemetryRow'

interface TelemetryTableProps {
  entries: TelemetryEntry[]
  loading: boolean
  editingId: number | null
  onStartEdit: (id: number) => void
  onSaveEdit: (id: number, data: Omit<TelemetryEntry, 'id'>) => Promise<void>
  onCancelEdit: () => void
  onDelete: (id: number) => void
}

export default function TelemetryTable({
  entries,
  loading,
  editingId,
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
            <th>Satellite ID</th>
            <th>Timestamp</th>
            <th>Altitude (km)</th>
            <th>Velocity (km/s)</th>
            <th>Health Status</th>
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
