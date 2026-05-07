import type { EditState } from '../../lib/types'
import { EditableField } from './EditableField'
import { EditableImage } from './EditableImage'
import { useTheme } from '../../lib/themeContext'

interface CreativeMetrics {
  clicks?: number
  leads?: number
  messages?: number
  cpl?: number
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
}

/**
 * Vertical card layout: label → image (fixed 4:5, full-width) → metrics below.
 * Image size is fixed regardless of the actual image uploaded.
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
}: CreativeSpotProps) {
  const t = useTheme()
  const muted = dark ? t.darkSlideMuted : t.slideMuted
  const text  = dark ? t.darkSlideText  : t.slideText
  const bg    = dark ? t.darkSlideCardBg : t.slideCardBg
  const border = dark ? t.darkSlideBorder : t.slideBorder

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
        fontSize: 10,
        fontWeight: 700,
        color: muted,
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        borderBottom: `1px solid ${border}`,
      }}>
        {label}
      </div>

      {/* Image — fixed 4:5 aspect ratio, fills full width */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 5' }}>
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
      </div>

      {/* Metrics */}
      {metrics && (
        <div style={{
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
          borderTop: `1px solid ${border}`,
        }}>
          {metrics.clicks !== undefined && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: muted, fontWeight: 500 }}>Cliques</span>
              {eClicks
                ? <EditableField e={eClicks} style={{ fontSize: 13, fontWeight: 700, color: text }} />
                : <span style={{ fontWeight: 700, color: text }}>{metrics.clicks}</span>
              }
            </div>
          )}
          {metrics.leads !== undefined && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: muted, fontWeight: 500 }}>Leads</span>
              {eLeads
                ? <EditableField e={eLeads} style={{ fontSize: 13, fontWeight: 700, color: text }} />
                : <span style={{ fontWeight: 700, color: text }}>{metrics.leads}</span>
              }
            </div>
          )}
          {metrics.messages !== undefined && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: muted, fontWeight: 500 }}>Mensagens</span>
              {eMessages
                ? <EditableField e={eMessages} style={{ fontSize: 13, fontWeight: 700, color: text }} />
                : <span style={{ fontWeight: 700, color: text }}>{metrics.messages}</span>
              }
            </div>
          )}
          {metrics.cpl !== undefined && (
            <div style={{
              display: 'flex', justifyContent: 'space-between', fontSize: 14,
              marginTop: 2, paddingTop: 6,
              borderTop: `1px solid ${border}`,
            }}>
              <span style={{ color: muted, fontWeight: 500 }}>CPL</span>
              {eCpl
                ? <EditableField e={eCpl} style={{ fontSize: 14, fontWeight: 800, color: t.accent }} />
                : <span style={{ fontWeight: 800, color: t.accent }}>R$ {metrics.cpl.toFixed(2)}</span>
              }
            </div>
          )}
        </div>
      )}
    </div>
  )
}
