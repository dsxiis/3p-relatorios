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
  metrics: MetricItem[]
  eAnnotation: EditState
  eName: EditState
  eCreativeImage: EditState
  eCreativeClicks: EditState
  eCreativeLeads: EditState
  eCreativeCpl: EditState
  eCreativeVisible: EditState  // 'true' | 'false'
}

export function CampaignSlide({
  campaign, clientName, metrics,
  eAnnotation, eName,
  eCreativeImage, eCreativeClicks, eCreativeLeads, eCreativeCpl, eCreativeVisible,
}: CampaignSlideProps) {
  const t = useTheme()
  const showCreative = eCreativeVisible.value !== 'false'

  return (
    <SlideShell>
      <SlideLogo clientName={clientName} position="top-right" />

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <SectionLabel>Campanha</SectionLabel>
        <h2 style={{ margin: '6px 0 0', fontSize: 32, fontWeight: 800, color: t.slideText, letterSpacing: '-0.8px' }}>
          <EditableField e={eName} style={{ fontSize: 32, fontWeight: 800, color: t.slideText, letterSpacing: '-0.8px' }} placeholder="Nome da campanha" />
        </h2>
        <div style={{ fontSize: 12, color: t.slideHint, marginTop: 4 }}>ID: {campaign.id}</div>
      </div>

      {/* Main grid: metrics+annotations | creative */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: showCreative ? '2fr 1fr' : '1fr',
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
              placeholder="Claude vai gerar a análise desta campanha..."
              style={{ flex: 1 }}
            />
          </div>
        </div>

        {/* Right: creative */}
        {showCreative && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
              <button
                onClick={() => { eCreativeVisible.change('false'); eCreativeVisible.save() }}
                style={{
                  background: 'none', border: 'none', fontSize: 11, color: t.slideHint,
                  cursor: 'pointer', padding: '2px 4px',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#ff6b6b' }}
                onMouseLeave={e => { e.currentTarget.style.color = t.slideHint }}
              >
                × ocultar
              </button>
            </div>
            <CreativeSpot
              label="Melhor Criativo"
              metrics={{
                clicks: campaign.topCreative?.clicks,
                leads: campaign.topCreative?.leads,
                cpl: campaign.topCreative?.cpl,
              }}
              eImage={eCreativeImage}
              eClicks={eCreativeClicks}
              eLeads={eCreativeLeads}
              eCpl={eCreativeCpl}
            />
          </div>
        )}
      </div>

      {/* Add creative back if hidden */}
      {!showCreative && (
        <div style={{ marginTop: 16 }}>
          <button
            onClick={() => { eCreativeVisible.change('true'); eCreativeVisible.save() }}
            style={{
              background: 'none', border: `1px dashed ${t.slideBorder}`, borderRadius: 6,
              padding: '5px 12px', fontSize: 12, color: t.slideMuted, cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.accent }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = t.slideBorder; e.currentTarget.style.color = t.slideMuted }}
          >
            + Melhor Criativo
          </button>
        </div>
      )}
    </SlideShell>
  )
}
