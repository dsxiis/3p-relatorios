import { useEffect, useState } from 'react'
import type { Client, Report } from '../lib/types'
import { apiReports } from '../lib/api'
import { T } from '../styles/tokens'

const STEPS = [
  { label: 'Conectando na Meta API', key: 'connecting' },
  { label: 'Buscando dados de campanhas', key: 'fetching' },
  { label: 'Claude gerando análise e insights', key: 'claude' },
  { label: 'Relatório pronto', key: 'done' },
]

const POLL_INTERVAL_MS = 2000
const POLL_TIMEOUT_MS = 5 * 60 * 1000

interface GeneratingViewProps {
  reportId: string
  client: Client | null
  onReady: (report: Report) => void
  onError: (msg: string) => void
}

export function GeneratingView({ reportId, client, onReady, onError }: GeneratingViewProps) {
  const [step, setStep] = useState(0)
  const isFranchise = client?.type === 'franchise'

  useEffect(() => {
    const stepTimers = [
      setTimeout(() => setStep(1), 800),
      setTimeout(() => setStep(2), 2400),
    ]

    let elapsed = 0
    const poll = setInterval(async () => {
      elapsed += POLL_INTERVAL_MS
      if (elapsed > POLL_TIMEOUT_MS) {
        clearInterval(poll)
        onError('Tempo limite excedido. Tente novamente.')
        return
      }

      try {
        const report = await apiReports.get(reportId) as Report
        if (report.status === 'ready') {
          clearInterval(poll)
          setStep(3)
          setTimeout(() => onReady(report), 600)
        } else if (report.status === 'error') {
          clearInterval(poll)
          onError(report.error_message ?? 'Erro na geração do relatório.')
        }
      } catch {
        // Network error — keep polling
      }
    }, POLL_INTERVAL_MS)

    return () => {
      stepTimers.forEach(clearTimeout)
      clearInterval(poll)
    }
  }, [reportId, onReady, onError])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 40, animation: 'fadein 0.2s ease',
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: '50%',
        border: `2px solid ${T.brand}`, borderTopColor: 'transparent',
        animation: 'spin 0.8s linear infinite', marginBottom: 26,
      }} />

      <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 5, color: T.text }}>
        Gerando relatório{isFranchise ? 's' : ''}...
      </h2>
      <p style={{ color: T.muted, fontSize: 12, marginBottom: 34 }}>
        {client?.name ?? ''}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280 }}>
        {STEPS.map((s, i) => {
          const done = i < step
          const current = i === step
          return (
            <div key={s.key} style={{ display: 'flex', gap: 11, alignItems: 'center' }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                background: done ? T.brand : current ? T.brandDim : T.surface,
                border: current ? `1px solid ${T.brandBorder}` : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, color: '#fff', transition: 'background 0.3s',
                animation: current ? 'pulse 1s ease infinite' : 'none',
              }}>
                {done ? '✓' : ''}
              </div>
              <span style={{
                fontSize: 12, transition: 'color 0.3s',
                color: done ? T.text : current ? T.muted : T.hint,
              }}>
                {s.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
