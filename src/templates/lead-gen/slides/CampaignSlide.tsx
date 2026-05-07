import { SlideShell } from '../../../components/slides/SlideShell'
import { MetricGrid } from '../../../components/slides/MetricGrid'
import { EditableText } from '../../../components/slides/EditableText'
import { CreativeSpot } from '../../../components/slides/CreativeSpot'
import { SlideLogo } from '../../../components/slides/SlideLogo'
import { EditableField } from '../../../components/slides/EditableField'
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
  const showCreative = eCreativeVisible.value !== 'false'

  return (
    <SlideShell>
      <SlideLogo clientName={clientName} position="top-right" />
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 10, color: '#8833ff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
          Campanha
        </div>
        <h2 style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.3px' }}>
          <EditableField e={eName} style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.3px' }} placeholder="Nome da campanha" />
        </h2>
        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>ID: {campaign.id}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: showCreative ? '1fr 180px' : '1fr', gap: 20, marginBottom: 16 }}>
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
              background: 'none', border: '1px dashed #d1d5db', borderRadius: 6,
              padding: '4px 10px', fontSize: 10, color: '#9ca3af', cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#8833ff'; e.currentTarget.style.color = '#8833ff' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#9ca3af' }}
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
              background: 'none', border: 'none', fontSize: 10, color: '#9ca3af',
              cursor: 'pointer', padding: '2px 6px',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ff6b6b' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af' }}
          >
            × ocultar criativo
          </button>
        </div>
      )}

      <div style={{ marginTop: 4 }}>
        <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
          Anotações
        </div>
        <EditableText e={eAnnotation} placeholder="Claude vai gerar a análise desta campanha..." />
      </div>
    </SlideShell>
  )
}
