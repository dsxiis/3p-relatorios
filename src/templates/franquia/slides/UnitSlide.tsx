import { SlideShell } from '../../../components/slides/SlideShell'
import { MetricGrid } from '../../../components/slides/MetricGrid'
import { EditableText } from '../../../components/slides/EditableText'
import { CreativeSpot } from '../../../components/slides/CreativeSpot'
import { SlideLogo } from '../../../components/slides/SlideLogo'
import type { FranchiseUnitData, EditState } from '../../../lib/types'

interface UnitSlideProps {
  unit: FranchiseUnitData
  clientName: string
  e: EditState
}

function fmtBRL(n: number) {
  return `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function UnitSlide({ unit, clientName, e }: UnitSlideProps) {
  const metrics = [
    { label: 'Impressões', value: unit.impressions.toLocaleString('pt-BR') },
    { label: 'Alcance', value: unit.reach.toLocaleString('pt-BR') },
    { label: 'Conversas', value: unit.conversations.toLocaleString('pt-BR'), accentColor: '#34d399' },
    { label: 'CPC', value: fmtBRL(unit.cpc), accentColor: '#34d399' },
    { label: 'Investimento', value: fmtBRL(unit.spend), accentColor: '#8833ff' },
  ]

  return (
    <SlideShell>
      <SlideLogo clientName={clientName} position="top-right" />

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 10, color: '#0891b2', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
          Unidade
        </div>
        <h2 style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.3px' }}>
          {unit.city}
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 20, marginBottom: 16 }}>
        <div>
          <MetricGrid metrics={metrics} columns={3} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {unit.bestAd && (
            <CreativeSpot
              label="Melhor AD"
              metrics={{ clicks: unit.bestAd.clicks, messages: unit.bestAd.messages, cpl: unit.bestAd.cpl }}
            />
          )}
          {unit.bestVideo && (
            <CreativeSpot
              label="Melhor VID"
              metrics={{ clicks: unit.bestVideo.clicks, messages: unit.bestVideo.messages, cpl: unit.bestVideo.cpl }}
            />
          )}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
          Anotações
        </div>
        <EditableText e={e} placeholder="Claude vai gerar a análise desta unidade..." />
      </div>
    </SlideShell>
  )
}
