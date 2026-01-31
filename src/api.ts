import { TelemetryEntry, PaginatedResponse, TelemetryFilters } from './types'

const API_BASE = '/api/telemetry/'

export function formatErrors(data: Record<string, unknown>): string {
  if (typeof data === 'string') return data
  if (data.detail) return String(data.detail)
  return Object.entries(data)
    .map(([field, errors]) =>
      `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`
    )
    .join(' | ')
}

async function handleResponse<T>(resp: Response): Promise<T> {
  if (!resp.ok) {
    const data = await resp.json().catch(() => null)
    throw new Error(data ? formatErrors(data) : `Server error: ${resp.status}`)
  }
  return resp.json()
}

export async function fetchTelemetry(
  page: number,
  filters: TelemetryFilters
): Promise<PaginatedResponse<TelemetryEntry>> {
  const params = new URLSearchParams()
  if (filters.satellite_id) params.set('satellite_id', filters.satellite_id)
  if (filters.status) params.set('status', filters.status)
  if (page) params.set('page', String(page))
  const qs = params.toString()
  const url = API_BASE + (qs ? '?' + qs : '')
  const resp = await fetch(url)
  return handleResponse(resp)
}

export async function createEntry(
  body: Omit<TelemetryEntry, 'id'>
): Promise<TelemetryEntry> {
  const resp = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return handleResponse(resp)
}

export async function getEntry(id: number): Promise<TelemetryEntry> {
  const resp = await fetch(`${API_BASE}${id}/`)
  return handleResponse(resp)
}

export async function updateEntry(
  id: number,
  body: Omit<TelemetryEntry, 'id'>
): Promise<TelemetryEntry> {
  const resp = await fetch(`${API_BASE}${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return handleResponse(resp)
}

export async function deleteEntry(id: number): Promise<void> {
  const resp = await fetch(`${API_BASE}${id}/`, { method: 'DELETE' })
  if (!resp.ok) {
    const data = await resp.json().catch(() => null)
    throw new Error(data ? formatErrors(data) : `Server error: ${resp.status}`)
  }
}
