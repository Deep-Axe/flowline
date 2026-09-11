import { expect, test } from '@playwright/test'

test('event replay streams ticks and flags Gate A', async ({ page }) => {
  await page.goto('/?t=14')
  await expect(page.getByText('FLOWLINE').first()).toBeVisible({ timeout: 30_000 })
  await expect(page.locator('.venue-map')).toBeVisible()

  const wsStarted = page.waitForEvent('websocket', {
    predicate: (ws) => ws.url().includes('/graphql'),
    timeout: 30_000,
  })
  await page.getByRole('button', { name: /Play event replay|Resume replay/ }).click()
  const socket = await wsStarted
  expect(socket.url()).toContain('/graphql')

  await expect(page.locator('.hot-list')).toContainText('Gate A', { timeout: 25_000 })
  await expect(page.locator('.incident-list')).toContainText('Gate A', { timeout: 15_000 })
})
