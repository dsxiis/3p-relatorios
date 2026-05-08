import { franchiseDataSchema, type FranchiseData } from './schema'
import { metaMapper, csvMapper } from './mapper'
import { claudePrompt } from './prompt'
import { Cover } from './slides/Cover'
import { UnitSlide } from './slides/UnitSlide'
import { FranqueadoraSlide } from './slides/FranqueadoraSlide'
import type { TemplateConfig } from '../types'
import type { EditState } from '../../lib/types'

function fmtBRL(n: number) {
  return `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtNum(n: number) {
  return n.toLocaleString('pt-BR')
}

export const franquiaConfig: TemplateConfig<FranchiseData> = {
  id: 'franquia',
  name: 'Franquia',
  description: 'Redes com múltiplas unidades — foco em WhatsApp',
  clientType: 'franchise',
  dataSchema: franchiseDataSchema,
  metaMapper: (insights, clientName, period) => metaMapper(insights, clientName, period),
  csvMapper: (rows, clientName, period) => csvMapper(rows, clientName, period),
  claudePrompt,
  renderSlides: (data: FranchiseData, mkEdit: (id: string, defaultValue: string) => EditState, clientLogo?: string | null) => {
    const eClient = mkEdit('cover.client', data.client)
    const ePeriod = mkEdit('cover.period', data.period)

    return [
      <Cover key="cover" eClient={eClient} ePeriod={ePeriod} unitCount={data.units.length} clientLogo={clientLogo} />,

      ...data.units.map((unit, i) => {
        const pfx = `unit.${i}`
        const unitMetrics = [
          { label: 'Impressões',   value: fmtNum(unit.impressions),  e: mkEdit(`${pfx}.impressions`, fmtNum(unit.impressions)),  eVisible: mkEdit(`vis.${pfx}.impressions`, 'true') },
          { label: 'Alcance',      value: fmtNum(unit.reach),        e: mkEdit(`${pfx}.reach`, fmtNum(unit.reach)),              eVisible: mkEdit(`vis.${pfx}.reach`, 'true') },
          { label: 'Conversas',    value: fmtNum(unit.conversations), accentColor: '#34d399', e: mkEdit(`${pfx}.conversations`, fmtNum(unit.conversations)), eVisible: mkEdit(`vis.${pfx}.conversations`, 'true') },
          { label: 'CPC',          value: fmtBRL(unit.cpc),           accentColor: '#34d399', e: mkEdit(`${pfx}.cpc`, fmtBRL(unit.cpc)),                    eVisible: mkEdit(`vis.${pfx}.cpc`, 'true') },
          { label: 'Investimento', value: fmtBRL(unit.spend),         accentColor: '#8833ff', e: mkEdit(`${pfx}.spend`, fmtBRL(unit.spend)),                eVisible: mkEdit(`vis.${pfx}.spend`, 'true') },
        ]
        const v = unit.bestVideo
        const im = unit.bestImage ?? unit.bestAd  // fallback pro bestAd legado
        return (
          <UnitSlide
            key={`unit-${unit.id}`}
            unit={unit}
            clientName={data.client}
            clientLogo={clientLogo}
            metrics={unitMetrics}
            ePeriod={ePeriod}
            eAnnotation={mkEdit(`${pfx}.annotation`, unit.annotation)}
            eCity={mkEdit(`${pfx}.city`, unit.city)}
            // Vídeo
            eVideoImage={mkEdit(`${pfx}.video.image`, v?.thumbnail_url ?? '')}
            eVideoLink={mkEdit(`${pfx}.video.link`, v?.preview_link ?? '')}
            eVideoClicks={mkEdit(`${pfx}.video.clicks`, String(v?.clicks ?? 0))}
            eVideoMessages={mkEdit(`${pfx}.video.messages`, String(v?.messages ?? 0))}
            eVideoCpl={mkEdit(`${pfx}.video.cpl`, v ? `R$ ${v.cpl.toFixed(2)}` : '—')}
            eVideoImpressions={mkEdit(`${pfx}.video.impressions`, String(v?.impressions ?? 0))}
            eVideoCtr={mkEdit(`${pfx}.video.ctr`, v?.ctr ? `${v.ctr.toFixed(2)}%` : '—')}
            eVideoVisible={mkEdit(`vis.${pfx}.video`, 'true')}
            // Estático
            eImageImage={mkEdit(`${pfx}.static.image`, im?.thumbnail_url ?? '')}
            eImageLink={mkEdit(`${pfx}.static.link`, im?.preview_link ?? '')}
            eImageClicks={mkEdit(`${pfx}.static.clicks`, String(im?.clicks ?? 0))}
            eImageMessages={mkEdit(`${pfx}.static.messages`, String(im?.messages ?? 0))}
            eImageCpl={mkEdit(`${pfx}.static.cpl`, im ? `R$ ${im.cpl.toFixed(2)}` : '—')}
            eImageImpressions={mkEdit(`${pfx}.static.impressions`, String(im?.impressions ?? 0))}
            eImageCtr={mkEdit(`${pfx}.static.ctr`, im?.ctr ? `${im.ctr.toFixed(2)}%` : '—')}
            eImageVisible={mkEdit(`vis.${pfx}.static`, 'true')}
          />
        )
      }),

      <FranqueadoraSlide
        key="franqueadora"
        clientName={data.client}
        clientLogo={clientLogo}
        franchiseHistory={data.franchiseHistory}
        ePeriod={ePeriod}
        eHistory={mkEdit('franchise.history', data.franchiseHistory.join('\n'))}
      />,
    ]
  },
}
