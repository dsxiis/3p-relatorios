import { useState, useRef, useMemo } from 'react'
import type { Client, Screen, DataSource } from '../lib/types'
import { apiReports, apiClients } from '../lib/api'
import { parseCsvFile } from '../lib/csvParser'
import { T } from '../styles/tokens'
import { ALL_THEMES } from '../lib/themes'
import { ThemePreviewMini } from '../components/slides/ThemePreviewMini'
import { MetaAccountPicker } from '../components/MetaAccountPicker'

// ── Date helpers ─────────────────────────────────────
// Use local timezone (not UTC) to avoid off-by-one on BR time
function fmt(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}
function today() { return new Date() }
function startOfMonth(offset = 0) {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth() + offset, 1)
}
function endOfMonth(offset = 0) {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth() + offset + 1, 0)
}

const MONTH_PT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
function monthLabel(offset = 0) {
  const d = new Date()
  const m = new Date(d.getFullYear(), d.getMonth() + offset, 1)
  return `${MONTH_PT[m.getMonth()]} ${m.getFullYear()}`
}
function monthFull(offset = 0) {
  const FULL = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
  const d = new Date()
  const m = new Date(d.getFullYear(), d.getMonth() + offset, 1)
  return `${FULL[m.getMonth()]} / ${m.getFullYear()}`
}

interface Preset {
  label: string
  short: string
  start: string
  end: string
}

function buildPresets(): Preset[] {
  return [
    { label: 'Últimos 7 dias',   short: '7d',    start: fmt(daysAgo(7)),         end: fmt(today()) },
    { label: 'Últimos 14 dias',  short: '14d',   start: fmt(daysAgo(14)),        end: fmt(today()) },
    { label: 'Últimos 30 dias',  short: '30d',   start: fmt(daysAgo(30)),        end: fmt(today()) },
    { label: 'Este mês',         short: 'Mês',   start: fmt(startOfMonth(0)),    end: fmt(today()) },
    { label: monthFull(-1),      short: monthLabel(-1), start: fmt(startOfMonth(-1)), end: fmt(endOfMonth(-1)) },
    { label: monthFull(-2),      short: monthLabel(-2), start: fmt(startOfMonth(-2)), end: fmt(endOfMonth(-2)) },
    { label: 'Últimos 90 dias',  short: '90d',   start: fmt(daysAgo(90)),        end: fmt(today()) },
    { label: 'Últimos 6 meses',  short: '6m',    start: fmt(daysAgo(182)),       end: fmt(today()) },
    { label: 'Últimos 12 meses', short: '12m',   start: fmt(daysAgo(365)),       end: fmt(today()) },
    { label: 'Personalizado',    short: '...',   start: '',                       end: '' },
  ]
}

interface FormViewProps {
  client: Client
  onNavigate: (screen: Screen, client?: Client) => void
  onGenerate: (reportId: string) => void
  showToast?: (msg: string) => void
  onClientUpdated?: (updated: Client) => void
}

