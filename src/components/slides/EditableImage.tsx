import { useRef } from 'react'
import type { EditState } from '../../lib/types'

interface EditableImageProps {
  e: EditState          // value = base64 data URL or ''
  label?: string
  dark?: boolean
  width?: number | string
  height?: number | string
}

/** Compress image to JPEG data URL with max dimensions */
function compressImage(file: File, maxW = 420, maxH = 560, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = ev => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width, maxH / img.height)
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject
      img.src = ev.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function EditableImage({
  e,
  label,
  dark = false,
  width = 90,
  height = 110,
}: EditableImageProps) {
  // allow '100%' string widths for flex/grid children

  const inputRef = useRef<HTMLInputElement>(null)
  const hasImage = Boolean(e.value)

  const border = dark ? '#2e2e50' : '#e5e7eb'
  const muted = dark ? '#555' : '#9ca3af'
  const bg = dark ? '#1a1a2e' : '#f3f4f6'
  const hoverBg = dark ? '#20203a' : '#ede9fe'

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return
    try {
      const dataUrl = await compressImage(file)
      e.change(dataUrl)
      e.save(dataUrl)  // valor explícito pra evitar stale closure
    } catch {
      // ignore compression error
    }
  }

  const handleDrop = (ev: React.DragEvent) => {
    ev.preventDefault()
    const file = ev.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && (
        <div style={{ fontSize: 10, fontWeight: 700, color: muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </div>
      )}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={ev => ev.preventDefault()}
        onDrop={handleDrop}
        title={hasImage ? 'Clique para trocar imagem' : 'Clique ou arraste para adicionar imagem'}
        style={{
          width, height,
          borderRadius: 8,
          border: `1.5px dashed ${hasImage ? 'transparent' : border}`,
          background: hasImage ? 'transparent' : bg,
          cursor: 'pointer',
          overflow: 'hidden',
          position: 'relative',
          flexShrink: 0,
          transition: 'border-color 0.15s, background 0.15s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget
          if (!hasImage) el.style.background = hoverBg
          el.style.borderColor = '#8833ff'
        }}
        onMouseLeave={ev => {
          const el = ev.currentTarget
          if (!hasImage) el.style.background = bg
          el.style.borderColor = hasImage ? 'transparent' : border
        }}
      >
        {hasImage ? (
          <>
            <img
              src={e.value}
              alt="criativo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',  // mostra a imagem inteira sem recortar
                display: 'block',
                background: bg,         // letterbox combina com tema
              }}
            />
            {/* Overlay on hover */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.45)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              opacity: 0, transition: 'opacity 0.15s',
              gap: 4,
            }}
              onMouseEnter={ev => { (ev.currentTarget as HTMLDivElement).style.opacity = '1' }}
              onMouseLeave={ev => { (ev.currentTarget as HTMLDivElement).style.opacity = '0' }}
            >
              <span style={{ fontSize: 18 }}>🔄</span>
              <span style={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>Trocar</span>
            </div>
          </>
        ) : (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 8, padding: 16, width: '100%', height: '100%',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 32 }}>📷</div>
            <div style={{ fontSize: 13, color: muted, fontWeight: 600, lineHeight: 1.5 }}>
              Clique ou arraste<br />para adicionar imagem
            </div>
          </div>
        )}
      </div>

      {hasImage && (
        <button
          data-editor-only="true"
          onClick={ev => { ev.stopPropagation(); e.change(''); e.save('') }}
          style={{
            background: 'none', border: 'none',
            fontSize: 10, color: muted, cursor: 'pointer',
            padding: '2px 0', textAlign: 'left',
          }}
        >
          × remover
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={ev => {
          const file = ev.target.files?.[0]
          if (file) handleFile(file)
          ev.target.value = ''
        }}
      />
    </div>
  )
}
