import { SlideShell } from '../../../components/slides/SlideShell'
import { SlideLogo } from '../../../components/slides/SlideLogo'

interface CoverProps {
  clientName: string
  period: string
  unitCount: number
}

export function Cover({ clientName, period, unitCount }: CoverProps) {
  return (
    <SlideShell dark style={{
      background: 'linear-gradient(135deg, #0f0f1a 0%, #001830 60%, #003060 100%)',
      minHeight: 200,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }}>
      <SlideLogo clientName={clientName} dark position="top-right" />
      <div style={{ fontSize: 11, color: '#34d399', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 12 }}>
        Relatório de Performance — Franquia
      </div>
      <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-1px', lineHeight: 1.1 }}>
        {clientName}
      </h1>
      <div style={{ display: 'flex', gap: 16, marginTop: 12, alignItems: 'center' }}>
        <div style={{ fontSize: 14, color: '#888', fontWeight: 500 }}>{period}</div>
        <div style={{
          padding: '3px 10px', borderRadius: 20,
          background: 'rgba(52,211,153,0.15)', color: '#34d399',
          fontSize: 11, fontWeight: 700,
        }}>
          {unitCount} unidades
        </div>
      </div>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
        background: 'linear-gradient(90deg, #34d399, #0891b2, transparent)',
      }} />
    </SlideShell>
  )
}
