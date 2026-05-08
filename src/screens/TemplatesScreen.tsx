import { useState } from 'react'
import { ALL_THEMES } from '../lib/themes'
import type { SlideTheme } from '../lib/themes'
import { ThemePreviewMini } from '../components/slides/ThemePreviewMini'
import { T } from '../styles/tokens'

interface TemplatesScreenProps {
  onBack?: () => void
}

export function TemplatesScreen({ onBack: _ }: TemplatesScreenProps) {
  const [expanded, setExpanded] = useState<SlideTheme | null>(null)

  return (
    <div className="screen-root" style={{ maxWidth: 860, animation: 'fadein 0.25s ease' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: '-0.4px', margin: 0 }}>
          Templates de Relatório
        </h1>
        <p style={{ color: T.muted, fontSize: 13, marginTop: 6, marginBottom: 0 }}>
          5 padrões visuais distintos — cards, tipografia e estrutura diferentes. Selecione ao gerar um relatório.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 20,
      }}>
        {ALL_THEMES.map(theme => (
          <ThemeGalleryCard
            key={theme.id}
            theme={theme}
            onExpand={() => setExpanded(theme)}
          />
        ))}
      </div>

      <div style={{
        marginTop: 36,
        padding: '16px 20px',
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 10,
        display: 'flex', gap: 12, alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
        <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.7 }}>
          Ao gerar um novo relatório você escolhe o template. O estilo é aplicado individualmente — relatórios diferentes podem ter designs diferentes.
        </div>
      </div>

      {/* Expanded preview modal */}
      {expanded && (
        <PreviewModal theme={expanded} onClose={() => setExpanded(null)} />
      )}
    </div>
  )
}

// ── Gallery card ───────────────────────────────────────────────

function ThemeGalleryCard({ theme, onExpand }: { theme: SlideTheme; onExpand: () => void }) {
  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 12,
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'box-shadow 0.15s, transform 0.15s',
    }}
    onClick={onExpand}
    onMouseEnter={e => {
      e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.14)'
      e.currentTarget.style.transform = 'translateY(-3px)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.boxShadow = 'none'
      e.currentTarget.style.transform = 'none'
    }}
    >
      {/* Live preview */}
      <div style={{ padding: 10, background: '#e5e7eb' }}>
        <ThemePreviewMini theme={theme} width={280} />
      </div>

      {/* Info strip */}
      <div style={{ padding: '12px 16px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
            <span style={{ fontSize: 15 }}>{theme.emoji}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{theme.name}</span>
          </div>
          <p style={{ fontSize: 11, color: T.muted, margin: 0, lineHeight: 1.4 }}>
            {theme.description}
          </p>
        </div>
        <div style={{ fontSize: 11, color: T.muted, flexShrink: 0, marginLeft: 12 }}>
          Ampliar →
        </div>
      </div>
    </div>
  )
}

// ── Expanded modal ─────────────────────────────────────────────

function PreviewModal({ theme, onClose }: { theme: SlideTheme; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.7)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        animation: 'fadein 0.15s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: T.surface,
          borderRadius: 16,
          overflow: 'hidden',
          maxWidth: 680,
          width: '100%',
          boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '18px 22px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: `1px solid ${T.border}`,
        }}>
          <div>
            <span style={{ fontSize: 18, marginRight: 8 }}>{theme.emoji}</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{theme.name}</span>
            <span style={{ fontSize: 12, color: T.muted, marginLeft: 10 }}>{theme.description}</span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 18, color: T.muted, cursor: 'pointer', padding: '2px 6px' }}
          >
            ×
          </button>
        </div>

        {/* Large preview */}
        <div style={{ padding: 20, background: '#d1d5db', display: 'flex', justifyContent: 'center' }}>
          <ThemePreviewMini theme={theme} width={600} />
        </div>

        {/* Style tags */}
        <div style={{ padding: '14px 22px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <StyleTag label={`Cards: ${cardVariantLabel(theme.metricCardVariant)}`} color={theme.accent} />
          <StyleTag label={`Labels: ${labelStyleLabel(theme.sectionLabelStyle)}`} color={theme.accent} />
          <StyleTag label={`Radius: ${theme.cardRadius}px`} color={theme.accent} />
        </div>
      </div>
    </div>
  )
}

function StyleTag({ label, color }: { label: string; color: string }) {
  return (
    <div style={{
      padding: '3px 9px', borderRadius: 4,
      background: color + '18', color,
      fontSize: 10, fontWeight: 600,
    }}>
      {label}
    </div>
  )
}

function cardVariantLabel(v: SlideTheme['metricCardVariant']): string {
  return { filled: 'Preenchido', 'left-border': 'Borda lateral', 'top-accent': 'Borda superior', outline: 'Outline' }[v]
}

function labelStyleLabel(v: SlideTheme['sectionLabelStyle']): string {
  return { badge: 'Badge', underline: 'Sublinhado', dot: 'Marcador', rule: 'Régua' }[v]
}
