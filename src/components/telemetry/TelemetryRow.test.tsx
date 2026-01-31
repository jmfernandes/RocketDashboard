import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { TelemetryEntry } from '../../types'
import TelemetryRow from './TelemetryRow'

const mockEntry: TelemetryEntry = {
  id: 1,
  satellite_id: 'SAT-001',
  timestamp: '2025-01-15T12:00:00Z',
  altitude: 500.0,
  velocity: 7.5,
  status: 'healthy',
}

const defaultProps = {
  entry: mockEntry,
  isEditing: false,
  onStartEdit: vi.fn(),
  onSaveEdit: vi.fn(),
  onCancelEdit: vi.fn(),
  onDelete: vi.fn(),
}

function renderRow(props = {}) {
  return render(
    <table>
      <tbody>
        <TelemetryRow {...defaultProps} {...props} />
      </tbody>
    </table>
  )
}

describe('TelemetryRow - view mode', () => {
  it('displays satellite ID', () => {
    renderRow()
    expect(screen.getByText('SAT-001')).toBeInTheDocument()
  })

  it('displays formatted altitude', () => {
    renderRow()
    expect(screen.getByText('500.00')).toBeInTheDocument()
  })

  it('displays formatted velocity', () => {
    renderRow()
    expect(screen.getByText('7.50')).toBeInTheDocument()
  })

  it('displays status badge', () => {
    renderRow()
    expect(screen.getByText('Healthy')).toHaveClass('badge', 'bg-success')
  })

  it('displays warning badge correctly', () => {
    renderRow({ entry: { ...mockEntry, status: 'warning' } })
    expect(screen.getByText('Warning')).toHaveClass('badge', 'bg-warning')
  })

  it('displays critical badge correctly', () => {
    renderRow({ entry: { ...mockEntry, status: 'critical' } })
    expect(screen.getByText('Critical')).toHaveClass('badge', 'bg-danger')
  })

  it('calls onStartEdit when edit button is clicked', async () => {
    const onStartEdit = vi.fn()
    renderRow({ onStartEdit })
    await userEvent.click(screen.getByTitle('Edit'))
    expect(onStartEdit).toHaveBeenCalledWith(1)
  })

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn()
    renderRow({ onDelete })
    await userEvent.click(screen.getByTitle('Delete'))
    expect(onDelete).toHaveBeenCalledWith(1)
  })
})

describe('TelemetryRow - edit mode', () => {
  it('renders input fields when editing', () => {
    renderRow({ isEditing: true })
    expect(screen.getByDisplayValue('SAT-001')).toBeInTheDocument()
    expect(screen.getByDisplayValue('500')).toBeInTheDocument()
    expect(screen.getByDisplayValue('7.5')).toBeInTheDocument()
  })

  it('renders status select with current value', () => {
    renderRow({ isEditing: true })
    const select = screen.getByDisplayValue('Healthy')
    expect(select).toBeInTheDocument()
  })

  it('renders Save and Cancel buttons', () => {
    renderRow({ isEditing: true })
    expect(screen.getByTitle('Save')).toBeInTheDocument()
    expect(screen.getByTitle('Cancel')).toBeInTheDocument()
  })

  it('calls onCancelEdit when cancel is clicked', async () => {
    const onCancelEdit = vi.fn()
    renderRow({ isEditing: true, onCancelEdit })
    await userEvent.click(screen.getByTitle('Cancel'))
    expect(onCancelEdit).toHaveBeenCalledOnce()
  })

  it('calls onSaveEdit with updated data when save is clicked', async () => {
    const onSaveEdit = vi.fn().mockResolvedValue(undefined)
    renderRow({ isEditing: true, onSaveEdit })

    const altitudeInput = screen.getByDisplayValue('500')
    await userEvent.clear(altitudeInput)
    await userEvent.type(altitudeInput, '9000')

    await userEvent.click(screen.getByTitle('Save'))
    expect(onSaveEdit).toHaveBeenCalledWith(1, expect.objectContaining({
      altitude: 9000,
    }))
  })
})
