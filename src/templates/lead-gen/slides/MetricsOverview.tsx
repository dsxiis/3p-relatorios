import { SlideShell } from '../../../components/slides/SlideShell'
import { MetricGrid } from '../../../components/slides/MetricGrid'
import { SlideLogo } from '../../../components/slides/SlideLogo'
import type { LeadGenData } from '../schema'

interface MetricsOverviewProps {
  data: LeadGenData
}

function fmtNum(n: number) {
  return n.toLocaleString('pt-BR')
}

function fmtBRL(n: number) {
  return `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function MetricsOverview({ data }: MetricsOverviewProps) {
  const metrics = [
    { label: 'Investimento', value: fmtBRL(data.investment), accentColor: '#8833ff' },
    { label: 'Alcance', value: fmtNum(data.totals.reach) },
    { label: 'Impressões', value: fmtNum(data.totals.impressions) },
    { label: 'Cliques', value: fmtNum(data.totals.clicks) },
    { label: 'Leads', value: fmtNum(data.totals.leads), accentColor: '#34d399' },
    { label: 'CPL Médio', value: fmtBRL(data.totals.cpl), accentColor: '#34d399' },
  ]

  return (
    <SlideShell>
      <SlideLogo clientName={data.client} position="top-right" />
      <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>
        Visão Geral — {data.period}
      </div>
      <MetricGrid metrics={metrics} columns={3} />
    </SlideShell>
  )
}
