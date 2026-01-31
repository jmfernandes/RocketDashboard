export type HealthStatus = 'healthy' | 'warning' | 'critical'

export interface TelemetryEntry {
  id: number
  satellite_id: string
  timestamp: string
  altitude: number
  velocity: number
  status: HealthStatus
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface TelemetryFilters {
  satellite_id: string
  status: string
}
