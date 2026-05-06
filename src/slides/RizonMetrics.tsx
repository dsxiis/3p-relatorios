import { Slide } from '../components/Slide'
import { MetricBox } from '../components/MetricBox'
import { Logo3P } from '../components/Logo3P'
import type { RizonData } from '../lib/mockData'
import { SLIDE } from '../styles/tokens'

interface RizonMetricsProps {
  data: RizonData
}

export function RizonMetrics({ data }: RizonMetricsProps) {
  return (
    <Slide bg={SLIDE.bg} padding="32px 40px">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 3 }}>
            <div style={{
              width: 26, height: 26,
              background: 'linear-gradient(135deg,#0668E1,#00B2FF)',
              borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 13, fontWeight: 800,
            }}>
              ∞
            </div>
            <span style={{ fontSize: 17, fontWeight: 800, color: '#111' }}>Meta</span>
          </div>
          <div style={{ fontSize: 12, color: '#999' }}>{data.period}</div>
          <div style={{ fontSize: 20, fontWeight: 300, color: '#ccc', marginTop: 3 }}>
            R$ {data.investment}
          </div>
        </div>

        {/* 3-column metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, width: '100%' }}>
          {[
            ['ALCANCE', data.alcance],
            ['IMPRESSÕES', data.impressoes],
            ['CLIQUES', data.cliques],
          ].map(([l, v]) => (
            <MetricBox key={l} label={l} value={v} />
          ))}
        </div>

        {/* 2-column metrics (centered) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, width: '60%' }}>
          {[
            ['LEADS', data.leads],
            ['CUSTO/LEAD', `R$ ${data.cpl}`],
          ].map(([l, v]) => (
            <MetricBox key={l} label={l} value={v} />
          ))}
        </div>

        <Logo3P dark />
      </div>
    </Slide>
  )
}
