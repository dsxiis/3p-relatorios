import { useState, useRef } from 'react'
import type { Client, Screen, DataSource } from '../lib/types'
import { apiReports } from '../lib/api'
import { parseCsvFile } from '../lib/csvParser'
import { T } from '../styles/tokens'
import { ALL_THEMES } from '../lib/themes'
import type { SlideTheme } from '../lib/themes'
import { ThemePreviewMini } from '../components/slides/ThemePreviewMini'

const PERIOD_OPTIONS = [
  { label: 'Maio / 2026',     start: '2026-05-01', end: '2026-05-31' },
  { label: 'Abril / 2026',    start: '2026-04-01', end: '2026-04-30' },
  { label: 'Março / 2026',    start: '2026-03-01', end: '2026-03-31' },
  { label: 'Fevereiro / 2026',start: '2026-02-01', end: '2026-02-28' },
]

interface FormViewProps {
  client: Client
  onNavigate: (screen: Screen, client?: Client) => void
  onGenerate: (reportId: string) => void
  showToast?: (msg: string) => void
}

export function FormView({ client, onNavigate, onGenerate, showToast }: FormViewProps) {
  const [step, setStep] = useState<'template' | 'form'>('template')
  const [selectedThemeId, setSelectedThemeId] = useState('dark-premium')
  const [periodIdx, setPeriodIdx] = useState(0)
  const [src, setSrc] = useState<DataSource>('meta')
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [selectedUnits, setSelectedUnits] = useState<string[]>(
    client.units?.map(u => u.id) ?? []
  )
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isFranchise = client.type === 'franchise'

  const defaultUnitNames = ['Campinas', 'Curitiba', 'Florianópolis', 'Londrina', 'Maringá', 'Ribeirão Preto']
  const unitItems = client.units && client.units.length > 0
    ? client.units.map(u => ({ id: u.id, name: u.name }))
    : defaultUnitNames.map((n, i) => ({ id: `unit-${i}`, name: n }))

  const toggleUnit = (id: string) => {
    setSelectedUnits(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      showToast?.('Arquivo deve ser .csv')
      return
    }
    setCsvFile(file)
  }

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const period = PERIOD_OPTIONS[periodIdx]

      let csvData: string | undefined
      if (src === 'csv' && csvFile) {
        const rows = await parseCsvFile(csvFile)
        csvData = JSON.stringify(rows)
      }

      const result = await apiReports.generate({
        client_id: client.id,
        period_start: period.start,
        period_end: period.end,
        period_label: period.label,
        source: src,
        template_id: selectedThemeId,
        csv_data: csvData,
        unit_ids: isFranchise ? selectedUnits : undefined,
      })

      const reportId = (result as { id: string }).id
      // Store template choice per-report in localStorage (worker may not save it yet)
      try {
        localStorage.setItem(`report-template-${reportId}`, selectedThemeId)
      } catch { /* ignore */ }

      onGenerate(reportId)
    } catch (err) {
      showToast?.('Erro ao iniciar geração. Verifique a conexão.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const canGenerate = src !== 'csv' || csvFile !== null
  const btnLabel = loading
    ? 'Iniciando...'
    : isFranchise
    ? `Gerar ${selectedUnits.length} relatórios →`
    : 'Gerar relatório →'

  // ── Step 1: Template picker ─────────────────────────
  if (step === 'template') {
    const selectedTheme = ALL_THEMES.find(t => t.id === selectedThemeId)!
    return (
      <div style={{ padding: '38px 42px', maxWidth: 760, animation: 'fadein 0.25s ease' }}>
        <button
          onClick={() => onNavigate('client', client)}
          className="btn-ghost"
          style={{ marginBottom: 24, fontSize: 13 }}
        >
          ← Voltar
        </button>

        <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.3px', color: T.text, marginBottom: 4 }}>
          Escolha o template
        </h1>
        <p style={{ color: T.muted, fontSize: 13, marginBottom: 24 }}>
          {client.name} · Clique no template para ver o visual
        </p>

        {/* Cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 14,
          marginBottom: 28,
        }}>
          {ALL_THEMES.map(theme => (
            <TemplatePickerCard
              key={theme.id}
              theme={theme}
              selected={selectedThemeId === theme.id}
              onSelect={() => setSelectedThemeId(theme.id)}
            />
          ))}
        </div>

        {/* Selected preview + continue */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 20,
          padding: '16px 20px',
          background: T.surface,
          border: `1.5px solid ${T.brandBorder}`,
          borderRadius: 10,
        }}>
          <ThemePreviewMini theme={selectedTheme} width={160} style={{ borderRadius: 6, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 4 }}>
              {selectedTheme.emoji} {selectedTheme.name}
            </div>
            <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5, marginBottom: 14 }}>
              {selectedTheme.description}
            </div>
            <button
              onClick={() => setStep('form')}
              style={{
                background: `linear-gradient(135deg, #5B18A8, #8833ff)`,
                color: '#fff',
                border: 'none', borderRadius: 8, padding: '10px 22px',
                fontSize: 13, fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '-0.2px',
              }}
            >
              Continuar →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Step 2: Form ────────────────────────────────────
  const selectedTheme = ALL_THEMES.find(t => t.id === selectedThemeId)!

  return (
    <div style={{ padding: '38px 42px', maxWidth: 560, animation: 'fadein 0.25s ease' }}>
      <button
        onClick={() => setStep('template')}
        className="btn-ghost"
        style={{ marginBottom: 24, fontSize: 13 }}
      >
        ← Voltar
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: selectedTheme.previewGradient,
          flexShrink: 0,
        }} />
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.3px', color: T.text, margin: 0 }}>
            Novo relatório
          </h1>
          <p style={{ color: T.muted, fontSize: 12, marginBottom: 0, marginTop: 2 }}>
            {client.name} · {selectedTheme.emoji} {selectedTheme.name}
          </p>
        </div>
      </div>

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

      <FormField label="Origem dos dados">
        {([
          ['meta',   'Meta API',  'Puxa dados automaticamente do Ads Manager'],
          ['csv',    'CSV Upload', 'Importar planilha exportada do Meta Ads'],
          ['manual', 'Manual',    'Relatório em branco — preencher depois'],
        ] as const).map(([id, label, desc]) => (
          <div
            key={id}
            onClick={() => setSrc(id)}
            style={{
              background: T.surface,
              border: src === id ? `1.5px solid ${T.brand}` : `0.5px solid ${T.border}`,
              borderRadius: 9, padding: '11px 13px', cursor: 'pointer',
              marginBottom: 7, display: 'flex', gap: 11, alignItems: 'center',
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

      {src === 'csv' && (
        <FormField label="Arquivo CSV">
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => {
              e.preventDefault()
              setDragOver(false)
              const file = e.dataTransfer.files[0]
              if (file) handleFileSelect(file)
            }}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `1.5px dashed ${dragOver ? T.brand : csvFile ? '#34d399' : T.border}`,
              borderRadius: 9, padding: '18px 14px',
              textAlign: 'center', cursor: 'pointer',
              background: dragOver ? `${T.brand}11` : T.surface,
              transition: 'all 0.15s',
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 6 }}>{csvFile ? '✅' : '📄'}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: csvFile ? '#34d399' : T.text }}>
              {csvFile ? csvFile.name : 'Arraste o CSV aqui ou clique para selecionar'}
            </div>
            <div style={{ fontSize: 10, color: T.muted, marginTop: 4 }}>
              Export do Meta Ads Manager — colunas: Campaign name, Amount spent, Reach, Impressions, Leads
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) handleFileSelect(file)
            }}
          />
          {csvFile && (
            <button
              onClick={() => setCsvFile(null)}
              style={{ marginTop: 6, background: 'none', border: 'none', color: T.muted, fontSize: 11, cursor: 'pointer' }}
            >
              × Remover arquivo
            </button>
          )}
        </FormField>
      )}

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
                    borderRadius: 8, padding: '8px 11px',
                    display: 'flex', gap: 8, alignItems: 'center',
                    cursor: 'pointer', transition: 'border-color 0.15s',
                  }}
                >
                  <div style={{
                    width: 12, height: 12,
                    background: on ? T.brand : T.surface2,
                    border: on ? 'none' : `0.5px solid ${T.border}`,
                    borderRadius: 3, flexShrink: 0, transition: 'background 0.15s',
                  }} />
                  <span style={{ fontSize: 12, color: on ? T.text : T.muted }}>{u.name}</span>
                </div>
              )
            })}
          </div>
        </FormField>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading || !canGenerate}
        style={{
          width: '100%',
          background: (loading || !canGenerate) ? T.surface2 : `linear-gradient(135deg,#5B18A8,${T.brand})`,
          color: (loading || !canGenerate) ? T.muted : '#fff',
          border: 'none', borderRadius: 9, padding: '13px',
          fontSize: 14, fontWeight: 700,
          cursor: (loading || !canGenerate) ? 'not-allowed' : 'pointer',
          marginTop: 6, letterSpacing: '-0.2px', transition: 'opacity 0.15s',
        }}
      >
        {btnLabel}
      </button>
    </div>
  )
}

