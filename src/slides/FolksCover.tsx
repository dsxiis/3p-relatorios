import { Slide } from '../components/Slide'
import { Logo3P } from '../components/Logo3P'
import { SLIDE } from '../styles/tokens'

interface FolksCoverProps {
  periodLabel: string
}

export function FolksCover({ periodLabel }: FolksCoverProps) {
  // e.g. "Março / 2026" → "Março - 2026"
  const formatted = periodLabel.replace(' / ', ' - ')

  return (
    <Slide bg={SLIDE.bg} padding="40px 52px">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ textAlign: 'right', marginBottom: 24 }}>
          <Logo3P dark />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: SLIDE.brand, marginBottom: 4 }}>Relatório</div>
          <div style={{ fontSize: 66, fontWeight: 900, color: '#111', lineHeight: 1, letterSpacing: '-2px' }}>
            Folks
          </div>
          <div style={{ fontSize: 16, color: '#999', marginTop: 6 }}>{formatted}</div>
        </div>
      </div>
    </Slide>
  )
}
