import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TelemetryEntry } from '../../types'
import TelemetryTable from './TelemetryTable'

const mockEntries: TelemetryEntry[] = [
  {
    id: 1,
    satellite_id: 'SAT-001',
    timestamp: '2025-01-15T12:00:00Z',
    altitude: 500.0,
    velocity: 7.5,
    status: 'healthy',
  },
  {
    id: 2,
    satellite_id: 'SAT-002',
    timestamp: '2025-01-15T13:00:00Z',
    altitude: 600.0,
    velocity: 8.0,
    status: 'critical',
  },
]

const defaultProps = {
  entries: mockEntries,
  loading: false,
  editingId: null,
  onStartEdit: vi.fn(),
  onSaveEdit: vi.fn(),
  onCancelEdit: vi.fn(),
  onDelete: vi.fn(),
}

describe('TelemetryTable', () => {
  it('renders table headers', () => {
    render(<TelemetryTable {...defaultProps} />)
    expect(screen.getByText('Satellite ID')).toBeInTheDocument()
    expect(screen.getByText('Timestamp')).toBeInTheDocument()
    expect(screen.getByText('Altitude (km)')).toBeInTheDocument()
    expect(screen.getByText('Velocity (km/s)')).toBeInTheDocument()
    expect(screen.getByText('Health Status')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('renders loading state', () => {
    render(<TelemetryTable {...defaultProps} loading={true} entries={[]} />)
    expect(screen.getByText(/Loading telemetry/)).toBeInTheDocument()
  })

  it('renders empty state when no entries', () => {
    render(<TelemetryTable {...defaultProps} entries={[]} />)
    expect(screen.getByText(/No telemetry data found/)).toBeInTheDocument()
  })

  it('renders rows for each entry', () => {
    render(<TelemetryTable {...defaultProps} />)
    expect(screen.getByText('SAT-001')).toBeInTheDocument()
    expect(screen.getByText('SAT-002')).toBeInTheDocument()
  })

  it('passes editingId to the correct row', () => {
    render(<TelemetryTable {...defaultProps} editingId={1} />)
    // Row with id 1 should be in edit mode (has input fields)
    expect(screen.getByDisplayValue('SAT-001')).toBeInTheDocument()
    // Row with id 2 should still be in view mode
    expect(screen.getByText('SAT-002')).toBeInTheDocument()
  })
})
