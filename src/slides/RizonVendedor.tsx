import { Slide } from '../components/Slide'
import { ImgPlaceholder } from '../components/ImgPlaceholder'
import { EditableBlock } from '../components/EditableBlock'
import type { RizonVendedorData } from '../lib/mockData'
import type { EditState } from '../lib/types'
import { SLIDE } from '../styles/tokens'

interface RizonVendedorProps {
  data: RizonVendedorData
  e: EditState
}

export function RizonVendedor({ data, e }: RizonVendedorProps) {
  return (
    <Slide bg={SLIDE.bg} padding="26px 34px">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <span style={{ fontSize: 18, fontWeight: 800, color: SLIDE.brand, fontFamily: 'monospace' }}>
            VENDEDOR [{data.id}]{' '}
          </span>
          <span style={{ fontSize: 13, color: '#ccc' }}>{data.inv}</span>
          <div style={{ fontSize: 10, color: '#bbb', marginTop: 2 }}>Campanha WPP</div>
        </div>
        <div style={{ fontSize: 10, fontWeight: 800, color: '#222' }}>rizon | 3P.</div>
      </div>

      {/* 5-col metrics grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 9, marginBottom: 18 }}>
        {[
          { l: 'Impressões', v: data.impressoes },
          { l: 'Leads', v: data.leads },
          { l: 'Custo/Lead', v: data.cpl, s: data.cplPrev },
          { l: 'Vendas', v: '' },
          { l: 'Valor em Vendas', v: '' },
        ].map(({ l, v, s }) => (
          <div key={l} style={{
            border: `1.5px solid ${SLIDE.borderBrand}`,
            borderRadius: 9, padding: '11px 13px',
            background: SLIDE.cardBg,
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#666', letterSpacing: '0.07em', marginBottom: 4 }}>{l}</div>
            {s && <div style={{ fontSize: 9, color: '#bbb', marginBottom: 2 }}>{s}</div>}
            <div style={{ fontSize: 18, fontWeight: 800, color: '#111' }}>
              {v || <span style={{ color: '#ddd' }}>—</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom: criativo + mini-metrics + editable */}
      <div style={{ display: 'grid', gridTemplateColumns: '84px 82px 1fr', gap: 14 }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: SLIDE.brand, marginBottom: 5 }}>Melhor Criativo</div>
          <ImgPlaceholder color={SLIDE.brandDim} />
        </div>
        <div style={{ paddingTop: 20 }}>
          {[
            ['Cliques', data.cliques],
            ['Leads', data.leadsTop],
            ['Custo/Lead', data.cplTop],
          ].map(([l, v]) => (
            <div key={l} style={{
              border: `1.5px solid ${SLIDE.borderBrand}`,
              borderRadius: 7, padding: '6px 9px', marginBottom: 6,
            }}>
              <div style={{ fontSize: 8, color: '#999', marginBottom: 1 }}>{l}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>{v}</div>
            </div>
          ))}
        </div>
        <EditableBlock label="Anotações" e={e} />
      </div>
    </Slide>
  )
}
