interface MetricBoxProps {
  label: string
  value: string | number
  sub?: string
  borderColor?: string
  fontSize?: number
}

export function MetricBox({ label, value, sub, borderColor = '#D4B0FF', fontSize = 24 }: MetricBoxProps) {
  return (
    <div
      className="metric-box"
      style={{ border: `1.5px solid ${borderColor}` }}
    >
      <div className="metric-box-label">{label}</div>
      {sub && (
        <div style={{ fontSize: 9, color: '#bbb', marginBottom: 2 }}>{sub}</div>
      )}
      <div className="metric-box-value" style={{ fontSize }}>
        {value || <span style={{ color: '#ddd' }}>—</span>}
      </div>
    </div>
  )
}
