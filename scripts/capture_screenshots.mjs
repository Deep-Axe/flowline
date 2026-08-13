/**
 * Capture README screenshots of the FLOWLINE ops console.
 * Requires crowd-api :8001 and ops-console :5173.
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'docs', 'screenshots')
mkdirSync(outDir, { recursive: true })

async function shot(page, name, url) {
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.getByText('FLOWLINE').first().waitFor({ timeout: 30000 })
  await page.locator('.venue-map').waitFor({ timeout: 15000 })
  await page.waitForTimeout(900)
  await page.screenshot({ path: join(outDir, name), fullPage: true })
  console.log('wrote', name)
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1.5,
})

await shot(page, '01-ops-console-idle.png', 'http://127.0.0.1:5173/?t=0')
await shot(page, '02-entry-rush-reroute.png', 'http://127.0.0.1:5173/?t=16')
await shot(page, '03-exit-crush.png', 'http://127.0.0.1:5173/?t=52')

await page.goto('http://127.0.0.1:5173/?t=0', { waitUntil: 'networkidle' })
await page.getByText('FLOWLINE').first().waitFor({ timeout: 30000 })
await page.getByText(/concourse within capacity|Crowd levels normal/i).first().waitFor({ timeout: 15000 })
await page.locator('input[type="file"]').setInputFiles(
  join(root, 'samples', 'camera-frames', 'entry_rush.jpg'),
)
await page.getByText(/Model:\s*(csrnet|heuristic)/i).waitFor({ timeout: 120000 })
await page.getByRole('button', { name: /Upload camera frame/i }).waitFor({ timeout: 30000 })
await page.waitForTimeout(1000)
await page.screenshot({
  path: join(outDir, '04-camera-upload.png'),
  fullPage: true,
})
console.log('wrote 04-camera-upload.png')

await browser.close()
console.log('done')
