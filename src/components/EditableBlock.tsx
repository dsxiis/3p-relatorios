import type { EditState } from '../lib/types'

interface EditableBlockProps {
  label: string
  e: EditState
  small?: boolean
  minHeight?: number
}

export function EditableBlock({ label, e, small = false, minHeight }: EditableBlockProps) {
  const fontSize = small ? 10 : 11
  const textHeight = small ? 104 : 120
  const viewMin = minHeight ?? (small ? 80 : 90)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <div className="editable-label" style={{ fontSize: small ? 9 : 10 }}>{label}</div>
        {!e.active ? (
          <button
            data-editor-only="true"
            onClick={e.start}
            className="editable-btn"
            style={{ background: '#F5F0FF', color: '#8B35E8' }}
          >
            ✏ Editar
          </button>
        ) : (
          <button
            data-editor-only="true"
            onClick={() => e.save()}
            className="editable-btn"
            style={{ background: '#8B35E8', color: '#fff' }}
          >
            ✓ Salvar
          </button>
        )}
      </div>
      {e.active ? (
        <textarea
          value={e.value}
          onChange={ev => e.change(ev.target.value)}
          autoFocus
          className="editable-textarea"
          style={{ height: textHeight, fontSize }}
        />
      ) : (
        <div
          className="editable-view"
          style={{ minHeight: viewMin, fontSize, lineHeight: 1.7 }}
        >
          {e.value}
        </div>
      )}
    </div>
  )
}
