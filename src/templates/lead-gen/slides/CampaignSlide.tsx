import { SlideShell } from '../../../components/slides/SlideShell'
import { MetricGrid } from '../../../components/slides/MetricGrid'
import { EditableText } from '../../../components/slides/EditableText'
import { CreativeSpot } from '../../../components/slides/CreativeSpot'
import { SlideLogo } from '../../../components/slides/SlideLogo'
import type { LeadGenCampaign, EditState } from '../../../lib/types'

interface CampaignSlideProps {
  campaign: LeadGenCampaign
  clientName: string
  e: EditState
}

function fmtBRL(n: number) {
  return `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function CampaignSlide({ campaign, clientName, e }: CampaignSlideProps) {
  const metrics = [
    { label: 'Investido', value: fmtBRL(campaign.spend) },
    { label: 'Impressões', value: campaign.impressions.toLocaleString('pt-BR') },
    { label: 'Leads', value: campaign.leads.toLocaleString('pt-BR'), accentColor: '#34d399' },
    { label: 'CPL', value: fmtBRL(campaign.cpl), accentColor: campaign.cpl < (campaign.cplPrevPeriod ?? campaign.cpl + 1) ? '#34d399' : '#f59e0b' },
    { label: 'CPL Anterior', value: campaign.cplPrevPeriod ? fmtBRL(campaign.cplPrevPeriod) : '—', sub: 'período anterior' },
    { label: 'Cliques', value: campaign.clicks.toLocaleString('pt-BR') },
  ]

  return (
    <SlideShell>
      <SlideLogo clientName={clientName} position="top-right" />
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 10, color: '#8833ff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
          Campanha
        </div>
        <h2 style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.3px' }}>
          {campaign.name}
        </h2>
        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>ID: {campaign.id}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 20, marginBottom: 16 }}>
        <div>
          <MetricGrid metrics={metrics} columns={3} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {campaign.topCreative && (
            <CreativeSpot
              label="Melhor Criativo"
              metrics={{
                clicks: campaign.topCreative.clicks,
                leads: campaign.topCreative.leads,
                cpl: campaign.topCreative.cpl,
              }}
            />
          )}
        </div>
      </div>

      <div style={{ marginTop: 4 }}>
        <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
          Anotações
        </div>
        <EditableText e={e} placeholder="Claude vai gerar a análise desta campanha..." />
      </div>
    </SlideShell>
  )
}
