import { useState } from 'react'
import type { EditState } from '../../lib/types'
import { EditableField } from './EditableField'

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
  const textColor = dark ? '#e8e8e8' : '#1a1a2e'
  const mutedColor = dark ? '#888' : '#6b7280'
  const borderColor = dark ? '#2e2e50' : '#e5e7eb'

  const visible = metrics.filter(m => m.eVisible?.value !== 'false')
  const hidden  = metrics.filter(m => m.eVisible?.value === 'false')

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 12,
      }}>
        {visible.map((m, i) => (
          <MetricCard
            key={i}
            m={m}
            dark={dark}
            textColor={textColor}
            mutedColor={mutedColor}
            borderColor={borderColor}
          />
        ))}
      </div>

      {/* Hidden metrics — chips to re-add */}
      {hidden.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {hidden.map((m, i) => (
            <button
              key={i}
              onClick={() => { m.eVisible!.change('true'); m.eVisible!.save() }}
              title={`Mostrar "${m.label}"`}
              style={{
                background: 'none',
                border: `1px dashed ${dark ? '#2e2e50' : '#d1d5db'}`,
                borderRadius: 6,
                padding: '3px 9px',
                fontSize: 10,
                color: mutedColor,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                transition: 'border-color 0.12s, color 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#8833ff'; e.currentTarget.style.color = '#8833ff' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = dark ? '#2e2e50' : '#d1d5db'; e.currentTarget.style.color = mutedColor }}
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

interface MetricCardProps {
  m: MetricItem
  dark: boolean
  textColor: string
  mutedColor: string
  borderColor: string
}

function MetricCard({ m, dark, textColor, mutedColor, borderColor }: MetricCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={{
        background: dark ? '#1a1a2e' : '#f9fafb',
        border: `1px solid ${m.accentColor ? m.accentColor + '44' : borderColor}`,
        borderRadius: 8,
        padding: '12px 14px',
        position: 'relative',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ fontSize: 10, color: mutedColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
        {m.label}
      </div>
      {m.sub && (
        <div style={{ fontSize: 9, color: mutedColor, marginBottom: 2 }}>{m.sub}</div>
      )}
      {m.e ? (
        <EditableField
          e={m.e}
          dark={dark}
          style={{ fontSize: 20, fontWeight: 800, color: m.accentColor ?? textColor, letterSpacing: '-0.5px', display: 'block' }}
        />
      ) : (
        <div style={{ fontSize: 20, fontWeight: 800, color: m.accentColor ?? textColor, letterSpacing: '-0.5px' }}>
          {m.value}
        </div>
      )}

      {/* Hide button — appears on hover when eVisible is provided */}
      {m.eVisible && hovered && (
        <button
          onClick={e => { e.stopPropagation(); m.eVisible!.change('false'); m.eVisible!.save() }}
          title="Esconder esta métrica"
          style={{
            position: 'absolute', top: 5, right: 5,
            background: dark ? '#2e2e50' : '#e5e7eb',
            border: 'none',
            borderRadius: 4,
            width: 18, height: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, color: mutedColor,
            cursor: 'pointer',
            lineHeight: 1,
            transition: 'background 0.1s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#ff6b6b'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.background = dark ? '#2e2e50' : '#e5e7eb'; e.currentTarget.style.color = mutedColor }}
        >
          ×
        </button>
      )}
    </div>
  )
}
