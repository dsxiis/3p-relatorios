interface ImgPlaceholderProps {
  color?: string
  ratio?: string
}

export function ImgPlaceholder({ color = '#F0E8FF', ratio = '3/4' }: ImgPlaceholderProps) {
  return (
    <div
      style={{
        width: '100%',
        aspectRatio: ratio,
        background: color,
        borderRadius: 7,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ddd',
        fontSize: 8,
      }}
    >
      imagem
    </div>
  )
}
