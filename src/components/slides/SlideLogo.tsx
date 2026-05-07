interface SlideLogoProps {
  clientName: string
  clientLogo?: string | null
  dark?: boolean
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left'
}

export function SlideLogo({ clientName, clientLogo, dark = false, position = 'top-right' }: SlideLogoProps) {
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
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    }}>
      {/* Client logo or text */}
      {clientLogo ? (
        <img
          src={clientLogo}
          alt={clientName}
          style={{ height: 22, maxWidth: 80, objectFit: 'contain', borderRadius: 3 }}
        />
      ) : (
        <span style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: '-0.2px' }}>
          {clientName}
        </span>
      )}
      {/* Divider */}
      <span style={{ fontSize: 11, color: dark ? '#555' : '#d1d5db' }}>|</span>
      {/* 3P logo */}
      <span style={{ fontSize: 11, fontWeight: 800, color: '#8833ff', letterSpacing: '-0.2px' }}>3P.</span>
    </div>
  )
}
