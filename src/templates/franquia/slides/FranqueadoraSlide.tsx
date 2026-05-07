import { SlideShell } from '../../../components/slides/SlideShell'
import { SlideLogo } from '../../../components/slides/SlideLogo'
import { EditableText } from '../../../components/slides/EditableText'
import type { EditState } from '../../../lib/types'

interface FranqueadoraSlideProps {
  clientName: string
  period: string
  franchiseHistory: string[]
  eHistory: EditState
}

export function FranqueadoraSlide({ clientName, period, franchiseHistory, eHistory }: FranqueadoraSlideProps) {
  return (
    <SlideShell dark style={{
      background: 'linear-gradient(135deg, #0f0f1a 0%, #001830 100%)',
    }}>
      <SlideLogo clientName={clientName} dark position="top-right" />

      <div style={{ fontSize: 11, color: '#34d399', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>
        Histórico de Otimizações — {period}
      </div>

      {franchiseHistory.length > 0 && !eHistory.active ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {franchiseHistory.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(52,211,153,0.15)', border: '1px solid #34d39944',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, color: '#34d399',
              }}>
                {i + 1}
              </div>
              <p style={{ fontSize: 13, color: '#e8e8e8', lineHeight: 1.6, margin: 0 }}>{item}</p>
            </div>
          ))}
          <button
            onClick={eHistory.start}
            style={{ alignSelf: 'flex-start', marginTop: 8, background: 'none', border: '1px solid #2e2e50', borderRadius: 5, color: '#666', fontSize: 10, padding: '3px 10px', cursor: 'pointer' }}
          >
            ✏ Editar
          </button>
        </div>
      ) : (
        <EditableText
          e={eHistory}
          dark
          placeholder="Claude vai gerar o histórico de otimizações da rede..."
        />
      )}
    </SlideShell>
  )
}
