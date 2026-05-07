import { useEffect, useRef, useState } from 'react'
import type { Client, Screen } from '../lib/types'
import { apiClients } from '../lib/api'
import { T } from '../styles/tokens'
import { NewClientModal } from '../components/NewClientModal'

const MONTH_LABELS = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']

function currentMonthLabel() {
  const now = new Date()
  return `${MONTH_LABELS[now.getMonth()]} ${now.getFullYear()}`
}

interface DashboardProps {
  onSelectClient: (client: Client) => void
  onNavigate: (screen: Screen, client?: Client) => void
  showToast: (msg: string) => void
}

export function Dashboard({ onSelectClient, onNavigate, showToast }: DashboardProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const fetchClients = () => {
    setLoading(true)
    apiClients.list()
      .then(setClients)
      .catch(() => setClients([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchClients() }, [])

  const handleCreated = (client: Client) => {
    setShowModal(false)
    showToast(`✓ ${client.name} criado com sucesso`)
    fetchClients()
  }

  const handleRenamed = (id: string, name: string) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, name } : c))
    showToast(`✓ Cliente renomeado`)
  }

  const handleDeleted = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id))
    showToast(`✓ Cliente removido`)
  }

  return (
    <div style={{ padding: '38px 42px', animation: 'fadein 0.25s ease' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, color: T.hint, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
          {currentMonthLabel()}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', color: T.text }}>
          Relatórios de tráfego
        </h1>
        <p style={{ color: T.muted, fontSize: 13, marginTop: 6, lineHeight: 1.6 }}>
          Dados da Meta API + análise com Claude API → PDF em minutos.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 40 }}>
        {[
          [String(clients.length), 'Clientes ativos'],
          ['0', 'Gerados este mês'],
          ['~4 min', 'Tempo médio'],
        ].map(([v, l]) => (
          <div
            key={l}
            style={{
              flex: 1,
              background: T.surface,
              border: `0.5px solid ${T.border}`,
              borderRadius: 12,
              padding: '15px 18px',
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 800, color: T.text }}>{v}</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Clients header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: T.hint, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
          Clientes
        </div>
        <button
          className="btn-primary"
          style={{ fontSize: 12, padding: '6px 13px', borderRadius: 7 }}
          onClick={() => setShowModal(true)}
        >
          + Novo cliente
        </button>
      </div>

      {/* Client list */}
      {loading ? (
        <div style={{ color: T.hint, fontSize: 13, padding: '20px 0' }}>Carregando...</div>
      ) : clients.length === 0 ? (
        <EmptyState onAdd={() => setShowModal(true)} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {clients.map((c, i) => (
            <ClientCard
              key={c.id}
              client={c}
              delay={i * 60}
              onClick={() => { onSelectClient(c); onNavigate('client', c) }}
              onRenamed={handleRenamed}
              onDeleted={handleDeleted}
              showToast={showToast}
            />
          ))}
        </div>
      )}

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
      background: T.surface,
      border: `0.5px dashed ${T.border}`,
      borderRadius: 14,
      padding: '40px 24px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 28, marginBottom: 12 }}>🏢</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 6 }}>Nenhum cliente ainda</div>
      <div style={{ fontSize: 13, color: T.muted, marginBottom: 20 }}>
        Cadastre seu primeiro cliente para começar a gerar relatórios.
      </div>
      <button
        className="btn-primary"
        style={{ fontSize: 13, padding: '9px 20px' }}
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
  onClick: () => void
  onRenamed: (id: string, name: string) => void
  onDeleted: (id: string) => void
  showToast: (msg: string) => void
}

function ClientCard({ client, delay, onClick, onRenamed, onDeleted, showToast }: ClientCardProps) {
  const initials = client.name.slice(0, 2).toUpperCase()
  const typeLabel = client.type === 'franchise' ? 'Franquia' : 'Lead Gen'
  const cardColor = (client as any).color ?? '#8B35E8'

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
        borderRadius: 12,
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'border-color 0.15s',
        animation: `rise 0.45s cubic-bezier(.25,.46,.45,.94) both`,
        animationDelay: `${delay}ms`,
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = T.borderHover)}
      onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}
    >
      {/* Left: avatar + name */}
      <div
        onClick={renaming ? undefined : onClick}
        style={{ display: 'flex', gap: 13, alignItems: 'center', flex: 1, cursor: renaming ? 'default' : 'pointer', minWidth: 0 }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: `linear-gradient(135deg, ${cardColor}cc, ${cardColor})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0,
          letterSpacing: '-0.5px',
        }}>
          {initials}
        </div>
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
                fontSize: 14, fontWeight: 700, color: T.text,
                background: T.surface2, border: `1.5px solid ${T.brand}`,
                borderRadius: 6, padding: '3px 8px', outline: 'none',
                width: 200,
              }}
            />
          ) : (
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {client.name}
            </div>
          )}
          <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{typeLabel}</div>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
        {/* Ver */}
        <div
          onClick={e => { e.stopPropagation(); onClick() }}
          style={{
            background: T.brand, color: '#fff',
            borderRadius: 7, padding: '6px 13px',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Ver →
        </div>

        {/* Kebab */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={e => { e.stopPropagation(); setMenuOpen(o => !o); setConfirming(false) }}
            style={{
              background: 'none', border: 'none',
              cursor: 'pointer', color: T.muted,
              fontSize: 20, letterSpacing: '1px',
              padding: '2px 4px', lineHeight: 1,
              borderRadius: 6,
            }}
          >
            •••
          </button>

          {menuOpen && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 6px)', zIndex: 200,
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              minWidth: 150,
              overflow: 'hidden',
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
                    onMouseEnter={e => (e.currentTarget.style.background = T.surface2)}
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
                    onMouseEnter={e => (e.currentTarget.style.background = T.surface2)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    Excluir
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
                        flex: 1, background: T.surface2, border: 'none',
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
