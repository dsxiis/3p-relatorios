import { useEffect, useRef, useState } from 'react'
import type { Client, DashboardStats, Screen } from '../lib/types'
import { apiClients, apiStats } from '../lib/api'
import { T } from '../styles/tokens'
import { NewClientModal } from '../components/NewClientModal'
import { StatsRow } from '../components/StatsRow'
import { ReportsBarChart } from '../components/ReportsBarChart'
import { RecentActivity } from '../components/RecentActivity'
import { relativeTime } from '../lib/utils'

interface DashboardProps {
  onSelectClient: (client: Client) => void
  onNavigate: (screen: Screen, client?: Client) => void
  showToast: (msg: string) => void
}

export function Dashboard({ onSelectClient, onNavigate, showToast }: DashboardProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchClients = () => {
    setLoading(true)
    apiClients.list()
      .then(setClients)
      .catch(() => setClients([]))
      .finally(() => setLoading(false))
  }

  const fetchStats = () => {
    setStatsLoading(true)
    apiStats.get()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false))
  }

  useEffect(() => {
    fetchClients()
    fetchStats()
  }, [])

  const handleCreated = (client: Client) => {
    setShowModal(false)
    showToast(`✓ ${client.name} criado`)
    fetchClients()
    fetchStats()
  }

  const handleRenamed = (id: string, name: string) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, name } : c))
  }

  const handleDeleted = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id))
    showToast('Cliente removido')
    fetchStats()
  }

  const handleGenerate = (client: Client) => {
    onSelectClient(client)
    onNavigate('form', client)
  }

  const handleView = (client: Client) => {
    onSelectClient(client)
    onNavigate('client', client)
  }

  const handleNavigateToClient = (clientId: string) => {
    const c = clients.find(x => x.id === clientId)
    if (c) { onSelectClient(c); onNavigate('client', c) }
  }

  const hasChartData = !statsLoading && (stats?.monthly_counts?.length ?? 0) > 0

  return (
    <div className="screen-root" style={{ animation: 'fadein 0.25s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.6px', color: T.text, marginBottom: 6 }}>
            Dashboard
          </h1>
          <p style={{ color: T.muted, fontSize: 14 }}>
            Visão geral da sua operação de relatórios.
          </p>
        </div>
        <button
          className="btn-primary"
          style={{ fontSize: 14, padding: '10px 20px', fontWeight: 700, marginTop: 4 }}
          onClick={() => setShowModal(true)}
        >
          + Novo cliente
        </button>
      </div>

      {/* Stats cards */}
      <StatsRow stats={stats} loading={statsLoading} />

      {/* Chart + Activity row */}
      {(hasChartData || statsLoading || (stats && stats.recent_reports.length > 0)) && (
        <div className="dash-row">
          {/* Bar chart */}
          {(hasChartData || statsLoading) && (
            <div className="dash-chart-cell">
              {statsLoading ? (
                <div style={{
                  background: T.surface, border: `0.5px solid ${T.border}`,
                  borderRadius: 14, height: 220,
                  animation: 'pulse 1.4s ease-in-out infinite',
                }} />
              ) : stats?.monthly_counts && stats.monthly_counts.length > 0 ? (
                <ReportsBarChart months={stats.monthly_counts} />
              ) : null}
            </div>
          )}

          {/* Recent activity */}
          <div className="dash-activity-cell">
            <RecentActivity
              reports={stats?.recent_reports ?? []}
              loading={statsLoading}
              onNavigateToClient={handleNavigateToClient}
            />
          </div>
        </div>
      )}

      {/* Client list header + search */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, marginBottom: 12, flexWrap: 'wrap',
      }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: T.hint,
          letterSpacing: '0.8px', textTransform: 'uppercase',
        }}>
          Clientes {search && clients.length > 0 && (
            <span style={{ fontWeight: 500, marginLeft: 6, color: T.muted, textTransform: 'none', letterSpacing: 0 }}>
              · {clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).length} de {clients.length}
            </span>
          )}
        </div>
        {clients.length > 0 && (
          <div style={{ position: 'relative', flex: '0 1 280px', minWidth: 200 }}>
            <span style={{
              position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
              fontSize: 12, color: T.hint, pointerEvents: 'none',
            }}>🔎</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar cliente..."
              style={{
                width: '100%', padding: '7px 32px 7px 32px',
                borderRadius: 9, border: `0.5px solid ${T.border}`,
                background: T.surface, color: T.text,
                fontSize: 13, outline: 'none',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = T.brand; e.currentTarget.style.boxShadow = `0 0 0 3px ${T.brandDim}` }}
              onBlur={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = 'none' }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: T.muted, cursor: 'pointer',
                  fontSize: 14, padding: '2px 6px', lineHeight: 1,
                }}
                title="Limpar busca"
              >
                ×
              </button>
            )}
          </div>
        )}
      </div>

      {/* Client list */}
      {loading ? (
        <div style={{ color: T.hint, fontSize: 14, padding: '32px 0', textAlign: 'center' }}>
          Carregando clientes...
        </div>
      ) : clients.length === 0 ? (
        <EmptyState onAdd={() => setShowModal(true)} />
      ) : (() => {
        const filtered = search
          ? clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
          : clients
        if (filtered.length === 0) {
          return (
            <div style={{
              color: T.hint, fontSize: 13, padding: '40px 0', textAlign: 'center',
              border: `0.5px dashed ${T.border}`, borderRadius: 12,
            }}>
              Nenhum cliente encontrado para <strong style={{ color: T.muted }}>"{search}"</strong>
              <br />
              <button
                onClick={() => setSearch('')}
                style={{
                  marginTop: 10, background: 'none', border: `0.5px solid ${T.border}`,
                  borderRadius: 7, padding: '5px 14px', fontSize: 12,
                  color: T.muted, cursor: 'pointer',
                }}
              >
                Limpar busca
              </button>
            </div>
          )
        }
        return (
        <div className="dash-clients-grid">
          {filtered.map((c, i) => {
            const perClient = stats?.per_client_counts?.find(x => x.client_id === c.id)
            return (
              <ClientCard
                key={c.id}
                client={c}
                delay={i * 50}
                reportCount={perClient?.report_count}
                lastReportAt={perClient?.last_report_at}
                onGenerate={() => handleGenerate(c)}
                onView={() => handleView(c)}
                onRenamed={handleRenamed}
                onDeleted={handleDeleted}
                showToast={showToast}
              />
            )
          })}
        </div>
        )
      })()}

      {showModal && (
        <NewClientModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreated}
        />
      )}
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div style={{
      border: `1.5px dashed ${T.border}`,
      borderRadius: 16,
      padding: '52px 32px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>🏢</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 8 }}>
        Nenhum cliente cadastrado
      </div>
      <div style={{ fontSize: 14, color: T.muted, marginBottom: 24, lineHeight: 1.6 }}>
        Adicione seu primeiro cliente para começar a gerar relatórios de tráfego.
      </div>
      <button
        className="btn-primary"
        style={{ fontSize: 14, padding: '11px 24px' }}
        onClick={onAdd}
      >
        + Adicionar cliente
      </button>
    </div>
  )
}

