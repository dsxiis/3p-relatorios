import type { Client } from '../lib/types'
import { T } from '../styles/tokens'

const STEPS = [
  'Conectando na Meta API',
  'Buscando dados de campanhas',
  'Claude gerando análise e insights',
  'Renderizando template',
]

interface GeneratingViewProps {
  step: number
  client: Client | null
}

export function GeneratingView({ step, client }: GeneratingViewProps) {
  const isFranchise = client?.type === 'franchise'

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
      animation: 'fadein 0.2s ease',
    }}>
      {/* Spinner */}
      <div style={{
        width: 42, height: 42,
        borderRadius: '50%',
        border: `2px solid ${T.brand}`,
        borderTopColor: 'transparent',
        animation: 'spin 0.8s linear infinite',
        marginBottom: 26,
      }} />

      <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 5, color: T.text }}>
        Gerando relatório{isFranchise ? 's' : ''}...
      </h2>
      <p style={{ color: T.muted, fontSize: 12, marginBottom: 34 }}>
        {client?.name ?? ''}
      </p>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280 }}>
        {STEPS.map((s, i) => {
          const done = i < step
          const current = i === step
          return (
            <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'center' }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                background: done ? T.brand : current ? T.brandDim : T.surface,
                border: current ? `1px solid ${T.brandBorder}` : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, color: '#fff',
                transition: 'background 0.3s',
                animation: current ? 'pulse 1s ease infinite' : 'none',
              }}>
                {done ? '✓' : ''}
              </div>
              <span style={{
                fontSize: 12,
                color: done ? T.text : current ? T.muted : T.hint,
                transition: 'color 0.3s',
              }}>
                {s}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
