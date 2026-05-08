import { useEffect, useRef } from 'react'
import type { EditState } from '../../lib/types'
import { EditableField } from './EditableField'
import { EditableImage } from './EditableImage'
import { useTheme } from '../../lib/themeContext'
import { apiMeta } from '../../lib/api'

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
  // ID do creative — usado pra fazer upgrade lazy da thumbnail pra HD (1080×1920)
  creativeId?: string | null
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
  creativeId,
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

  // Lazy HD upgrade: se temos creative_id e a thumbnail atual é da Meta CDN,
  // troca pelo HD on-demand. Não mexe se user uploadou imagem custom (não-fbcdn).
  const upgradedRef = useRef(false)
  useEffect(() => {
    if (upgradedRef.current) return
    if (!creativeId || !eImage) return
    const current = eImage.value ?? ''
    // Só faz upgrade pra URLs da Meta CDN. data: URLs (uploads custom) ficam intactas.
    if (!current.includes('fbcdn.net')) return
    // Já é HD? skip
    if (current.includes('p1080x1920')) return
    upgradedRef.current = true
    apiMeta.hdThumb(creativeId)
      .then(({ thumbnail_url }) => {
        const v = eImage.value ?? ''
        // Recheca: ainda fbcdn (não foi customizada)?
        if (v.includes('fbcdn.net') && !v.includes('p1080x1920')) {
          eImage.change(thumbnail_url)
          eImage.save(thumbnail_url)
        }
      })
      .catch(() => { /* mantém lo-res — já funciona, só fica borrado */ })
  }, [creativeId, eImage])
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

        </div>
      </div>
    </div>
  )
}
