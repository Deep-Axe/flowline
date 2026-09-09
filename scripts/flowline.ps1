#!/usr/bin/env pwsh
# Windows-friendly orchestration when Task is not installed.
param(
  [Parameter(Position = 0)]
  [ValidateSet('setup', 'contracts', 'api', 'console', 'test', 'check', 'build', 'frames')]
  [string]$Command = 'check'
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$Py = Join-Path $Root '.venv\Scripts\python.exe'
$Pip = Join-Path $Root '.venv\Scripts\pip.exe'

function Ensure-Venv {
  if (-not (Test-Path $Py)) {
    python -m venv .venv
  }
}

switch ($Command) {
  'setup' {
    Ensure-Venv
    & $Pip install -r apps\crowd-api\requirements.txt httpx pytest
    npm install
  }
  'contracts' {
    Ensure-Venv
    & $Py scripts\export_openapi.py
    & $Py scripts\export_graphql.py
    npm --workspace packages/contracts run generate
    & $Py scripts\stamp_contracts.py
    npm --workspace apps/ops-console run codegen
    & $Py scripts\stamp_graphql.py
  }
  'api' {
    Ensure-Venv
    $env:PYTHONPATH = Join-Path $Root 'apps\crowd-api'
    & $Py -m uvicorn app.main:app --reload --reload-dir apps\crowd-api\app --host 127.0.0.1 --port 8001
  }
  'console' {
    npm --prefix apps/ops-console run dev
  }
  'test' {
    Ensure-Venv
    $env:PYTHONPATH = 'apps\crowd-api'
    & $Py -m pytest apps\crowd-api\tests -q
  }
  'check' {
    & $PSCommandPath contracts
    npm --workspace packages/contracts run check:stale
    npm --prefix apps/ops-console run check:generated
    npm --prefix apps/ops-console run lint
    npm --prefix apps/ops-console run test
    npm --prefix apps/ops-console run typecheck
    & $PSCommandPath test
  }
  'build' {
    npm --prefix apps/ops-console run build
  }
  'frames' {
    Ensure-Venv
    & $Py scripts\generate_camera_frames.py
  }
}
