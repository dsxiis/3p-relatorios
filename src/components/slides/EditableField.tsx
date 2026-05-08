import { useRef, useEffect } from 'react'
import type { EditState } from '../../lib/types'

interface EditableFieldProps {
  e: EditState
  style?: React.CSSProperties
  inputStyle?: React.CSSProperties
  multiline?: boolean
  placeholder?: string
  dark?: boolean
}

/**
 * Inline editable field — looks like plain text when idle,
 * becomes an input/textarea when clicked.
 */
export function EditableField({
  e,
  style = {},
  inputStyle = {},
  multiline = false,
  placeholder = '—',
  dark = false,
}: EditableFieldProps) {
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null)

  useEffect(() => {
    if (e.active) ref.current?.focus()
  }, [e.active])

  const hintColor = dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)'

  if (e.active) {
    const shared: React.CSSProperties = {
      background: 'transparent',
      border: 'none',
      borderBottom: `2px solid #8833ff`,
      outline: 'none',
      fontFamily: 'inherit',
      padding: '0 0 2px',
      width: '100%',
      color: 'inherit',
      ...style,
      ...inputStyle,
    }

    return multiline ? (
      <textarea
        ref={ref as any}
        value={e.value}
        onChange={ev => e.change(ev.target.value)}
        onBlur={() => e.save()}
        placeholder={placeholder}
        rows={3}
        style={{ ...shared, resize: 'none', lineHeight: (style.lineHeight as string) ?? '1.5' }}
      />
    ) : (
      <input
        ref={ref as any}
        value={e.value}
        onChange={ev => e.change(ev.target.value)}
        onBlur={() => e.save()}
        onKeyDown={ev => { if (ev.key === 'Enter') { ev.preventDefault(); e.save() } }}
        placeholder={placeholder}
        style={shared}
      />
    )
  }

  return (
    <span
      onClick={e.start}
      title="Clique para editar"
      style={{
        cursor: 'text',
        position: 'relative',
        display: 'inline-block',
        minWidth: 40,
        borderBottom: `1px dashed ${hintColor}`,
        ...style,
      }}
    >
      {e.value || <span style={{ opacity: 0.4 }}>{placeholder}</span>}
    </span>
  )
}
