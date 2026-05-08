import { useEffect, useState } from 'react'
import type { AppSettings, MetaAdAccount, ClientType } from '../lib/types'
import { apiSettings, apiMeta, apiClients } from '../lib/api'
import { T } from '../styles/tokens'
import { relativeTime } from '../lib/utils'

interface SettingsScreenProps {
  showToast: (msg: string) => void
}

const COLORS = ['#8B35E8', '#6C3CE1', '#E8355A', '#E87A35', '#35B8E8', '#35E87A']

type TestResult =
  | { kind: 'idle' }
  | { kind: 'testing' }
  | { kind: 'ok'; bms: number; accounts: number }
  | { kind: 'error'; message: string }

export function SettingsScreen({ showToast }: SettingsScreenProps) {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [tokenInput, setTokenInput] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<TestResult>({ kind: 'idle' })

  useEffect(() => {
    apiSettings.get()
      .then(setSettings)
      .catch(() => setSettings(null))
      .finally(() => setLoading(false))
  }, [])

  const handleSaveAndTest = async () => {
    const token = tokenInput.trim()
    if (token.length < 30) {
      setResult({ kind: 'error', message: 'Token muito curto (mínimo 30 caracteres)' })
      return
    }

    setSaving(true)
    setResult({ kind: 'testing' })
    try {
      const updated = await apiSettings.updateMetaToken(token)
      setSettings(updated)
      // Now test connection
      const grouped = await apiMeta.businesses()
      const accounts = grouped.direct_accounts.length
        + grouped.businesses.reduce((s, b) => s + b.accounts.length, 0)
      setResult({ kind: 'ok', bms: grouped.businesses.length, accounts })
      setTokenInput('')
      showToast('✓ Token salvo e validado')
    } catch (e: any) {
      setResult({ kind: 'error', message: e?.message || 'Falha ao validar token' })
    } finally {
      setSaving(false)
    }
  }

  const handleTestOnly = async () => {
    setResult({ kind: 'testing' })
    try {
      const grouped = await apiMeta.businesses()
      const accounts = grouped.direct_accounts.length
        + grouped.businesses.reduce((s, b) => s + b.accounts.length, 0)
      setResult({ kind: 'ok', bms: grouped.businesses.length, accounts })
    } catch (e: any) {
      setResult({ kind: 'error', message: e?.message || 'Falha ao testar' })
    }
  }

  const tokenInfo = settings?.meta_token

  return (
    <div style={{ padding: '38px 42px', maxWidth: 760, animation: 'fadein 0.25s ease' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.6px', color: T.text, marginBottom: 6 }}>
        Configurações
      </h1>
      <p style={{ color: T.muted, fontSize: 14, marginBottom: 32 }}>
        Gerencie tokens de integração e preferências do sistema.
      </p>

      {/* ── TOKEN META API ── */}
      <Section title="Token Meta API" subtitle="Usado para puxar contas e dados de campanhas do Facebook/Meta">
        {loading ? (
          <div style={{ color: T.hint, fontSize: 13 }}>Carregando...</div>
        ) : (
          <>
            {/* Status */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px',
              background: tokenInfo?.set ? 'var(--green-dim)' : '#ff6b6b18',
              border: `1px solid ${tokenInfo?.set ? 'var(--green-border)' : '#ff6b6b44'}`,
              borderRadius: 9,
              marginBottom: 16,
            }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: tokenInfo?.set ? 'var(--green)' : '#ef4444',
              }} />
              <div style={{ flex: 1 }}>
                {tokenInfo?.set ? (
                  <>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
                      Ativo · {tokenInfo.preview}
                      <span style={{
                        marginLeft: 8, fontSize: 10, fontWeight: 600,
                        color: tokenInfo.source === 'db' ? 'var(--brand)' : T.hint,
                        background: tokenInfo.source === 'db' ? 'var(--brand-dim)' : 'var(--surface2)',
                        padding: '1px 7px', borderRadius: 20,
                      }}>
                        {tokenInfo.source === 'db' ? 'CUSTOMIZADO' : 'PADRÃO'}
                      </span>
                    </div>
                    {tokenInfo.updated_at && (
                      <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
                        Atualizado {relativeTime(tokenInfo.updated_at)}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>
                    Não configurado
                  </div>
                )}
              </div>
              <button
                onClick={handleTestOnly}
                disabled={!tokenInfo?.set || result.kind === 'testing'}
                className="btn-ghost"
                style={{ fontSize: 12, padding: '6px 12px' }}
              >
                {result.kind === 'testing' ? 'Testando...' : 'Testar conexão'}
              </button>
            </div>

            {/* Test result */}
            {result.kind !== 'idle' && result.kind !== 'testing' && (
              <div style={{
                padding: '10px 14px', marginBottom: 16,
                background: result.kind === 'ok' ? 'var(--green-dim)' : '#ff6b6b18',
                border: `1px solid ${result.kind === 'ok' ? 'var(--green-border)' : '#ff6b6b44'}`,
                borderRadius: 8,
                fontSize: 13,
                color: result.kind === 'ok' ? 'var(--green)' : '#ef4444',
                fontWeight: 600,
              }}>
                {result.kind === 'ok'
                  ? `✓ ${result.bms} Business Manager${result.bms === 1 ? '' : 's'} · ${result.accounts} conta${result.accounts === 1 ? '' : 's'} detectada${result.accounts === 1 ? '' : 's'}`
                  : `✗ ${result.message}`}
              </div>
            )}

            {/* New token input */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.hint, letterSpacing: '0.7px', textTransform: 'uppercase', marginBottom: 6 }}>
                Novo token (substitui o atual)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showToken ? 'text' : 'password'}
                  value={tokenInput}
                  onChange={e => setTokenInput(e.target.value)}
                  placeholder="EAA... (cole o System User Token aqui)"
                  disabled={saving}
                  style={{
                    width: '100%',
                    background: T.surface, border: `1px solid ${T.border}`,
                    borderRadius: 8, padding: '10px 44px 10px 12px',
                    fontSize: 13, color: T.text, outline: 'none',
                    fontFamily: 'monospace',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = T.brand)}
                  onBlur={e => (e.currentTarget.style.borderColor = T.border)}
                />
                <button
                  onClick={() => setShowToken(s => !s)}
                  type="button"
                  style={{
                    position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '4px 8px', fontSize: 14, color: T.muted,
                  }}
                  title={showToken ? 'Ocultar' : 'Mostrar'}
                >
                  {showToken ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleSaveAndTest}
                disabled={saving || !tokenInput.trim()}
                className="btn-primary"
                style={{
                  fontSize: 13, padding: '9px 18px', fontWeight: 700,
                  opacity: saving || !tokenInput.trim() ? 0.6 : 1,
                  cursor: saving || !tokenInput.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                {saving ? 'Salvando...' : 'Salvar e testar'}
              </button>
            </div>

            {/* Help box */}
            <div style={{
              marginTop: 20, padding: '12px 14px',
              background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 8, fontSize: 12, color: T.muted, lineHeight: 1.6,
            }}>
              <div style={{ fontWeight: 700, color: T.text, marginBottom: 6 }}>💡 Como gerar um token?</div>
              <ol style={{ paddingLeft: 18, margin: 0 }}>
                <li>Acesse <b>Meta Business Suite</b> → Configurações de negócios</li>
                <li>Em <b>Usuários</b> → <b>Usuários do sistema</b>, selecione o usuário (ou crie um)</li>
                <li>Clique em <b>Gerar novo token</b></li>
                <li>Permissões necessárias: <code style={{ background: 'var(--surface2)', padding: '1px 5px', borderRadius: 3 }}>ads_read</code> e <code style={{ background: 'var(--surface2)', padding: '1px 5px', borderRadius: 3 }}>business_management</code></li>
                <li>Cole o token acima e clique em <b>Salvar e testar</b></li>
              </ol>
              <a
                href="https://business.facebook.com/settings/system-users"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block', marginTop: 10,
                  color: T.brand, fontSize: 12, fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Abrir Meta Business Suite →
              </a>
            </div>
          </>
        )}
      </Section>

      {/* ── ADICIONAR CLIENTE POR ID META ── */}
      <Section
        title="Adicionar cliente rápido"
        subtitle="Crie um cliente direto pelo ID da conta Meta — útil quando a conta não aparece na lista do picker"
      >
        <QuickClientForm showToast={showToast} />
      </Section>

      {/* ── SOBRE ── */}
      <Section title="Sobre" subtitle="Informações do sistema">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
          <Row label="Worker URL" value={(import.meta.env.VITE_WORKER_URL ?? 'http://localhost:8787') as string} mono />
          <Row label="Versão" value="1.0" />
        </div>
      </Section>
    </div>
  )
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: T.hint,
        letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 4,
      }}>{title}</div>
      {subtitle && (
        <div style={{ fontSize: 13, color: T.muted, marginBottom: 14 }}>{subtitle}</div>
      )}
      <div style={{
        background: T.surface, border: `0.5px solid ${T.border}`,
        borderRadius: 12, padding: '20px',
      }}>
        {children}
      </div>
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
      <span style={{ color: T.muted }}>{label}</span>
      <span style={{
        color: T.text, fontWeight: 500,
        fontFamily: mono ? 'monospace' : undefined,
        fontSize: mono ? 12 : 13,
      }}>{value}</span>
    </div>
  )
}

