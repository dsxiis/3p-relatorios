import { useState } from 'react'
import type { Client, Report, Screen, EditState, LeadGenData, FranchiseData } from '../lib/types'
import { T } from '../styles/tokens'
import { apiReports } from '../lib/api'
import { getTemplateForClientType } from '../templates/index'
import { MOCK_RIZON, MOCK_FOLKS } from '../lib/mockData'
import { SlideThemeProvider } from '../lib/themeContext'

interface ReportViewProps {
  client: Client
  report: Report | null
  onNavigate: (screen: Screen, client?: Client) => void
  showToast: (msg: string) => void
}

// Convert mock Rizon data to LeadGenData shape
function mockToLeadGen(clientName: string): LeadGenData {
  const r = MOCK_RIZON
  return {
    client: clientName,
    period: '01/03 - 31/03',
    investment: parseFloat(r.investment.replace('.', '').replace(',', '.')),
    totals: {
      reach: parseInt(r.alcance.replace('.', '')),
      impressions: parseInt(r.impressoes.replace('.', '')),
      clicks: parseInt(r.cliques.replace('.', '')),
      leads: parseInt(r.leads.replace('.', '')),
      cpl: parseFloat(r.cpl.replace(',', '.')),
    },
    campaigns: r.vendedores.map(v => ({
      id: v.id,
      name: `Vendedor ${v.id}`,
      spend: parseFloat(v.inv.replace('R$', '').replace('.', '').replace(',', '.').trim()),
      impressions: parseInt(v.impressoes.replace('.', '')),
      clicks: parseInt(v.cliques.replace('.', '')),
      leads: parseInt(v.leads.replace('.', '')),
      cpl: parseFloat(v.cpl.replace('R$', '').replace(',', '.').trim()),
      cplPrevPeriod: parseFloat(v.cplPrev.replace(/[^\d,]/g, '').replace(',', '.')),
      topCreative: {
        clicks: parseInt(v.cliques),
        leads: parseInt(v.leadsTop),
        cpl: parseFloat(v.cplTop.replace('R$', '').replace(',', '.').trim()),
      },
      annotation: v.anotacoes,
    })),
    todos3P: r.todos3P,
    todosClient: r.todosCliente,
  }
}

// Convert mock Folks data to FranchiseData shape
function mockToFranchise(clientName: string): FranchiseData {
  const f = MOCK_FOLKS
  return {
    client: clientName,
    period: '01/03 - 31/03',
    units: f.units.map((u, i) => ({
      id: `unit-${i}`,
      city: u.city,
      impressions: parseInt(u.impressoes.replace('.', '')),
      reach: parseInt(u.alcance.replace('.', '')),
      conversations: parseInt(u.conversas.replace('.', '')),
      cpc: parseFloat(u.cpc.replace('R$', '').replace(',', '.').trim()),
      spend: parseFloat(u.valor.replace('R$', '').replace('.', '').replace(',', '.').trim()),
      bestAd: {
        clicks: parseInt(u.adCliques),
        messages: parseInt(u.adMsg),
        cpl: parseFloat(u.adCpl.replace('R$', '').replace(',', '.').trim()),
      },
      bestVideo: {
        clicks: parseInt(u.vidCliques),
        messages: parseInt(u.vidMsg),
        cpl: parseFloat(u.vidCpl.replace('R$', '').replace(',', '.').trim()),
      },
      annotation: u.anotacoes,
    })),
    franchiseHistory: [],
  }
}

export function ReportView({ client, report, onNavigate, showToast }: ReportViewProps) {
  const [editing, setEditing] = useState<string | null>(null)
  const [_saving, setSaving] = useState(false)

  const reportKey = report?.id ?? `preview-${client.id}`

  // Load persisted edits: text from report.edits, images from localStorage
  const [edits, setEdits] = useState<Record<string, string>>(() => {
    const base = report?.edits ?? {}
    // Merge image edits from localStorage
    try {
      const stored = localStorage.getItem(`img-edits-${reportKey}`)
      if (stored) return { ...base, ...JSON.parse(stored) }
    } catch { /* ignore */ }
    return base
  })

  const template = getTemplateForClientType(client.type)

  // Resolve theme: from report (if worker saves it), then from per-report localStorage key, then default.
  // NOTE: intentionally NOT using a per-client fallback — that was causing themes to leak across reports.
  const themeId = report?.template_id
    ?? (() => {
      try { return localStorage.getItem(`report-template-${reportKey}`) } catch { return null }
    })()
    ?? 'dark-premium'

  // Resolve data: real raw_data from report, or mock fallback for dev/preview
  const data = report?.raw_data ?? (
    client.type === 'lead_gen'
      ? mockToLeadGen(client.name)
      : mockToFranchise(client.name)
  )

  const periodLabel = report?.period_label ?? 'Março / 2026'

  const mkEdit = (id: string, defaultValue: string): EditState => ({
    id,
    active: editing === id,
    value: edits[id] !== undefined ? edits[id] : defaultValue,
    start: () => {
      setEditing(id)
      if (edits[id] === undefined) {
        setEdits(prev => ({ ...prev, [id]: defaultValue }))
      }
    },
    change: (v: string) => setEdits(prev => ({ ...prev, [id]: v })),
    save: async () => {
      setSaving(true)
      setEditing(null)
      const value = edits[id] ?? defaultValue
      const isImage = value.startsWith('data:') || value === ''

      if (isImage) {
        // Images stay in localStorage — too large for API
        try {
          const stored = localStorage.getItem(`img-edits-${reportKey}`)
          const imgEdits = stored ? JSON.parse(stored) : {}
          if (value) imgEdits[id] = value
          else delete imgEdits[id]
          localStorage.setItem(`img-edits-${reportKey}`, JSON.stringify(imgEdits))
        } catch { /* ignore */ }
        showToast('✓ Imagem salva')
      } else if (report) {
        try {
          await apiReports.saveEdit(report.id, id, value)
          showToast('✓ Alteração salva')
        } catch {
          showToast('✓ Salvo localmente')
        }
      } else {
        showToast('✓ Alteração salva')
      }
      setSaving(false)
    },
  })

  const slides = template.renderSlides(data as any, mkEdit)

  return (
    <div style={{ padding: '22px 22px 60px', animation: 'fadein 0.2s ease' }}>
      {/* Topbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => onNavigate('client', client)}
            style={{ background: 'none', border: 'none', color: T.muted, fontSize: 18, cursor: 'pointer', lineHeight: 1 }}
          >
            ←
          </button>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
              {client.name} — {periodLabel}
            </div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>
              Clique em ✏ nos blocos de texto para editar
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 7 }}>
          <button className="btn-ghost" onClick={() => showToast('Compartilhamento disponível em breve')}>
            Compartilhar
          </button>
          <button
            className="btn-primary"
            style={{ fontSize: 12 }}
            onClick={() => showToast('PDF via Cloudflare Browser Rendering — disponível em breve')}
          >
            ↓ Exportar PDF
          </button>
        </div>
      </div>

      {/* Slides */}
      <SlideThemeProvider themeId={themeId}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {slides}
        </div>
      </SlideThemeProvider>
    </div>
  )
}
