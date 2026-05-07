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
              minHeight: 160,
              background: bg,
              border: `1.5px solid ${t.accent}`,
              borderRadius: 10,
              padding: '18px 20px',
              fontSize: 18,
              color: text,
              lineHeight: 1.75,
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={e.save}
            style={{
              marginTop: 10,
              background: t.accent,
              color: '#fff',
              border: 'none',
              borderRadius: 7,
              padding: '9px 22px',
              fontSize: 13,
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
            borderRadius: 10,
            padding: '18px 52px 18px 20px',
            fontSize: 18,
            color: e.value ? text : muted,
            lineHeight: 1.75,
            whiteSpace: 'pre-wrap',
            minHeight: 70,
            cursor: 'text',
            position: 'relative',
          }}
          onClick={e.start}
        >
          {e.value || placeholder}
          <button
            onClick={ev => { ev.stopPropagation(); e.start() }}
            style={{
              position: 'absolute', top: 14, right: 14,
              background: 'none', border: 'none',
              cursor: 'pointer', fontSize: 17, color: muted,
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
