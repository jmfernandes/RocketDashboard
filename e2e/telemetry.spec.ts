import { test, expect } from '@playwright/test'

// ---------- Navigation & Routing ----------

test.describe('Navigation', () => {
  test('home page renders welcome content', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Welcome to RocketDashboard'
    )
    await expect(page.getByText('Monitor satellite telemetry')).toBeVisible()
  })

  test('navigate from home to telemetry via button', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /View Telemetry/ }).click()
    await expect(page).toHaveURL('/telemetry/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Satellite Telemetry'
    )
  })

  test('navbar brand links to home', async ({ page }) => {
    await page.goto('/telemetry/')
    await page.getByRole('link', { name: 'RocketDashboard' }).click()
    await expect(page).toHaveURL('/')
  })

  test('navbar Telemetry link works', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Telemetry', exact: true }).click()
    await expect(page).toHaveURL('/telemetry/')
  })

  test('unknown route shows 404 page', async ({ page }) => {
    await page.goto('/nonexistent-page')
    await expect(page.getByText('404')).toBeVisible()
    await expect(page.getByText('Signal Lost')).toBeVisible()
    await expect(page.getByText('/nonexistent-page')).toBeVisible()
  })

  test('404 page return link navigates home', async ({ page }) => {
    await page.goto('/nonexistent-page')
    await page.getByRole('link', { name: /Return to Mission Control/ }).click()
    await expect(page).toHaveURL('/')
  })
})

// ---------- Telemetry Data Display ----------

test.describe('Telemetry data display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/telemetry/')
  })

  test('table loads with entries', async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible()
    // The seeded database has entries — wait for at least one satellite ID to appear
    await expect(page.getByRole('table').getByText(/SAT-/).first()).toBeVisible()
  })

  test('entry count is displayed', async ({ page }) => {
    await expect(page.getByText(/Showing \d+ of \d+ entries/)).toBeVisible()
  })

  test('table has expected column headers', async ({ page }) => {
    const table = page.getByRole('table')
    await expect(table.getByText('Satellite ID')).toBeVisible()
    await expect(table.getByText('Timestamp')).toBeVisible()
    await expect(table.getByText('Altitude (km)')).toBeVisible()
    await expect(table.getByText('Velocity (km/s)')).toBeVisible()
    await expect(table.getByText('Health Status')).toBeVisible()
    await expect(table.getByText('Actions')).toBeVisible()
  })
})

// ---------- Filtering ----------

test.describe('Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/telemetry/')
    // Wait for data to load
    await expect(page.getByText(/Showing \d+ of \d+ entries/)).toBeVisible()
  })

  test('filter by satellite ID', async ({ page }) => {
    await page.locator('#filterSatelliteId').selectOption('SAT-001')
    // Filters apply automatically — wait for table to update
    await expect(page.getByRole('table').locator('tbody tr').first().locator('td').first()).toHaveText('SAT-001')
    const rows = page.getByRole('table').locator('tbody tr')
    const count = await rows.count()
    expect(count).toBeGreaterThan(0)
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i).locator('td').first()).toHaveText('SAT-001')
    }
  })

  test('filter by health status', async ({ page }) => {
    // Record initial count before filtering
    const rows = page.getByRole('table').locator('tbody tr')
    const initialCount = await rows.count()

    await page.locator('#filterStatus').selectOption('healthy')
    // Wait for filtered results to load (count will change since not all entries are healthy)
    await expect(rows).not.toHaveCount(initialCount)

    const count = await rows.count()
    expect(count).toBeGreaterThan(0)
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i).locator('.badge')).toHaveText('Healthy')
    }
  })

  test('clear button resets filters', async ({ page }) => {
    // Apply a filter first
    await page.locator('#filterSatelliteId').selectOption('SAT-001')
    await expect(page.getByRole('table').locator('tbody tr').first().locator('td').first()).toHaveText('SAT-001')

    // Clear the filter
    await page.getByRole('button', { name: 'Clear' }).click()
    // Satellite ID dropdown should reset to "All Satellites"
    await expect(page.locator('#filterSatelliteId')).toHaveValue('')
    await expect(page.locator('#filterStatus')).toHaveValue('')
  })
})

// ---------- CRUD Operations ----------

