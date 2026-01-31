import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import TelemetryPage from './TelemetryPage'
import * as api from '../api'

vi.mock('../api')

const mockEntries = [
  {
    id: 1,
    satellite_id: 'SAT-001',
    timestamp: '2025-01-15T12:00:00Z',
    altitude: 500.0,
    velocity: 7.5,
    status: 'healthy' as const,
  },
  {
    id: 2,
    satellite_id: 'SAT-002',
    timestamp: '2025-01-15T13:00:00Z',
    altitude: 600.0,
    velocity: 8.0,
    status: 'critical' as const,
  },
]

const mockResponse = {
  count: 2,
  next: null,
  previous: null,
  results: mockEntries,
}

function renderPage() {
  return render(
    <MemoryRouter>
      <TelemetryPage />
    </MemoryRouter>
  )
}

function getTable() {
  return screen.getByRole('table')
}

beforeEach(() => {
  vi.mocked(api.fetchTelemetry).mockResolvedValue(mockResponse)
  vi.mocked(api.createEntry).mockResolvedValue(mockEntries[0])
  vi.mocked(api.updateEntry).mockResolvedValue(mockEntries[0])
  vi.mocked(api.deleteEntry).mockResolvedValue(undefined)
})

describe('TelemetryPage', () => {
  it('renders the page heading', async () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Satellite Telemetry/)
  })

  it('loads and displays telemetry data in the table', async () => {
    renderPage()
    await waitFor(() => {
      const table = getTable()
      expect(within(table).getByText('SAT-001')).toBeInTheDocument()
      expect(within(table).getByText('SAT-002')).toBeInTheDocument()
    })
  })

  it('shows entry count after loading', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Showing 2 of 2 entries')).toBeInTheDocument()
    })
  })

  it('calls fetchTelemetry on mount with default sort', async () => {
    renderPage()
    await waitFor(() => {
      expect(api.fetchTelemetry).toHaveBeenCalledWith(
        1,
        { satellite_id: '', status: '' },
        '-timestamp'
      )
    })
  })

  it('shows error when fetchTelemetry fails', async () => {
    vi.mocked(api.fetchTelemetry).mockRejectedValueOnce(new Error('Network error'))
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
  })

  it('deletes an entry and shows success', async () => {
    renderPage()
    await waitFor(() => {
      expect(within(getTable()).getByText('SAT-001')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByTitle('Delete')
    await userEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(api.deleteEntry).toHaveBeenCalledWith(1)
    })
    await waitFor(() => {
      expect(screen.getByText('Entry deleted.')).toBeInTheDocument()
    })
  })

  it('shows error when delete fails', async () => {
    vi.mocked(api.deleteEntry).mockRejectedValueOnce(new Error('Delete failed'))
    renderPage()
    await waitFor(() => {
      expect(within(getTable()).getByText('SAT-001')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByTitle('Delete')
    await userEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Delete failed')).toBeInTheDocument()
    })
  })

  it('enters edit mode when edit is clicked', async () => {
    renderPage()
    await waitFor(() => {
      expect(within(getTable()).getByText('SAT-001')).toBeInTheDocument()
    })

    const editButtons = screen.getAllByTitle('Edit')
    await userEvent.click(editButtons[0])

    expect(screen.getByDisplayValue('SAT-001')).toBeInTheDocument()
    expect(screen.getByTitle('Save')).toBeInTheDocument()
    expect(screen.getByTitle('Cancel')).toBeInTheDocument()
  })

  it('exits edit mode when cancel is clicked', async () => {
    renderPage()
    await waitFor(() => {
      expect(within(getTable()).getByText('SAT-001')).toBeInTheDocument()
    })

    await userEvent.click(screen.getAllByTitle('Edit')[0])
    expect(screen.getByTitle('Cancel')).toBeInTheDocument()

    await userEvent.click(screen.getByTitle('Cancel'))
    expect(screen.queryByTitle('Save')).not.toBeInTheDocument()
  })
})
