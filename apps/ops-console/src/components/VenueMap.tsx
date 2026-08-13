import type { RiskLevel, RouteSuggestion, Venue, ZoneSnapshot } from '../api'

const RISK_FILL: Record<RiskLevel, string> = {
  low: 'oklch(0.42 0.04 220 / 0.35)',
  medium: 'oklch(0.62 0.12 75 / 0.55)',
  high: 'oklch(0.55 0.16 35 / 0.65)',
  critical: 'oklch(0.48 0.18 22 / 0.78)',
}

const RISK_STROKE: Record<RiskLevel, string> = {
  low: 'oklch(0.72 0.06 220)',
  medium: 'oklch(0.78 0.14 75)',
  high: 'oklch(0.68 0.17 35)',
  critical: 'oklch(0.72 0.19 22)',
}

function polyPoints(polygon: number[][]) {
  return polygon.map(([x, y]) => `${x},${y}`).join(' ')
}

interface Props {
  venue: Venue
  zones: ZoneSnapshot[] | null
  routes: RouteSuggestion[]
  playing: boolean
}

export function VenueMap({ venue, zones, routes, playing }: Props) {
  const byId = new Map((zones ?? []).map((z) => [z.id, z]))
  const bottleneckSet = new Set((zones ?? []).filter((z) => z.density >= 0.75).map((z) => z.id))

  return (
    <svg
      className="venue-map"
      viewBox={`0 0 ${venue.width} ${venue.height}`}
      role="img"
      aria-label={`${venue.name} crowd density map`}
    >
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="oklch(1 0 0 / 0.04)" strokeWidth="1" />
        </pattern>
        <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="oklch(0.78 0.11 210)" />
        </marker>
      </defs>

      <rect width={venue.width} height={venue.height} fill="url(#grid)" />

      {/* Graph edges under zones */}
      {venue.graph.edges.map((e) => {
        const a = venue.zones.find((z) => z.id === e.from)
        const b = venue.zones.find((z) => z.id === e.to)
        if (!a || !b) return null
        return (
          <line
            key={`${e.from}-${e.to}`}
            x1={a.centroid[0]}
            y1={a.centroid[1]}
            x2={b.centroid[0]}
            y2={b.centroid[1]}
            stroke="oklch(1 0 0 / 0.08)"
            strokeWidth="3"
          />
        )
      })}

      {venue.zones.map((zone) => {
        const live = byId.get(zone.id)
        const risk: RiskLevel = live?.risk ?? 'low'
        const density = live?.density ?? 0
        const isHot = bottleneckSet.has(zone.id)
        return (
          <g key={zone.id} className={isHot && playing ? 'zone-pulse' : undefined}>
            <polygon
              points={polyPoints(zone.polygon)}
              fill={RISK_FILL[risk]}
              stroke={RISK_STROKE[risk]}
              strokeWidth={isHot ? 3.5 : 1.5}
              style={{ transition: 'fill 0.45s ease, stroke 0.45s ease' }}
            />
            <text
              x={zone.centroid[0]}
              y={zone.centroid[1] - 8}
              textAnchor="middle"
              className="zone-label"
            >
              {zone.label}
            </text>
            <text
              x={zone.centroid[0]}
              y={zone.centroid[1] + 14}
              textAnchor="middle"
              className="zone-meta"
            >
              {live ? `${Math.round(density * 100)}% · ${Math.round(live.count_est)}` : zone.type}
            </text>
          </g>
        )
      })}

      {routes.map((route, idx) => {
        const pts = route.path
          .map((id) => venue.zones.find((z) => z.id === id)?.centroid)
          .filter((p): p is number[] => Array.isArray(p) && p.length >= 2)
        if (pts.length < 2) return null
        const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ')
        return (
          <path
            key={`route-${idx}`}
            d={d}
            fill="none"
            stroke="oklch(0.78 0.11 210)"
            strokeWidth="4"
            strokeDasharray="10 8"
            markerEnd="url(#arrow)"
            className="route-path"
            filter="url(#glow)"
          />
        )
      })}
    </svg>
  )
}
