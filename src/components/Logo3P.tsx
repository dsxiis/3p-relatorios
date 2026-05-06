interface Logo3PProps {
  dark?: boolean
}

export function Logo3P({ dark = false }: Logo3PProps) {
  return (
    <div style={{ fontSize: 11, fontWeight: 800, color: dark ? '#111' : '#fff' }}>
      3P <span style={{ fontWeight: 400, color: dark ? '#aaa' : '#666' }}>Marketing</span>
    </div>
  )
}
