import { useTheme } from '../../lib/themeContext'

interface SlideShellProps {
  children: React.ReactNode
  dark?: boolean
  style?: React.CSSProperties
}

export function SlideShell({ children, dark = false, style }: SlideShellProps) {
  const t = useTheme()
  return (
    <div style={{
      background: dark ? t.darkSlideBg : t.slideBg,
      borderRadius: t.cardRadius + 4,
      padding: `40px ${t.slidePaddingX}px`,
      boxShadow: '0 2px 20px rgba(0,0,0,0.18)',
      color: dark ? t.darkSlideText : t.slideText,
      position: 'relative',
      overflow: 'hidden',
      ...style,
    }}>
      {children}
    </div>
  )
}
