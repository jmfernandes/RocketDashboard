import { describe, it, expect, vi, beforeEach } from 'vitest'
import { formatErrors, fetchTelemetry, createEntry, getEntry, updateEntry, deleteEntry } from './api'

const mockFetch = vi.fn()
global.fetch = mockFetch

beforeEach(() => {
  mockFetch.mockReset()
})

describe('formatErrors', () => {
  it('returns string data directly', () => {
    expect(formatErrors('error' as unknown as Record<string, unknown>)).toBe('error')
  })

  it('returns detail field if present', () => {
    expect(formatErrors({ detail: 'Not found' })).toBe('Not found')
  })

  it('formats field-level errors', () => {
    const result = formatErrors({
      altitude: ['Must be positive.'],
      velocity: ['Must be positive.'],
    })
    expect(result).toBe('altitude: Must be positive. | velocity: Must be positive.')
  })
})

describe('fetchTelemetry', () => {
  it('fetches with filters and page', async () => {
    const mockData = { count: 1, next: null, previous: null, results: [] }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    })

    const result = await fetchTelemetry(2, { satellite_id: 'SAT-001', status: 'healthy' })

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/telemetry/?satellite_id=SAT-001&status=healthy&page=2'
    )
    expect(result).toEqual(mockData)
  })

  it('fetches without empty filters', async () => {
    const mockData = { count: 0, next: null, previous: null, results: [] }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    })

    await fetchTelemetry(1, { satellite_id: '', status: '' })
    expect(mockFetch).toHaveBeenCalledWith('/api/telemetry/?page=1')
  })

  it('throws on error response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ detail: 'Server error' }),
    })

    await expect(fetchTelemetry(1, { satellite_id: '', status: '' }))
      .rejects.toThrow('Server error')
  })

  it('throws generic message when error body is not JSON', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('not json')),
    })

    await expect(fetchTelemetry(1, { satellite_id: '', status: '' }))
      .rejects.toThrow('Server error: 500')
  })
})

describe('createEntry', () => {
  it('sends POST with JSON body', async () => {
    const entry = {
      satellite_id: 'SAT-001',
      timestamp: '2025-01-15T12:00:00Z',
      altitude: 500,
      velocity: 7.5,
      status: 'healthy' as const,
    }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 1, ...entry }),
    })

    const result = await createEntry(entry)
    expect(mockFetch).toHaveBeenCalledWith('/api/telemetry/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    })
    expect(result.id).toBe(1)
  })
})

describe('getEntry', () => {
  it('fetches single entry by ID', async () => {
    const entry = { id: 5, satellite_id: 'SAT-005', timestamp: '2025-01-15T12:00:00Z', altitude: 500, velocity: 7.5, status: 'healthy' }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(entry),
    })

    const result = await getEntry(5)
    expect(mockFetch).toHaveBeenCalledWith('/api/telemetry/5/')
    expect(result.id).toBe(5)
  })
})

describe('updateEntry', () => {
  it('sends PUT with JSON body', async () => {
    const data = {
      satellite_id: 'SAT-001',
      timestamp: '2025-01-15T12:00:00Z',
      altitude: 9000,
      velocity: 7.5,
      status: 'healthy' as const,
    }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 1, ...data }),
    })

    await updateEntry(1, data)
    expect(mockFetch).toHaveBeenCalledWith('/api/telemetry/1/', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  })
})

describe('deleteEntry', () => {
  it('sends DELETE request', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true })

    await deleteEntry(3)
    expect(mockFetch).toHaveBeenCalledWith('/api/telemetry/3/', { method: 'DELETE' })
  })

  it('throws on error response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ detail: 'Not found.' }),
    })

    await expect(deleteEntry(999)).rejects.toThrow('Not found.')
  })
})
