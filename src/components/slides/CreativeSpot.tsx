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

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      {eImage ? (
        <EditableImage e={eImage} dark={dark} width={72} height={90} />
      ) : (
        <div style={{
          width: 72, height: 90, flexShrink: 0,
          background: dark ? t.darkSlideCardBg : t.slideCardBg,
          border: `1px dashed ${dark ? t.darkSlideBorder : t.slideBorder}`,
          borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, color: muted,
        }}>
          🖼
        </div>
      )}

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: muted, textTransform: 'uppercase', marginBottom: 6 }}>
          {label}
        </div>
        {metrics && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {metrics.clicks !== undefined && (
              <div style={{ fontSize: 11, color: text }}>
                <span style={{ color: muted }}>Cliques: </span>
                {eClicks
                  ? <EditableField e={eClicks} style={{ fontSize: 11, color: text }} />
                  : metrics.clicks
                }
              </div>
            )}
            {metrics.leads !== undefined && (
              <div style={{ fontSize: 11, color: text }}>
                <span style={{ color: muted }}>Leads: </span>
                {eLeads
                  ? <EditableField e={eLeads} style={{ fontSize: 11, color: text }} />
                  : metrics.leads
                }
              </div>
            )}
            {metrics.messages !== undefined && (
              <div style={{ fontSize: 11, color: text }}>
                <span style={{ color: muted }}>Msgs: </span>
                {eMessages
                  ? <EditableField e={eMessages} style={{ fontSize: 11, color: text }} />
                  : metrics.messages
                }
              </div>
            )}
            {metrics.cpl !== undefined && (
              <div style={{ fontSize: 11, fontWeight: 700, color: t.accent }}>
                {eCpl
                  ? <EditableField e={eCpl} style={{ fontSize: 11, fontWeight: 700, color: t.accent }} />
                  : `CPL R$ ${metrics.cpl.toFixed(2)}`
                }
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
