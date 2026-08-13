import { createHash } from 'node:crypto'
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const openapiPath = join(root, '..', 'openapi.json')
const stampPath = join(root, '..', 'src', 'client', '.openapi.sha256')

if (!existsSync(openapiPath) || !existsSync(stampPath)) {
  console.error('Missing openapi.json or generated stamp. Run task contracts.')
  process.exit(1)
}

const hash = createHash('sha256').update(readFileSync(openapiPath)).digest('hex')
const stamp = readFileSync(stampPath, 'utf8').trim()
if (hash !== stamp) {
  console.error('Generated client is stale relative to openapi.json. Run task contracts.')
  process.exit(1)
}

console.log('contracts client is up to date')
