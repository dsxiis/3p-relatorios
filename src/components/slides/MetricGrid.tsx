import { useState } from 'react'
import type { EditState } from '../../lib/types'
import { EditableField } from './EditableField'
import { useTheme } from '../../lib/themeContext'

interface MetricItem {
  label: string
  value: string
  sub?: string
  accentColor?: string
  e?: EditState        // makes value editable
  eVisible?: EditState // 'true' | 'false' — controls visibility
}

interface MetricGridProps {
  metrics: MetricItem[]
  columns?: number
  dark?: boolean
}

export function MetricGrid({ metrics, columns = 3, dark = false }: MetricGridProps) {
  const t = useTheme()
  const mutedColor = dark ? t.darkSlideMuted : t.slideMuted

  const visible = metrics.filter(m => m.eVisible?.value !== 'false')
  const hidden  = metrics.filter(m => m.eVisible?.value === 'false')

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: t.metricCardVariant === 'outline' ? 14 : 16,
      }}>
        {visible.map((m, i) => (
          <MetricCard key={i} m={m} dark={dark} />
        ))}
      </div>

      {/* Hidden metrics — chips to re-add */}
      {hidden.length > 0 && (
        <div data-editor-only="true" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
          {hidden.map((m, i) => (
            <button
              key={i}
              onClick={() => { m.eVisible!.change('true'); m.eVisible!.save('true') }}
              title={`Mostrar "${m.label}"`}
              style={{
                background: 'none',
                border: `1px dashed ${dark ? t.darkSlideBorder : '#d1d5db'}`,
                borderRadius: 6,
                padding: '4px 11px',
                fontSize: 12,
                color: mutedColor,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                transition: 'border-color 0.12s, color 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.accent }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = dark ? t.darkSlideBorder : '#d1d5db'; e.currentTarget.style.color = mutedColor }}
            >
              <span>+</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── MetricCard ────────────────────────────────────────────────

interface MetricCardProps {
  m: MetricItem
  dark: boolean
}

function MetricCard({ m, dark }: MetricCardProps) {
  const [hovered, setHovered] = useState(false)
  const t = useTheme()
  const accentColor = m.accentColor ?? t.accent
  const textColor   = dark ? t.darkSlideText   : t.slideText
  const mutedColor  = dark ? t.darkSlideMuted  : t.slideMuted

  const variant = t.metricCardVariant

  // ── filled ──────────────────────────────────────────
  if (variant === 'filled') {
    const bg     = dark ? t.darkSlideCardBg : t.slideCardBg
    const border = dark ? t.darkSlideBorder : (m.accentColor ? m.accentColor + '33' : t.slideBorder)

    return (
      <CardShell hovered={hovered} onEnter={() => setHovered(true)} onLeave={() => setHovered(false)}
        style={{ background: bg, border: `1px solid ${border}`, borderRadius: t.cardRadius, padding: '20px 20px 18px', overflow: 'hidden' }}
      >
        <Label>{m.label}</Label>
        {m.sub && <Sub>{m.sub}</Sub>}
        <Value e={m.e} dark={dark} value={m.value} color={accentColor} size={t.metricValueSize} />
        {/* Bottom accent fill */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, ${accentColor}60, ${accentColor}10)`,
        }} />
        <HideBtn show={!!m.eVisible && hovered} onHide={() => { m.eVisible!.change('false'); m.eVisible!.save('false') }}
          bg={dark ? t.darkSlideBorder : t.slideBorder} muted={mutedColor} />
      </CardShell>
    )
  }

  // ── left-border ─────────────────────────────────────
  if (variant === 'left-border') {
    const bg = dark ? t.darkSlideCardBg : '#ffffff'
    return (
      <CardShell hovered={hovered} onEnter={() => setHovered(true)} onLeave={() => setHovered(false)}
        style={{
          background: bg,
          border: `1px solid ${dark ? t.darkSlideBorder : t.slideBorder}`,
          borderLeft: `4px solid ${accentColor}`,
          borderRadius: t.cardRadius,
          padding: '20px 20px 18px',
          overflow: 'hidden',
        }}
      >
        <Label color={mutedColor}>{m.label}</Label>
        {m.sub && <Sub>{m.sub}</Sub>}
        <Value e={m.e} dark={dark} value={m.value} color={accentColor} size={t.metricValueSize} />
        {/* Bottom tint */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
          background: `${accentColor}30`,
        }} />
        <HideBtn show={!!m.eVisible && hovered} onHide={() => { m.eVisible!.change('false'); m.eVisible!.save('false') }}
          bg={dark ? t.darkSlideBorder : t.slideBorder} muted={mutedColor} />
      </CardShell>
    )
  }

  // ── top-accent ──────────────────────────────────────
  if (variant === 'top-accent') {
    const bg = dark ? t.darkSlideCardBg : '#ffffff'
    return (
      <CardShell hovered={hovered} onEnter={() => setHovered(true)} onLeave={() => setHovered(false)}
        style={{
          background: bg,
          border: `1px solid ${dark ? t.darkSlideBorder : t.slideBorder}`,
          borderTop: `3px solid ${accentColor}`,
          borderRadius: t.cardRadius,
          padding: '20px 20px 18px',
          overflow: 'hidden',
        }}
      >
        <Label color={mutedColor}>{m.label}</Label>
        {m.sub && <Sub>{m.sub}</Sub>}
        <Value e={m.e} dark={dark} value={m.value} color={textColor} size={t.metricValueSize}
          accentBelow={accentColor} />
        <HideBtn show={!!m.eVisible && hovered} onHide={() => { m.eVisible!.change('false'); m.eVisible!.save('false') }}
          bg={dark ? t.darkSlideBorder : t.slideBorder} muted={mutedColor} />
      </CardShell>
    )
  }

  // ── outline ─────────────────────────────────────────
  return (
    <CardShell hovered={hovered} onEnter={() => setHovered(true)} onLeave={() => setHovered(false)}
      style={{
        background: 'transparent',
        border: `2px solid ${dark ? t.darkSlideText : t.slideText}`,
        borderRadius: t.cardRadius,
        padding: '20px 20px 18px',
        overflow: 'hidden',
      }}
    >
      <Label color={mutedColor}>{m.label}</Label>
      {m.sub && <Sub>{m.sub}</Sub>}
      <Value e={m.e} dark={dark} value={m.value} color={textColor} size={t.metricValueSize} />
      <HideBtn show={!!m.eVisible && hovered} onHide={() => { m.eVisible!.change('false'); m.eVisible!.save('false') }}
        bg={dark ? t.darkSlideBorder : t.slideBorder} muted={mutedColor} />
    </CardShell>
  )
}

// ── Shared sub-components ─────────────────────────────────────

function CardShell({ children, style, onEnter, onLeave, hovered: _ }:
  { children: React.ReactNode; style: React.CSSProperties; onEnter: () => void; onLeave: () => void; hovered?: boolean }) {
  return (
    <div
      style={{ position: 'relative', ...style }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  )
}

function Label({ children, color }: { children: React.ReactNode; color?: string }) {
  const t = useTheme()
  return (
    <div style={{
      fontSize: 13, fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.8px', marginBottom: 8,
      color: color ?? t.slideMuted,
    }}>
      {children}
    </div>
  )
}

function Sub({ children }: { children: React.ReactNode }) {
  const t = useTheme()
  return <div style={{ fontSize: 12, color: t.slideMuted, marginBottom: 4 }}>{children}</div>
}

function Value({ e, dark, value, color, size, accentBelow }:
  { e?: EditState; dark: boolean; value: string; color: string; size: number; accentBelow?: string }) {
  return (
    <div>
      {e ? (
        <EditableField
          e={e}
          dark={dark}
          style={{ fontSize: size, fontWeight: 900, color, letterSpacing: '-1px', display: 'block', lineHeight: 1 }}
        />
      ) : (
        <div style={{ fontSize: size, fontWeight: 900, color, letterSpacing: '-1px', lineHeight: 1 }}>
          {value}
        </div>
      )}
      {accentBelow && (
        <div style={{ marginTop: 10, height: 3, width: 32, background: accentBelow, borderRadius: 2 }} />
      )}
    </div>
  )
}

function HideBtn({ show, onHide, bg, muted }:
  { show: boolean; onHide: () => void; bg: string; muted: string }) {
  if (!show) return null
  return (
    <button
      data-editor-only="true"
      onClick={e => { e.stopPropagation(); onHide() }}
      title="Esconder esta métrica"
      style={{
        position: 'absolute', top: 6, right: 6,
        background: bg, border: 'none',
        borderRadius: 3,
        width: 18, height: 18,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, color: muted,
        cursor: 'pointer', lineHeight: 1,
        transition: 'background 0.1s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#ff6b6b'; e.currentTarget.style.color = '#fff' }}
      onMouseLeave={e => { e.currentTarget.style.background = bg; e.currentTarget.style.color = muted }}
    >
      ×
    </button>
  )
}
