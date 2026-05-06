import { useState } from 'react'
import type { Client, Screen } from '../lib/types'
import { apiReports } from '../lib/api'
import { T } from '../styles/tokens'

const PERIOD_OPTIONS = [
  { label: 'Maio / 2026',     start: '2026-05-01', end: '2026-05-31' },
  { label: 'Abril / 2026',    start: '2026-04-01', end: '2026-04-30' },
  { label: 'Março / 2026',    start: '2026-03-01', end: '2026-03-31' },
  { label: 'Fevereiro / 2026',start: '2026-02-01', end: '2026-02-28' },
]

interface FormViewProps {
  client: Client
  onNavigate: (screen: Screen, client?: Client) => void
  onGenerate: () => void
  showToast?: (msg: string) => void
}

export function FormView({ client, onNavigate, onGenerate }: FormViewProps) {
  const [periodIdx, setPeriodIdx] = useState(0)
  const [src, setSrc] = useState<'api' | 'manual'>('api')
  const [selectedUnits, setSelectedUnits] = useState<string[]>(
    client.units?.map(u => u.id) ?? []
  )
  const [loading, setLoading] = useState(false)

  const isFranchise = client.type === 'franchise'

  // Fallback franchise unit names if DB data not loaded
  const defaultUnitNames = ['Campinas', 'Curitiba', 'Florianópolis', 'Londrina', 'Maringá', 'Ribeirão Preto']
  const unitItems = client.units && client.units.length > 0
    ? client.units.map(u => ({ id: u.id, name: u.name }))
    : defaultUnitNames.map((n, i) => ({ id: `unit-${i}`, name: n }))

  const toggleUnit = (id: string) => {
    setSelectedUnits(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const period = PERIOD_OPTIONS[periodIdx]
      await apiReports.generate({
        client_id: client.id,
        period_start: period.start,
        period_end: period.end,
        period_label: period.label,
        unit_ids: isFranchise ? selectedUnits : undefined,
      })
      onGenerate()
    } catch {
      // Still show generating state for demo
      onGenerate()
    } finally {
      setLoading(false)
    }
  }

  const btnLabel = isFranchise
    ? `Gerar ${selectedUnits.length} relatórios →`
    : 'Gerar relatório →'

  return (
    <div style={{ padding: '38px 42px', maxWidth: 540, animation: 'fadein 0.25s ease' }}>
      {/* Back */}
      <button
        onClick={() => onNavigate('client', client)}
        className="btn-ghost"
        style={{ marginBottom: 24, fontSize: 13 }}
      >
        ← Voltar
      </button>

      <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.3px', color: T.text, marginBottom: 6 }}>
        Novo relatório
      </h1>
      <p style={{ color: T.muted, fontSize: 13, marginBottom: 32 }}>
        {client.name} · {client.type === 'franchise' ? 'Franquia' : 'Lead Gen — B2B'}
      </p>

      {/* Período */}
      <FormField label="Período">
        <select
          value={periodIdx}
          onChange={e => setPeriodIdx(Number(e.target.value))}
          className="input"
          style={{ cursor: 'pointer' }}
        >
          {PERIOD_OPTIONS.map((p, i) => (
            <option key={p.label} value={i}>{p.label}</option>
          ))}
        </select>
      </FormField>

      {/* Origem dos dados */}
      <FormField label="Origem dos dados">
        {([
          ['api', 'Meta API', 'Puxa dados automaticamente do Ads Manager'],
          ['manual', 'Manual / CSV', 'Inserir dados ou importar planilha'],
        ] as const).map(([id, label, desc]) => (
          <div
            key={id}
            onClick={() => setSrc(id)}
            style={{
              background: T.surface,
              border: src === id ? `1.5px solid ${T.brand}` : `0.5px solid ${T.border}`,
              borderRadius: 9,
              padding: '11px 13px',
              cursor: 'pointer',
              marginBottom: 7,
              display: 'flex',
              gap: 11,
              alignItems: 'center',
              transition: 'border-color 0.15s',
            }}
          >
            <div style={{
              width: 15, height: 15, borderRadius: '50%', flexShrink: 0, marginTop: 1,
              border: src === id ? `5px solid ${T.brand}` : `2px solid ${T.border}`,
            }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{label}</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{desc}</div>
            </div>
          </div>
        ))}
      </FormField>

      {/* Units (franchise only) */}
      {isFranchise && (
        <FormField label={`Unidades (${selectedUnits.length} selecionadas)`}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
            {unitItems.map(u => {
              const on = selectedUnits.includes(u.id)
              return (
                <div
                  key={u.id}
                  onClick={() => toggleUnit(u.id)}
                  style={{
                    background: T.surface,
                    border: on ? `0.5px solid ${T.brandBorder}` : `0.5px solid ${T.border}`,
                    borderRadius: 8,
                    padding: '8px 11px',
                    display: 'flex',
                    gap: 8,
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s',
                  }}
                >
                  <div style={{
                    width: 12, height: 12,
                    background: on ? T.brand : T.surface2,
                    border: on ? 'none' : `0.5px solid ${T.border}`,
                    borderRadius: 3, flexShrink: 0,
                    transition: 'background 0.15s',
                  }} />
                  <span style={{ fontSize: 12, color: on ? T.text : T.muted }}>{u.name}</span>
                </div>
              )
            })}
          </div>
        </FormField>
      )}

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          width: '100%',
          background: loading ? T.surface2 : `linear-gradient(135deg,#5B18A8,${T.brand})`,
          color: loading ? T.muted : '#fff',
          border: 'none',
          borderRadius: 9,
          padding: '13px',
          fontSize: 14,
          fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          marginTop: 6,
          letterSpacing: '-0.2px',
          transition: 'opacity 0.15s',
        }}
      >
        {loading ? 'Iniciando...' : btnLabel}
      </button>
    </div>
  )
}

interface FormFieldProps {
  label: string
  children: React.ReactNode
}

function FormField({ label, children }: FormFieldProps) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label className="field-label">{label}</label>
      {children}
    </div>
  )
}
