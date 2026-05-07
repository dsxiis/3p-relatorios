/**
 * ThemePreviewMini
 *
 * Renders a realistic scaled-down preview of a theme: cover slide + content slide.
 * Pure static rendering — no hooks, no EditState, no external deps.
 * Renders at 480px inner width and scales via CSS transform.
 */
import type { SlideTheme, MetricCardVariant, SectionLabelStyle } from '../../lib/themes'

const INNER_W = 480
const COVER_H = 160
const CONTENT_H = 280
const GAP = 6
const INNER_H = COVER_H + GAP + CONTENT_H

interface ThemePreviewMiniProps {
  theme: SlideTheme
  /** Outer display width in px. Height scales proportionally. Default 300. */
  width?: number
  style?: React.CSSProperties
}

export function ThemePreviewMini({ theme: t, width = 300, style }: ThemePreviewMiniProps) {
  const scale = width / INNER_W
  const height = INNER_H * scale

  return (
    <div style={{
      width,
      height,
      overflow: 'hidden',
      borderRadius: 8,
      flexShrink: 0,
      position: 'relative',
      background: '#eee',
      ...style,
    }}>
      <div style={{
        width: INNER_W,
        height: INNER_H,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        display: 'flex',
        flexDirection: 'column',
        gap: GAP,
        background: '#e5e7eb',
        padding: 6,
      }}>
        {/* ── Cover slide ───────────────────────────── */}
        <div style={{
          height: COVER_H,
          background: t.coverBg,
          borderRadius: t.cardRadius + 4,
          padding: '22px 28px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {/* Logo placeholder */}
          <div style={{
            position: 'absolute', top: 14, right: 18,
            width: 32, height: 10, borderRadius: 2,
            background: 'rgba(255,255,255,0.15)',
          }} />
          {/* Label */}
          <div style={{
            fontSize: 9, fontWeight: 700, color: t.coverAccentColor,
            textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 8,
          }}>
            Relatório de Performance
          </div>
          {/* Title */}
          <div style={{
            fontSize: 26, fontWeight: 900, color: t.coverTitleColor,
            letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 8,
          }}>
            Nome do Cliente
          </div>
          {/* Period + badge */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ fontSize: 12, color: t.coverSubColor, fontWeight: 500 }}>
              Abril / 2026
            </div>
            <div style={{
              padding: '2px 8px', borderRadius: 20,
              background: t.coverBadgeBg, color: t.coverBadgeText,
              fontSize: 9, fontWeight: 700,
            }}>
              Lead Gen
            </div>
          </div>
          {/* Accent bar */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
            background: t.coverBarGradient,
          }} />
        </div>

        {/* ── Content slide ─────────────────────────── */}
        <div style={{
          flex: 1,
          background: t.slideBg,
          borderRadius: t.cardRadius + 4,
          padding: `18px ${t.slidePaddingX}px`,
          overflow: 'hidden',
        }}>
          {/* Section label */}
          <div style={{ marginBottom: 12 }}>
            <MiniSectionLabel t={t} />
          </div>

          {/* Metric cards row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
            {SAMPLE_METRICS.map((m, i) => (
              <MiniMetricCard key={i} m={m} t={t} />
            ))}
          </div>

          {/* Second row — 2 cards + spacer */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
            {SAMPLE_METRICS2.map((m, i) => (
              <MiniMetricCard key={i} m={m} t={t} />
            ))}
            <div /> {/* spacer */}
          </div>

          {/* Annotation area */}
          <MiniAnnotation t={t} />
        </div>
      </div>
    </div>
  )
}

// ── Sample data ───────────────────────────────────────────────

const SAMPLE_METRICS = [
  { label: 'Impressões', value: '284k', accent: false },
  { label: 'Leads',      value: '142',  accent: true  },
  { label: 'CPL',        value: 'R$18', accent: true  },
]

const SAMPLE_METRICS2 = [
  { label: 'Cliques',    value: '3.2k', accent: false },
  { label: 'Investim.',  value: 'R$2.6k', accent: false },
]

// ── Mini card variants ─────────────────────────────────────────

function MiniMetricCard({ m, t }: { m: { label: string; value: string; accent: boolean }; t: SlideTheme }) {
  const accentColor = m.accent ? t.accent : (t.slideText)
  const variant: MetricCardVariant = t.metricCardVariant

  const baseStyle: React.CSSProperties = {
    borderRadius: t.cardRadius,
    padding: '8px 10px',
    position: 'relative',
    overflow: 'hidden',
  }

  let containerStyle: React.CSSProperties = baseStyle

  if (variant === 'filled') {
    containerStyle = {
      ...baseStyle,
      background: t.slideCardBg,
      border: `1px solid ${m.accent ? t.accent + '33' : t.slideBorder}`,
    }
  } else if (variant === 'left-border') {
    containerStyle = {
      ...baseStyle,
      background: '#ffffff',
      border: `1px solid ${t.slideBorder}`,
      borderLeft: `3px solid ${accentColor}`,
    }
  } else if (variant === 'top-accent') {
    containerStyle = {
      ...baseStyle,
      background: '#ffffff',
      border: `1px solid ${t.slideBorder}`,
      borderTop: `2px solid ${accentColor}`,
    }
  } else {
    // outline
    containerStyle = {
      ...baseStyle,
      background: 'transparent',
      border: `1.5px solid ${t.slideText}`,
    }
  }

  return (
    <div style={containerStyle}>
      <div style={{ fontSize: 7, color: t.slideMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>
        {m.label}
      </div>
      <div style={{ fontSize: t.metricValueSize * 0.72, fontWeight: 800, color: accentColor, letterSpacing: '-0.5px', lineHeight: 1 }}>
        {m.value}
      </div>
      {variant === 'top-accent' && (
        <div style={{ marginTop: 4, height: 1.5, width: 16, background: accentColor, borderRadius: 1 }} />
      )}
    </div>
  )
}

// ── Mini section label ─────────────────────────────────────────

function MiniSectionLabel({ t }: { t: SlideTheme }) {
  const style: SectionLabelStyle = t.sectionLabelStyle
  const color = t.labelColor
  const muted = t.slideMuted

  if (style === 'badge') {
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center',
        background: `${color}18`, color,
        borderRadius: 4, padding: '2px 6px',
        fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px',
      }}>
        Campanha
      </div>
    )
  }

  if (style === 'underline') {
    return (
      <div style={{
        fontSize: 9, fontWeight: 700, color,
        textTransform: 'uppercase', letterSpacing: '1px',
        paddingBottom: 3, borderBottom: `2px solid ${color}`,
        display: 'inline-block',
      }}>
        Campanha
      </div>
    )
  }

  if (style === 'dot') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <span style={{ fontSize: 9, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          Campanha
        </span>
      </div>
    )
  }

  // rule
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 9, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '1.2px', whiteSpace: 'nowrap' }}>
        Campanha
      </span>
      <div style={{ flex: 1, height: 1, background: t.slideBorder }} />
    </div>
  )
}

