import { SlideShell } from '../../../components/slides/SlideShell'
import { MetricGrid } from '../../../components/slides/MetricGrid'
import { EditableText } from '../../../components/slides/EditableText'
import { CreativeSpot } from '../../../components/slides/CreativeSpot'
import { SlideLogo } from '../../../components/slides/SlideLogo'
import { SectionLabel } from '../../../components/slides/SectionLabel'
import { EditableField } from '../../../components/slides/EditableField'
import { useTheme } from '../../../lib/themeContext'
import type { FranchiseUnitData, EditState } from '../../../lib/types'

interface MetricItem {
  label: string
  value: string
  sub?: string
  accentColor?: string
  e?: EditState
  eVisible?: EditState
}

interface UnitSlideProps {
  unit: FranchiseUnitData
  clientName: string
  metrics: MetricItem[]
  eAnnotation: EditState
  eCity: EditState
  eAdImage: EditState
  eAdClicks: EditState
  eAdMessages: EditState
  eAdCpl: EditState
  eAdVisible: EditState
  eVideoImage: EditState
  eVideoClicks: EditState
  eVideoMessages: EditState
  eVideoCpl: EditState
  eVideoVisible: EditState
}

function ShowBtn({ label, accent, border, muted, onShow }: {
  label: string; accent: string; border: string; muted: string; onShow: () => void
}) {
  return (
    <button
      onClick={onShow}
      style={{
        background: 'none', border: `1px dashed ${border}`, borderRadius: 6,
        padding: '4px 10px', fontSize: 12, color: muted, cursor: 'pointer',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = muted }}
    >
      + {label}
    </button>
  )
}

function HideBtn({ label, muted, onHide }: { label: string; muted: string; onHide: () => void }) {
  return (
    <button
      onClick={onHide}
      style={{
        background: 'none', border: 'none', fontSize: 11, color: muted,
        cursor: 'pointer', padding: '2px 4px',
      }}
      onMouseEnter={e => { e.currentTarget.style.color = '#ff6b6b' }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = muted }}
    >
      × {label}
    </button>
  )
}

export function UnitSlide({
  unit, clientName, metrics,
  eAnnotation, eCity,
  eAdImage, eAdClicks, eAdMessages, eAdCpl, eAdVisible,
  eVideoImage, eVideoClicks, eVideoMessages, eVideoCpl, eVideoVisible,
}: UnitSlideProps) {
  const t = useTheme()
  const showAd    = eAdVisible.value !== 'false'
  const showVideo = eVideoVisible.value !== 'false'
  const hasCreatives = showAd || showVideo

  return (
    <SlideShell>
      <SlideLogo clientName={clientName} position="top-right" />

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <SectionLabel>Unidade</SectionLabel>
        <h2 style={{ margin: '6px 0 0', fontSize: 36, fontWeight: 800, color: t.slideText, letterSpacing: '-1px' }}>
          <EditableField e={eCity} style={{ fontSize: 36, fontWeight: 800, color: t.slideText, letterSpacing: '-1px' }} placeholder="Cidade" />
        </h2>
      </div>

      {/* Main grid: metrics+annotations | creatives */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: hasCreatives ? '2fr 1fr' : '1fr',
        gap: 32,
        alignItems: 'stretch',
      }}>
        {/* Left: metrics → annotations fills remaining height */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <MetricGrid metrics={metrics} columns={3} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <SectionLabel style={{ marginBottom: 10 }}>Anotações</SectionLabel>
            <EditableText
              e={eAnnotation}
              placeholder="Claude vai gerar a análise desta unidade..."
              style={{ flex: 1 }}
            />
          </div>
        </div>

        {/* Right: creatives stacked */}
        {hasCreatives && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {showAd && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
                  <HideBtn label="ocultar AD" muted={t.slideMuted}
                    onHide={() => { eAdVisible.change('false'); eAdVisible.save() }} />
                </div>
                <CreativeSpot
                  label="Melhor AD"
                  metrics={{ clicks: unit.bestAd?.clicks, messages: unit.bestAd?.messages, cpl: unit.bestAd?.cpl }}
                  eImage={eAdImage} eClicks={eAdClicks} eMessages={eAdMessages} eCpl={eAdCpl}
                />
              </div>
            )}
            {showVideo && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
                  <HideBtn label="ocultar VID" muted={t.slideMuted}
                    onHide={() => { eVideoVisible.change('false'); eVideoVisible.save() }} />
                </div>
                <CreativeSpot
                  label="Melhor VID"
                  metrics={{ clicks: unit.bestVideo?.clicks, messages: unit.bestVideo?.messages, cpl: unit.bestVideo?.cpl }}
                  eImage={eVideoImage} eClicks={eVideoClicks} eMessages={eVideoMessages} eCpl={eVideoCpl}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Re-add hidden creatives */}
      {(!showAd || !showVideo) && (
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {!showAd && (
            <ShowBtn label="Melhor AD" accent={t.accent} border={t.slideBorder} muted={t.slideMuted}
              onShow={() => { eAdVisible.change('true'); eAdVisible.save() }} />
          )}
          {!showVideo && (
            <ShowBtn label="Melhor VID" accent={t.accent} border={t.slideBorder} muted={t.slideMuted}
              onShow={() => { eVideoVisible.change('true'); eVideoVisible.save() }} />
          )}
        </div>
      )}
    </SlideShell>
  )
}
