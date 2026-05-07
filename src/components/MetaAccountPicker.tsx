import { useEffect, useState } from 'react'
import type { MetaAdAccount } from '../lib/types'
import { apiMeta } from '../lib/api'
import { T } from '../styles/tokens'

interface MetaAccountPickerProps {
  selectedId: string | null
  onSelect: (account: MetaAdAccount | null) => void
  onSkip?: () => void
  skipLabel?: string
}

export function MetaAccountPicker({
  selectedId,
  onSelect,
  onSkip,
  skipLabel = 'Pular por agora',
}: MetaAccountPickerProps) {
  const [accounts, setAccounts] = useState<MetaAdAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiMeta.accounts()
      .then(data => { setAccounts(data); setLoading(false) })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Erro ao buscar contas')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '20px 0', textAlign: 'center', color: T.muted, fontSize: 13 }}>
        Buscando contas Meta...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '14px', background: '#ff6b6b18', borderRadius: 9, border: '1px solid #ff6b6b44' }}>
        <div style={{ fontSize: 13, color: '#ff6b6b', fontWeight: 600, marginBottom: 4 }}>Erro ao conectar com Meta API</div>
        <div style={{ fontSize: 12, color: T.muted }}>{error}</div>
        {onSkip && (
          <button
            onClick={onSkip}
            style={{ marginTop: 10, background: 'none', border: 'none', color: T.muted, fontSize: 12, cursor: 'pointer', padding: 0 }}
          >
            {skipLabel} →
          </button>
        )}
      </div>
    )
  }

  if (accounts.length === 0) {
    return (
      <div style={{ padding: '14px', background: T.surface2, borderRadius: 9, textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: T.muted }}>Nenhuma conta de anúncios encontrada neste token.</div>
        {onSkip && (
          <button
            onClick={onSkip}
            style={{ marginTop: 8, background: 'none', border: 'none', color: T.muted, fontSize: 12, cursor: 'pointer' }}
          >
            {skipLabel}
          </button>
        )}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {accounts.map(acc => {
        const cleanId = acc.id.replace('act_', '')
        const isSelected = selectedId === cleanId || selectedId === acc.id
        const isActive = acc.account_status === 1

        return (
          <div
            key={acc.id}
            onClick={() => isActive ? onSelect(acc) : undefined}
            style={{
              background: isSelected ? `${T.brand}15` : T.surface,
              border: `1px solid ${isSelected ? T.brand : T.border}`,
              borderRadius: 9,
              padding: '10px 14px',
              cursor: isActive ? 'pointer' : 'not-allowed',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              opacity: isActive ? 1 : 0.45,
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => { if (isActive && !isSelected) e.currentTarget.style.borderColor = T.brandBorder }}
            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = T.border }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{acc.name}</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
                {cleanId} · {acc.currency}
                {!isActive && <span style={{ color: '#f87171', marginLeft: 6 }}>desativada</span>}
              </div>
            </div>
            {isSelected && (
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                background: T.brand, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 800, flexShrink: 0,
              }}>
                ✓
              </div>
            )}
          </div>
        )
      })}

      {onSkip && (
        <button
          onClick={onSkip}
          style={{
            background: 'none', border: 'none',
            color: T.muted, fontSize: 12, cursor: 'pointer',
            padding: '6px 0', textAlign: 'left',
          }}
        >
          {skipLabel}
        </button>
      )}
    </div>
  )
}