// ── Template picker card ──────────────────────────────

function TemplatePickerCard({
  theme, selected, onSelect,
}: { theme: SlideTheme; selected: boolean; onSelect: () => void }) {
  return (
    <div
      onClick={onSelect}
      style={{
        border: selected ? `2px solid #8833ff` : `1.5px solid ${T.border}`,
        borderRadius: 10,
        overflow: 'hidden',
        cursor: 'pointer',
        background: T.surface,
        transition: 'border-color 0.15s, box-shadow 0.15s',
        boxShadow: selected ? '0 0 0 3px rgba(136,51,255,0.15)' : 'none',
        position: 'relative',
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = '#c084fc' }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = T.border }}
    >
      {/* Mini preview */}
      <div style={{ padding: 6, background: '#e5e7eb' }}>
        <ThemePreviewMini theme={theme} width={208} style={{ borderRadius: 5 }} />
      </div>

      {/* Name + check */}
      <div style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>
          {theme.emoji} {theme.name}
        </span>
        {selected ? (
          <div style={{
            width: 16, height: 16, borderRadius: '50%',
            background: '#8833ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, color: '#fff', fontWeight: 700, flexShrink: 0,
          }}>
            ✓
          </div>
        ) : (
          <div style={{
            width: 16, height: 16, borderRadius: '50%',
            border: `1.5px solid ${T.border}`,
            flexShrink: 0,
          }} />
        )}
      </div>
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
