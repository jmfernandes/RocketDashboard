import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import FilterBar from './FilterBar'

const defaultProps = {
  filters: { satellite_id: '', status: '' },
  satelliteIds: ['SAT-001', 'SAT-002', 'SAT-003'],
  onFilterChange: vi.fn(),
  onClear: vi.fn(),
}

describe('FilterBar', () => {
  it('renders satellite ID options', () => {
    render(<FilterBar {...defaultProps} />)
    expect(screen.getByText('All Satellites')).toBeInTheDocument()
    expect(screen.getByText('SAT-001')).toBeInTheDocument()
    expect(screen.getByText('SAT-002')).toBeInTheDocument()
    expect(screen.getByText('SAT-003')).toBeInTheDocument()
  })

  it('renders status options', () => {
    render(<FilterBar {...defaultProps} />)
    expect(screen.getByText('All Statuses')).toBeInTheDocument()
    expect(screen.getByText('Healthy')).toBeInTheDocument()
    expect(screen.getByText('Warning')).toBeInTheDocument()
    expect(screen.getByText('Critical')).toBeInTheDocument()
  })

  it('calls onFilterChange when satellite ID changes', async () => {
    const onFilterChange = vi.fn()
    render(<FilterBar {...defaultProps} onFilterChange={onFilterChange} />)
    await userEvent.selectOptions(screen.getByLabelText('Satellite ID'), 'SAT-002')
    expect(onFilterChange).toHaveBeenCalledWith({ satellite_id: 'SAT-002', status: '' })
  })

  it('calls onFilterChange when status changes', async () => {
    const onFilterChange = vi.fn()
    render(<FilterBar {...defaultProps} onFilterChange={onFilterChange} />)
    await userEvent.selectOptions(screen.getByLabelText('Health Status'), 'critical')
    expect(onFilterChange).toHaveBeenCalledWith({ satellite_id: '', status: 'critical' })
  })

  it('calls onClear when Clear button is clicked', async () => {
    const onClear = vi.fn()
    render(<FilterBar {...defaultProps} onClear={onClear} />)
    await userEvent.click(screen.getByText('Clear'))
    expect(onClear).toHaveBeenCalledOnce()
  })
})
