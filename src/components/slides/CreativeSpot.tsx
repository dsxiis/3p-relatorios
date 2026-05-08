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
  // Edit states — all optional for backwards compat
  eImage?: EditState
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
  eImage,
  eClicks,
  eLeads,
  eMessages,
  eCpl,
  eImpressions,
  eCtr,
}: CreativeSpotProps) {
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
      {/* Label strip */}
      <div style={{
        padding: '8px 12px',
        fontSize: 11,
        fontWeight: 700,
        color: muted,
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        borderBottom: `1px solid ${border}`,
      }}>
        {label}
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

      {/* === IMAGE — altura FIXA, contain (mostra imagem inteira sem recorte) === */}
      <div style={{
        width: '100%',
        height: 170,
        position: 'relative',
        background: dark ? t.darkSlideCardBg : '#f9fafb',
      }}>
        {eImage ? (
          <EditableImage e={eImage} dark={dark} width="100%" height="100%" />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            color: muted,
          }}>
            🖼
          </div>
        )}
      </div>
    </div>
  )
}
