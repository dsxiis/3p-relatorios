import { useState, useRef } from 'react'
import type { Client, Screen, DataSource } from '../lib/types'
import { apiReports } from '../lib/api'
import { parseCsvFile } from '../lib/csvParser'
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
  onGenerate: (reportId: string) => void
  showToast?: (msg: string) => void
}

export function FormView({ client, onNavigate, onGenerate, showToast }: FormViewProps) {
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
        csv_data: csvData,
        unit_ids: isFranchise ? selectedUnits : undefined,
      })

      const reportId = (result as { id: string }).id
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

  return (
    <div style={{ padding: '38px 42px', maxWidth: 560, animation: 'fadein 0.25s ease' }}>
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
