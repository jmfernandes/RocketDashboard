import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import AddEntryForm from './AddEntryForm'

function getSubmitButton() {
  return screen.getAllByRole('button').find((b) => b.getAttribute('type') === 'submit')!
}

describe('AddEntryForm', () => {
  it('renders all form fields', () => {
    render(<AddEntryForm onSubmit={vi.fn()} />)
    expect(screen.getByLabelText('Satellite ID')).toBeInTheDocument()
    expect(screen.getByLabelText('Timestamp')).toBeInTheDocument()
    expect(screen.getByLabelText('Altitude (km)')).toBeInTheDocument()
    expect(screen.getByLabelText('Velocity (km/s)')).toBeInTheDocument()
    expect(screen.getByLabelText('Status')).toBeInTheDocument()
  })

  it('renders the Add New Telemetry Entry header', () => {
    render(<AddEntryForm onSubmit={vi.fn()} />)
    expect(screen.getByText('Add New Telemetry Entry')).toBeInTheDocument()
  })

  it('calls onSubmit with form data', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<AddEntryForm onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText('Satellite ID'), 'SAT-005')
    await userEvent.type(screen.getByLabelText('Timestamp'), '2025-06-15T10:30:00')
    await userEvent.type(screen.getByLabelText('Altitude (km)'), '400')
    await userEvent.type(screen.getByLabelText('Velocity (km/s)'), '7.66')

    const submitBtn = getSubmitButton()
    await userEvent.click(submitBtn!)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          satellite_id: 'SAT-005',
          altitude: 400,
          velocity: 7.66,
          status: 'healthy',
        })
      )
    })
  })

  it('clears the form after successful submission', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<AddEntryForm onSubmit={onSubmit} />)

    const satInput = screen.getByLabelText('Satellite ID')
    await userEvent.type(satInput, 'SAT-005')
    await userEvent.type(screen.getByLabelText('Timestamp'), '2025-06-15T10:30:00')
    await userEvent.type(screen.getByLabelText('Altitude (km)'), '400')
    await userEvent.type(screen.getByLabelText('Velocity (km/s)'), '7.66')

    const submitBtn = getSubmitButton()
    await userEvent.click(submitBtn!)

    await waitFor(() => {
      expect(satInput).toHaveValue('')
    })
  })

  it('shows error banner when onSubmit rejects', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Server validation failed'))
    render(<AddEntryForm onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText('Satellite ID'), 'SAT-001')
    await userEvent.type(screen.getByLabelText('Timestamp'), '2025-06-15T10:30:00')
    await userEvent.type(screen.getByLabelText('Altitude (km)'), '100')
    await userEvent.type(screen.getByLabelText('Velocity (km/s)'), '7')

    const submitBtn = getSubmitButton()
    await userEvent.click(submitBtn!)

    await waitFor(() => {
      expect(screen.getByText('Server validation failed')).toBeInTheDocument()
    })
  })
})
