import { SlideShell } from '../../../components/slides/SlideShell'
import { MetricGrid } from '../../../components/slides/MetricGrid'
import { SlideLogo } from '../../../components/slides/SlideLogo'
import { SectionLabel } from '../../../components/slides/SectionLabel'
import { EditableField } from '../../../components/slides/EditableField'
import { useTheme } from '../../../lib/themeContext'
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
  clientLogo?: string | null
}

export function MetricsOverview({ data, ePeriod, metrics, clientLogo }: MetricsOverviewProps) {
  const t = useTheme()
  return (
    <SlideShell>
      <SlideLogo clientName={data.client} clientLogo={clientLogo} position="top-right" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
        <SectionLabel style={{ marginBottom: 0 }}>Visão Geral</SectionLabel>
        <div style={{ fontSize: 15, color: t.slideMuted, fontWeight: 500 }}>—</div>
        <EditableField e={ePeriod} style={{ fontSize: 15, color: t.slideMuted, fontWeight: 600 }} placeholder="Período" />
      </div>
      <MetricGrid metrics={metrics} columns={3} />
    </SlideShell>
  )
}
