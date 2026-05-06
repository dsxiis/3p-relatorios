import { Slide } from '../components/Slide'
import { ImgPlaceholder } from '../components/ImgPlaceholder'
import { EditableBlock } from '../components/EditableBlock'
import type { FolksUnitData } from '../lib/mockData'
import type { EditState } from '../lib/types'
import { SLIDE } from '../styles/tokens'

interface FolksUnitProps {
  data: FolksUnitData
  e: EditState
}

export function FolksUnit({ data, e }: FolksUnitProps) {
  // Extract month from the outer period - we'll just say "Março" as default
  // In a real scenario this would be passed from the report context
  const month = 'Março'

  return (
    <Slide bg={SLIDE.bg} padding="22px 30px">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: SLIDE.brand }}>
          {data.city} — {month}
        </div>
        <div style={{ fontSize: 10, fontWeight: 800, color: '#222' }}>Folks | 3P.</div>
      </div>

      {/* 5-col metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 9, marginBottom: 16 }}>
        {[
          ['Impressões', data.impressoes],
          ['Alcance', data.alcance],
          ['Conversas', data.conversas],
          ['Custo/Conversa', data.cpc],
          ['Valor Usado', data.valor],
        ].map(([l, v]) => (
          <div key={l} style={{
            border: `1.5px solid ${SLIDE.borderBrandFolks}`,
            borderRadius: 9, padding: '11px 13px',
            background: SLIDE.cardBg,
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#555', letterSpacing: '0.07em', marginBottom: 4 }}>{l}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#111' }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Bottom: ad + vid + notes */}
      <div style={{ display: 'grid', gridTemplateColumns: '78px 76px 78px 76px 1fr', gap: 11 }}>
        {/* Best AD */}
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: SLIDE.brand, marginBottom: 5 }}>Melhor AD</div>
          <ImgPlaceholder color={SLIDE.brandDim} ratio="3/4" />
        </div>
        <div style={{ paddingTop: 18 }}>
          {[
            ['Cliques', data.adCliques],
            ['Mensagens', data.adMsg],
            ['R$/Lead', data.adCpl],
          ].map(([l, v]) => (
            <div key={l} style={{
              border: `1px solid ${SLIDE.borderBrand}`,
              borderRadius: 6, padding: '5px 8px', marginBottom: 5,
            }}>
              <div style={{ fontSize: 8, color: '#999', marginBottom: 1 }}>{l}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#111' }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Best VID */}
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: SLIDE.brand, marginBottom: 5 }}>Melhor VID</div>
          <ImgPlaceholder color="#E0F0FF" ratio="3/4" />
        </div>
        <div style={{ paddingTop: 18 }}>
          {[
            ['Cliques', data.vidCliques],
            ['Mensagens', data.vidMsg],
            ['R$/Lead', data.vidCpl],
          ].map(([l, v]) => (
            <div key={l} style={{
              border: `1px solid #BFD8FF`,
              borderRadius: 6, padding: '5px 8px', marginBottom: 5,
            }}>
              <div style={{ fontSize: 8, color: '#999', marginBottom: 1 }}>{l}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#111' }}>{v}</div>
            </div>
          ))}
        </div>

        <EditableBlock label="Anotações" e={e} small />
      </div>
    </Slide>
  )
}
