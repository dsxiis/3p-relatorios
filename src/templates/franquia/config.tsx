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
            eAdImage={mkEdit(`${pfx}.ad.image`, '')}
            eAdClicks={mkEdit(`${pfx}.ad.clicks`, String(unit.bestAd?.clicks ?? 0))}
            eAdMessages={mkEdit(`${pfx}.ad.messages`, String(unit.bestAd?.messages ?? 0))}
            eAdCpl={mkEdit(`${pfx}.ad.cpl`, unit.bestAd ? `CPL R$ ${unit.bestAd.cpl.toFixed(2)}` : '—')}
            eAdImpressions={mkEdit(`${pfx}.ad.impressions`, String(unit.bestAd?.impressions ?? 0))}
            eAdCtr={mkEdit(`${pfx}.ad.ctr`, unit.bestAd?.ctr ? `${unit.bestAd.ctr.toFixed(2)}%` : '—')}
            eAdVisible={mkEdit(`vis.${pfx}.ad`, 'true')}
            eVideoImage={mkEdit(`${pfx}.video.image`, '')}
            eVideoClicks={mkEdit(`${pfx}.video.clicks`, String(unit.bestVideo?.clicks ?? 0))}
            eVideoMessages={mkEdit(`${pfx}.video.messages`, String(unit.bestVideo?.messages ?? 0))}
            eVideoCpl={mkEdit(`${pfx}.video.cpl`, unit.bestVideo ? `CPL R$ ${unit.bestVideo.cpl.toFixed(2)}` : '—')}
            eVideoImpressions={mkEdit(`${pfx}.video.impressions`, String(unit.bestVideo?.impressions ?? 0))}
            eVideoCtr={mkEdit(`${pfx}.video.ctr`, unit.bestVideo?.ctr ? `${unit.bestVideo.ctr.toFixed(2)}%` : '—')}
            eVideoVisible={mkEdit(`vis.${pfx}.video`, 'true')}
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
