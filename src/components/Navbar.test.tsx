import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import Navbar from './Navbar'

function renderNavbar() {
  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  )
}

describe('Navbar', () => {
  it('renders the brand name', () => {
    renderNavbar()
    expect(screen.getByText('RocketDashboard')).toBeInTheDocument()
  })

  it('renders Telemetry link', () => {
    renderNavbar()
    expect(screen.getByText('Telemetry')).toHaveAttribute('href', '/telemetry/')
  })

  it('renders API link pointing to /api/', () => {
    renderNavbar()
    const apiLink = screen.getByText('API')
    expect(apiLink).toHaveAttribute('href', '/api/')
    expect(apiLink).toHaveAttribute('target', '_blank')
  })

  it('renders brand link to home', () => {
    renderNavbar()
    expect(screen.getByText('RocketDashboard').closest('a')).toHaveAttribute('href', '/')
  })
})