test.describe('CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/telemetry/')
    await expect(page.getByText(/Showing \d+ of \d+ entries/)).toBeVisible()
  })

  test('create a new entry', async ({ page }) => {
    // Wait for actual data to load (not the initial "0 of 0" state)
    await expect(page.getByRole('table').locator('tbody tr').first()).toBeVisible()
    await expect(page.getByText(/of [1-9]\d* entries/)).toBeVisible()

    // Read initial count
    const countText = await page.getByText(/of [1-9]\d* entries/).textContent()
    const totalBefore = parseInt(countText!.match(/of (\d+)/)?.[1] ?? '0')

    // Fill in the add entry form
    await page.locator('#addSatelliteId').fill('SAT-E2E')
    await page.locator('#addTimestamp').fill('2025-06-15T12:00')
    await page.locator('#addAltitude').fill('400')
    await page.locator('#addVelocity').fill('7.5')
    await page.locator('#addStatus').selectOption('healthy')

    // Submit
    await page.locator('form button[type="submit"]').click()

    // Verify success banner
    await expect(page.getByText('Telemetry entry added successfully.')).toBeVisible()

    // Verify count increased
    await expect(page.getByText(`of ${totalBefore + 1} entries`)).toBeVisible()
  })

  test('edit an existing entry', async ({ page }) => {
    // Click the first Edit button
    const firstEditBtn = page.getByTitle('Edit').first()
    await firstEditBtn.click()

    // Should see Save and Cancel buttons
    await expect(page.getByTitle('Save')).toBeVisible()
    await expect(page.getByTitle('Cancel')).toBeVisible()

    // Modify the altitude
    const altitudeInput = page.getByRole('table').locator('input[type="number"]').first()
    await altitudeInput.fill('9999')

    // Save
    await page.getByTitle('Save').click()

    // Verify success
    await expect(page.getByText('Entry updated successfully.')).toBeVisible()

    // Save/Cancel buttons should be gone
    await expect(page.getByTitle('Save')).not.toBeVisible()
  })

  test('cancel edit reverts to view mode', async ({ page }) => {
    await page.getByTitle('Edit').first().click()
    await expect(page.getByTitle('Save')).toBeVisible()

    await page.getByTitle('Cancel').click()
    await expect(page.getByTitle('Save')).not.toBeVisible()
  })

  test('delete an entry', async ({ page }) => {
    // Wait for actual data to load (not the initial "0 of 0" state)
    await expect(page.getByRole('table').locator('tbody tr').first()).toBeVisible()
    await expect(page.getByText(/of [1-9]\d* entries/)).toBeVisible()

    const countText = await page.getByText(/of [1-9]\d* entries/).textContent()
    const totalBefore = parseInt(countText!.match(/of (\d+)/)?.[1] ?? '0')

    // Click the first Delete button
    await page.getByTitle('Delete').first().click()

    // Verify success banner
    await expect(page.getByText('Entry deleted.')).toBeVisible()

    // Verify count decreased
    await expect(page.getByText(`of ${totalBefore - 1} entries`)).toBeVisible()
  })
})

// ---------- Pagination ----------

test.describe('Pagination', () => {
  test('page buttons appear when entries exceed page size', async ({ page }) => {
    await page.goto('/telemetry/')
    await expect(page.getByText(/Showing \d+ of \d+ entries/)).toBeVisible()

    // With 98 entries and page size 50, there should be a page 2 button
    const page2Btn = page.getByRole('button', { name: '2' })
    await expect(page2Btn).toBeVisible()
  })

  test('clicking page 2 loads next set of results', async ({ page }) => {
    await page.goto('/telemetry/')
    await expect(page.getByText(/Showing \d+ of \d+ entries/)).toBeVisible()

    await page.getByRole('button', { name: '2' }).click()

    // Wait for table to update — the entry count text should still be present
    await expect(page.getByText(/Showing \d+ of \d+ entries/)).toBeVisible()

    // Page 2 button's parent li should have the 'active' class
    await expect(page.getByRole('button', { name: '2' }).locator('..')).toHaveClass(/active/)
  })

  test('Next and Previous buttons work', async ({ page }) => {
    await page.goto('/telemetry/')
    await expect(page.getByText(/Showing \d+ of \d+ entries/)).toBeVisible()

    // Click Next
    await page.getByRole('button', { name: 'Next' }).click()
    await expect(page.getByRole('button', { name: '2' }).locator('..')).toHaveClass(/active/)

    // Click Previous
    await page.getByRole('button', { name: 'Previous' }).click()
    await expect(page.getByRole('button', { name: '1' }).locator('..')).toHaveClass(/active/)
  })
})
