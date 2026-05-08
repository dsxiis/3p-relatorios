import { useEffect, useMemo, useState } from 'react'
import type { MetaAdAccount, MetaAccountsGrouped, BusinessGroup } from '../lib/types'
import { apiMeta } from '../lib/api'
import { T } from '../styles/tokens'

interface MetaAccountPickerProps {
  selectedId: string | null
  onSelect: (account: MetaAdAccount) => void
  onSkip?: () => void
  skipLabel?: string
}

export function MetaAccountPicker({
  selectedId,
  onSelect,
  onSkip,
  skipLabel = 'Pular por agora',
}: MetaAccountPickerProps) {
  const [data, setData] = useState<MetaAccountsGrouped | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  // Manual entry state
  const [manualOpen, setManualOpen] = useState(false)
  const [manualId, setManualId] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [manualError, setManualError] = useState<string | null>(null)

  useEffect(() => {
    apiMeta.businesses()
      .then(d => {
        setData(d)
        setLoading(false)
        // Auto-expand BMs that contain selectedId, or sensible defaults
        const open = new Set<string>()
        const manual = d.manual_accounts ?? []
        if (selectedId) {
          for (const bm of d.businesses) {
            if (bm.accounts.some(a => normalizeId(a.id) === normalizeId(selectedId))) {
              open.add(bm.id)
            }
          }
          if (d.direct_accounts.some(a => normalizeId(a.id) === normalizeId(selectedId))) {
            open.add('__direct__')
          }
          if (manual.some(a => normalizeId(a.id) === normalizeId(selectedId))) {
            open.add('__manual__')
          }
        }
        if (open.size === 0) {
          // Default: expand manual + first 2 BMs
          if (manual.length > 0) open.add('__manual__')
          d.businesses.slice(0, 2).forEach(bm => open.add(bm.id))
          if (d.direct_accounts.length > 0) open.add('__direct__')
        }
        setExpanded(open)
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Erro ao buscar contas')
        setLoading(false)
      })
  }, [])

  const refreshManual = async () => {
    try {
      const fresh = await apiMeta.businesses()
      setData(fresh)
    } catch { /* ignore */ }
  }

  // Auto-expand all groups when there's a search query
  const visibleGroups = useMemo(() => {
    if (!data) return null
    const q = search.trim().toLowerCase()
    const manual = data.manual_accounts ?? []

    if (!q) return {
      manual,
      businesses: data.businesses,
      direct: data.direct_accounts,
    }

    const filterAccounts = (acc: MetaAdAccount[]) =>
      acc.filter(a =>
        a.name.toLowerCase().includes(q) ||
        normalizeId(a.id).includes(q.replace(/^act_/, ''))
      )

    return {
      manual: filterAccounts(manual),
      businesses: data.businesses
        .map(bm => ({ ...bm, accounts: filterAccounts(bm.accounts) }))
        .filter(bm => bm.accounts.length > 0 || bm.name.toLowerCase().includes(q)),
      direct: filterAccounts(data.direct_accounts),
    }
  }, [data, search])

  const totalAccounts = useMemo(() => {
    if (!data) return 0
    return (data.manual_accounts?.length ?? 0)
      + data.direct_accounts.length
      + data.businesses.reduce((s, b) => s + b.accounts.length, 0)
  }, [data])

  const handleRemoveManual = async (id: string) => {
    try {
      await apiMeta.removeManualAccount(id)
      await refreshManual()
    } catch { /* ignore */ }
  }

  const handleManualVerify = async () => {
    setManualError(null)
    const id = manualId.trim()
    if (!id) {
      setManualError('Digite um ID de conta (ex: act_123456789)')
      return
    }
    setVerifying(true)
    try {
      // Verify + persist in one shot
      const account = await apiMeta.saveManualAccount(id)
      await refreshManual()
      onSelect(account)
      setManualId('')
      setManualOpen(false)
    } catch (e: any) {
      setManualError(e?.message || 'Conta não encontrada ou sem acesso')
    } finally {
      setVerifying(false)
    }
  }

  const toggleBM = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

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
        <div style={{ fontSize: 12, color: T.muted, marginBottom: 8 }}>{error}</div>
        <div style={{ fontSize: 11, color: T.hint }}>Verifique o token em ⚙️ Configurações → Token Meta API</div>
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Search */}
      <div style={{ position: 'relative' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={`🔍 Buscar entre ${totalAccounts} contas...`}
          style={{
            width: '100%',
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 13,
            color: T.text,
            outline: 'none',
            transition: 'border-color 0.15s',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = T.brand)}
          onBlur={e => (e.currentTarget.style.borderColor = T.border)}
        />
      </div>

      {/* Manual entry */}
      <div style={{
        background: T.surface,
        border: `1px dashed ${T.border}`,
        borderRadius: 8,
        padding: manualOpen ? '12px' : '0',
      }}>
        {!manualOpen ? (
          <button
            onClick={() => setManualOpen(true)}
            style={{
              width: '100%', background: 'none', border: 'none',
              padding: '10px 12px', fontSize: 12, fontWeight: 600,
              color: T.muted, cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <span style={{ color: T.brand, fontSize: 14 }}>+</span>
            Adicionar conta por ID
            <span style={{ color: T.hint, fontWeight: 400, fontSize: 11, marginLeft: 'auto' }}>
              se não está na lista
            </span>
          </button>
        ) : (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 8 }}>
              Adicionar conta por ID
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                autoFocus
                value={manualId}
                onChange={e => { setManualId(e.target.value); setManualError(null) }}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleManualVerify() } }}
                placeholder="act_123456789 ou 123456789"
                disabled={verifying}
                style={{
                  flex: 1, background: T.surface, border: `1px solid ${manualError ? '#ef4444' : T.border}`,
                  borderRadius: 7, padding: '7px 10px', fontSize: 12, color: T.text,
                  outline: 'none', fontFamily: 'monospace',
                }}
              />
              <button
                onClick={handleManualVerify}
                disabled={verifying}
                style={{
                  background: T.brand, color: '#fff', border: 'none',
                  borderRadius: 7, padding: '7px 14px', fontSize: 12, fontWeight: 700,
                  cursor: verifying ? 'not-allowed' : 'pointer', opacity: verifying ? 0.6 : 1,
                  whiteSpace: 'nowrap',
                }}
              >
                {verifying ? '...' : 'Verificar'}
              </button>
              <button
                onClick={() => { setManualOpen(false); setManualId(''); setManualError(null) }}
                disabled={verifying}
                style={{
                  background: 'none', border: `1px solid ${T.border}`, color: T.muted,
                  borderRadius: 7, padding: '7px 12px', fontSize: 12, cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
            </div>
            {manualError && (
              <div style={{ fontSize: 11, color: '#ef4444', marginTop: 6 }}>{manualError}</div>
            )}
          </div>
        )}
      </div>

      {/* Empty state */}
      {totalAccounts === 0 && (
        <div style={{ padding: '20px 14px', background: T.surface, borderRadius: 9, textAlign: 'center', border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 13, color: T.muted, marginBottom: 4 }}>Nenhuma conta de anúncios encontrada</div>
          <div style={{ fontSize: 11, color: T.hint }}>Verifique o token em ⚙️ Configurações ou adicione uma conta por ID acima</div>
        </div>
      )}

      {/* Groups */}
      {visibleGroups && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 360, overflowY: 'auto' }}>
          {/* Manual accounts (persisted) */}
          {visibleGroups.manual.length > 0 && (
            <BusinessSection
              bm={{ id: '__manual__', name: '⭐ Adicionadas manualmente', accounts: visibleGroups.manual }}
              expanded={expanded.has('__manual__') || !!search.trim()}
              onToggle={() => toggleBM('__manual__')}
              selectedId={selectedId}
              onSelect={onSelect}
              removable
              onRemove={handleRemoveManual}
            />
          )}
          {visibleGroups.businesses.map(bm => (
            <BusinessSection
              key={bm.id}
              bm={bm}
              expanded={expanded.has(bm.id) || !!search.trim()}
              onToggle={() => toggleBM(bm.id)}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
          {visibleGroups.direct.length > 0 && (
            <BusinessSection
              bm={{ id: '__direct__', name: 'Sem Business Manager', accounts: visibleGroups.direct }}
              expanded={expanded.has('__direct__') || !!search.trim()}
              onToggle={() => toggleBM('__direct__')}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          )}
          {search.trim() && visibleGroups.businesses.length === 0 && visibleGroups.direct.length === 0 && visibleGroups.manual.length === 0 && (
            <div style={{ padding: '14px', textAlign: 'center', color: T.muted, fontSize: 13 }}>
              Nenhuma conta encontrada para "<b>{search}</b>"
            </div>
          )}
        </div>
      )}

      {onSkip && (
        <button
          onClick={onSkip}
          style={{
            background: 'none', border: 'none',
            color: T.muted, fontSize: 12, cursor: 'pointer',
            padding: '8px 0 4px', textAlign: 'left',
          }}
        >
          {skipLabel}
        </button>
      )}
    </div>
  )
}

