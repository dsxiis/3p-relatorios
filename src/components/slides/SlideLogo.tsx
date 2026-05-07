interface SlideLogoProps {
  clientName: string
  dark?: boolean
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left'
}

export function SlideLogo({ clientName, dark = false, position = 'top-right' }: SlideLogoProps) {
  const posMap: Record<string, React.CSSProperties> = {
    'top-right':    { top: 20, right: 24 },
    'bottom-right': { bottom: 20, right: 24 },
    'top-left':     { top: 20, left: 24 },
    'bottom-left':  { bottom: 20, left: 24 },
  }
  const color = dark ? '#aaa' : '#6b7280'

  return (
    <div style={{
      position: 'absolute',
      ...posMap[position],
      fontSize: 11,
      fontWeight: 700,
      color,
      letterSpacing: '-0.2px',
    }}>
      {clientName} <span style={{ color: '#8833ff' }}>| 3P.</span>
    </div>
  )
}
