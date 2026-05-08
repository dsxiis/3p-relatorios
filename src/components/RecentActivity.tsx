import type { RecentReport } from '../lib/types'
import { T } from '../styles/tokens'
import { relativeTime } from '../lib/utils'

interface RecentActivityProps {
  reports: RecentReport[]
  loading: boolean
  onNavigateToClient: (clientId: string) => void
}

const STATUS = {
  ready: { label: 'Pronto', color: 'var(--green)', bg: 'var(--green-dim)', border: 'var(--green-border)' },
  error: { label: 'Erro', color: 'var(--danger)', bg: 'var(--danger-dim)', border: 'var(--danger-dim)' },
  generating: { label: 'Gerando', color: 'var(--amber)', bg: 'var(--amber-dim)', border: 'var(--amber-dim)' },
}

export function RecentActivity({ reports, loading, onNavigateToClient }: RecentActivityProps) {
  return (
    <div style={{
      background: T.surface,
      border: `0.5px solid ${T.border}`,
      borderRadius: 14,
      padding: '20px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color: T.hint,
        letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 14,
      }}>
        Atividade recente
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              height: 36, borderRadius: 8,
              background: T.surface,
              animation: 'pulse 1.4s ease-in-out infinite',
              animationDelay: `${i * 150}ms`,
            }} />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 13, color: T.hint }}>Nenhum relatório ainda</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {reports.map((r, i) => {
            const st = STATUS[r.status] ?? STATUS.generating
            const color = r.client_color || '#8B35E8'
            return (
              <button
                key={r.id}
                onClick={() => onNavigateToClient(r.client_id)}
                style={{
                  background: 'none', border: 'none',
                  borderRadius: 8, padding: '9px 8px',
                  cursor: 'pointer', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: 10,
                  transition: 'background 0.1s',
                  animation: `fadein 0.3s ease ${i * 60}ms both`,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                {/* Client color dot */}
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: color, flexShrink: 0,
                }} />

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 600, color: T.text,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {r.client_name}
                  </div>
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>
                    {r.period_label} · {relativeTime(r.created_at)}
                  </div>
                </div>

                {/* Status badge */}
                <div style={{
                  fontSize: 10, fontWeight: 700,
                  color: st.color,
                  background: st.bg,
                  border: `0.5px solid ${st.border}`,
                  borderRadius: 20, padding: '2px 8px',
                  flexShrink: 0,
                }}>
                  {st.label}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
