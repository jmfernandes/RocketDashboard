import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import AlertBanner from './AlertBanner'

describe('AlertBanner', () => {
  it('renders nothing when message is null', () => {
    const { container } = render(<AlertBanner type="danger" message={null} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders danger alert with message', () => {
    render(<AlertBanner type="danger" message="Something went wrong" />)
    expect(screen.getByRole('alert')).toHaveClass('alert-danger')
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders success alert with message', () => {
    render(<AlertBanner type="success" message="Entry added" />)
    expect(screen.getByRole('alert')).toHaveClass('alert-success')
    expect(screen.getByText('Entry added')).toBeInTheDocument()
  })
})
