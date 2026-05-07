import { useState, useEffect, useRef, useCallback } from 'react'
import type { Client, MetaAdAccount } from '../lib/types'
import { apiClients } from '../lib/api'
import { T } from '../styles/tokens'
import { MetaAccountPicker } from './MetaAccountPicker'

interface NewClientModalProps {
  onClose: () => void
  onCreate: (client: Client) => void
}

const COLORS = [
  '#8B35E8', '#6C3CE1', '#E8355A', '#E87A35', '#35B8E8', '#35E87A',
]

export function NewClientModal({ onClose, onCreate }: NewClientModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [name, setName] = useState('')
  const [type, setType] = useState<'lead_gen' | 'franchise'>('lead_gen')
  const [color, setColor] = useState(COLORS[0])
  const [logo, setLogo] = useState<string | null>(null)
  const [logoDragging, setLogoDragging] = useState(false)
  const [units, setUnits] = useState<string[]>([''])
  const [selectedAccount, setSelectedAccount] = useState<MetaAdAccount | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const logoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const handleStep1 = () => {
    if (!name.trim()) { setError('Nome é obrigatório'); return }
    setError(null)
    if (type === 'franchise') { setStep(2) } else { setStep(3) }
  }

  const handleLogoDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setLogoDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) handleLogoFile(file)
  }, [])

  const handleLogoFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = e => {
      const dataUrl = e.target?.result as string
      // Compress: draw on canvas at max 200px width
      const img = new Image()
      img.onload = () => {
        const maxW = 200
        const scale = Math.min(1, maxW / img.width)
        const canvas = document.createElement('canvas')
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        setLogo(canvas.toDataURL('image/png', 0.9))
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      const unitList = units
        .map(u => u.trim())
        .filter(Boolean)
        .map(u => ({ name: u }))

      const client = await apiClients.create({
        name: name.trim(),
        type,
        color,
        logo: logo ?? undefined,
        meta_account_id: selectedAccount ? selectedAccount.id.replace('act_', '') : undefined,
        units: type === 'franchise' ? unitList : undefined,
      } as any)
      onCreate(client)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar cliente')
      setLoading(false)
    }
  }

  const addUnit = () => setUnits(prev => [...prev, ''])
  const removeUnit = (i: number) => setUnits(prev => prev.filter((_, j) => j !== i))
  const updateUnit = (i: number, val: string) =>
    setUnits(prev => prev.map((u, j) => (j === i ? val : u)))

  const validUnits = units.filter(u => u.trim()).length

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        animation: 'fadein 0.15s ease',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: T.bg,
        border: `0.5px solid ${T.border}`,
        borderRadius: 16,
        width: '100%',
        maxWidth: 440,
        padding: '30px 28px',
        animation: 'rise 0.2s cubic-bezier(.25,.46,.45,.94)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: T.text, letterSpacing: '-0.3px' }}>
              {step === 1 ? 'Novo cliente' : step === 2 ? 'Unidades da franquia' : 'Conta Meta Ads'}
            </h2>
            <p style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>
              {step === 1 ? `Passo 1 de ${type === 'franchise' ? 3 : 2}`
                : step === 2 ? `${name} · ${validUnits} unidade${validUnits !== 1 ? 's' : ''}`
                : `${name} · passo ${type === 'franchise' ? 3 : 2} de ${type === 'franchise' ? 3 : 2}`}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: T.hint, fontSize: 20, cursor: 'pointer', lineHeight: 1, padding: '2px 6px' }}
          >
            ×
          </button>
        </div>

        {/* Step 1 — Nome + Tipo + Cor */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <FieldBlock label="Nome do cliente">
              <input
                ref={nameRef}
                className="input"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleStep1() }}
                placeholder="Ex: Rizon, Folks Pub..."
                maxLength={60}
              />
            </FieldBlock>

            <FieldBlock label="Tipo de relatório">
              {([
                ['lead_gen', 'Lead Gen — B2B', 'Campanhas com geração de leads por vendedor'],
                ['franchise', 'Franquia', 'Relatório por unidade com métricas consolidadas'],
              ] as const).map(([id, label, desc]) => (
                <div
                  key={id}
                  onClick={() => setType(id)}
                  style={{
                    background: T.surface,
                    border: type === id ? `1.5px solid ${T.brand}` : `0.5px solid ${T.border}`,
                    borderRadius: 9, padding: '11px 13px', cursor: 'pointer',
                    marginBottom: 7, display: 'flex', gap: 11, alignItems: 'center',
                    transition: 'border-color 0.15s',
                  }}
                >
                  <div style={{
                    width: 15, height: 15, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                    border: type === id ? `5px solid ${T.brand}` : `2px solid ${T.border}`,
                    transition: 'border 0.1s',
                  }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{label}</div>
                    <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </FieldBlock>

            <FieldBlock label="Cor do avatar">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {COLORS.map(c => (
                  <div
                    key={c}
                    onClick={() => setColor(c)}
                    style={{
                      width: 28, height: 28, borderRadius: 7,
                      background: c, cursor: 'pointer',
                      border: color === c ? '2.5px solid #fff' : '2.5px solid transparent',
                      boxShadow: color === c ? `0 0 0 2px ${c}` : 'none',
                      transition: 'all 0.1s',
                    }}
                  />
                ))}
                <div style={{
                  width: 28, height: 28, borderRadius: 7, cursor: 'pointer',
                  background: `linear-gradient(135deg, #ff6b6b, #ffd93d, #6bcb77, #4d96ff)`,
                  border: !COLORS.includes(color) ? '2.5px solid #fff' : '2.5px solid transparent',
                  boxShadow: !COLORS.includes(color) ? '0 0 0 2px #888' : 'none',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <input
                    type="color"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                  />
                </div>
              </div>
            </FieldBlock>

            <FieldBlock label="Logo do cliente (opcional)">
              <input
                ref={logoRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => { if (e.target.files?.[0]) handleLogoFile(e.target.files[0]) }}
              />
              <div
                onClick={() => !logo && logoRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setLogoDragging(true) }}
                onDragLeave={() => setLogoDragging(false)}
                onDrop={handleLogoDrop}
                style={{
                  border: `1.5px dashed ${logoDragging ? T.brand : logo ? T.border : T.border}`,
                  borderRadius: 10,
                  padding: logo ? '10px 14px' : '18px 14px',
                  background: logoDragging ? `${T.brand}11` : T.surface,
                  cursor: logo ? 'default' : 'pointer',
                  transition: 'border-color 0.15s, background 0.15s',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}
                onMouseEnter={e => { if (!logo) e.currentTarget.style.borderColor = T.brand }}
                onMouseLeave={e => { if (!logo) e.currentTarget.style.borderColor = T.border }}
              >
                {logo ? (
                  <>
                    <img
                      src={logo}
                      alt="Logo"
                      style={{ height: 36, maxWidth: 120, objectFit: 'contain', borderRadius: 4, border: `1px solid ${T.border}`, padding: 4, background: '#fff' }}
                    />
                    <div style={{ flex: 1, fontSize: 12, color: T.muted }}>Arraste para trocar</div>
                    <button
                      onClick={e => { e.stopPropagation(); setLogo(null) }}
                      style={{ background: 'none', border: `1px solid ${T.border}`, borderRadius: 6, padding: '4px 10px', fontSize: 12, color: T.muted, cursor: 'pointer' }}
                    >
                      Remover
                    </button>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', width: '100%' }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>🖼️</div>
                    <div style={{ fontSize: 12, color: T.muted }}>
                      Arraste a imagem aqui ou <span style={{ color: T.brand, fontWeight: 600 }}>clique para selecionar</span>
                    </div>
                  </div>
                )}
              </div>
            </FieldBlock>

            {error && (
              <div style={{ color: T.danger, fontSize: 12 }}>{error}</div>
            )}

            <button
              onClick={handleStep1}
              disabled={loading}
              style={{
                background: `linear-gradient(135deg,#5B18A8,${T.brand})`,
                color: '#fff', border: 'none', borderRadius: 9,
                padding: '12px', fontSize: 14, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: 4, opacity: loading ? 0.6 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              {loading ? 'Criando...' : type === 'franchise' ? 'Próximo — unidades →' : 'Próximo — conta Meta →'}
            </button>
          </div>
        )}

        {/* Step 2 — Unidades */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, maxHeight: 300, overflowY: 'auto' }}>
              {units.map((u, i) => (
                <div key={i} style={{ display: 'flex', gap: 7 }}>
                  <input
                    className="input"
                    value={u}
                    onChange={e => updateUnit(i, e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') { e.preventDefault(); addUnit() }
                    }}
                    placeholder={`Unidade ${i + 1} — ex: Campinas, Curitiba...`}
                    autoFocus={i === units.length - 1 && i > 0}
                    style={{ flex: 1 }}
                  />
                  {units.length > 1 && (
                    <button
                      onClick={() => removeUnit(i)}
                      style={{
                        background: T.surface, border: `0.5px solid ${T.border}`,
                        borderRadius: 8, padding: '0 11px', color: T.hint,
                        cursor: 'pointer', fontSize: 16, flexShrink: 0,
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addUnit}
              style={{
                background: 'none', border: `1px dashed ${T.border}`,
                borderRadius: 9, padding: '9px', color: T.muted,
                cursor: 'pointer', fontSize: 13, width: '100%',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = T.brand)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}
            >
              + Adicionar unidade
            </button>

            {error && (
              <div style={{ color: T.danger, fontSize: 12 }}>{error}</div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button
                onClick={() => { setStep(1); setError(null) }}
                className="btn-ghost"
                style={{ flex: 1, padding: '11px', fontSize: 13 }}
                disabled={loading}
              >
                ← Voltar
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={validUnits === 0}
                style={{
                  flex: 2,
                  background: validUnits === 0 ? T.surface2 : `linear-gradient(135deg,#5B18A8,${T.brand})`,
                  color: validUnits === 0 ? T.muted : '#fff',
                  border: 'none', borderRadius: 9,
                  padding: '11px', fontSize: 14, fontWeight: 700,
                  cursor: validUnits === 0 ? 'not-allowed' : 'pointer',
                  transition: 'opacity 0.15s',
                }}
              >
                Próximo →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Meta Account */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 13, color: T.muted, margin: 0, lineHeight: 1.5 }}>
              Selecione a conta de anúncios do Meta Ads para puxar os dados automaticamente.
            </p>

            <MetaAccountPicker
              selectedId={selectedAccount?.id.replace('act_', '') ?? null}
              onSelect={acc => setSelectedAccount(acc)}
              onSkip={handleSubmit}
              skipLabel="Pular — configurar depois"
            />

            {error && (
              <div style={{ color: T.danger, fontSize: 12 }}>{error}</div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button
                onClick={() => { setStep(type === 'franchise' ? 2 : 1); setError(null) }}
                className="btn-ghost"
                style={{ flex: 1, padding: '11px', fontSize: 13 }}
                disabled={loading}
              >
                ← Voltar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  flex: 2,
                  background: loading ? T.surface2 : `linear-gradient(135deg,#5B18A8,${T.brand})`,
                  color: loading ? T.muted : '#fff',
                  border: 'none', borderRadius: 9,
                  padding: '11px', fontSize: 14, fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'opacity 0.15s',
                }}
              >
                {loading ? 'Criando...' : selectedAccount ? `Criar com ${selectedAccount.name} →` : 'Criar sem conta Meta →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface FieldBlockProps { label: string; children: React.ReactNode }
function FieldBlock({ label, children }: FieldBlockProps) {
  return (
    <div>
      <label className="field-label">{label}</label>
      {children}
    </div>
  )
}
