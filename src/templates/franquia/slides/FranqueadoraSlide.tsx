import { SlideShell } from '../../../components/slides/SlideShell'
import { SlideLogo } from '../../../components/slides/SlideLogo'
import { EditableText } from '../../../components/slides/EditableText'
import { EditableField } from '../../../components/slides/EditableField'
import { useTheme } from '../../../lib/themeContext'
import type { EditState } from '../../../lib/types'

interface FranqueadoraSlideProps {
  clientName: string
  clientLogo?: string | null
  franchiseHistory: string[]
  ePeriod: EditState
  eHistory: EditState
  eFranqueadoraVisible: EditState
}

export function FranqueadoraSlide({ clientName, clientLogo, franchiseHistory, ePeriod, eHistory, eFranqueadoraVisible }: FranqueadoraSlideProps) {
  const t = useTheme()

  if (eFranqueadoraVisible.value === 'false') return null

  return (
    <SlideShell dark style={{ background: t.darkSlideBg }}>
      <SlideLogo clientName={clientName} clientLogo={clientLogo} dark position="top-right" />

      {/* Botão remover slide */}
      <button
        data-editor-only="true"
        onClick={() => {
          if (confirm('Remover o slide de Histórico de Otimizações? Você pode restaurar depois.')) {
            eFranqueadoraVisible.change('false')
            eFranqueadoraVisible.save('false')
          }
        }}
        style={{
          position: 'absolute', top: 16, left: 16, zIndex: 5,
          display: 'inline-flex', alignItems: 'center', gap: 4,
          background: 'none', border: `0.5px solid ${t.darkSlideBorder}`,
          borderRadius: 6, padding: '4px 10px',
          fontSize: 11, color: t.darkSlideMuted, cursor: 'pointer',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#ff6b6b'; e.currentTarget.style.borderColor = '#ff6b6b'; e.currentTarget.style.background = 'rgba(255,107,107,0.1)' }}
        onMouseLeave={e => { e.currentTarget.style.color = t.darkSlideMuted; e.currentTarget.style.borderColor = t.darkSlideBorder; e.currentTarget.style.background = 'none' }}
        title="Remover slide de Histórico"
      >
        × Remover slide
      </button>

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
          display: 'flex', gap: 4,
        }}>
          Histórico de Otimizações —{' '}
          <EditableField e={ePeriod} style={{ fontSize: 12, fontWeight: 700, color: t.accentGreen, textTransform: 'uppercase', letterSpacing: '1.2px' }} />
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
