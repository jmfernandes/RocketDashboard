import { useState } from 'react'
import { HealthStatus, TelemetryEntry } from '../../types'

interface TelemetryRowProps {
  entry: TelemetryEntry
  isEditing: boolean
  onStartEdit: (id: number) => void
  onSaveEdit: (id: number, data: Omit<TelemetryEntry, 'id'>) => Promise<void>
  onCancelEdit: () => void
  onDelete: (id: number) => void
}

function formatTimestamp(isoString: string): string {
  const d = new Date(isoString)
  return (
    d.getFullYear() +
    '-' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getDate()).padStart(2, '0') +
    ' ' +
    String(d.getHours()).padStart(2, '0') +
    ':' +
    String(d.getMinutes()).padStart(2, '0') +
    ':' +
    String(d.getSeconds()).padStart(2, '0')
  )
}

function toDatetimeLocalValue(isoString: string): string {
  const d = new Date(isoString)
  return (
    d.getFullYear() +
    '-' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getDate()).padStart(2, '0') +
    'T' +
    String(d.getHours()).padStart(2, '0') +
    ':' +
    String(d.getMinutes()).padStart(2, '0') +
    ':' +
    String(d.getSeconds()).padStart(2, '0')
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text?: string; label: string }> = {
    healthy: { bg: 'bg-success', label: 'Healthy' },
    warning: { bg: 'bg-warning', text: 'text-dark', label: 'Warning' },
    critical: { bg: 'bg-danger', label: 'Critical' },
  }
  const info = map[status] || { bg: 'bg-secondary', label: status }
  return (
    <span className={`badge ${info.bg} ${info.text || ''}`}>{info.label}</span>
  )
}

export default function TelemetryRow({
  entry,
  isEditing,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}: TelemetryRowProps) {
  const [editData, setEditData] = useState({
    satellite_id: entry.satellite_id,
    timestamp: toDatetimeLocalValue(entry.timestamp),
    altitude: String(entry.altitude),
    velocity: String(entry.velocity),
    status: entry.status,
  })

  async function handleSave() {
    const isoTimestamp = new Date(editData.timestamp).toISOString()
    await onSaveEdit(entry.id, {
      satellite_id: editData.satellite_id.trim(),
      timestamp: isoTimestamp,
      altitude: parseFloat(editData.altitude),
      velocity: parseFloat(editData.velocity),
      status: editData.status as TelemetryEntry['status'],
    })
  }

  if (isEditing) {
    return (
      <tr>
        <td>
          <input
            type="text"
            className="form-control form-control-sm"
            value={editData.satellite_id}
            onChange={(e) =>
              setEditData({ ...editData, satellite_id: e.target.value })
            }
          />
        </td>
        <td>
          <input
            type="datetime-local"
            className="form-control form-control-sm"
            step="1"
            value={editData.timestamp}
            onChange={(e) =>
              setEditData({ ...editData, timestamp: e.target.value })
            }
          />
        </td>
        <td>
          <input
            type="number"
            className="form-control form-control-sm"
            step="0.01"
            min="0"
            value={editData.altitude}
            onChange={(e) =>
              setEditData({ ...editData, altitude: e.target.value })
            }
          />
        </td>
        <td>
          <input
            type="number"
            className="form-control form-control-sm"
            step="0.01"
            min="0"
            value={editData.velocity}
            onChange={(e) =>
              setEditData({ ...editData, velocity: e.target.value })
            }
          />
        </td>
        <td>
          <select
            className="form-select form-select-sm"
            value={editData.status}
            onChange={(e) =>
              setEditData({ ...editData, status: e.target.value as HealthStatus })
            }
          >
            <option value="healthy">Healthy</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </td>
        <td className="text-center">
          <button
            className="btn btn-sm btn-success me-1"
            onClick={handleSave}
            title="Save"
          >
            <i className="fas fa-check"></i>
          </button>
          <button
            className="btn btn-sm btn-secondary"
            onClick={onCancelEdit}
            title="Cancel"
          >
            <i className="fas fa-times"></i>
          </button>
        </td>
      </tr>
    )
  }

  return (
    <tr>
      <td className="fw-bold">{entry.satellite_id}</td>
      <td>{formatTimestamp(entry.timestamp)}</td>
      <td>{entry.altitude.toFixed(2)}</td>
      <td>{entry.velocity.toFixed(2)}</td>
      <td>
        <StatusBadge status={entry.status} />
      </td>
      <td className="text-center">
        <button
          className="btn btn-sm btn-outline-primary me-1"
          onClick={() => onStartEdit(entry.id)}
          title="Edit"
        >
          <i className="fas fa-edit"></i>
        </button>
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={() => onDelete(entry.id)}
          title="Delete"
        >
          <i className="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  )
}
