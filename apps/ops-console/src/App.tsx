import { useEffect, useMemo, useRef, useState } from 'react'
import {
  analyzeImage,
  fetchDemoTick,
  fetchModelStatus,
  fetchVenue,
  resetDemo,
  type Snapshot,
  type Venue,
} from './api'
import { TrendChart } from './components/TrendChart'
import { VenueMap } from './components/VenueMap'
import './App.css'

const DEMO_DURATION = 60

export default function App() {
  const [venue, setVenue] = useState<Venue | null>(null)
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [playing, setPlaying] = useState(false)
  const [t, setT] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modelReady, setModelReady] = useState<boolean | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const [v, status] = await Promise.all([fetchVenue(), fetchModelStatus()])
        setVenue(v)
        setModelReady(Boolean(status.ready))
        await resetDemo()
        const params = new URLSearchParams(window.location.search)
        const startT = Math.min(
          DEMO_DURATION,
          Math.max(0, Number(params.get('t') ?? 0) || 0),
        )
        setT(startT)
        const first = await fetchDemoTick(startT)
        setSnapshot(first)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to connect to backend')
      }
    })()
  }, [])

  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      startRef.current = null
      return
    }

    let lastFetch = -1
    const tick = async (now: number) => {
      if (startRef.current == null) startRef.current = now - t * 1000
      const elapsed = Math.min(DEMO_DURATION, (now - startRef.current) / 1000)
      setT(elapsed)
      const bucket = Math.floor(elapsed * 2) / 2
      if (bucket !== lastFetch) {
        lastFetch = bucket
        try {
          const snap = await fetchDemoTick(bucket)
          setSnapshot(snap)
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Demo failed')
          setPlaying(false)
          return
        }
      }
      if (elapsed >= DEMO_DURATION) {
        setPlaying(false)
        setT(DEMO_DURATION)
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [playing]) // eslint-disable-line react-hooks/exhaustive-deps

  const focusIds = useMemo(() => {
    if (!snapshot) return []
    if (snapshot.bottlenecks.length) return snapshot.bottlenecks
    return snapshot.zones
      .slice()
      .sort((a, b) => b.density - a.density)
      .slice(0, 3)
      .map((z) => z.id)
  }, [snapshot])

  async function onPlayToggle() {
    setError(null)
    if (!playing && t >= DEMO_DURATION) {
      setT(0)
      await resetDemo()
      setSnapshot(await fetchDemoTick(0))
    }
    setPlaying((p) => !p)
  }

  async function onReset() {
    setPlaying(false)
    setT(0)
    setPreviewUrl(null)
    setError(null)
    await resetDemo()
    setSnapshot(await fetchDemoTick(0))
  }

  async function onUpload(file: File | undefined) {
    if (!file) return
    setPlaying(false)
    setBusy(true)
    setError(null)
    setPreviewUrl(URL.createObjectURL(file))
    try {
      const snap = await analyzeImage(file, 'camera_upload')
      setSnapshot(snap)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload analyze failed')
    } finally {
      setBusy(false)
    }
  }

  if (!venue) {
    return (
      <div className="boot">
        <p className="brand">FLOWLINE</p>
        <p>{error ?? 'Connecting to crowd ops backend…'}</p>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand-block">
          <p className="brand">FLOWLINE</p>
          <p className="tagline">Live crowd density · bottleneck detection · reroute assist</p>
        </div>
        <div className="status-pills">
          <span className={`pill ${modelReady ? 'ok' : 'warn'}`}>
            HF CSRNet {modelReady ? 'ready' : 'fallback'}
          </span>
          <span className="pill mute">{venue.name}</span>
        </div>
      </header>

      <main className="stage">
        <section className="map-pane">
          <VenueMap
            venue={venue}
            zones={snapshot?.zones ?? null}
            routes={snapshot?.routes ?? []}
            playing={playing}
          />
          <div className="map-footer">
            <div className="legend">
              <span><i className="swatch low" /> Low</span>
              <span><i className="swatch mid" /> Medium</span>
              <span><i className="swatch high" /> High</span>
              <span><i className="swatch crit" /> Critical</span>
              <span><i className="swatch route" /> Reroute</span>
            </div>
            <p className="clock">{t.toFixed(1)}s / {DEMO_DURATION}s</p>
          </div>
        </section>

        <aside className="side">
          <div className="suggest" data-hot={(snapshot?.bottlenecks.length ?? 0) > 0}>
            <p className="suggest-label">Ops suggestion</p>
            <p className="suggest-text">{snapshot?.suggestion ?? '—'}</p>
            {snapshot?.note ? <p className="suggest-note">{snapshot.note}</p> : null}
          </div>

          <div className="controls">
            <button type="button" className="btn primary" onClick={onPlayToggle}>
              {playing ? 'Pause replay' : t > 0 && t < DEMO_DURATION ? 'Resume replay' : 'Play event replay'}
            </button>
            <button type="button" className="btn" onClick={onReset}>
              Reset
            </button>
            <button
              type="button"
              className="btn"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
            >
              {busy ? 'Analyzing…' : 'Upload camera frame'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => onUpload(e.target.files?.[0])}
            />
          </div>

          {previewUrl ? (
            <div className="preview">
              <img src={previewUrl} alt="Uploaded frame" />
              <p>
                Model: {snapshot?.model.source} · count ≈ {snapshot?.model.global_count}
              </p>
            </div>
          ) : null}

          <div className="panel">
            <p className="panel-title">Density trend</p>
            <TrendChart history={snapshot?.history ?? {}} focusIds={focusIds} />
          </div>

          <div className="panel">
            <p className="panel-title">Bottlenecks</p>
            {(snapshot?.bottlenecks.length ?? 0) === 0 ? (
              <p className="empty">None — concourse within capacity</p>
            ) : (
              <ul className="hot-list">
                {snapshot!.bottlenecks.map((id) => {
                  const z = snapshot!.zones.find((x) => x.id === id)
                  return (
                    <li key={id}>
                      <strong>{z?.label ?? id}</strong>
                      <span>{Math.round((z?.density ?? 0) * 100)}% · {z?.trend}</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div className="panel">
            <p className="panel-title">Active reroutes</p>
            {(snapshot?.routes.length ?? 0) === 0 ? (
              <p className="empty">No alternate paths needed</p>
            ) : (
              <ul className="route-list">
                {snapshot!.routes.map((r, i) => (
                  <li key={i}>{r.path_labels.join(' -> ')}</li>
                ))}
              </ul>
            )}
          </div>

          {error ? <p className="error">{error}</p> : null}
        </aside>
      </main>
    </div>
  )
}
