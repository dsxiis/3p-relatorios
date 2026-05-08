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
  clientLogo?: string | null
  metrics: MetricItem[]
  ePeriod: EditState
  eAnnotation: EditState
  eCity: EditState
  eUnitVisible: EditState
  // Vídeo
  eVideoImage: EditState
  eVideoLink: EditState
  eVideoClicks: EditState
  eVideoMessages: EditState
  eVideoCpl: EditState
  eVideoImpressions: EditState
  eVideoCtr: EditState
  eVideoVisible: EditState
  // Estático
  eImageImage: EditState
  eImageLink: EditState
  eImageClicks: EditState
  eImageMessages: EditState
  eImageCpl: EditState
  eImageImpressions: EditState
  eImageCtr: EditState
  eImageVisible: EditState
}

export function UnitSlide({
  unit, clientName, clientLogo, metrics,
  ePeriod, eAnnotation, eCity, eUnitVisible,
  eVideoImage, eVideoLink, eVideoClicks, eVideoMessages, eVideoCpl, eVideoImpressions, eVideoCtr, eVideoVisible,
  eImageImage, eImageLink, eImageClicks, eImageMessages, eImageCpl, eImageImpressions, eImageCtr, eImageVisible,
}: UnitSlideProps) {
  const t = useTheme()

  // Se a unidade foi removida pelo usuário, slide não renderiza
  if (eUnitVisible.value === 'false') return null

  const videoData = unit.bestVideo
  const imageData = unit.bestImage ?? unit.bestAd  // fallback pro bestAd legado se não tem bestImage

  const showVideo = eVideoVisible.value !== 'false'
  const showImage = eImageVisible.value !== 'false'

  const visibleCount = (showVideo ? 1 : 0) + (showImage ? 1 : 0)
  const gridCols = visibleCount === 0
    ? '1fr'
    : visibleCount === 1
      ? '1.6fr 1fr'
      : '1.4fr 0.85fr 0.85fr'

  return (
    <SlideShell>
      <SlideLogo clientName={clientName} clientLogo={clientLogo} position="top-right" />

      {/* Header */}
      <div style={{ marginBottom: 24, position: 'relative' }}>
        <SectionLabel>Unidade</SectionLabel>
        <h2 style={{ margin: '6px 0 0', fontSize: 36, fontWeight: 800, color: t.slideText, letterSpacing: '-1px' }}>
          <EditableField e={eCity} style={{ fontSize: 36, fontWeight: 800, color: t.slideText, letterSpacing: '-1px' }} placeholder="Cidade" />
        </h2>
        <div style={{ fontSize: 12, color: t.slideHint, marginTop: 4 }}>
          <EditableField e={ePeriod} style={{ fontSize: 12, color: t.slideHint }} />
        </div>
        {/* Botão remover unidade — esconde slide inteiro */}
        <button
          data-editor-only="true"
          onClick={() => {
            if (confirm(`Remover a unidade "${unit.city || 'sem nome'}" do relatório? Você pode restaurar depois.`)) {
              eUnitVisible.change('false')
              eUnitVisible.save('false')
            }
          }}
          style={{
            position: 'absolute', top: 0, right: 0, zIndex: 5,
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: 'none', border: `0.5px solid ${t.slideHint}`,
            borderRadius: 6, padding: '4px 10px',
            fontSize: 11, color: t.slideHint, cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#ff6b6b'
            e.currentTarget.style.borderColor = '#ff6b6b'
            e.currentTarget.style.background = 'rgba(255,107,107,0.06)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = t.slideHint
            e.currentTarget.style.borderColor = t.slideHint
            e.currentTarget.style.background = 'none'
          }}
          title="Remover esta unidade do relatório"
        >
          × Remover unidade
        </button>
      </div>

      {/* Main grid: metrics+annotations | melhor vídeo | melhor estático */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: gridCols,
        gap: 18,
        alignItems: 'flex-start',
      }}>
        {/* Esquerda */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <MetricGrid metrics={metrics} columns={2} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <SectionLabel style={{ marginBottom: 10 }}>Anotações</SectionLabel>
            <EditableText
              e={eAnnotation}
              placeholder="Claude vai gerar a análise desta unidade..."
              style={{ flex: 1 }}
            />
          </div>
        </div>

        {/* Melhor Vídeo */}
        {showVideo && (
          <div style={{ position: 'relative' }}>
            <button
              data-editor-only="true"
              onClick={() => { eVideoVisible.change('false'); eVideoVisible.save('false') }}
              style={{
                position: 'absolute', top: -22, right: 0, zIndex: 5,
                background: 'none', border: 'none', fontSize: 11, color: t.slideHint,
                cursor: 'pointer', padding: '2px 4px',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#ff6b6b' }}
              onMouseLeave={e => { e.currentTarget.style.color = t.slideHint }}
              title="Ocultar Melhor Vídeo"
            >
              × ocultar
            </button>
            <CreativeSpot
              label="🎬 Melhor Vídeo"
              metrics={videoData ? {
                clicks: videoData.clicks,
                messages: videoData.messages,
                cpl: videoData.cpl,
                impressions: videoData.impressions,
                ctr: videoData.ctr,
              } : { clicks: 0, messages: 0, cpl: 0, impressions: 0, ctr: 0 }}
              previewLink={videoData?.preview_link}
              adName={videoData?.ad_name}
              creativeId={(videoData as any)?.creative_id}
              eImage={eVideoImage}
              eLink={eVideoLink}
              eClicks={eVideoClicks}
              eMessages={eVideoMessages}
              eCpl={eVideoCpl}
              eImpressions={eVideoImpressions}
              eCtr={eVideoCtr}
            />
            {!videoData && (
              <div data-editor-only="true" style={{
                marginTop: 6, fontSize: 10, color: t.slideHint,
                textAlign: 'center', fontStyle: 'italic',
              }}>
                Sem vídeo nesse período — você pode adicionar manualmente
              </div>
            )}
          </div>
        )}

        {/* Melhor Estático */}
        {showImage && (
          <div style={{ position: 'relative' }}>
            <button
              data-editor-only="true"
              onClick={() => { eImageVisible.change('false'); eImageVisible.save('false') }}
              style={{
                position: 'absolute', top: -22, right: 0, zIndex: 5,
                background: 'none', border: 'none', fontSize: 11, color: t.slideHint,
                cursor: 'pointer', padding: '2px 4px',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#ff6b6b' }}
              onMouseLeave={e => { e.currentTarget.style.color = t.slideHint }}
              title="Ocultar Melhor Estático"
            >
              × ocultar
            </button>
            <CreativeSpot
              label="🖼 Melhor Estático"
              metrics={imageData ? {
                clicks: imageData.clicks,
                messages: imageData.messages,
                cpl: imageData.cpl,
                impressions: imageData.impressions,
                ctr: imageData.ctr,
              } : { clicks: 0, messages: 0, cpl: 0, impressions: 0, ctr: 0 }}
              previewLink={imageData?.preview_link}
              adName={imageData?.ad_name}
              creativeId={(imageData as any)?.creative_id}
              eImage={eImageImage}
              eLink={eImageLink}
              eClicks={eImageClicks}
              eMessages={eImageMessages}
              eCpl={eImageCpl}
              eImpressions={eImageImpressions}
              eCtr={eImageCtr}
            />
            {!imageData && (
              <div data-editor-only="true" style={{
                marginTop: 6, fontSize: 10, color: t.slideHint,
                textAlign: 'center', fontStyle: 'italic',
              }}>
                Sem estático nesse período — você pode adicionar manualmente
              </div>
            )}
          </div>
        )}
      </div>

      {(!showVideo || !showImage) && (
        <div data-editor-only="true" style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          {!showVideo && (
            <button
              onClick={() => { eVideoVisible.change('true'); eVideoVisible.save('true') }}
              style={{
                background: 'none', border: `1px dashed ${t.slideBorder}`, borderRadius: 6,
                padding: '5px 12px', fontSize: 12, color: t.slideMuted, cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.accent }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = t.slideBorder; e.currentTarget.style.color = t.slideMuted }}
            >
              + 🎬 Melhor Vídeo
            </button>
          )}
          {!showImage && (
            <button
              onClick={() => { eImageVisible.change('true'); eImageVisible.save('true') }}
              style={{
                background: 'none', border: `1px dashed ${t.slideBorder}`, borderRadius: 6,
                padding: '5px 12px', fontSize: 12, color: t.slideMuted, cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.accent }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = t.slideBorder; e.currentTarget.style.color = t.slideMuted }}
            >
              + 🖼 Melhor Estático
            </button>
          )}
        </div>
      )}
    </SlideShell>
  )
}
