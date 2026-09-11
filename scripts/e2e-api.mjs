import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const win = process.platform === 'win32'
const venvPy = win
  ? join(root, '.venv', 'Scripts', 'python.exe')
  : join(root, '.venv', 'bin', 'python')
const python = existsSync(venvPy) ? venvPy : 'python'

const child = spawn(
  python,
  ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8001'],
  {
    cwd: root,
    env: { ...process.env, PYTHONPATH: join(root, 'apps', 'crowd-api') },
    stdio: 'inherit',
  },
)

child.on('exit', (code) => process.exit(code ?? 1))
