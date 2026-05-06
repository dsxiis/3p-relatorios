import { useEffect, useState } from 'react'
import type { Client, Screen } from '../lib/types'
import { apiClients } from '../lib/api'
import { T } from '../styles/tokens'

// Static mock for development (matches DB seed)
const MOCK_CLIENTS: Client[] = [
  {
    id: 'rizon-001',
    name: 'Rizon',
    type: 'lead_gen',
    description: 'Lead Gen — B2B · Máquinas industriais',
    meta_account_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'folks-001',
    name: 'Folks Pub',
    type: 'franchise',
    description: 'Franquia — 6 unidades · Pub sertanejo',
    meta_account_id: null,
    created_at: new Date().toISOString(),
  },
]

const MONTH_LABELS = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']

function currentMonthLabel() {
  const now = new Date()
  return `${MONTH_LABELS[now.getMonth()]} ${now.getFullYear()}`
}

interface DashboardProps {
  onSelectClient: (client: Client) => void
  onNavigate: (screen: Screen, client?: Client) => void
}

export function Dashboard({ onSelectClient, onNavigate }: DashboardProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClients.list()
      .then(setClients)
      .catch(() => setClients(MOCK_CLIENTS))
      .finally(() => setLoading(false))
  }, [])

  const displayClients = clients.length > 0 ? clients : MOCK_CLIENTS

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
          [String(displayClients.length), 'Clientes ativos'],
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
          onClick={() => alert('Cadastro de clientes — em breve')}
        >
          + Novo cliente
        </button>
      </div>

      {/* Client list */}
      {loading ? (
        <div style={{ color: T.hint, fontSize: 13, padding: '20px 0' }}>Carregando...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {displayClients.map((c, i) => (
            <ClientCard
              key={c.id}
              client={c}
              delay={i * 60}
              onClick={() => { onSelectClient(c); onNavigate('client', c) }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface ClientCardProps {
  client: Client
  delay: number
  onClick: () => void
}

function ClientCard({ client, delay, onClick }: ClientCardProps) {
  const initials = client.name.slice(0, 1).toUpperCase()
  const typeLabel = client.type === 'franchise' ? 'Franquia' : 'Lead Gen'
  const desc = client.description ?? typeLabel

  return (
    <div
      onClick={onClick}
      style={{
        background: T.surface,
        border: `0.5px solid ${T.border}`,
        borderRadius: 12,
        padding: '16px 20px',
        cursor: 'pointer',
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
      <div style={{ display: 'flex', gap: 13, alignItems: 'center' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'linear-gradient(135deg,#3D1580,#8B35E8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0,
        }}>
          {initials}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{client.name}</div>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{desc}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: T.hint }}>Último relatório</div>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>—</div>
        </div>
        <div style={{
          background: T.brand,
          color: '#fff',
          borderRadius: 7,
          padding: '6px 13px',
          fontSize: 12,
          fontWeight: 600,
        }}>
          Ver →
        </div>
      </div>
    </div>
  )
}
