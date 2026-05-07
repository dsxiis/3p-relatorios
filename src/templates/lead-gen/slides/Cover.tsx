import { SlideShell } from '../../../components/slides/SlideShell'
import { SlideLogo } from '../../../components/slides/SlideLogo'
import { EditableField } from '../../../components/slides/EditableField'
import type { EditState } from '../../../lib/types'

interface CoverProps {
  eClient: EditState
  ePeriod: EditState
}

export function Cover({ eClient, ePeriod }: CoverProps) {
  return (
    <SlideShell dark style={{
      background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1040 60%, #2a1060 100%)',
      minHeight: 200,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }}>
      <SlideLogo clientName={eClient.value} dark position="top-right" />
      <div style={{ fontSize: 11, color: '#8833ff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 12 }}>
        Relatório de Performance
      </div>
      <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-1px', lineHeight: 1.1 }}>
        <EditableField e={eClient} dark style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-1px' }} placeholder="Nome do cliente" />
      </h1>
      <div style={{ fontSize: 14, color: '#888', marginTop: 10, fontWeight: 500 }}>
        <EditableField e={ePeriod} dark style={{ fontSize: 14, color: '#aaa', fontWeight: 500 }} placeholder="Período" />
      </div>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
        background: 'linear-gradient(90deg, #8833ff, #5B18A8, transparent)',
      }} />
    </SlideShell>
  )
}
