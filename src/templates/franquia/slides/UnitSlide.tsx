import { SlideShell } from '../../../components/slides/SlideShell'
import { MetricGrid } from '../../../components/slides/MetricGrid'
import { EditableText } from '../../../components/slides/EditableText'
import { CreativeSpot } from '../../../components/slides/CreativeSpot'
import { SlideLogo } from '../../../components/slides/SlideLogo'
import { EditableField } from '../../../components/slides/EditableField'
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

function ToggleSection({
  label, visible, onShow, onHide,
}: { label: string; visible: boolean; onShow: () => void; onHide: () => void }) {
  if (!visible) {
    return (
      <button
        onClick={onShow}
        style={{
          background: 'none', border: '1px dashed #d1d5db', borderRadius: 6,
          padding: '4px 10px', fontSize: 10, color: '#9ca3af', cursor: 'pointer',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#8833ff'; e.currentTarget.style.color = '#8833ff' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#9ca3af' }}
      >
        + {label}
      </button>
    )
  }
  return (
    <button
      onClick={onHide}
      style={{
        background: 'none', border: 'none', fontSize: 9, color: '#9ca3af', cursor: 'pointer', padding: '1px 4px',
      }}
      onMouseEnter={e => { e.currentTarget.style.color = '#ff6b6b' }}
      onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af' }}
    >
      × ocultar
    </button>
  )
}

export function UnitSlide({
  unit, clientName, metrics,
  eAnnotation, eCity,
  eAdImage, eAdClicks, eAdMessages, eAdCpl, eAdVisible,
  eVideoImage, eVideoClicks, eVideoMessages, eVideoCpl, eVideoVisible,
}: UnitSlideProps) {
  const showAd    = eAdVisible.value !== 'false'
  const showVideo = eVideoVisible.value !== 'false'
  const hasCreatives = showAd || showVideo

  return (
    <SlideShell>
      <SlideLogo clientName={clientName} position="top-right" />

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 10, color: '#0891b2', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
          Unidade
        </div>
        <h2 style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.3px' }}>
          <EditableField e={eCity} style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.3px' }} placeholder="Cidade" />
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: hasCreatives ? '1fr 200px' : '1fr', gap: 20, marginBottom: 12 }}>
        <div>
          <MetricGrid metrics={metrics} columns={3} />
        </div>

        {hasCreatives && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {showAd && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 9, color: '#9ca3af' }}> </span>
                  <ToggleSection label="Melhor AD" visible={showAd}
                    onShow={() => { eAdVisible.change('true'); eAdVisible.save() }}
                    onHide={() => { eAdVisible.change('false'); eAdVisible.save() }}
                  />
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
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
                  <ToggleSection label="Melhor VID" visible={showVideo}
                    onShow={() => { eVideoVisible.change('true'); eVideoVisible.save() }}
                    onHide={() => { eVideoVisible.change('false'); eVideoVisible.save() }}
                  />
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
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          {!showAd && (
            <ToggleSection label="Melhor AD" visible={false}
              onShow={() => { eAdVisible.change('true'); eAdVisible.save() }}
              onHide={() => {}}
            />
          )}
          {!showVideo && (
            <ToggleSection label="Melhor VID" visible={false}
              onShow={() => { eVideoVisible.change('true'); eVideoVisible.save() }}
              onHide={() => {}}
            />
          )}
        </div>
      )}

      <div>
        <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
          Anotações
        </div>
        <EditableText e={eAnnotation} placeholder="Claude vai gerar a análise desta unidade..." />
      </div>
    </SlideShell>
  )
}