export function FormView({ client, onNavigate, onGenerate, showToast, onClientUpdated }: FormViewProps) {
  // Compute presets fresh on each render (avoids stale dates if page cached)
  const presets = useMemo(() => buildPresets(), [])

  const [selectedThemeId, setSelectedThemeId] = useState('dark-premium')
  const [presetIdx, setPresetIdx] = useState(3) // "Este mês"
  const [customStart, setCustomStart] = useState(fmt(startOfMonth(-1)))
  const [customEnd, setCustomEnd] = useState(fmt(endOfMonth(-1)))
  const [src, setSrc] = useState<DataSource>('meta')
  const [linkingAccount, setLinkingAccount] = useState(false)
  const [localMetaAccount, setLocalMetaAccount] = useState<string | null>(client.meta_account_id)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [selectedUnits, setSelectedUnits] = useState<string[]>(
    client.units?.map(u => u.id) ?? []
  )
  const [loading, setLoading] = useState(false)
  const [showThemes, setShowThemes] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isFranchise = client.type === 'franchise'
  const unitItems = client.units && client.units.length > 0
    ? client.units.map(u => ({ id: u.id, name: u.name }))
    : []

  const toggleUnit = (id: string) => {
    setSelectedUnits(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith('.csv')) { showToast?.('Arquivo deve ser .csv'); return }
    setCsvFile(file)
  }

  const preset = presets[presetIdx]
  const isCustom = preset.short === '...'
  const activePeriod = isCustom
    ? { label: `${customStart} → ${customEnd}`, start: customStart, end: customEnd }
    : preset

  const handleGenerate = async () => {
    setLoading(true)
    try {
      let csvData: string | undefined
      if (src === 'csv' && csvFile) {
        const rows = await parseCsvFile(csvFile)
        csvData = JSON.stringify(rows)
      }

      const result = await apiReports.generate({
        client_id: client.id,
        period_start: activePeriod.start,
        period_end: activePeriod.end,
        period_label: activePeriod.label,
        source: src,
        template_id: selectedThemeId,
        csv_data: csvData,
        unit_ids: isFranchise ? selectedUnits : undefined,
      })

      const reportId = (result as { id: string }).id
      try { localStorage.setItem(`report-template-${reportId}`, selectedThemeId) } catch { /* ignore */ }
      onGenerate(reportId)
    } catch (err) {
      showToast?.('Erro ao iniciar geração. Verifique a conexão.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const canGenerate =
    (src !== 'csv' || csvFile !== null) &&
    (src !== 'meta' || !!localMetaAccount) &&
    (!isCustom || (customStart !== '' && customEnd !== '' && customStart <= customEnd)) &&
    (!isFranchise || selectedUnits.length > 0)

  const selectedTheme = ALL_THEMES.find(t => t.id === selectedThemeId)!

  return (
    <div style={{ padding: '40px 44px', maxWidth: 600, animation: 'fadein 0.25s ease' }}>
      {/* Back */}
      <button
        onClick={() => onNavigate('client', client)}
        className="btn-ghost"
        style={{ marginBottom: 28, fontSize: 13 }}
      >
        ← {client.name}
      </button>

      {/* Title */}
      <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', color: T.text, marginBottom: 6 }}>
        Novo relatório
      </h1>
      <p style={{ color: T.muted, fontSize: 14, marginBottom: 32 }}>
        {isFranchise ? 'Franquia' : 'Lead Gen'} · Preencha as opções abaixo e clique em gerar.
      </p>

      {/* ── Período ── */}
      <Section label="Período">
        {/* Button group — compact pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: isCustom ? 10 : 0 }}>
          {presets.map((p, i) => (
            <button
              key={p.short}
              onClick={() => setPresetIdx(i)}
              style={{
                padding: '6px 13px',
                borderRadius: 7,
                border: `1.5px solid ${presetIdx === i ? T.brand : T.border}`,
                background: presetIdx === i ? `${T.brand}18` : 'none',
                color: presetIdx === i ? T.brand : T.muted,
                fontSize: 13,
                fontWeight: presetIdx === i ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.12s',
              }}
            >
              {p.short}
            </button>
          ))}
        </div>

        {/* Show selected range */}
        {!isCustom && (
          <div style={{ fontSize: 12, color: T.hint, marginTop: 8 }}>
            {activePeriod.label} &nbsp;·&nbsp; {activePeriod.start} → {activePeriod.end}
          </div>
        )}

        {/* Custom date range */}
        {isCustom && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
            <input
              type="date"
              value={customStart}
              onChange={e => setCustomStart(e.target.value)}
              className="input"
              style={{ flex: 1 }}
            />
            <span style={{ color: T.muted }}>→</span>
            <input
              type="date"
              value={customEnd}
              max={fmt(today())}
              onChange={e => setCustomEnd(e.target.value)}
              className="input"
              style={{ flex: 1 }}
            />
          </div>
        )}
      </Section>

      {/* ── Origem dos dados ── */}
      <Section label="Origem dos dados">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {([
            ['meta',   'Meta API',    'Puxar automaticamente do Ads Manager'],
            ['csv',    'CSV',          'Importar planilha exportada do Meta Ads'],
            ['manual', 'Manual',       'Relatório em branco para preencher depois'],
          ] as const).map(([id, label, desc]) => (
            <div
              key={id}
              onClick={() => setSrc(id)}
              style={{
                background: src === id ? `${T.brand}0d` : T.surface,
                border: `1.5px solid ${src === id ? T.brand : T.border}`,
                borderRadius: 10, padding: '12px 14px', cursor: 'pointer',
                display: 'flex', gap: 12, alignItems: 'center',
                transition: 'all 0.12s',
              }}
            >
              <div style={{
                width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                border: src === id ? `5px solid ${T.brand}` : `2px solid ${T.border}`,
                transition: 'border 0.1s',
              }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{label}</div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Meta account status */}
      {src === 'meta' && (
        <div style={{ marginBottom: 24 }}>
          {localMetaAccount && !linkingAccount ? (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#22c55e0d', border: '1.5px solid #22c55e44',
              borderRadius: 10, padding: '11px 14px',
            }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#22c55e', marginBottom: 2 }}>
                  ● Conta Meta vinculada
                </div>
                <div style={{ fontSize: 13, color: T.text, fontFamily: 'monospace' }}>
                  act_{localMetaAccount}
                </div>
              </div>
              <button
                onClick={() => setLinkingAccount(true)}
                style={{ background: 'none', border: 'none', fontSize: 12, color: T.muted, cursor: 'pointer' }}
              >
                Trocar
              </button>
            </div>
          ) : !linkingAccount ? (
            <div style={{
              background: '#f59e0b0d', border: '1.5px solid #f59e0b44',
              borderRadius: 10, padding: '12px 14px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', marginBottom: 2 }}>
                  Nenhuma conta Meta vinculada
                </div>
                <div style={{ fontSize: 12, color: T.muted }}>
                  Configure uma conta para puxar dados automaticamente.
                </div>
              </div>
              <button
                onClick={() => setLinkingAccount(true)}
                style={{
                  background: T.brand, color: '#fff', border: 'none',
                  borderRadius: 8, padding: '7px 14px',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
                }}
              >
                Configurar →
              </button>
            </div>
          ) : (
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '14px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 10 }}>
                Selecionar conta Meta Ads
              </div>
              <MetaAccountPicker
                selectedId={localMetaAccount}
                onSelect={async (acc) => {
                  const cleanId = acc.id.replace('act_', '')
                  setLocalMetaAccount(cleanId)
                  setLinkingAccount(false)
                  try {
                    const updated = await apiClients.updateAccount(client.id, cleanId)
                    onClientUpdated?.(updated)
                  } catch {
                    showToast?.('Erro ao salvar conta')
                  }
                }}
                onSkip={() => setLinkingAccount(false)}
                skipLabel="Cancelar"
              />
            </div>
          )}
        </div>
      )}

      {/* CSV upload */}
      {src === 'csv' && (
        <div style={{ marginBottom: 24 }}>
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f) }}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `1.5px dashed ${dragOver ? T.brand : csvFile ? '#34d399' : T.border}`,
              borderRadius: 10, padding: '22px 18px',
              textAlign: 'center', cursor: 'pointer',
              background: dragOver ? `${T.brand}0d` : T.surface,
              transition: 'all 0.15s',
            }}
          >
            <div style={{ fontSize: 26, marginBottom: 8 }}>{csvFile ? '✅' : '📄'}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: csvFile ? '#34d399' : T.text }}>
              {csvFile ? csvFile.name : 'Arraste o arquivo CSV aqui'}
            </div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>
              ou clique para selecionar · Export do Meta Ads Manager
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f) }}
          />
          {csvFile && (
            <button
              onClick={() => setCsvFile(null)}
              style={{ marginTop: 6, background: 'none', border: 'none', color: T.muted, fontSize: 11, cursor: 'pointer' }}
            >
              × Remover arquivo
            </button>
          )}
        </div>
      )}

      {/* Franchise unit selection */}
      {isFranchise && unitItems.length > 0 && (
        <Section label={`Unidades (${selectedUnits.length} selecionadas)`}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
            {unitItems.map(u => {
              const on = selectedUnits.includes(u.id)
              return (
                <div
                  key={u.id}
                  onClick={() => toggleUnit(u.id)}
                  style={{
                    background: on ? `${T.brand}0d` : T.surface,
                    border: `1.5px solid ${on ? T.brand : T.border}`,
                    borderRadius: 8, padding: '9px 12px',
                    display: 'flex', gap: 9, alignItems: 'center',
                    cursor: 'pointer', transition: 'all 0.12s',
                  }}
                >
                  <div style={{
                    width: 14, height: 14,
                    background: on ? T.brand : 'none',
                    border: on ? 'none' : `2px solid ${T.border}`,
                    borderRadius: 4, flexShrink: 0, transition: 'all 0.12s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {on && <span style={{ fontSize: 9, color: '#fff', fontWeight: 800 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 13, color: on ? T.text : T.muted, fontWeight: on ? 600 : 400 }}>{u.name}</span>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* Theme picker (collapsible) */}
      <div style={{ marginBottom: 28 }}>
        <button
          onClick={() => setShowThemes(o => !o)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            padding: 0, marginBottom: showThemes ? 12 : 0,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, color: T.hint, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Visual do relatório
          </span>
          <div style={{
            width: 18, height: 18, borderRadius: 4,
            background: selectedTheme.previewGradient,
            flexShrink: 0,
          }} />
          <span style={{ fontSize: 12, color: T.muted }}>
            {selectedTheme.emoji} {selectedTheme.name}
          </span>
          <span style={{ fontSize: 11, color: T.hint }}>{showThemes ? '▲' : '▼'}</span>
        </button>

        {showThemes && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
            {ALL_THEMES.map(theme => (
              <div
                key={theme.id}
                onClick={() => { setSelectedThemeId(theme.id); setShowThemes(false) }}
                style={{
                  border: selectedThemeId === theme.id ? `2px solid ${T.brand}` : `1.5px solid ${T.border}`,
                  borderRadius: 9, overflow: 'hidden', cursor: 'pointer',
                  background: T.surface,
                  boxShadow: selectedThemeId === theme.id ? `0 0 0 3px ${T.brand}22` : 'none',
                  transition: 'all 0.12s',
                }}
              >
                <div style={{ padding: 5, background: '#e5e7eb' }}>
                  <ThemePreviewMini theme={theme} width={130} style={{ borderRadius: 4 }} />
                </div>
                <div style={{ padding: '6px 8px', fontSize: 11, fontWeight: 600, color: T.text }}>
                  {theme.emoji} {theme.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={loading || !canGenerate}
        style={{
          width: '100%',
          background: (loading || !canGenerate)
            ? T.surface2
            : `linear-gradient(135deg, #5B18A8, #8833ff)`,
          color: (loading || !canGenerate) ? T.muted : '#fff',
          border: 'none', borderRadius: 10, padding: '15px',
          fontSize: 16, fontWeight: 700,
          cursor: (loading || !canGenerate) ? 'not-allowed' : 'pointer',
          letterSpacing: '-0.2px',
          transition: 'opacity 0.15s',
        }}
      >
        {loading
          ? 'Iniciando...'
          : !canGenerate && src === 'meta' && !localMetaAccount
          ? 'Configure a conta Meta para continuar'
          : !canGenerate && isFranchise && selectedUnits.length === 0
          ? 'Selecione ao menos uma unidade'
          : isFranchise
          ? `Gerar ${selectedUnits.length} relatório${selectedUnits.length !== 1 ? 's' : ''} →`
          : 'Gerar relatório →'
        }
      </button>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.hint, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
        {label}
      </div>
      {children}
    </div>
  )
}
