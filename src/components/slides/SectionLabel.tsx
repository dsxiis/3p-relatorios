import { useTheme } from '../../lib/themeContext'

interface SectionLabelProps {
  children: React.ReactNode
  dark?: boolean
  style?: React.CSSProperties
}

/**
 * Section heading ("Campanha", "Unidade", "Anotações", etc.)
 * Renders differently based on theme.sectionLabelStyle:
 *   badge      — colored background pill (Dark Premium, Emerald)
 *   underline  — text with colored bottom border (Sunrise)
 *   dot        — colored bullet dot before text (Ocean)
 *   rule       — text + full-width rule line (Mono Pro)
 */
export function SectionLabel({ children, dark = false, style }: SectionLabelProps) {
  const t = useTheme()
  const color = dark ? t.coverAccentColor : t.labelColor
  const muted = dark ? t.darkSlideMuted : t.slideMuted

  switch (t.sectionLabelStyle) {
    case 'badge':
      return (
        <div style={{
          display: 'inline-flex', alignItems: 'center',
          background: dark ? `${color}22` : `${color}18`,
          color,
          borderRadius: 5,
          padding: '4px 11px',
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          marginBottom: 10,
          ...style,
        }}>
          {children}
        </div>
      )

    case 'underline':
      return (
        <div style={{
          fontSize: 12,
          fontWeight: 700,
          color,
          textTransform: 'uppercase',
          letterSpacing: '1.2px',
          paddingBottom: 5,
          borderBottom: `2px solid ${color}`,
          marginBottom: 10,
          display: 'inline-block',
          ...style,
        }}>
          {children}
        </div>
      )

    case 'dot':
      return (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 10,
          ...style,
        }}>
          <div style={{
            width: 8, height: 8,
            borderRadius: '50%',
            background: color,
            flexShrink: 0,
          }} />
          <span style={{
            fontSize: 12,
            fontWeight: 700,
            color: muted,
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            {children}
          </span>
        </div>
      )

    case 'rule':
      return (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          marginBottom: 10,
          ...style,
        }}>
          <span style={{
            fontSize: 12,
            fontWeight: 700,
            color: muted,
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            whiteSpace: 'nowrap',
          }}>
            {children}
          </span>
          <div style={{ flex: 1, height: 1, background: t.slideBorder }} />
        </div>
      )
  }
}
