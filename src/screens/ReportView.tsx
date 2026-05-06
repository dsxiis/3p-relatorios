import { useState } from 'react'
import type { Client, Report, Screen, EditState } from '../lib/types'
import { T } from '../styles/tokens'
import { apiReports } from '../lib/api'

// Rizon slides
import { RizonCover } from '../slides/RizonCover'
import { RizonMetrics } from '../slides/RizonMetrics'
import { RizonVendedor } from '../slides/RizonVendedor'
import { RizonTodo } from '../slides/RizonTodo'

// Folks slides
import { FolksCover } from '../slides/FolksCover'
import { FolksUnit } from '../slides/FolksUnit'
import { FolksFranqueadora } from '../slides/FolksFranqueadora'

// Mock data for preview (matches DB seed, used when report.raw_data is null)
import { MOCK_RIZON, MOCK_FOLKS } from '../lib/mockData'

interface ReportViewProps {
  client: Client
  report: Report | null
  onNavigate: (screen: Screen, client?: Client) => void
  showToast: (msg: string) => void
}

export function ReportView({ client, report, onNavigate, showToast }: ReportViewProps) {
  const [editing, setEditing] = useState<string | null>(null)
  const [edits, setEdits] = useState<Record<string, string>>(report?.edits ?? {})
  const [_saving, setSaving] = useState(false)

  const isRizon = client.type === 'lead_gen'

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
      if (report) {
        try {
          await apiReports.saveEdit(report.id, id, edits[id] ?? defaultValue)
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

  const periodLabel = report?.period_label ?? 'Março / 2026'

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
          <button
            className="btn-ghost"
            onClick={() => showToast('Compartilhamento disponível em breve')}
          >
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {isRizon ? (
          <>
            <RizonCover periodLabel={periodLabel} />
            <RizonMetrics data={MOCK_RIZON} />
            {MOCK_RIZON.vendedores.map(v => (
              <RizonVendedor
                key={v.id}
                data={v}
                e={mkEdit(`rv-${v.id}`, v.anotacoes)}
              />
            ))}
            <RizonTodo data={MOCK_RIZON} mkEdit={mkEdit} />
          </>
        ) : (
          <>
            <FolksCover periodLabel={periodLabel} />
            {MOCK_FOLKS.units.map(u => (
              <FolksUnit
                key={u.city}
                data={u}
                e={mkEdit(`fu-${u.city}`, u.anotacoes)}
              />
            ))}
            <FolksFranqueadora periodLabel={periodLabel} />
          </>
        )}
      </div>
    </div>
  )
}
