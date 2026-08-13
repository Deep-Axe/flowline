/**
 * Thin app-facing API helpers over the generated OpenAPI client.
 * Types come from @flowline/contracts — do not redefine schema here.
 */
import {
  analyze,
  client,
  demoReset,
  getDemoTick,
  getVenue,
  modelStatus,
  type ModelStatus,
  type RouteSuggestion,
  type Snapshot,
  type Venue,
  type ZoneSnapshot,
} from '@flowline/contracts'

export type { ModelStatus, RouteSuggestion, Snapshot, Venue, ZoneSnapshot }
export type RiskLevel = ZoneSnapshot['risk']

client.setConfig({ baseUrl: '' })

function unwrap<T>(result: { data?: T; error?: unknown }, label: string): T {
  if (result.error || result.data === undefined) {
    throw new Error(`${label} failed`)
  }
  return result.data
}

export async function fetchVenue(): Promise<Venue> {
  return unwrap(await getVenue(), 'venue')
}

export async function fetchDemoTick(t: number): Promise<Snapshot> {
  return unwrap(await getDemoTick({ query: { t } }), 'demo tick')
}

export async function resetDemo(): Promise<void> {
  unwrap(await demoReset(), 'demo reset')
}

export async function fetchModelStatus(): Promise<ModelStatus> {
  return unwrap(await modelStatus(), 'model status')
}

export async function analyzeImage(file: File, phase?: string): Promise<Snapshot> {
  return unwrap(
    await analyze({
      body: {
        file,
        phase: phase ?? null,
        reset: false,
      },
    }),
    'analyze',
  )
}
