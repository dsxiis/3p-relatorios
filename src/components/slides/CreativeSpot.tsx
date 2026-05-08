import type { EditState } from '../../lib/types'
import { EditableField } from './EditableField'
import { EditableImage } from './EditableImage'
import { useTheme } from '../../lib/themeContext'

interface CreativeMetrics {
  clicks?: number
  leads?: number
  messages?: number
  cpl?: number
  impressions?: number
  ctr?: number
}

interface CreativeSpotProps {
  label: string
  metrics?: CreativeMetrics
  dark?: boolean
  // Link e nome do ad — passados pra edit state quando vem do Meta
  previewLink?: string | null
  adName?: string | null
  // Edit states — all optional for backwards compat
  eImage?: EditState
  eLink?: EditState     // link editável pro preview do anúncio
  eClicks?: EditState
  eLeads?: EditState
  eMessages?: EditState
  eCpl?: EditState
  eImpressions?: EditState
  eCtr?: EditState
}

/**
 * Card with label strip + prominent metrics panel + image (4:3 landscape).
 * Metrics são o foco, imagem é menor.
 */
export function CreativeSpot({
  label,
  metrics,
  dark = false,
  previewLink,
  adName,
  eImage,
  eLink,
  eClicks,
  eLeads,
  eMessages,
  eCpl,
  eImpressions,
  eCtr,
}: CreativeSpotProps) {
  // Link efetivo: prioridade pro estado editado, fallback pro vindo da Meta
  const effectiveLink = (eLink?.value ?? previewLink ?? '').trim()
  const t = useTheme()
  const text   = dark ? t.darkSlideText : t.slideText
  const muted  = dark ? t.darkSlideMuted : t.slideMuted
  const hint   = dark ? t.darkSlideMuted : t.slideHint
  const border = dark ? t.darkSlideBorder : t.slideBorder
  const bg     = dark ? t.darkSlideCardBg : t.slideCardBg
  const surface = dark ? t.darkSlideCardBg : t.slideCardBg

  // Accent colors
  const cplAccent = t.accent  // purple
  const leadAccent = '#34d399' // green

  return (
    <div style={{
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: t.cardRadius + 2,
      overflow: 'hidden',
    }}>
      {/* Label strip + nome do ad + link */}
      <div style={{
        padding: '8px 12px',
        borderBottom: `1px solid ${border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            color: muted,
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
          }}>
            {label}
          </div>
          {adName && (
            <div style={{
              fontSize: 10, color: muted, marginTop: 2,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}
            title={adName}
            >
              {adName}
            </div>
          )}
        </div>
        {effectiveLink && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <a
              href={effectiveLink}
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir anúncio na Meta"
              style={{
                fontSize: 11, color: t.accent, fontWeight: 700,
                textDecoration: 'none',
                padding: '3px 8px', borderRadius: 5,
                background: `${t.accent}18`,
              }}
            >
              ↗ Ver
            </a>
            {eLink && (
              <button
                data-editor-only="true"
                onClick={() => {
                  const url = window.prompt('Editar link do anúncio (deixe vazio pra remover):', effectiveLink)
                  if (url !== null) {
                    eLink.change(url)
                    eLink.save(url)
                  }
                }}
                title="Editar link"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '2px 4px', fontSize: 10, color: muted,
                }}
              >
                ✏
              </button>
            )}
          </div>
        )}
        {!effectiveLink && eLink && (
          <button
            data-editor-only="true"
            onClick={() => {
              const url = window.prompt('Adicionar link do anúncio:', '')
              if (url) {
                eLink.change(url)
                eLink.save(url)
              }
            }}
            style={{
              fontSize: 10, color: muted,
              background: 'none', border: `1px dashed ${border}`,
              padding: '3px 8px', borderRadius: 5,
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            + link
          </button>
        )}
      </div>

      {/* === METRICS PANEL (em destaque, em cima) === */}
      {metrics && (
        <div style={{
          padding: '12px 14px 10px',
          background: surface,
          borderBottom: `1px solid ${border}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          {/* Top row: Leads/Messages (focal) + CTR */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            {(metrics.leads !== undefined || metrics.messages !== undefined) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: hint,
                  letterSpacing: '0.7px', textTransform: 'uppercase',
                }}>
                  {metrics.leads !== undefined ? 'Leads' : 'Mensagens'}
                </span>
                <span style={{ fontSize: 30, fontWeight: 800, color: leadAccent, lineHeight: 1, letterSpacing: '-0.5px' }}>
                  {metrics.leads !== undefined
                    ? (eLeads ? <EditableField e={eLeads} style={{ fontSize: 30, fontWeight: 800, color: leadAccent, letterSpacing: '-0.5px' }} /> : metrics.leads)
                    : (eMessages ? <EditableField e={eMessages} style={{ fontSize: 30, fontWeight: 800, color: leadAccent, letterSpacing: '-0.5px' }} /> : metrics.messages)
                  }
                </span>
              </div>
            )}
            {metrics.ctr !== undefined && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-end' }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: hint,
                  letterSpacing: '0.7px', textTransform: 'uppercase',
                }}>CTR</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: text, lineHeight: 1, letterSpacing: '-0.3px' }}>
                  {eCtr
                    ? <EditableField e={eCtr} style={{ fontSize: 20, fontWeight: 800, color: text, letterSpacing: '-0.3px' }} />
                    : `${metrics.ctr.toFixed(2)}%`
                  }
                </span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: border, opacity: 0.7 }} />

          {/* Bottom row: Clicks · Impressões · CPL */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {metrics.clicks !== undefined && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 9, color: hint, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase' }}>Cliques</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: text, letterSpacing: '-0.2px' }}>
                  {eClicks
                    ? <EditableField e={eClicks} style={{ fontSize: 16, fontWeight: 800, color: text, letterSpacing: '-0.2px' }} />
                    : metrics.clicks.toLocaleString('pt-BR')
                  }
                </span>
              </div>
            )}
            {metrics.impressions !== undefined && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                <span style={{ fontSize: 9, color: hint, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase' }}>Impressões</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: text, letterSpacing: '-0.2px' }}>
                  {eImpressions
                    ? <EditableField e={eImpressions} style={{ fontSize: 16, fontWeight: 800, color: text, letterSpacing: '-0.2px' }} />
                    : metrics.impressions.toLocaleString('pt-BR')
                  }
                </span>
              </div>
            )}
            {metrics.cpl !== undefined && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-end' }}>
                <span style={{ fontSize: 9, color: hint, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase' }}>CPL</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: cplAccent, letterSpacing: '-0.3px' }}>
                  {eCpl
                    ? <EditableField e={eCpl} style={{ fontSize: 18, fontWeight: 800, color: cplAccent, letterSpacing: '-0.3px' }} />
                    : `R$ ${metrics.cpl.toFixed(2)}`
                  }
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* === IMAGE AREA — card fixo, dentro um frame 9:16 padronizado === */}
      <div style={{
        width: '100%',
        height: 340,                           /* card fixo */
        background: dark ? t.darkSlideCardBg : '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,                           /* espaço pras bordas */
      }}>
        {/* Frame 9:16 padronizado — sempre vertical, independente da imagem */}
        <div style={{
          aspectRatio: '9 / 16',
          height: '100%',
          maxWidth: '100%',
          background: '#0a0a0a',
          borderRadius: 6,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',     /* pra overlays */
        }}>
          {eImage ? (
            <EditableImage e={eImage} dark={dark} width="100%" height="100%" />
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              fontSize: 24,
              color: '#666',
            }}>
              <span>📷</span>
              <span style={{ fontSize: 10, fontWeight: 600 }}>9:16</span>
            </div>
          )}

          {/* ▶ Play / "Ver Anúncio" overlay — quando tem link */}
          {effectiveLink && (
            <a
              href={effectiveLink}
              target="_blank"
              rel="noopener noreferrer"
              data-editor-only="true"
              onClick={e => e.stopPropagation()}
              title="Ver anúncio na Meta"
              style={{
                position: 'absolute',
                bottom: 10, right: 10,
                background: 'rgba(0,0,0,0.75)',
                backdropFilter: 'blur(8px)',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: 5,
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.2)',
                zIndex: 10,
                transition: 'transform 0.12s, background 0.12s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = t.accent
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(0,0,0,0.75)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <span style={{ fontSize: 9 }}>▶</span>
              Ver Anúncio
            </a>
          )}

          {/* Big centered play overlay quando NÃO tem imagem mas tem link */}
          {effectiveLink && eImage && !eImage.value && (
            <a
              href={effectiveLink}
              target="_blank"
              rel="noopener noreferrer"
              data-editor-only="true"
              onClick={e => e.stopPropagation()}
              title="Abrir anúncio na Meta"
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.4)',
                color: '#fff',
                textDecoration: 'none',
                cursor: 'pointer',
                zIndex: 5,
              }}
            >
              <div style={{
                background: 'rgba(255,255,255,0.95)',
                color: '#000',
                width: 56, height: 56, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, paddingLeft: 4,
              }}>
                ▶
              </div>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
