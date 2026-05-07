interface CreativeMetrics {
  clicks?: number
  leads?: number
  messages?: number
  cpl?: number
}

interface CreativeSpotProps {
  label: string
  metrics?: CreativeMetrics
  dark?: boolean
}

export function CreativeSpot({ label, metrics, dark = false }: CreativeSpotProps) {
  const border = dark ? '#2e2e50' : '#e5e7eb'
  const muted = dark ? '#666' : '#9ca3af'
  const text = dark ? '#ccc' : '#374151'

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div style={{
        width: 72, height: 90, flexShrink: 0,
        background: dark ? '#1a1a2e' : '#f3f4f6',
        border: `1px dashed ${border}`,
        borderRadius: 6,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, color: muted,
      }}>
        🖼
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: muted, textTransform: 'uppercase', marginBottom: 6 }}>
          {label}
        </div>
        {metrics && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {metrics.clicks !== undefined && (
              <div style={{ fontSize: 11, color: text }}>
                <span style={{ color: muted }}>Cliques: </span>{metrics.clicks}
              </div>
            )}
            {metrics.leads !== undefined && (
              <div style={{ fontSize: 11, color: text }}>
                <span style={{ color: muted }}>Leads: </span>{metrics.leads}
              </div>
            )}
            {metrics.messages !== undefined && (
              <div style={{ fontSize: 11, color: text }}>
                <span style={{ color: muted }}>Msgs: </span>{metrics.messages}
              </div>
            )}
            {metrics.cpl !== undefined && (
              <div style={{ fontSize: 11, fontWeight: 700, color: '#8833ff' }}>
                CPL R$ {metrics.cpl.toFixed(2)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
