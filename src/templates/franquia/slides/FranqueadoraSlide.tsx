import { SlideShell } from '../../../components/slides/SlideShell'
import { SlideLogo } from '../../../components/slides/SlideLogo'
import { EditableText } from '../../../components/slides/EditableText'
import { useTheme } from '../../../lib/themeContext'
import type { EditState } from '../../../lib/types'

interface FranqueadoraSlideProps {
  clientName: string
  period: string
  franchiseHistory: string[]
  eHistory: EditState
}

export function FranqueadoraSlide({ clientName, period, franchiseHistory, eHistory }: FranqueadoraSlideProps) {
  const t = useTheme()
  return (
    <SlideShell dark style={{ background: t.darkSlideBg }}>
      <SlideLogo clientName={clientName} dark position="top-right" />

      {/* Section header — dark slide, always use accent green + rule style */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 16,
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: t.accentGreen, flexShrink: 0,
        }} />
        <span style={{
          fontSize: 12, fontWeight: 700, color: t.accentGreen,
          textTransform: 'uppercase', letterSpacing: '1.2px',
        }}>
          Histórico de Otimizações — {period}
        </span>
        <div style={{ flex: 1, height: 1, background: `${t.accentGreen}33` }} />
      </div>

      {franchiseHistory.length > 0 && !eHistory.active ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {franchiseHistory.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                background: t.accentGreenDim,
                border: `1px solid ${t.accentGreen}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: t.accentGreen,
              }}>
                {i + 1}
              </div>
              <p style={{ fontSize: 17, color: t.darkSlideText, lineHeight: 1.7, margin: 0 }}>{item}</p>
            </div>
          ))}
          <button
            onClick={eHistory.start}
            style={{
              alignSelf: 'flex-start', marginTop: 8,
              background: 'none', border: `1px solid ${t.darkSlideBorder}`,
              borderRadius: 5, color: t.darkSlideMuted, fontSize: 10, padding: '3px 10px', cursor: 'pointer',
            }}
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
