import { useEffect, useState } from 'react'
import type { Client, Report, Screen } from '../lib/types'
import { apiReports } from '../lib/api'
import { T } from '../styles/tokens'

interface ClientViewProps {
  client: Client
  onNavigate: (screen: Screen, client?: Client) => void
  onSelectReport: (report: Report) => void
  showToast: (msg: string) => void
}

export function ClientView({ client, onNavigate, onSelectReport, showToast }: ClientViewProps) {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiReports.list(client.id)
      .then(setReports)
      .catch(() => setReports([]))
      .finally(() => setLoading(false))
  }, [client.id])

  const handleDelete = async (reportId: string) => {
    try {
      await apiReports.delete(reportId)
      // Remove from state
      setReports(prev => prev.filter(r => r.id !== reportId))
      // Clean up localStorage entries
      try {
        localStorage.removeItem(`report-template-${reportId}`)
        localStorage.removeItem(`img-edits-${reportId}`)
      } catch { /* ignore */ }
      showToast('Relatório excluído')
    } catch {
      showToast('Erro ao excluir relatório')
    }
  }

  const typeLabel = client.type === 'franchise' ? 'Franquia' : 'Lead Gen — B2B'

  return (
    <div style={{ padding: '38px 42px', animation: 'fadein 0.25s ease' }}>
      {/* Back */}
      <button
        onClick={() => onNavigate('dashboard')}
        className="btn-ghost"
        style={{ marginBottom: 24, fontSize: 13 }}
      >
        ← Voltar
      </button>

      {/* Client header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{
            width: 50, height: 50, borderRadius: 12,
            background: 'linear-gradient(135deg,#3D1580,#8B35E8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17, fontWeight: 800, color: '#fff',
          }}>
            {client.name[0]}
          </div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', color: T.text }}>
              {client.name}
            </h1>
            <div style={{ fontSize: 14, color: T.muted, marginTop: 4 }}>
              {typeLabel}
              {client.description ? ` · ${client.description}` : ''}
            </div>
          </div>
        </div>
        <button
          className="btn-primary"
          style={{ padding: '10px 20px', fontSize: 13, fontWeight: 700 }}
          onClick={() => onNavigate('form', client)}
        >
          + Novo relatório
        </button>
      </div>

      {/* Reports list */}
      <div style={{
        fontSize: 11, fontWeight: 700, color: T.hint,
        letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 14,
      }}>
        Histórico
      </div>

      {loading ? (
        <div style={{ color: T.hint, fontSize: 13 }}>Carregando...</div>
      ) : reports.length === 0 ? (
        <div style={{
          background: T.surface,
          border: `0.5px solid ${T.border}`,
          borderRadius: 12,
          padding: '28px 24px',
          textAlign: 'center',
          color: T.hint,
          fontSize: 15,
        }}>
          Nenhum relatório gerado ainda. Clique em "+ Novo relatório" para começar.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {reports.map(r => (
            <ReportRow
              key={r.id}
              report={r}
              onView={() => { onSelectReport(r); onNavigate('report', client) }}
              onDownload={() => showToast('PDF disponível após geração completa')}
              onDelete={() => handleDelete(r.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface ReportRowProps {
  report: Report
  onView: () => void
  onDownload: () => void
  onDelete: () => void
}

function ReportRow({ report, onView, onDownload, onDelete }: ReportRowProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const statusColor = report.status === 'ready'
    ? '#22C55E'
    : report.status === 'error'
    ? '#ff6b6b'
    : '#f59e0b'

  const statusLabel = report.status === 'ready'
    ? 'Pronto'
    : report.status === 'error'
    ? 'Erro'
    : 'Gerando...'

  const formattedDate = new Date(report.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric'
  })

  const handleConfirmDelete = async () => {
    setDeleting(true)
    await onDelete()
    // (component unmounts after deletion, no need to reset state)
  }

  return (
    <div style={{
      background: T.surface,
      border: `0.5px solid ${confirmDelete ? '#ff6b6b44' : T.border}`,
      borderRadius: 10,
      padding: '13px 17px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      transition: 'border-color 0.15s',
    }}
      onMouseEnter={e => { if (!confirmDelete) e.currentTarget.style.borderColor = T.borderHover }}
      onMouseLeave={e => { if (!confirmDelete) e.currentTarget.style.borderColor = T.border }}
    >
      {/* Left: status + info */}
      <div style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
        <div style={{
          width: 7, height: 7, borderRadius: '50%',
          background: statusColor, flexShrink: 0,
        }} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: T.text }}>{report.period_label}</div>
          <div style={{ fontSize: 13, color: T.muted, marginTop: 2 }}>
            Gerado em {formattedDate} · {statusLabel}
          </div>
        </div>
      </div>

      {/* Right: actions */}
      <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
        {confirmDelete ? (
          /* Inline confirmation */
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#ff6b6b', fontWeight: 600 }}>
              Excluir permanentemente?
            </span>
            <button
              onClick={handleConfirmDelete}
              disabled={deleting}
              style={{
                background: '#ff6b6b',
                color: '#fff',
                border: 'none',
                borderRadius: 5,
                padding: '5px 13px',
                fontSize: 13,
                fontWeight: 700,
                cursor: deleting ? 'not-allowed' : 'pointer',
                opacity: deleting ? 0.7 : 1,
              }}
            >
              {deleting ? 'Excluindo...' : 'Sim, excluir'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              style={{
                background: 'none',
                border: `1px solid ${T.border}`,
                borderRadius: 5,
                padding: '5px 12px',
                fontSize: 13,
                color: T.muted,
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
          </div>
        ) : (
          <>
            {report.status === 'ready' && (
              <button className="btn-ghost" style={{ fontSize: 12 }} onClick={onView}>
                Ver preview
              </button>
            )}
            <button className="btn-ghost" style={{ fontSize: 12 }} onClick={onDownload}>
              ↓ PDF
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              title="Excluir relatório"
              style={{
                background: 'none',
                border: 'none',
                padding: '4px 6px',
                borderRadius: 5,
                cursor: 'pointer',
                color: T.hint,
                fontSize: 14,
                lineHeight: 1,
                transition: 'color 0.1s, background 0.1s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#ff6b6b'; e.currentTarget.style.background = 'rgba(255,107,107,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.color = T.hint; e.currentTarget.style.background = 'none' }}
            >
              🗑
            </button>
          </>
        )}
      </div>
    </div>
  )
}
