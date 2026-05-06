import type { CSSProperties, ReactNode } from 'react'

interface SlideProps {
  bg?: string
  padding?: string
  children: ReactNode
  style?: CSSProperties
}

export function Slide({ bg = '#fff', padding = '0', children, style }: SlideProps) {
  return (
    <div
      className="slide"
      style={{
        background: bg,
        padding,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
