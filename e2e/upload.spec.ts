import { expect, test } from '@playwright/test'
import { join } from 'node:path'

const frame = join(process.cwd(), 'samples', 'camera-frames', 'quiet.jpg')

test('camera upload posts GraphQL analyzeCamera, not REST', async ({ page }) => {
  let graphqlPost = false
  let restAnalyze = false
  page.on('request', (req) => {
    const url = req.url()
    if (req.method() !== 'POST') {
      return
    }
    if (url.includes('/api/analyze')) {
      restAnalyze = true
    }
    if (url.includes('/graphql')) {
      graphqlPost = true
    }
  })

  await page.goto('/?t=0')
  await expect(page.getByText('FLOWLINE').first()).toBeVisible({ timeout: 30_000 })
  await expect(page.getByText(/None — concourse within capacity/i)).toBeVisible()

  await page.locator('input[type="file"]').setInputFiles(frame)
  await expect(page.getByText(/Model:\s*(csrnet|heuristic)/i)).toBeVisible({ timeout: 120_000 })
  expect(graphqlPost).toBe(true)
  expect(restAnalyze).toBe(false)
})