/* ── QuickClientForm ──────────────────────────────────────── */

type Step = 'id' | 'verified' | 'saving' | 'done'

function QuickClientForm({ showToast }: { showToast: (msg: string) => void }) {
  const [step, setStep] = useState<Step>('id')
  const [metaId, setMetaId] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState<MetaAdAccount | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [type, setType] = useState<ClientType>('lead_gen')
  const [color, setColor] = useState(COLORS[0])

  const reset = () => {
    setStep('id')
    setMetaId('')
    setVerified(null)
    setName('')
    setType('lead_gen')
    setColor(COLORS[0])
    setError(null)
  }

  const handleVerify = async () => {
    setError(null)
    const id = metaId.trim()
    if (!id) {
      setError('Cole o ID da conta Meta (ex: act_123456789)')
      return
    }
    setVerifying(true)
    try {
      const account = await apiMeta.verifyAccount(id)
      setVerified(account)
      setName(account.name)
      setStep('verified')
    } catch (e: any) {
      setError(e?.message || 'Conta não encontrada ou sem acesso')
    } finally {
      setVerifying(false)
    }
  }

  const handleCreate = async () => {
    if (!verified) return
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Nome do cliente é obrigatório')
      return
    }
    setStep('saving')
    setError(null)
    try {
      const cleanId = verified.id.replace(/^act_/, '')
      const client = await apiClients.create({
        name: trimmed,
        type,
        color,
        meta_account_id: cleanId,
      })
      showToast(`✓ ${client.name} criado e vinculado`)
      setStep('done')
      // Reset after a moment for the next addition
      setTimeout(reset, 1200)
    } catch (e: any) {
      setError(e?.message || 'Erro ao criar cliente')
      setStep('verified')
    }
  }

  // Step 1: enter ID
  if (step === 'id') {
    return (
      <div>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.hint, letterSpacing: '0.7px', textTransform: 'uppercase', marginBottom: 6 }}>
          ID da conta Meta
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={metaId}
            onChange={e => { setMetaId(e.target.value); setError(null) }}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleVerify() } }}
            placeholder="act_123456789 ou 123456789"
            disabled={verifying}
            style={{
              flex: 1, background: T.surface, border: `1px solid ${error ? '#ef4444' : T.border}`,
              borderRadius: 8, padding: '10px 12px', fontSize: 13, color: T.text,
              outline: 'none', fontFamily: 'monospace',
            }}
            onFocus={e => { if (!error) e.currentTarget.style.borderColor = T.brand }}
            onBlur={e => { if (!error) e.currentTarget.style.borderColor = T.border }}
          />
          <button
            onClick={handleVerify}
            disabled={verifying || !metaId.trim()}
            className="btn-primary"
            style={{
              fontSize: 13, padding: '10px 20px', fontWeight: 700,
              opacity: verifying || !metaId.trim() ? 0.6 : 1,
              cursor: verifying || !metaId.trim() ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {verifying ? 'Verificando...' : 'Verificar →'}
          </button>
        </div>
        {error && (
          <div style={{ fontSize: 12, color: '#ef4444', marginTop: 8 }}>{error}</div>
        )}
        <div style={{ fontSize: 11, color: T.hint, marginTop: 10, lineHeight: 1.6 }}>
          Encontre o ID em <b>Meta Business Suite</b> → Contas de anúncio → ao clicar na conta, o ID aparece na URL ou nas configurações.
        </div>
      </div>
    )
  }

  // Step 2-3: verified, fill name+type
  return (
    <div>
      {/* Verified banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 14px',
        background: 'var(--green-dim)',
        border: '1px solid var(--green-border)',
        borderRadius: 9, marginBottom: 16,
      }}>
        <div style={{ fontSize: 16 }}>✓</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
            {verified?.name}
          </div>
          <div style={{ fontSize: 11, color: T.muted, fontFamily: 'monospace', marginTop: 1 }}>
            act_{verified?.id.replace(/^act_/, '')} · {verified?.currency}
            {verified?.account_status !== 1 && (
              <span style={{ color: '#f87171', marginLeft: 6 }}>(inativa)</span>
            )}
          </div>
        </div>
        <button
          onClick={reset}
          disabled={step === 'saving'}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: T.muted, fontSize: 12, fontWeight: 600,
            padding: '4px 8px',
          }}
        >
          Trocar
        </button>
      </div>

      {/* Name + type + color */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.hint, letterSpacing: '0.7px', textTransform: 'uppercase', marginBottom: 6 }}>
            Nome do cliente
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nome interno do cliente"
            disabled={step === 'saving'}
            style={{
              width: '100%', background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 8, padding: '9px 12px', fontSize: 13, color: T.text, outline: 'none',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = T.brand)}
            onBlur={e => (e.currentTarget.style.borderColor = T.border)}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.hint, letterSpacing: '0.7px', textTransform: 'uppercase', marginBottom: 6 }}>
            Tipo
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['lead_gen', 'franchise'] as const).map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                disabled={step === 'saving'}
                style={{
                  flex: 1,
                  background: type === t ? `${T.brand}20` : T.surface,
                  border: `1px solid ${type === t ? T.brand : T.border}`,
                  borderRadius: 8, padding: '9px 12px',
                  fontSize: 13, fontWeight: 600,
                  color: type === t ? T.text : T.muted,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {t === 'lead_gen' ? 'Lead Gen' : 'Franquia'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.hint, letterSpacing: '0.7px', textTransform: 'uppercase', marginBottom: 6 }}>
            Cor do avatar
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                disabled={step === 'saving'}
                style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: c, border: 'none', cursor: 'pointer',
                  outline: color === c ? `2px solid ${T.text}` : 'none',
                  outlineOffset: 2,
                }}
              />
            ))}
          </div>
        </div>

        {error && (
          <div style={{ fontSize: 12, color: '#ef4444' }}>{error}</div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button
            onClick={handleCreate}
            disabled={step === 'saving' || step === 'done' || !name.trim()}
            className="btn-primary"
            style={{
              fontSize: 13, padding: '10px 20px', fontWeight: 700,
              opacity: (step === 'saving' || step === 'done' || !name.trim()) ? 0.6 : 1,
              cursor: (step === 'saving' || step === 'done' || !name.trim()) ? 'not-allowed' : 'pointer',
            }}
          >
            {step === 'saving' ? 'Criando...' : step === 'done' ? '✓ Criado!' : 'Criar cliente'}
          </button>
          <button
            onClick={reset}
            disabled={step === 'saving'}
            style={{
              background: 'none', border: `1px solid ${T.border}`,
              borderRadius: 8, padding: '10px 18px', fontSize: 13,
              color: T.muted, cursor: 'pointer', fontWeight: 600,
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
