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

  const [renaming, setRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(client.name)
  const [confirming, setConfirming] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const renameRef = useRef<HTMLInputElement>(null)

  const startRename = (e: React.MouseEvent) => {
    e.stopPropagation()
    setRenameValue(client.name)
    setConfirming(false)
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
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>

        {/* Rename btn */}
        <button
          onClick={startRename}
          title="Renomear"
          style={{
            background: 'none', border: `1px solid ${T.border}`,
            borderRadius: 7, padding: '5px 10px',
            fontSize: 13, color: T.muted, cursor: 'pointer',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.brand; e.currentTarget.style.color = T.brand }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted }}
        >
          ✏
        </button>

        {/* Delete btn / confirm inline */}
        {confirming ? (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: T.muted, whiteSpace: 'nowrap' }}>Excluir?</span>
            <button
              onClick={e => { e.stopPropagation(); setConfirming(false) }}
              style={{
                background: T.surface2, border: `1px solid ${T.border}`,
                borderRadius: 7, padding: '5px 10px',
                fontSize: 12, fontWeight: 600, color: T.muted, cursor: 'pointer',
              }}
            >
              Não
            </button>
            <button
              onClick={commitDelete}
              disabled={actionLoading}
              style={{
                background: '#ef4444', border: 'none',
                borderRadius: 7, padding: '5px 12px',
                fontSize: 12, fontWeight: 700, color: '#fff',
                cursor: actionLoading ? 'not-allowed' : 'pointer',
                opacity: actionLoading ? 0.6 : 1,
              }}
            >
              {actionLoading ? '…' : 'Sim'}
            </button>
          </div>
        ) : (
          <button
            onClick={e => { e.stopPropagation(); setRenaming(false); setConfirming(true) }}
            title="Excluir cliente"
            style={{
              background: 'none', border: `1px solid ${T.border}`,
              borderRadius: 7, padding: '5px 10px',
              fontSize: 13, color: T.muted, cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted }}
          >
            🗑
          </button>
        )}

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
      </div>
    </div>
  )
}
