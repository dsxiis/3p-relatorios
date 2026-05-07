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
      <div style={{ marginBottom: 18 }}>
        <SectionLabel>Campanha</SectionLabel>
        <h2 style={{ margin: '6px 0 0', fontSize: 24, fontWeight: 800, color: t.slideText, letterSpacing: '-0.5px' }}>
          <EditableField e={eName} style={{ fontSize: 24, fontWeight: 800, color: t.slideText, letterSpacing: '-0.5px' }} placeholder="Nome da campanha" />
        </h2>
        <div style={{ fontSize: 12, color: t.slideHint, marginTop: 4 }}>ID: {campaign.id}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: showCreative ? '1fr 220px' : '1fr', gap: 28, marginBottom: 20 }}>
        <div>
          <MetricGrid metrics={metrics} columns={3} />
        </div>
        {showCreative && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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

      {/* Toggle creative section */}
      {!showCreative && (
        <div style={{ marginBottom: 12 }}>
          <button
            onClick={() => { eCreativeVisible.change('true'); eCreativeVisible.save() }}
            style={{
              background: 'none', border: `1px dashed ${t.slideBorder}`, borderRadius: 6,
              padding: '4px 10px', fontSize: 10, color: t.slideMuted, cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.accent }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = t.slideBorder; e.currentTarget.style.color = t.slideMuted }}
          >
            + Melhor Criativo
          </button>
        </div>
      )}
      {showCreative && (
        <div style={{ marginBottom: 4, textAlign: 'right' }}>
          <button
            onClick={() => { eCreativeVisible.change('false'); eCreativeVisible.save() }}
            style={{
              background: 'none', border: 'none', fontSize: 10, color: t.slideHint,
              cursor: 'pointer', padding: '2px 6px',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ff6b6b' }}
            onMouseLeave={e => { e.currentTarget.style.color = t.slideHint }}
          >
            × ocultar criativo
          </button>
        </div>
      )}

      <div style={{ marginTop: 4 }}>
        <SectionLabel>Anotações</SectionLabel>
        <EditableText e={eAnnotation} placeholder="Claude vai gerar a análise desta campanha..." />
      </div>
    </SlideShell>
  )
}
