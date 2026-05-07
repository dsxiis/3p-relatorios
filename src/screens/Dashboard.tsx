import { useEffect, useRef, useState } from 'react'
import type { Client, Screen } from '../lib/types'
import { apiClients } from '../lib/api'
import { T } from '../styles/tokens'
import { NewClientModal } from '../components/NewClientModal'

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
    showToast(`✓ ${client.name} criado`)
    fetchClients()
  }

  const handleRenamed = (id: string, name: string) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, name } : c))
  }

  const handleDeleted = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id))
    showToast('Cliente removido')
  }

  const handleGenerate = (client: Client) => {
    onSelectClient(client)
    onNavigate('form', client)
  }

  const handleView = (client: Client) => {
    onSelectClient(client)
    onNavigate('client', client)
  }

  return (
    <div style={{ padding: '40px 44px', maxWidth: 720, animation: 'fadein 0.25s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.6px', color: T.text, marginBottom: 6 }}>
            Clientes
          </h1>
          <p style={{ color: T.muted, fontSize: 14 }}>
            Selecione um cliente para gerar o relatório.
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

      {/* Client list */}
      {loading ? (
        <div style={{ color: T.hint, fontSize: 14, padding: '40px 0', textAlign: 'center' }}>
          Carregando clientes...
        </div>
      ) : clients.length === 0 ? (
        <EmptyState onAdd={() => setShowModal(true)} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {clients.map((c, i) => (
            <ClientCard
              key={c.id}
              client={c}
              delay={i * 50}
              onGenerate={() => handleGenerate(c)}
              onView={() => handleView(c)}
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
  onGenerate: () => void
  onView: () => void
  onRenamed: (id: string, name: string) => void
  onDeleted: (id: string) => void
  showToast: (msg: string) => void
}

function ClientCard({ client, delay, onGenerate, onView, onRenamed, onDeleted, showToast }: ClientCardProps) {
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
        borderRadius: 14,
        padding: '18px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        animation: `rise 0.4s cubic-bezier(.25,.46,.45,.94) both`,
        animationDelay: `${delay}ms`,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderHover; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = 'none' }}
    >
      {/* Left: avatar + name */}
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
                background: T.surface2, border: `1.5px solid ${T.brand}`,
                borderRadius: 6, padding: '3px 8px', outline: 'none',
                width: 220,
              }}
            />
          ) : (
            <div style={{ fontSize: 16, fontWeight: 700, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {client.name}
            </div>
          )}
          <div style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>
            {typeLabel}
            {client.meta_account_id && (
              <span style={{ marginLeft: 8, color: '#22c55e' }}>● Meta vinculado</span>
            )}
          </div>
        </div>
      </div>

      {/* Right: actions */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, marginLeft: 12 }}>
        {/* Gerar relatório — primary action */}
        <button
          onClick={e => { e.stopPropagation(); onGenerate() }}
          style={{
            background: `linear-gradient(135deg, #5B18A8, #8833ff)`,
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '-0.1px',
            whiteSpace: 'nowrap',
          }}
        >
          Gerar relatório
        </button>

        {/* Histórico */}
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
              background: 'none', border: 'none',
              cursor: 'pointer', color: T.hint,
              fontSize: 20, letterSpacing: '1px',
              padding: '4px 6px', lineHeight: 1,
              borderRadius: 6, display: 'flex', alignItems: 'center',
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
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
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
