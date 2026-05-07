import type { EditState } from '../../lib/types'
import { useTheme } from '../../lib/themeContext'

interface EditableTextProps {
  e: EditState
  placeholder?: string
  dark?: boolean
  style?: React.CSSProperties
}

export function EditableText({ e, placeholder = 'Clique em ✏ para editar', dark = false, style }: EditableTextProps) {
  const t = useTheme()
  const bg     = dark ? t.darkSlideCardBg : t.slideCardBg
  const border  = dark ? t.darkSlideBorder : t.slideBorder
  const text    = dark ? t.darkSlideText   : t.slideText
  const muted   = dark ? t.darkSlideMuted  : t.slideHint

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
              border: `1.5px solid ${t.accent}`,
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
              background: t.accent,
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
