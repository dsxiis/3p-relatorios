import { useEffect, useState } from 'react'
import type { AppSettings, MetaAdAccount, ClientType, MetaOAuthStatus, MetaAccountsGrouped } from '../lib/types'
import { apiSettings, apiMeta, apiClients, apiAuth } from '../lib/api'
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

  // OAuth state
  const [oauth, setOauth] = useState<MetaOAuthStatus | null>(null)
  const [oauthLoading, setOauthLoading] = useState(true)
  const [oauthBusy, setOauthBusy] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const refreshAll = async () => {
    setLoading(true)
    setOauthLoading(true)
    try {
      const [s, o] = await Promise.all([
        apiSettings.get().catch(() => null),
        apiAuth.metaStatus().catch(() => ({ connected: false }) as MetaOAuthStatus),
      ])
      setSettings(s)
      setOauth(o)
    } finally {
      setLoading(false)
      setOauthLoading(false)
    }
  }

  useEffect(() => {
    refreshAll()
    // Handle redirect-back from Meta OAuth
    const params = new URLSearchParams(window.location.search)
    if (params.get('meta_connected') === '1') {
      showToast('✓ Conectado com Facebook')
      window.history.replaceState({}, '', window.location.pathname + window.location.hash)
    }
    const err = params.get('meta_error')
    if (err) {
      showToast(`Erro ao conectar: ${decodeURIComponent(err)}`)
      window.history.replaceState({}, '', window.location.pathname + window.location.hash)
    }
  }, [])

  const handleConnectFacebook = async () => {
    setOauthBusy(true)
    try {
      const { url } = await apiAuth.metaStart()
      window.location.href = url
    } catch (e: any) {
      showToast(e?.message || 'Erro ao iniciar conexão')
      setOauthBusy(false)
    }
  }

  const handleDisconnectFacebook = async () => {
    if (!confirm('Desconectar conta do Facebook? Você precisará conectar novamente para gerar relatórios via Meta.')) return
    setOauthBusy(true)
    try {
      await apiAuth.metaDisconnect()
      setOauth({ connected: false })
      showToast('Conta Facebook desconectada')
    } catch (e: any) {
      showToast(e?.message || 'Erro ao desconectar')
    } finally {
      setOauthBusy(false)
    }
  }

  const handleRefreshToken = async () => {
    setOauthBusy(true)
    try {
      const result = await apiAuth.metaRefresh()
      showToast(`✓ Token renovado · ${result.days_left} dias`)
      const fresh = await apiAuth.metaStatus()
      setOauth(fresh)
    } catch (e: any) {
      showToast(`Erro ao renovar: ${e?.message || 'tente reconectar'}`)
    } finally {
      setOauthBusy(false)
    }
  }

  const handleRecheck = async () => {
    setOauthBusy(true)
    try {
      const fresh = await apiAuth.metaStatus()
      setOauth(fresh)
      if (fresh.healthy) showToast('✓ Conexão funcionando')
      else showToast(`Erro: ${fresh.health_error || 'token inválido'}`)
    } finally {
      setOauthBusy(false)
    }
  }

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

      {/* ── CONTA FACEBOOK (OAuth) ── */}
      <Section title="Conta Facebook" subtitle="Conecte sua conta do Facebook para puxar dados de campanhas automaticamente">
        {oauthLoading ? (
          <div style={{ color: T.hint, fontSize: 13 }}>Carregando...</div>
        ) : oauth?.connected ? (
          <div>
            {/* Health status banner */}
            <HealthBanner status={oauth} onRecheck={handleRecheck} busy={oauthBusy} />

            {/* Connected card */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px',
              background: oauth.healthy ? 'var(--green-dim)' : '#ff6b6b18',
              border: `1px solid ${oauth.healthy ? 'var(--green-border)' : '#ff6b6b44'}`,
              borderRadius: 10,
              marginBottom: 12,
            }}>
              {oauth.picture ? (
                <img
                  src={oauth.picture} alt={oauth.user_name}
                  style={{ width: 48, height: 48, borderRadius: '50%', flexShrink: 0, border: `1px solid ${T.border}` }}
                />
              ) : (
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#1877F2,#0a4eb3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, color: '#fff', fontSize: 18, fontWeight: 800,
                }}>
                  {(oauth.user_name || '?').charAt(0).toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {oauth.user_name}
                  <span style={{
                    fontSize: 9, fontWeight: 700, color: '#fff',
                    background: '#1877F2', padding: '2px 7px', borderRadius: 20,
                    letterSpacing: '0.5px',
                  }}>
                    FACEBOOK
                  </span>
                </div>
                {oauth.user_email && (
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{oauth.user_email}</div>
                )}
                <div style={{ fontSize: 11, color: T.hint, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: (oauth.days_left ?? 60) < 7 ? 'var(--amber)' : 'var(--green)',
                  }} />
                  {oauth.days_left !== undefined ? (
                    <>Token expira em <b>{oauth.days_left} dias</b></>
                  ) : 'Token ativo'}
                </div>
              </div>
              <button
                onClick={handleDisconnectFacebook}
                disabled={oauthBusy}
                style={{
                  background: 'none', border: `1px solid ${T.border}`,
                  borderRadius: 8, padding: '8px 14px', fontSize: 12,
                  color: T.muted, cursor: oauthBusy ? 'not-allowed' : 'pointer',
                  fontWeight: 600, whiteSpace: 'nowrap',
                }}
              >
                Desconectar
              </button>
            </div>

            {/* Renew button — sempre disponível enquanto saudável */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <button
                onClick={handleRefreshToken}
                disabled={oauthBusy || !oauth.healthy}
                className="btn-ghost"
                style={{ fontSize: 12, padding: '7px 14px', fontWeight: 600 }}
                title="Estende a validade do token por mais 60 dias"
              >
                ↻ Renovar token (+60 dias)
              </button>
              {(oauth.days_left ?? 60) < 14 && (
                <span style={{
                  fontSize: 11, color: 'var(--amber)', fontWeight: 600,
                  display: 'flex', alignItems: 'center',
                }}>
                  ⚠ Renove ou reconecte antes de expirar
                </span>
              )}
            </div>

            {!oauth.healthy && oauth.health_error && (
              <div style={{
                background: '#ff6b6b18', border: '1px solid #ff6b6b44',
                borderRadius: 8, padding: '10px 14px', fontSize: 12,
                color: '#ef4444', marginBottom: 10,
              }}>
                <b>Erro ao validar token:</b> {oauth.health_error}
                <div style={{ marginTop: 6, color: T.muted, fontWeight: 400 }}>
                  Tente <button onClick={handleConnectFacebook} disabled={oauthBusy} style={{ background: 'none', border: 'none', color: T.brand, cursor: 'pointer', textDecoration: 'underline', padding: 0, fontSize: 12 }}>reconectar</button> com sua conta Facebook.
                </div>
              </div>
            )}

            <div style={{ fontSize: 11, color: T.hint, marginTop: 12, lineHeight: 1.6 }}>
              Permissões: leitura de contas e dados de campanha (read-only). Você pode revogar a qualquer momento em
              {' '}<a href="https://www.facebook.com/settings?tab=applications" target="_blank" rel="noopener noreferrer" style={{ color: T.brand, textDecoration: 'none' }}>Facebook → Apps e sites</a>.
            </div>
          </div>
        ) : (
          <div>
            <button
              onClick={handleConnectFacebook}
              disabled={oauthBusy}
              style={{
                background: '#1877F2',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '12px 22px',
                fontSize: 14,
                fontWeight: 700,
                cursor: oauthBusy ? 'not-allowed' : 'pointer',
                opacity: oauthBusy ? 0.6 : 1,
                display: 'flex', alignItems: 'center', gap: 10,
                boxShadow: '0 1px 3px rgba(24,119,242,0.3)',
                transition: 'transform 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              {oauthBusy ? 'Abrindo Facebook...' : 'Continuar com Facebook'}
            </button>

            <div style={{
              marginTop: 16, padding: '12px 14px',
              background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 8, fontSize: 12, color: T.muted, lineHeight: 1.6,
            }}>
              <div style={{ fontWeight: 700, color: T.text, marginBottom: 6 }}>🔒 O que isso permite:</div>
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                <li><b>Ler</b> suas Business Managers e contas de anúncio (ads_read + business_management)</li>
                <li><b>Ler</b> métricas de campanha (impressões, gasto, leads, cliques)</li>
                <li><b>Não</b> permite criar, editar, pausar campanhas ou gastar dinheiro</li>
                <li>Token expira em <b>60 dias</b> automaticamente</li>
                <li>Você revoga em 1 clique aqui ou no Facebook</li>
              </ul>
            </div>
          </div>
        )}
      </Section>

      {/* ── ADVANCED: Manual token ── */}
      <div style={{ marginBottom: 28 }}>
        <button
          onClick={() => setShowAdvanced(v => !v)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: T.muted, fontSize: 12, fontWeight: 600,
            padding: '8px 0', display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <span style={{ transition: 'transform 0.15s', transform: showAdvanced ? 'rotate(90deg)' : 'rotate(0)' }}>▶</span>
          Configurações avançadas
        </button>
      </div>

      {showAdvanced && (
      <Section title="Token Meta API (avançado)" subtitle="Use System User Token caso prefira não conectar com sua conta pessoal — não expira">
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
      )}

      {/* ── CONTAS META DETECTADAS ── */}
      <Section
        title="Contas Meta detectadas"
        subtitle="Todas as contas que o sistema enxerga com o token atual — diretas, agrupadas por BM e adicionadas manualmente"
      >
        <DetectedAccountsList showToast={showToast} />
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

/* ── HealthBanner ─────────────────────────────────────── */
function HealthBanner({
  status,
  onRecheck,
  busy,
}: {
  status: MetaOAuthStatus
  onRecheck: () => void
  busy: boolean
}) {
  const days = status.days_left ?? 60
  const lastCheck = status.last_check ? new Date(status.last_check) : null
  const lastCheckLabel = lastCheck ? timeAgo(lastCheck) : null

  let kind: 'ok' | 'warning' | 'error' = 'ok'
  let label = ''
  let detail = ''
  let icon = '✓'

  if (!status.healthy) {
    kind = 'error'
    icon = '✗'
    label = 'Conexão com erro'
    detail = status.health_error || 'Token inválido — reconecte sua conta'
  } else if (days < 7) {
    kind = 'warning'
    icon = '⚠'
    label = `Conectado · expira em ${days} dia${days === 1 ? '' : 's'}`
    detail = 'Renove o token agora para evitar interrupção'
  } else if (days < 14) {
    kind = 'warning'
    icon = '✓'
    label = `Conectado · expira em ${days} dias`
    detail = 'Considere renovar antes de expirar'
  } else {
    kind = 'ok'
    icon = '✓'
    label = `Conectado e funcionando`
    detail = `Token válido por mais ${days} dias`
  }

  const colors = {
    ok: { bg: 'var(--green-dim)', border: 'var(--green-border)', fg: 'var(--green)' },
    warning: { bg: 'var(--amber-dim)', border: 'var(--amber)', fg: 'var(--amber)' },
    error: { bg: '#ff6b6b18', border: '#ff6b6b44', fg: '#ef4444' },
  }[kind]

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: colors.bg, border: `1px solid ${colors.border}`,
      borderRadius: 10, padding: '10px 14px', marginBottom: 12,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        background: colors.fg, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 800, flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{label}</div>
        <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
          {detail}
          {lastCheckLabel && <span style={{ color: T.hint, marginLeft: 8 }}>· verificado {lastCheckLabel}</span>}
        </div>
      </div>
      <button
        onClick={onRecheck}
        disabled={busy}
        className="btn-ghost"
        style={{ fontSize: 11, padding: '5px 10px', whiteSpace: 'nowrap' }}
        title="Verificar agora"
      >
        ↻ Testar
      </button>
    </div>
  )
}

function timeAgo(d: Date): string {
  const sec = Math.floor((Date.now() - d.getTime()) / 1000)
  if (sec < 5) return 'agora'
  if (sec < 60) return `${sec}s atrás`
  if (sec < 3600) return `${Math.floor(sec / 60)}min atrás`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h atrás`
  return d.toLocaleDateString('pt-BR')
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
      // Save to manual list (persists for all future picker uses)
      const account = await apiMeta.saveManualAccount(id)
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

/* ── DetectedAccountsList ─────────────────────────────── */

function DetectedAccountsList({ showToast }: { showToast: (msg: string) => void }) {
  const [data, setData] = useState<MetaAccountsGrouped | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const load = async (showLoad = true) => {
    if (showLoad) setLoading(true)
    else setRefreshing(true)
    setError(null)
    try {
      const d = await apiMeta.businesses()
      setData(d)
    } catch (e: any) {
      setError(e?.message || 'Erro ao buscar contas')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleRemoveManual = async (id: string) => {
    if (!confirm('Remover esta conta da lista de salvas? Você pode adicionar de novo a qualquer momento.')) return
    try {
      await apiMeta.removeManualAccount(id)
      showToast('Conta removida')
      await load(false)
    } catch (e: any) {
      showToast(e?.message || 'Erro ao remover')
    }
  }

  if (loading) return <div style={{ color: T.hint, fontSize: 13 }}>Carregando contas...</div>
  if (error) return (
    <div style={{ padding: '12px 14px', background: '#ff6b6b18', borderRadius: 8, fontSize: 13, color: '#ef4444' }}>
      ✗ {error}
    </div>
  )
  if (!data) return null

  const manual = data.manual_accounts ?? []
  const total = manual.length + data.direct_accounts.length + data.businesses.reduce((s, b) => s + b.accounts.length, 0)
  const q = search.trim().toLowerCase()
  const matches = (acc: MetaAdAccount) =>
    !q || acc.name.toLowerCase().includes(q) || acc.id.replace(/^act_/, '').includes(q.replace(/^act_/, ''))

  const filteredManual = manual.filter(matches)
  const filteredDirect = data.direct_accounts.filter(matches)
  const filteredBMs = data.businesses
    .map(bm => ({ ...bm, accounts: bm.accounts.filter(matches) }))
    .filter(bm => bm.accounts.length > 0 || bm.name.toLowerCase().includes(q))
  const filteredTotal = filteredManual.length + filteredDirect.length + filteredBMs.reduce((s, b) => s + b.accounts.length, 0)

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Buscar conta por nome ou ID..."
          style={{
            flex: 1, background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 8, padding: '8px 12px', fontSize: 13, color: T.text,
            outline: 'none',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = T.brand)}
          onBlur={e => (e.currentTarget.style.borderColor = T.border)}
        />
        <button
          onClick={() => load(false)}
          disabled={refreshing}
          className="btn-ghost"
          style={{ fontSize: 12, padding: '8px 14px', whiteSpace: 'nowrap' }}
        >
          {refreshing ? 'Atualizando...' : '↻ Atualizar'}
        </button>
      </div>

      {/* Summary */}
      <div style={{ fontSize: 12, color: T.muted, marginBottom: 12 }}>
        {q
          ? <><b style={{ color: T.text }}>{filteredTotal}</b> de <b>{total}</b> contas — busca: "<i>{search}</i>"</>
          : <><b style={{ color: T.text }}>{total}</b> conta{total === 1 ? '' : 's'} detectada{total === 1 ? '' : 's'} · {data.businesses.length} Business Manager{data.businesses.length === 1 ? '' : 's'} · {manual.length} manuai{manual.length === 1 ? 's' : 's'}</>
        }
      </div>

      {/* Empty */}
      {total === 0 && (
        <div style={{ padding: '20px 14px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, color: T.muted, textAlign: 'center' }}>
          Nenhuma conta detectada. Verifique o token nas seções acima ou adicione manualmente abaixo.
        </div>
      )}

      {q && filteredTotal === 0 && total > 0 && (
        <div style={{ padding: '14px', textAlign: 'center', color: T.muted, fontSize: 13 }}>
          Nenhuma conta encontrada para "<b>{search}</b>"
        </div>
      )}

      {/* Groups */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 480, overflowY: 'auto' }}>
        {filteredManual.length > 0 && (
          <DetectedGroup
            title="Adicionadas manualmente"
            icon="⭐"
            accounts={filteredManual}
            onRemove={handleRemoveManual}
          />
        )}

        {filteredBMs.map(bm => (
          <DetectedGroup
            key={bm.id}
            title={bm.name}
            icon="🏢"
            accounts={bm.accounts}
            subtitle={`Business Manager · ${bm.id}`}
          />
        ))}

        {filteredDirect.length > 0 && (
          <DetectedGroup
            title="Sem Business Manager"
            icon="📂"
            accounts={filteredDirect}
            subtitle="Contas vinculadas diretamente ao usuário do token"
          />
        )}
      </div>
    </div>
  )
}

function DetectedGroup({
  title, icon, accounts, subtitle, onRemove,
}: {
  title: string
  icon: string
  accounts: MetaAdAccount[]
  subtitle?: string
  onRemove?: (id: string) => void
}) {
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 10, overflow: 'hidden',
    }}>
      <div style={{
        padding: '10px 14px',
        borderBottom: `1px solid ${T.border}`,
        background: 'var(--surface2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
            <span style={{ marginRight: 6 }}>{icon}</span>
            {title}
          </div>
          <div style={{ fontSize: 11, color: T.hint }}>
            {accounts.length} {accounts.length === 1 ? 'conta' : 'contas'}
          </div>
        </div>
        {subtitle && (
          <div style={{ fontSize: 11, color: T.muted, marginTop: 2, fontFamily: 'monospace' }}>
            {subtitle}
          </div>
        )}
      </div>
      <div>
        {accounts.map(acc => {
          const cleanId = acc.id.replace(/^act_/, '')
          const active = acc.account_status === 1
          return (
            <div
              key={acc.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 14px', borderBottom: `1px solid ${T.border}`,
                opacity: active ? 1 : 0.55,
              }}
            >
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: active ? 'var(--green)' : '#f87171', flexShrink: 0,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {acc.name}
                </div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 1, fontFamily: 'monospace' }}>
                  act_{cleanId} · {acc.currency || '—'}
                  {!active && <span style={{ color: '#f87171', marginLeft: 6 }}>inativa</span>}
                </div>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(`act_${cleanId}`)}
                title="Copiar ID"
                style={{
                  background: 'none', border: `1px solid ${T.border}`,
                  borderRadius: 6, padding: '4px 9px', fontSize: 11,
                  color: T.muted, cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                Copiar ID
              </button>
              {onRemove && (
                <button
                  onClick={() => onRemove(cleanId)}
                  title="Remover da lista"
                  style={{
                    background: 'none', border: 'none',
                    color: T.hint, cursor: 'pointer', padding: '4px 8px',
                    fontSize: 14, borderRadius: 6,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#ef4444' }}
                  onMouseLeave={e => { e.currentTarget.style.color = T.hint }}
                >
                  ✕
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
