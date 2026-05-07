import { SlideShell } from '../../../components/slides/SlideShell'
import { MetricGrid } from '../../../components/slides/MetricGrid'
import { SlideLogo } from '../../../components/slides/SlideLogo'
import { EditableField } from '../../../components/slides/EditableField'
import type { LeadGenData } from '../schema'
import type { EditState } from '../../../lib/types'

interface MetricItem {
  label: string
  value: string
  sub?: string
  accentColor?: string
  e?: EditState
  eVisible?: EditState
}

interface MetricsOverviewProps {
  data: LeadGenData
  ePeriod: EditState
  metrics: MetricItem[]
}

export function MetricsOverview({ data, ePeriod, metrics }: MetricsOverviewProps) {
  return (
    <SlideShell>
      <SlideLogo clientName={data.client} position="top-right" />
      <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>
        Visão Geral —{' '}
        <EditableField e={ePeriod} style={{ fontSize: 11, color: '#6b7280', fontWeight: 700, letterSpacing: '1px' }} placeholder="Período" />
      </div>
      <MetricGrid metrics={metrics} columns={3} />
    </SlideShell>
  )
}
