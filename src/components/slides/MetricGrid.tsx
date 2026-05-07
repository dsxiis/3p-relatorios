interface MetricItem {
  label: string
  value: string
  sub?: string
  accentColor?: string
}

interface MetricGridProps {
  metrics: MetricItem[]
  columns?: number
  dark?: boolean
}

export function MetricGrid({ metrics, columns = 3, dark = false }: MetricGridProps) {
  const textColor = dark ? '#e8e8e8' : '#1a1a2e'
  const mutedColor = dark ? '#888' : '#6b7280'
  const borderColor = dark ? '#2e2e50' : '#e5e7eb'

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: 12,
    }}>
      {metrics.map((m, i) => (
        <div key={i} style={{
          background: dark ? '#1a1a2e' : '#f9fafb',
          border: `1px solid ${m.accentColor ? m.accentColor + '44' : borderColor}`,
          borderRadius: 8,
          padding: '12px 14px',
        }}>
          <div style={{ fontSize: 10, color: mutedColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
            {m.label}
          </div>
          {m.sub && (
            <div style={{ fontSize: 9, color: mutedColor, marginBottom: 2 }}>{m.sub}</div>
          )}
          <div style={{ fontSize: 20, fontWeight: 800, color: m.accentColor ?? textColor, letterSpacing: '-0.5px' }}>
            {m.value}
          </div>
        </div>
      ))}
    </div>
  )
}
