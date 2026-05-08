import type { DashboardStats } from '../lib/types'
import { T } from '../styles/tokens'

interface StatsRowProps {
  stats: DashboardStats | null
  loading: boolean
}

export function StatsRow({ stats, loading }: StatsRowProps) {
  const items = [
    { label: 'Clientes', value: stats?.total_clients },
    { label: 'Relatórios gerados', value: stats?.total_reports },
    { label: 'Este mês', value: stats?.reports_this_month },
  ]

  return (
    <div className="stats-row">
      {items.map(({ label, value }) => (
        <div
          key={label}
          style={{
            flex: 1,
            background: T.surface,
            border: `0.5px solid ${T.border}`,
            borderRadius: 12,
            padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}
        >
          <div>
            <div style={{
              fontSize: 10, fontWeight: 700, color: T.hint,
              letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 4,
            }}>
              {label}
            </div>
            {loading || value === undefined ? (
              <div style={{
                height: 26, width: 48,
                background: 'var(--surface2)',
                borderRadius: 6,
                animation: 'pulse 1.4s ease-in-out infinite',
              }} />
            ) : (
              <div style={{
                fontSize: 26, fontWeight: 800, color: T.text,
                letterSpacing: '-0.5px', lineHeight: 1,
                animation: 'fadein 0.4s ease',
              }}>
                {value}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
