import { useEffect, useState } from 'react'
import type { AppSettings } from '../lib/types'
import { apiSettings, apiMeta } from '../lib/api'
import { T } from '../styles/tokens'
import { relativeTime } from '../lib/utils'

interface SettingsScreenProps {
  showToast: (msg: string) => void
}

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
