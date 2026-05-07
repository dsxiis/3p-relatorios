import type { EditState } from '../../lib/types'

interface EditableTextProps {
  e: EditState
  placeholder?: string
  dark?: boolean
  style?: React.CSSProperties
}

export function EditableText({ e, placeholder = 'Clique em ✏ para editar', dark = false, style }: EditableTextProps) {
  const bg = dark ? '#1a1a2e' : '#f9fafb'
  const border = dark ? '#2e2e50' : '#e5e7eb'
  const text = dark ? '#e8e8e8' : '#374151'
  const muted = dark ? '#666' : '#9ca3af'

  return (
    <div style={{ position: 'relative', ...style }}>
      {e.active ? (
        <div>
          <textarea
            value={e.value}
            onChange={ev => e.change(ev.target.value)}
            autoFocus
            style={{
              width: '100%',
              minHeight: 100,
              background: bg,
              border: `1.5px solid #8833ff`,
              borderRadius: 6,
              padding: '10px 12px',
              fontSize: 12,
              color: text,
              lineHeight: 1.7,
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={e.save}
            style={{
              marginTop: 6,
              background: '#8833ff',
              color: '#fff',
              border: 'none',
              borderRadius: 5,
              padding: '5px 14px',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ✓ Salvar
          </button>
        </div>
      ) : (
        <div
          style={{
            background: bg,
            border: `1px solid ${border}`,
            borderRadius: 6,
            padding: '10px 36px 10px 12px',
            fontSize: 12,
            color: e.value ? text : muted,
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
            minHeight: 44,
            cursor: 'text',
            position: 'relative',
          }}
          onClick={e.start}
        >
          {e.value || placeholder}
          <button
            onClick={ev => { ev.stopPropagation(); e.start() }}
            style={{
              position: 'absolute', top: 8, right: 8,
              background: 'none', border: 'none',
              cursor: 'pointer', fontSize: 13, color: muted,
              padding: 2,
            }}
          >
            ✏
          </button>
        </div>
      )}
    </div>
  )
}
