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
  // Vídeo (criativo de vídeo)
  eVideoImage: EditState
  eVideoClicks: EditState
  eVideoLeads: EditState
  eVideoCpl: EditState
  eVideoImpressions: EditState
  eVideoCtr: EditState
  // Imagem (criativo estático)
  eImageImage: EditState
  eImageClicks: EditState
  eImageLeads: EditState
  eImageCpl: EditState
  eImageImpressions: EditState
  eImageCtr: EditState
  eCreativeVisible: EditState  // 'true' | 'false' — esconde a coluna inteira
}

export function CampaignSlide({
  campaign, clientName, clientLogo, metrics,
  ePeriod, eAnnotation, eName,
  eVideoImage, eVideoClicks, eVideoLeads, eVideoCpl, eVideoImpressions, eVideoCtr,
  eImageImage, eImageClicks, eImageLeads, eImageCpl, eImageImpressions, eImageCtr,
  eCreativeVisible,
}: CampaignSlideProps) {
  const t = useTheme()
  const showCreative = eCreativeVisible.value !== 'false'

  // Fallback: se não tem topVideo/topImage, usa topCreative (legado)
  const videoData = campaign.topVideo ?? campaign.topCreative
  const imageData = campaign.topImage ?? campaign.topCreative

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

      {/* Main grid: metrics+annotations | melhor vídeo | melhor estático */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: showCreative ? '1.4fr 1fr 1fr' : '1fr',
        gap: 20,
        alignItems: 'flex-start',
      }}>
        {/* Esquerda: metrics → annotations */}
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

        {/* Centro: Melhor Vídeo */}
        {showCreative && (
          <div style={{ position: 'relative' }}>
            <button
              data-editor-only="true"
              onClick={() => { eCreativeVisible.change('false'); eCreativeVisible.save('false') }}
              style={{
                position: 'absolute', top: -22, right: 0, zIndex: 5,
                background: 'none', border: 'none', fontSize: 11, color: t.slideHint,
                cursor: 'pointer', padding: '2px 4px',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#ff6b6b' }}
              onMouseLeave={e => { e.currentTarget.style.color = t.slideHint }}
            >
              × ocultar
            </button>
            <CreativeSpot
              label="🎬 Melhor Vídeo"
              metrics={{
                clicks: videoData?.clicks,
                leads: videoData?.leads,
                cpl: videoData?.cpl,
                impressions: videoData?.impressions,
                ctr: videoData?.ctr,
              }}
              previewLink={videoData?.preview_link}
              adName={videoData?.ad_name}
              eImage={eVideoImage}
              eClicks={eVideoClicks}
              eLeads={eVideoLeads}
              eCpl={eVideoCpl}
              eImpressions={eVideoImpressions}
              eCtr={eVideoCtr}
            />
          </div>
        )}

        {/* Direita: Melhor Estático */}
        {showCreative && (
          <div>
            <CreativeSpot
              label="🖼 Melhor Estático"
              metrics={{
                clicks: imageData?.clicks,
                leads: imageData?.leads,
                cpl: imageData?.cpl,
                impressions: imageData?.impressions,
                ctr: imageData?.ctr,
              }}
              previewLink={imageData?.preview_link}
              adName={imageData?.ad_name}
              eImage={eImageImage}
              eClicks={eImageClicks}
              eLeads={eImageLeads}
              eCpl={eImageCpl}
              eImpressions={eImageImpressions}
              eCtr={eImageCtr}
            />
          </div>
        )}
      </div>

      {/* Add creatives back if hidden */}
      {!showCreative && (
        <div data-editor-only="true" style={{ marginTop: 16 }}>
          <button
            onClick={() => { eCreativeVisible.change('true'); eCreativeVisible.save('true') }}
            style={{
              background: 'none', border: `1px dashed ${t.slideBorder}`, borderRadius: 6,
              padding: '5px 12px', fontSize: 12, color: t.slideMuted, cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.accent }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = t.slideBorder; e.currentTarget.style.color = t.slideMuted }}
          >
            + Melhores Criativos (Vídeo + Estático)
          </button>
        </div>
      )}
    </SlideShell>
  )
}