interface BusinessSectionProps {
  bm: BusinessGroup
  expanded: boolean
  onToggle: () => void
  selectedId: string | null
  onSelect: (a: MetaAdAccount) => void
  removable?: boolean
  onRemove?: (id: string) => void
}

function BusinessSection({ bm, expanded, onToggle, selectedId, onSelect, removable, onRemove }: BusinessSectionProps) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 9, overflow: 'hidden' }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', background: 'none', border: 'none',
          padding: '10px 14px', textAlign: 'left',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: T.muted, fontSize: 11, transform: expanded ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.15s' }}>▶</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{bm.name}</span>
        </div>
        <span style={{ fontSize: 11, color: T.hint }}>
          {bm.accounts.length} {bm.accounts.length === 1 ? 'conta' : 'contas'}
        </span>
      </button>

      {expanded && bm.accounts.length > 0 && (
        <div style={{ borderTop: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column' }}>
          {bm.accounts.map(acc => (
            <AccountRow
              key={acc.id}
              account={acc}
              selected={isSelected(selectedId, acc.id)}
              onSelect={onSelect}
              removable={removable}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function AccountRow({
  account, selected, onSelect, removable, onRemove,
}: {
  account: MetaAdAccount
  selected: boolean
  onSelect: (a: MetaAdAccount) => void
  removable?: boolean
  onRemove?: (id: string) => void
}) {
  const cleanId = account.id.replace('act_', '')
  const active = account.account_status === 1

  return (
    <div
      onClick={() => active && onSelect(account)}
      style={{
        background: selected ? `${T.brand}15` : 'transparent',
        borderLeft: `3px solid ${selected ? T.brand : 'transparent'}`,
        padding: '8px 14px',
        cursor: active ? 'pointer' : 'not-allowed',
        opacity: active ? 1 : 0.45,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        transition: 'background 0.1s',
      }}
      onMouseEnter={e => { if (active && !selected) e.currentTarget.style.background = T.surface2 }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent' }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {account.name}
        </div>
        <div style={{ fontSize: 11, color: T.muted, marginTop: 1, fontFamily: 'monospace' }}>
          act_{cleanId} · {account.currency}
          {!active && <span style={{ color: '#f87171', marginLeft: 6 }}>(inativa)</span>}
        </div>
      </div>
      {selected && (
        <div style={{
          width: 18, height: 18, borderRadius: '50%',
          background: T.brand, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, color: '#fff', fontWeight: 800, flexShrink: 0, marginLeft: 8,
        }}>✓</div>
      )}
      {removable && onRemove && (
        <button
          onClick={e => { e.stopPropagation(); onRemove(cleanId) }}
          title="Remover da lista de salvas"
          style={{
            background: 'none', border: 'none',
            color: T.hint, fontSize: 14, cursor: 'pointer',
            padding: '4px 8px', borderRadius: 5, marginLeft: 6,
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444' }}
          onMouseLeave={e => { e.currentTarget.style.color = T.hint }}
        >
          ✕
        </button>
      )}
    </div>
  )
}

function normalizeId(id: string): string {
  return id.replace(/^act_/, '')
}

function isSelected(selectedId: string | null, accountId: string): boolean {
  if (!selectedId) return false
  return normalizeId(selectedId) === normalizeId(accountId)
}
