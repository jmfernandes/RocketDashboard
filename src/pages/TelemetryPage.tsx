import { useCallback, useEffect, useRef, useState } from 'react'
import { TelemetryEntry, TelemetryFilters, SortConfig } from '../types'
import * as api from '../api'
import AlertBanner from '../components/telemetry/AlertBanner'
import FilterBar from '../components/telemetry/FilterBar'
import AddEntryForm from '../components/telemetry/AddEntryForm'
import TelemetryTable from '../components/telemetry/TelemetryTable'
import Pagination from '../components/telemetry/Pagination'

export default function TelemetryPage() {
  const [entries, setEntries] = useState<TelemetryEntry[]>([])
  const [count, setCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<TelemetryFilters>({
    satellite_id: '',
    status: '',
  })
  const [satelliteIds, setSatelliteIds] = useState<string[]>([])
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'timestamp',
    direction: 'desc',
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function showError(message: string) {
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
    setError(message)
    errorTimerRef.current = setTimeout(() => setError(null), 8000)
  }

  function showSuccess(message: string) {
    if (successTimerRef.current) clearTimeout(successTimerRef.current)
    setSuccess(message)
    successTimerRef.current = setTimeout(() => setSuccess(null), 4000)
  }

  const ordering =
    sortConfig.direction === 'desc'
      ? `-${sortConfig.field}`
      : sortConfig.field

  const loadData = useCallback(
    async (page: number) => {
      setLoading(true)
      try {
        const data = await api.fetchTelemetry(page, filters, ordering)
        setEntries(data.results)
        setCount(data.count)
        setCurrentPage(page)
        setHasNext(data.next !== null)
        setHasPrevious(data.previous !== null)

        // Accumulate satellite IDs across pages.
        const newIds = data.results.map((e) => e.satellite_id)
        setSatelliteIds((prev) => {
          const combined = new Set([...prev, ...newIds])
          return [...combined].sort()
        })
      } catch (err) {
        showError(err instanceof Error ? err.message : 'Failed to load data.')
      } finally {
        setLoading(false)
      }
    },
    [filters, ordering]
  )

  useEffect(() => {
    loadData(1)
  }, [loadData])

  // Clean up timers on unmount.
  useEffect(() => {
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
      if (successTimerRef.current) clearTimeout(successTimerRef.current)
    }
  }, [])

  async function handleAddEntry(entryData: Omit<TelemetryEntry, 'id'>) {
    await api.createEntry(entryData)
    showSuccess('Telemetry entry added successfully.')
    loadData(currentPage)
  }

  async function handleSaveEdit(
    id: number,
    data: Omit<TelemetryEntry, 'id'>
  ) {
    try {
      await api.updateEntry(id, data)
      showSuccess('Entry updated successfully.')
      setEditingId(null)
      loadData(currentPage)
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update entry.')
    }
  }

  async function handleDelete(id: number) {
    try {
      await api.deleteEntry(id)
      showSuccess('Entry deleted.')
      loadData(currentPage)
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete entry.')
    }
  }

  function handleSort(field: string) {
    setSortConfig((prev) =>
      prev.field === field
        ? { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { field, direction: 'asc' }
    )
  }

  function handleClearFilters() {
    setFilters({ satellite_id: '', status: '' })
  }

  const pageSize = entries.length || 50
  const totalPages = Math.ceil(count / pageSize)

  return (
    <>
      <h1 className="mb-4">
        <i className="fas fa-satellite text-primary me-2"></i>Satellite
        Telemetry
      </h1>

      <AlertBanner type="danger" message={error} />
      <AlertBanner type="success" message={success} />

      <FilterBar
        filters={filters}
        satelliteIds={satelliteIds}
        onFilterChange={setFilters}
        onClear={handleClearFilters}
      />

      <AddEntryForm onSubmit={handleAddEntry} />

      <p className="text-muted mb-3">
        Showing {entries.length} of {count} entries
      </p>

      <TelemetryTable
        entries={entries}
        loading={loading}
        editingId={editingId}
        sortConfig={sortConfig}
        onSort={handleSort}
        onStartEdit={setEditingId}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={() => setEditingId(null)}
        onDelete={handleDelete}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
        onPageChange={(page) => loadData(page)}
      />
    </>
  )
}