interface ClientCardProps {
  client: Client
  delay: number
  reportCount?: number
  lastReportAt?: string
  onGenerate: () => void
  onView: () => void
  onRenamed: (id: string, name: string) => void
  onDeleted: (id: string) => void
  showToast: (msg: string) => void
}

function ClientCard({
  client, delay, reportCount, lastReportAt,
  onGenerate, onView, onRenamed, onDeleted, showToast,
}: ClientCardProps) {
  const initials = client.name.slice(0, 2).toUpperCase()
  const typeLabel = client.type === 'franchise' ? 'Franquia' : 'Lead Gen'
  const cardColor = client.color ?? '#8B35E8'

  const [menuOpen, setMenuOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(client.name)
  const [confirming, setConfirming] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const renameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
        setConfirming(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const startRename = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(false)
    setConfirming(false)
    setRenameValue(client.name)
    setRenaming(true)
    setTimeout(() => renameRef.current?.select(), 50)
  }

  const commitRename = async () => {
    const trimmed = renameValue.trim()
    if (!trimmed || trimmed === client.name) { setRenaming(false); return }
    setActionLoading(true)
    try {
      await apiClients.rename(client.id, trimmed)
      onRenamed(client.id, trimmed)
    } catch {
      showToast('Erro ao renomear cliente')
    } finally {
      setActionLoading(false)
      setRenaming(false)
    }
  }

  const commitDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setActionLoading(true)
    try {
      await apiClients.delete(client.id)
      onDeleted(client.id)
    } catch {
      showToast('Erro ao remover cliente')
      setActionLoading(false)
      setConfirming(false)
    }
  }

  return (
    <div
      style={{
        background: T.surface,
        border: `0.5px solid ${T.border}`,
        borderRadius: 14,
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        animation: `rise 0.4s cubic-bezier(.25,.46,.45,.94) both`,
        animationDelay: `${delay}ms`,
        position: 'relative',
        zIndex: menuOpen ? 10 : 1,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderHover; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = 'none' }}
    >
      {/* Left: avatar + info */}
      <div
        onClick={renaming ? undefined : onView}
        style={{ display: 'flex', gap: 14, alignItems: 'center', flex: 1, cursor: renaming ? 'default' : 'pointer', minWidth: 0 }}
      >
        {/* Avatar / Logo */}
        <div style={{
          width: 44, height: 44, borderRadius: 11,
          background: client.logo ? 'transparent' : `linear-gradient(135deg, ${cardColor}cc, ${cardColor})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, overflow: 'hidden',
          border: client.logo ? `1px solid ${T.border}` : 'none',
        }}>
          {client.logo ? (
            <img src={client.logo} alt={client.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
          ) : (
            <span style={{ fontSize: 14, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>{initials}</span>
          )}
        </div>

        {/* Name + meta */}
        <div style={{ minWidth: 0 }}>
          {renaming ? (
            <input
              ref={renameRef}
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') { e.preventDefault(); commitRename() }
                if (e.key === 'Escape') { setRenaming(false) }
              }}
              onBlur={commitRename}
              onClick={e => e.stopPropagation()}
              disabled={actionLoading}
              style={{
                fontSize: 16, fontWeight: 700, color: T.text,
                background: T.surface, border: `1.5px solid ${T.brand}`,
                borderRadius: 6, padding: '3px 8px', outline: 'none',
                width: 220,
              }}
            />
          ) : (
            <div style={{ fontSize: 16, fontWeight: 700, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {client.name}
            </div>
          )}
          <div style={{ fontSize: 12, color: T.muted, marginTop: 3, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span>{typeLabel}</span>
            {client.type === 'franchise' ? (
              // Franquia: mostra status agregado das unidades
              (() => {
                const total = client.total_units ?? 0
                const linked = client.linked_units ?? 0
                if (total === 0) {
                  return <span style={{ color: 'var(--amber)', fontSize: 11 }}>⚠ Sem unidades</span>
                }
                if (linked === total) {
                  return <span style={{ color: '#22c55e' }}>● {total} {total === 1 ? 'unidade' : 'unidades'} · todas com Meta</span>
                }
                if (linked === 0) {
                  return <span style={{ color: 'var(--amber)', fontSize: 11 }}>⚠ {total} {total === 1 ? 'unidade' : 'unidades'} · sem Meta</span>
                }
                return <span style={{ color: 'var(--amber)', fontSize: 11 }}>⚠ {linked}/{total} unidades vinculadas</span>
              })()
            ) : (
              // Lead Gen: status simples
              <>
                {!client.meta_account_id && (
                  <span title="Sem conta Meta Ads vinculada" style={{ color: 'var(--amber)', fontSize: 11 }}>⚠ Sem Meta</span>
                )}
                {client.meta_account_id && (
                  <span style={{ color: '#22c55e' }}>● Meta vinculado</span>
                )}
              </>
            )}
            {reportCount !== undefined && reportCount > 0 && (
              <span style={{
                background: 'var(--surface2)',
                border: `0.5px solid ${T.border}`,
                borderRadius: 20, padding: '1px 7px',
                fontSize: 11, color: T.hint,
              }}>
                {reportCount} {reportCount === 1 ? 'relatório' : 'relatórios'}
              </span>
            )}
            {lastReportAt && (
              <span style={{ color: T.hint, fontSize: 11 }}>{relativeTime(lastReportAt)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Right: actions */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, marginLeft: 12 }}>
        <button
          onClick={e => { e.stopPropagation(); onGenerate() }}
          style={{
            background: `linear-gradient(135deg, #5B18A8, #8833ff)`,
            color: '#fff', border: 'none', borderRadius: 8,
            padding: '8px 16px', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', letterSpacing: '-0.1px', whiteSpace: 'nowrap',
          }}
        >
          Gerar relatório
        </button>

        <button
          onClick={e => { e.stopPropagation(); onView() }}
          className="btn-ghost"
          style={{ fontSize: 12, padding: '7px 12px', whiteSpace: 'nowrap' }}
        >
          Histórico
        </button>

        {/* Kebab */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); setConfirming(false) }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', color: T.hint,
              fontSize: 20, letterSpacing: '1px', padding: '4px 6px', lineHeight: 1,
              borderRadius: 6, display: 'flex', alignItems: 'center',
            }}
          >
            •••
          </button>

          {menuOpen && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 6px)', zIndex: 200,
              background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              minWidth: 150, overflow: 'hidden',
            }}>
              {!confirming ? (
                <>
                  <button
                    onClick={startRename}
                    style={{
                      width: '100%', background: 'none', border: 'none',
                      padding: '11px 16px', textAlign: 'left',
                      fontSize: 13, fontWeight: 600, color: T.text, cursor: 'pointer',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    Renomear
                  </button>
                  <div style={{ height: 1, background: T.border }} />
                  <button
                    onClick={e => { e.stopPropagation(); setConfirming(true) }}
                    style={{
                      width: '100%', background: 'none', border: 'none',
                      padding: '11px 16px', textAlign: 'left',
                      fontSize: 13, fontWeight: 600, color: '#f87171', cursor: 'pointer',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    Excluir cliente
                  </button>
                </>
              ) : (
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 4 }}>
                    Excluir cliente?
                  </div>
                  <div style={{ fontSize: 12, color: T.muted, marginBottom: 12, lineHeight: 1.5 }}>
                    Todos os relatórios serão removidos.
                  </div>
                  <div style={{ display: 'flex', gap: 7 }}>
                    <button
                      onClick={e => { e.stopPropagation(); setConfirming(false) }}
                      style={{
                        flex: 1, background: 'var(--surface2)', border: 'none',
                        borderRadius: 7, padding: '7px 0',
                        fontSize: 12, fontWeight: 600, color: T.muted, cursor: 'pointer',
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={commitDelete}
                      disabled={actionLoading}
                      style={{
                        flex: 1, background: '#ef4444', border: 'none',
                        borderRadius: 7, padding: '7px 0',
                        fontSize: 12, fontWeight: 700, color: '#fff',
                        cursor: actionLoading ? 'not-allowed' : 'pointer',
                        opacity: actionLoading ? 0.6 : 1,
                      }}
                    >
                      {actionLoading ? '…' : 'Excluir'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
