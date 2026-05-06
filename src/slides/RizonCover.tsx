import { Slide } from '../components/Slide'
import { SLIDE } from '../styles/tokens'

interface RizonCoverProps {
  periodLabel: string
}

export function RizonCover({ periodLabel }: RizonCoverProps) {
  // Extract month from period label e.g. "Março / 2026" → "MARÇO"
  const month = periodLabel.split('/')[0].trim().toUpperCase()

  return (
    <Slide bg={SLIDE.coverBg} padding="48px">
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 12, textAlign: 'center',
      }}>
        <div style={{ fontSize: 76, fontWeight: 900, color: '#fff', letterSpacing: '-2.5px', lineHeight: 1 }}>
          RIZON
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', letterSpacing: '0.2em' }}>
          RELATÓRIO — {month}
        </div>
        <div style={{ fontSize: 11, color: '#777', letterSpacing: '0.18em', marginTop: 2 }}>
          PERÍODO: {periodLabel}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          marginTop: 28, paddingTop: 20,
          borderTop: `1px solid ${SLIDE.coverBorder}`,
          width: 220, justifyContent: 'center',
        }}>
          <span style={{ fontSize: 12, color: '#888', fontStyle: 'italic' }}>rizon</span>
          <span style={{ color: '#222' }}>|</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>
            3P <span style={{ fontWeight: 400, color: '#555' }}>Marketing</span>
          </span>
        </div>
      </div>
    </Slide>
  )
}
