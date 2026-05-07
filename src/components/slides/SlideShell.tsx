interface SlideShellProps {
  children: React.ReactNode
  dark?: boolean
  style?: React.CSSProperties
}

export function SlideShell({ children, dark = false, style }: SlideShellProps) {
  return (
    <div style={{
      background: dark ? '#0f0f1a' : '#ffffff',
      borderRadius: 12,
      padding: '28px 32px',
      boxShadow: '0 2px 20px rgba(0,0,0,0.18)',
      color: dark ? '#e8e8e8' : '#1a1a2e',
      position: 'relative',
      overflow: 'hidden',
      ...style,
    }}>
      {children}
    </div>
  )
}