// ── Mini annotation area ───────────────────────────────────────

function MiniAnnotation({ t }: { t: SlideTheme }) {
  return (
    <div>
      <MiniSectionLabelSmall t={t} text="Anotações" />
      <div style={{
        marginTop: 5,
        background: t.metricCardVariant === 'outline' ? 'transparent' : t.slideCardBg,
        border: `1px solid ${t.slideBorder}`,
        borderRadius: t.cardRadius,
        padding: '7px 9px',
      }}>
        {[100, 85, 60].map((w, i) => (
          <div key={i} style={{
            height: 5, background: t.slideHint + '66',
            borderRadius: 2, marginBottom: i < 2 ? 4 : 0,
            width: `${w}%`,
          }} />
        ))}
      </div>
    </div>
  )
}

function MiniSectionLabelSmall({ t, text }: { t: SlideTheme; text: string }) {
  const style: SectionLabelStyle = t.sectionLabelStyle
  const color = t.labelColor
  const muted = t.slideMuted

  if (style === 'badge') {
    return (
      <div style={{
        display: 'inline-flex',
        background: `${color}18`, color,
        borderRadius: 3, padding: '1px 5px',
        fontSize: 7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
      }}>{text}</div>
    )
  }
  if (style === 'underline') {
    return (
      <div style={{
        fontSize: 8, fontWeight: 700, color,
        textTransform: 'uppercase', letterSpacing: '1px',
        paddingBottom: 2, borderBottom: `1.5px solid ${color}`, display: 'inline-block',
      }}>{text}</div>
    )
  }
  if (style === 'dot') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <div style={{ width: 4, height: 4, borderRadius: '50%', background: color }} />
        <span style={{ fontSize: 8, fontWeight: 700, color: muted, textTransform: 'uppercase' }}>{text}</span>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 8, fontWeight: 700, color: muted, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{text}</span>
      <div style={{ flex: 1, height: 1, background: t.slideBorder }} />
    </div>
  )
}
