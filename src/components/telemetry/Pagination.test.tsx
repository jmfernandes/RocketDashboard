import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import Pagination from './Pagination'

describe('Pagination', () => {
  it('renders nothing when totalPages is 1', () => {
    const { container } = render(
      <Pagination
        currentPage={1}
        totalPages={1}
        hasNext={false}
        hasPrevious={false}
        onPageChange={vi.fn()}
      />
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders page buttons for multiple pages', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={3}
        hasNext={true}
        hasPrevious={false}
        onPageChange={vi.fn()}
      />
    )
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('disables Previous button on first page', () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={3}
        hasNext={true}
        hasPrevious={false}
        onPageChange={vi.fn()}
      />
    )
    expect(screen.getByText(/Previous/)).toBeDisabled()
  })

  it('disables Next button on last page', () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={3}
        hasNext={false}
        hasPrevious={true}
        onPageChange={vi.fn()}
      />
    )
    expect(screen.getByText(/Next/)).toBeDisabled()
  })

  it('marks current page as active', () => {
    render(
      <Pagination
        currentPage={2}
        totalPages={3}
        hasNext={true}
        hasPrevious={true}
        onPageChange={vi.fn()}
      />
    )
    expect(screen.getByText('2').closest('li')).toHaveClass('active')
    expect(screen.getByText('1').closest('li')).not.toHaveClass('active')
  })

  it('calls onPageChange with correct page number', async () => {
    const onPageChange = vi.fn()
    render(
      <Pagination
        currentPage={1}
        totalPages={3}
        hasNext={true}
        hasPrevious={false}
        onPageChange={onPageChange}
      />
    )
    await userEvent.click(screen.getByText('2'))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('calls onPageChange for Next button', async () => {
    const onPageChange = vi.fn()
    render(
      <Pagination
        currentPage={1}
        totalPages={3}
        hasNext={true}
        hasPrevious={false}
        onPageChange={onPageChange}
      />
    )
    await userEvent.click(screen.getByText(/Next/))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })
})
