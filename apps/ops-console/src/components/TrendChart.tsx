interface Props {
  history: Record<string, number[]>
  focusIds: string[]
}

const COLORS = [
  'oklch(0.68 0.18 22)',
  'oklch(0.72 0.12 210)',
  'oklch(0.75 0.14 75)',
  'oklch(0.70 0.10 160)',
]

export function TrendChart({ history, focusIds }: Props) {
  const ids = (focusIds.length ? focusIds : Object.keys(history)).slice(0, 4)
  const width = 420
  const height = 140
  const pad = 16

  const series = ids.map((id) => history[id] ?? [])
  const maxLen = Math.max(2, ...series.map((s) => s.length))

  function pathFor(values: number[]) {
    if (!values.length) return ''
    return values
      .map((v, i) => {
        const x = pad + (i / (maxLen - 1 || 1)) * (width - pad * 2)
        const y = height - pad - Math.min(1, v) * (height - pad * 2)
        return `${i === 0 ? 'M' : 'L'}${x},${y}`
      })
      .join(' ')
  }

  return (
    <div className="trend-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="trend-chart" aria-label="Density trend">
        {[0.25, 0.5, 0.75].map((g) => {
          const y = height - pad - g * (height - pad * 2)
          return (
            <line
              key={g}
              x1={pad}
              x2={width - pad}
              y1={y}
              y2={y}
              stroke="oklch(1 0 0 / 0.08)"
            />
          )
        })}
        {ids.map((id, i) => (
          <path
            key={id}
            d={pathFor(series[i])}
            fill="none"
            stroke={COLORS[i % COLORS.length]}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        ))}
      </svg>
      <div className="trend-legend">
        {ids.map((id, i) => (
          <span key={id} style={{ color: COLORS[i % COLORS.length] }}>
            {id.replace(/_/g, ' ')}
          </span>
        ))}
      </div>
    </div>
  )
}
