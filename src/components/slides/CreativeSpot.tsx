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
 * Card with label strip + image (3:4 aspect) with metrics overlaid at the bottom via gradient.
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
  const muted = dark ? t.darkSlideMuted : t.slideMuted
  const border = dark ? t.darkSlideBorder : t.slideBorder
  const bg     = dark ? t.darkSlideCardBg : t.slideCardBg

  // Accent colors for overlay metrics
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

      {/* Image with overlaid metrics */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '3 / 4' }}>
        {/* Image */}
        {eImage ? (
          <EditableImage e={eImage} dark={dark} width="100%" height="100%" />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            background: dark ? t.darkSlideCardBg : '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            color: muted,
          }}>
            🖼
          </div>
        )}

        {/* Gradient overlay + metrics (only if any metric is defined) */}
        {metrics && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 60%, transparent 100%)',
            padding: '28px 12px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
          }}>
            {/* Top row: Leads/Messages + CTR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {/* Leads or Messages — large focal metric */}
              {(metrics.leads !== undefined || metrics.messages !== undefined) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    {metrics.leads !== undefined ? 'Leads' : 'Mensagens'}
                  </span>
                  <span style={{ fontSize: 22, fontWeight: 800, color: leadAccent, lineHeight: 1 }}>
                    {metrics.leads !== undefined
                      ? (eLeads ? <EditableField e={eLeads} style={{ fontSize: 22, fontWeight: 800, color: leadAccent }} /> : metrics.leads)
                      : (eMessages ? <EditableField e={eMessages} style={{ fontSize: 22, fontWeight: 800, color: leadAccent }} /> : metrics.messages)
                    }
                  </span>
                </div>
              )}
              {/* CTR */}
              {metrics.ctr !== undefined && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                  <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>CTR</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>
                    {eCtr
                      ? <EditableField e={eCtr} style={{ fontSize: 15, fontWeight: 700, color: '#fff' }} />
                      : `${metrics.ctr.toFixed(2)}%`
                    }
                  </span>
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.15)', margin: '2px 0' }} />

            {/* Bottom row: Clicks · Impressões · CPL */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {metrics.clicks !== undefined && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', fontWeight: 500, letterSpacing: '0.3px', textTransform: 'uppercase' }}>Cliques</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                    {eClicks
                      ? <EditableField e={eClicks} style={{ fontSize: 13, fontWeight: 700, color: '#fff' }} />
                      : metrics.clicks.toLocaleString('pt-BR')
                    }
                  </span>
                </div>
              )}
              {metrics.impressions !== undefined && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', fontWeight: 500, letterSpacing: '0.3px', textTransform: 'uppercase' }}>Impressões</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                    {eImpressions
                      ? <EditableField e={eImpressions} style={{ fontSize: 13, fontWeight: 700, color: '#fff' }} />
                      : metrics.impressions.toLocaleString('pt-BR')
                    }
                  </span>
                </div>
              )}
              {metrics.cpl !== undefined && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', fontWeight: 500, letterSpacing: '0.3px', textTransform: 'uppercase' }}>CPL</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: cplAccent }}>
                    {eCpl
                      ? <EditableField e={eCpl} style={{ fontSize: 14, fontWeight: 800, color: cplAccent }} />
                      : `R$ ${metrics.cpl.toFixed(2)}`
                    }
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
