import { useEffect, useState, useRef, useCallback } from 'react'
import type { Client, MetaAdAccount, Report, Screen, FranchiseUnit } from '../lib/types'
import { apiReports, apiClients } from '../lib/api'
import { T } from '../styles/tokens'
import { MetaAccountPicker } from '../components/MetaAccountPicker'

interface ClientViewProps {
  client: Client
  onNavigate: (screen: Screen, client?: Client) => void
  onSelectReport: (report: Report) => void
  showToast: (msg: string) => void
  onClientUpdated?: (updated: Client) => void
}

export function ClientView({ client, onNavigate, onSelectReport, showToast, onClientUpdated }: ClientViewProps) {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [metaAccount, setMetaAccount] = useState<string | null>(client.meta_account_id ?? null)
  const [linkingAccount, setLinkingAccount] = useState(false)
  const [savingAccount, setSavingAccount] = useState(false)
  const [logo, setLogo] = useState<string | null | undefined>(client.logo)
  const [clientColor, setClientColor] = useState<string>((client as any).color ?? '#8B35E8')
  const [clientName, setClientName] = useState(client.name)
  const [clientDescription, setClientDescription] = useState<string | null>(client.description ?? null)
  const [savingLogo, setSavingLogo] = useState(false)
  const [logoDragging, setLogoDragging] = useState(false)
  const [units, setUnits] = useState<FranchiseUnit[]>(client.units ?? [])
  const logoInputRef = useRef<HTMLInputElement>(null)

  // Fetch fresh client data on mount so we always show the latest logo/meta/units
  useEffect(() => {
    apiClients.get(client.id)
      .then(fresh => {
        setLogo(fresh.logo ?? null)
        setMetaAccount(fresh.meta_account_id ?? null)
        setClientColor((fresh as any).color ?? '#8B35E8')
        setClientName(fresh.name)
        setClientDescription(fresh.description ?? null)
        setUnits(fresh.units ?? [])
        onClientUpdated?.(fresh)
      })
      .catch(() => {/* use prop data as fallback */})
  }, [client.id])

  const refreshUnits = async () => {
    try {
      const fresh = await apiClients.get(client.id)
      setUnits(fresh.units ?? [])
    } catch { /* ignore */ }
  }

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

  const handleLogoFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = async e => {
      const dataUrl = e.target?.result as string
      const img = new Image()
      img.onload = async () => {
        const maxW = 200
        const scale = Math.min(1, maxW / img.width)
        const canvas = document.createElement('canvas')
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
        const compressed = canvas.toDataURL('image/png', 0.9)
        setSavingLogo(true)
        try {
          const updated = await apiClients.updateLogo(client.id, compressed)
          setLogo(compressed)
          onClientUpdated?.(updated)
          showToast('✓ Logo atualizado')
        } catch {
          showToast('Erro ao salvar logo')
        } finally {
          setSavingLogo(false)
        }
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  }

  const handleLogoDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setLogoDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) handleLogoFile(file)
  }, [handleLogoFile])

  const handleRemoveLogo = async () => {
    setSavingLogo(true)
    try {
      const updated = await apiClients.updateLogo(client.id, null)
      setLogo(null)
      onClientUpdated?.(updated)
      showToast('Logo removido')
    } catch {
      showToast('Erro ao remover logo')
    } finally {
      setSavingLogo(false)
    }
  }

  const typeLabel = client.type === 'franchise' ? 'Franquia' : 'Lead Gen'
  const initials = clientName.slice(0, 2).toUpperCase()

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
            background: logo ? 'transparent' : `linear-gradient(135deg, ${clientColor}cc, ${clientColor})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 800, color: '#fff',
            flexShrink: 0, overflow: 'hidden',
            border: logo ? `1px solid ${T.border}` : 'none',
          }}>
            {logo
              ? <img src={logo} alt={clientName} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
              : initials
            }
          </div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', color: T.text }}>
              {clientName}
            </h1>
            <div style={{ fontSize: 14, color: T.muted, marginTop: 4 }}>
              {typeLabel}
              {clientDescription ? ` · ${clientDescription}` : ''}
              {metaAccount && <span style={{ marginLeft: 8, color: '#22c55e', fontSize: 13 }}>● Meta vinculado</span>}
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

      {/* Logo section */}
      <input
        ref={logoInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => { if (e.target.files?.[0]) handleLogoFile(e.target.files[0]) }}
      />
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.hint, letterSpacing: '0.7px', textTransform: 'uppercase', marginBottom: 8 }}>
          Logo do Cliente
        </div>
        <div
          onDragOver={e => { e.preventDefault(); setLogoDragging(true) }}
          onDragLeave={() => setLogoDragging(false)}
          onDrop={handleLogoDrop}
          onClick={() => !savingLogo && logoInputRef.current?.click()}
          style={{
            background: logoDragging ? `${T.brand}11` : T.surface,
            border: `1.5px dashed ${logoDragging ? T.brand : T.border}`,
            borderRadius: 12,
            padding: '16px 20px',
            cursor: savingLogo ? 'default' : 'pointer',
            transition: 'border-color 0.15s, background 0.15s',
            display: 'flex', alignItems: 'center', gap: 14,
          }}
          onMouseEnter={e => { if (!savingLogo) e.currentTarget.style.borderColor = T.brand }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = logoDragging ? T.brand : T.border }}
        >
          {logo ? (
            <>
              <img
                src={logo}
                alt={client.name}
                style={{ height: 40, maxWidth: 130, objectFit: 'contain', borderRadius: 6, border: `1px solid ${T.border}`, padding: 4, background: '#fff' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Logo ativo</div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                  {savingLogo ? 'Salvando...' : 'Arraste para trocar ou clique'}
                </div>
              </div>
              {!savingLogo && (
                <button
                  onClick={e => { e.stopPropagation(); handleRemoveLogo() }}
                  style={{ background: 'none', border: `1px solid ${T.border}`, borderRadius: 7, padding: '5px 10px', fontSize: 12, color: T.muted, cursor: 'pointer', flexShrink: 0 }}
                >
                  Remover
                </button>
              )}
            </>
          ) : (
            <div style={{ width: '100%', textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>🖼️</div>
              <div style={{ fontSize: 13, color: T.muted }}>
                {savingLogo ? 'Salvando...' : <>Arraste a imagem aqui ou <span style={{ color: T.brand, fontWeight: 600 }}>clique para selecionar</span></>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── FRANCHISE UNITS (each with own Meta account) ── */}
      {client.type === 'franchise' && (
        <FranchiseUnitsSection
          clientId={client.id}
          units={units}
          onChanged={refreshUnits}
          showToast={showToast}
        />
      )}

      {/* Meta Account section — only for lead_gen */}
      {client.type === 'lead_gen' && (
      <div style={{
        background: T.surface,
        border: `0.5px solid ${T.border}`,
        borderRadius: 12,
        padding: '16px 20px',
        marginBottom: 32,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: linkingAccount ? 14 : 0 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.hint, letterSpacing: '0.7px', textTransform: 'uppercase', marginBottom: 4 }}>
              Conta Meta Ads
            </div>
            {metaAccount ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: T.text, fontFamily: 'monospace' }}>
                  act_{metaAccount}
                </span>
              </div>
            ) : (
              <div style={{ fontSize: 13, color: T.muted }}>Nenhuma conta vinculada</div>
            )}
          </div>
          {!linkingAccount && (
            <button
              onClick={() => setLinkingAccount(true)}
              style={{
                background: metaAccount ? 'none' : T.brand,
                color: metaAccount ? T.muted : '#fff',
                border: metaAccount ? `1px solid ${T.border}` : 'none',
                borderRadius: 7, padding: '6px 13px',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {metaAccount ? 'Trocar' : 'Vincular conta →'}
            </button>
          )}
        </div>

        {linkingAccount && (
          <MetaAccountPicker
            selectedId={metaAccount}
            onSelect={async (acc: MetaAdAccount) => {
              const cleanId = acc.id.replace('act_', '')
              setSavingAccount(true)
              try {
                const updated = await apiClients.updateAccount(client.id, cleanId)
                setMetaAccount(cleanId)
                onClientUpdated?.(updated)
                showToast(`✓ Conta ${acc.name} vinculada`)
              } catch {
                showToast('Erro ao salvar conta')
              } finally {
                setSavingAccount(false)
                setLinkingAccount(false)
              }
            }}
            onSkip={() => setLinkingAccount(false)}
            skipLabel="Cancelar"
          />
        )}
        {savingAccount && (
          <div style={{ fontSize: 12, color: T.muted, marginTop: 8 }}>Salvando...</div>
        )}
      </div>
      )}

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

/* ── FranchiseUnitsSection ───────────────────────────── */

interface FranchiseUnitsSectionProps {
  clientId: string
  units: FranchiseUnit[]
  onChanged: () => void
  showToast: (msg: string) => void
}

function FranchiseUnitsSection({ clientId, units, onChanged, showToast }: FranchiseUnitsSectionProps) {
  const [linkingUnitId, setLinkingUnitId] = useState<string | null>(null)
  const [editingNameId, setEditingNameId] = useState<string | null>(null)
  const [nameValue, setNameValue] = useState('')
  const [adding, setAdding] = useState(false)
  const [newUnitName, setNewUnitName] = useState('')

  const linkedCount = units.filter(u => u.meta_account_id).length

  const handleSelectAccount = async (unitId: string, account: MetaAdAccount) => {
    const cleanId = account.id.replace(/^act_/, '')
    try {
      await apiClients.updateUnit(clientId, unitId, { meta_account_id: cleanId })
      showToast(`✓ Unidade vinculada a ${account.name}`)
      setLinkingUnitId(null)
      onChanged()
    } catch (e: any) {
      showToast(e?.message || 'Erro ao vincular conta')
    }
  }

  const handleRemoveAccount = async (unitId: string) => {
    if (!confirm('Desvincular conta Meta dessa unidade?')) return
    try {
      await apiClients.updateUnit(clientId, unitId, { meta_account_id: null })
      onChanged()
    } catch (e: any) {
      showToast(e?.message || 'Erro')
    }
  }

  const handleRenameUnit = async (unitId: string) => {
    if (!nameValue.trim()) { setEditingNameId(null); return }
    try {
      await apiClients.updateUnit(clientId, unitId, { name: nameValue.trim() })
      onChanged()
    } catch (e: any) {
      showToast(e?.message || 'Erro ao renomear')
    } finally {
      setEditingNameId(null)
    }
  }

  const handleDeleteUnit = async (unitId: string) => {
    if (!confirm('Remover essa unidade? Os relatórios já gerados continuam, mas novos não vão incluir ela.')) return
    try {
      await apiClients.removeUnit(clientId, unitId)
      onChanged()
    } catch (e: any) {
      showToast(e?.message || 'Erro')
    }
  }

  const handleAddUnit = async () => {
    if (!newUnitName.trim()) return
    try {
      await apiClients.addUnit(clientId, { name: newUnitName.trim() })
      setNewUnitName('')
      setAdding(false)
      onChanged()
    } catch (e: any) {
      showToast(e?.message || 'Erro ao adicionar unidade')
    }
  }

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.hint, letterSpacing: '0.7px', textTransform: 'uppercase', marginBottom: 4 }}>
            Unidades da Franquia
          </div>
          <div style={{ fontSize: 12, color: T.muted }}>
            <b style={{ color: T.text }}>{linkedCount}</b> de <b style={{ color: T.text }}>{units.length}</b> unidades com conta Meta vinculada
          </div>
        </div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="btn-ghost"
            style={{ fontSize: 12, padding: '6px 12px' }}
          >
            + Nova unidade
          </button>
        )}
      </div>

      {adding && (
        <div style={{
          display: 'flex', gap: 8, marginBottom: 10,
          padding: '12px', background: T.surface,
          border: `1px dashed ${T.brand}`, borderRadius: 9,
        }}>
          <input
            autoFocus
            value={newUnitName}
            onChange={e => setNewUnitName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); handleAddUnit() }
              if (e.key === 'Escape') { setAdding(false); setNewUnitName('') }
            }}
            placeholder="Nome da unidade (ex: Campinas)"
            style={{
              flex: 1, background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 7, padding: '7px 10px', fontSize: 13, color: T.text, outline: 'none',
            }}
          />
          <button
            onClick={handleAddUnit}
            disabled={!newUnitName.trim()}
            className="btn-primary"
            style={{ fontSize: 12, padding: '7px 14px', opacity: newUnitName.trim() ? 1 : 0.5 }}
          >
            Adicionar
          </button>
          <button
            onClick={() => { setAdding(false); setNewUnitName('') }}
            style={{
              background: 'none', border: `1px solid ${T.border}`,
              borderRadius: 7, padding: '7px 12px', fontSize: 12, color: T.muted, cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
        </div>
      )}

      {units.length === 0 ? (
        <div style={{
          padding: '20px', background: T.surface, border: `1px dashed ${T.border}`,
          borderRadius: 12, textAlign: 'center', fontSize: 13, color: T.muted,
        }}>
          Nenhuma unidade cadastrada. Clique em <b>+ Nova unidade</b> acima.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {units.map(unit => (
            <div
              key={unit.id}
              style={{
                background: T.surface, border: `0.5px solid ${T.border}`,
                borderRadius: 11, overflow: 'hidden',
              }}
            >
              {/* Unit header row */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 16px',
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: unit.meta_account_id ? '#22c55e' : 'var(--amber)',
                  flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  {editingNameId === unit.id ? (
                    <input
                      autoFocus
                      value={nameValue}
                      onChange={e => setNameValue(e.target.value)}
                      onBlur={() => handleRenameUnit(unit.id)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') { e.preventDefault(); handleRenameUnit(unit.id) }
                        if (e.key === 'Escape') setEditingNameId(null)
                      }}
                      style={{
                        background: T.surface, border: `1.5px solid ${T.brand}`,
                        borderRadius: 6, padding: '3px 8px', fontSize: 14, fontWeight: 700,
                        color: T.text, outline: 'none', width: '100%',
                      }}
                    />
                  ) : (
                    <div
                      onClick={() => { setEditingNameId(unit.id); setNameValue(unit.name) }}
                      style={{ fontSize: 14, fontWeight: 700, color: T.text, cursor: 'pointer' }}
                      title="Clique para renomear"
                    >
                      {unit.name}
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                    {unit.meta_account_id ? (
                      <>
                        <span style={{ fontFamily: 'monospace' }}>act_{unit.meta_account_id}</span>
                        {' · '}<span style={{ color: '#22c55e' }}>vinculada</span>
                      </>
                    ) : (
                      <span style={{ color: 'var(--amber)' }}>⚠ Sem conta Meta — relatório dessa unidade ficará vazio</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                  {unit.meta_account_id && (
                    <button
                      onClick={() => handleRemoveAccount(unit.id)}
                      title="Desvincular conta"
                      style={{
                        background: 'none', border: `1px solid ${T.border}`,
                        borderRadius: 6, padding: '5px 10px', fontSize: 11,
                        color: T.muted, cursor: 'pointer',
                      }}
                    >
                      Desvincular
                    </button>
                  )}
                  <button
                    onClick={() => setLinkingUnitId(linkingUnitId === unit.id ? null : unit.id)}
                    style={{
                      background: unit.meta_account_id ? T.surface : T.brand,
                      color: unit.meta_account_id ? T.text : '#fff',
                      border: unit.meta_account_id ? `1px solid ${T.border}` : 'none',
                      borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', whiteSpace: 'nowrap',
                    }}
                  >
                    {linkingUnitId === unit.id ? 'Cancelar' : (unit.meta_account_id ? 'Trocar' : 'Vincular Meta')}
                  </button>
                  <button
                    onClick={() => handleDeleteUnit(unit.id)}
                    title="Remover unidade"
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: T.hint, fontSize: 14, padding: '6px 8px', borderRadius: 6,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#ef4444' }}
                    onMouseLeave={e => { e.currentTarget.style.color = T.hint }}
                  >
                    🗑
                  </button>
                </div>
              </div>

              {/* Inline picker */}
              {linkingUnitId === unit.id && (
                <div style={{
                  padding: '12px 16px', borderTop: `1px solid ${T.border}`,
                  background: 'var(--surface2)',
                }}>
                  <MetaAccountPicker
                    selectedId={unit.meta_account_id}
                    onSelect={(acc) => handleSelectAccount(unit.id, acc)}
                    onSkip={() => setLinkingUnitId(null)}
                    skipLabel="Cancelar"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
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
