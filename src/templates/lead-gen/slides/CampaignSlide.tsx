import { SlideShell } from '../../../components/slides/SlideShell'
import { MetricGrid } from '../../../components/slides/MetricGrid'
import { EditableText } from '../../../components/slides/EditableText'
import { CreativeSpot } from '../../../components/slides/CreativeSpot'
import { SlideLogo } from '../../../components/slides/SlideLogo'
import { SectionLabel } from '../../../components/slides/SectionLabel'
import { EditableField } from '../../../components/slides/EditableField'
import { useTheme } from '../../../lib/themeContext'
import type { LeadGenCampaign, EditState } from '../../../lib/types'

interface MetricItem {
  label: string
  value: string
  sub?: string
  accentColor?: string
  e?: EditState
  eVisible?: EditState
}

interface CampaignSlideProps {
  campaign: LeadGenCampaign
  clientName: string
  clientLogo?: string | null
  metrics: MetricItem[]
  ePeriod: EditState
  eAnnotation: EditState
  eName: EditState
  // Vídeo
  eVideoImage: EditState
  eVideoClicks: EditState
  eVideoLeads: EditState
  eVideoCpl: EditState
  eVideoImpressions: EditState
  eVideoCtr: EditState
  eVideoVisible: EditState
  // Estático
  eImageImage: EditState
  eImageClicks: EditState
  eImageLeads: EditState
  eImageCpl: EditState
  eImageImpressions: EditState
  eImageCtr: EditState
  eImageVisible: EditState
}

export function CampaignSlide({
  campaign, clientName, clientLogo, metrics,
  ePeriod, eAnnotation, eName,
  eVideoImage, eVideoClicks, eVideoLeads, eVideoCpl, eVideoImpressions, eVideoCtr, eVideoVisible,
  eImageImage, eImageClicks, eImageLeads, eImageCpl, eImageImpressions, eImageCtr, eImageVisible,
}: CampaignSlideProps) {
  const t = useTheme()

  // Sem fallback — se topVideo não existe, fica undefined (não duplica com topImage)
  const videoData = campaign.topVideo
  const imageData = campaign.topImage

  const showVideo = eVideoVisible.value !== 'false'
  const showImage = eImageVisible.value !== 'false'

  // Quantos cards visíveis pra montar grid responsivo
  const visibleCount = (showVideo ? 1 : 0) + (showImage ? 1 : 0)
  const gridCols = visibleCount === 0
    ? '1fr'
    : visibleCount === 1
      ? '1.6fr 1fr'                  // métricas + 1 card
      : '1.4fr 0.85fr 0.85fr'        // métricas + 2 cards (mais estreitos)

  return (
    <SlideShell>
      <SlideLogo clientName={clientName} clientLogo={clientLogo} position="top-right" />

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <SectionLabel>Campanha</SectionLabel>
        <h2 style={{ margin: '6px 0 0', fontSize: 32, fontWeight: 800, color: t.slideText, letterSpacing: '-0.8px' }}>
          <EditableField e={eName} style={{ fontSize: 32, fontWeight: 800, color: t.slideText, letterSpacing: '-0.8px' }} placeholder="Nome da campanha" />
        </h2>
        <div style={{ fontSize: 12, color: t.slideHint, marginTop: 4 }}>
          ID: {campaign.id}
          {' · '}
          <EditableField e={ePeriod} style={{ fontSize: 12, color: t.slideHint }} />
        </div>
      </div>

      {/* Main grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: gridCols,
        gap: 18,
        alignItems: 'flex-start',
      }}>
        {/* Esquerda: metrics + annotations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <MetricGrid metrics={metrics} columns={2} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <SectionLabel style={{ marginBottom: 10 }}>Anotações</SectionLabel>
            <EditableText
              e={eAnnotation}
              placeholder="Claude vai gerar a análise desta campanha..."
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
                leads: videoData.leads,
                cpl: videoData.cpl,
                impressions: videoData.impressions,
                ctr: videoData.ctr,
              } : { clicks: 0, leads: 0, cpl: 0, impressions: 0, ctr: 0 }}
              previewLink={videoData?.preview_link}
              adName={videoData?.ad_name}
              eImage={eVideoImage}
              eClicks={eVideoClicks}
              eLeads={eVideoLeads}
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
                leads: imageData.leads,
                cpl: imageData.cpl,
                impressions: imageData.impressions,
                ctr: imageData.ctr,
              } : { clicks: 0, leads: 0, cpl: 0, impressions: 0, ctr: 0 }}
              previewLink={imageData?.preview_link}
              adName={imageData?.ad_name}
              eImage={eImageImage}
              eClicks={eImageClicks}
              eLeads={eImageLeads}
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

      {/* Restaurar criativos ocultos */}
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
