import { leadGenDataSchema, type LeadGenData } from './schema'
import { metaMapper, csvMapper } from './mapper'
import { claudePrompt } from './prompt'
import { Cover } from './slides/Cover'
import { MetricsOverview } from './slides/MetricsOverview'
import { CampaignSlide } from './slides/CampaignSlide'
import { TodoSlide } from './slides/TodoSlide'
import type { TemplateConfig } from '../types'
import type { EditState } from '../../lib/types'

function fmtBRL(n: number) {
  return `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtNum(n: number) {
  return n.toLocaleString('pt-BR')
}

export const leadGenConfig: TemplateConfig<LeadGenData> = {
  id: 'lead-gen',
  name: 'Lead Gen',
  description: 'B2B com múltiplos vendedores/campanhas',
  clientType: 'lead_gen',
  dataSchema: leadGenDataSchema,
  metaMapper: (insights, clientName, period) => metaMapper(insights, clientName, period),
  csvMapper: (rows, clientName, period) => csvMapper(rows, clientName, period),
  claudePrompt,
  renderSlides: (data: LeadGenData, mkEdit: (id: string, defaultValue: string) => EditState, clientLogo?: string | null) => {
    const eClient = mkEdit('cover.client', data.client)
    const ePeriod = mkEdit('cover.period', data.period)

    // Overview metrics with visibility toggles
    const overviewMetrics = [
      { label: 'Investimento', value: fmtBRL(data.investment),         accentColor: '#8833ff', e: mkEdit('metrics.investment', fmtBRL(data.investment)),         eVisible: mkEdit('vis.metrics.investment', 'true') },
      { label: 'Alcance',      value: fmtNum(data.totals.reach),       e: mkEdit('metrics.reach', fmtNum(data.totals.reach)),                                     eVisible: mkEdit('vis.metrics.reach', 'true') },
      { label: 'Impressões',   value: fmtNum(data.totals.impressions), e: mkEdit('metrics.impressions', fmtNum(data.totals.impressions)),                         eVisible: mkEdit('vis.metrics.impressions', 'true') },
      { label: 'Cliques',      value: fmtNum(data.totals.clicks),      e: mkEdit('metrics.clicks', fmtNum(data.totals.clicks)),                                   eVisible: mkEdit('vis.metrics.clicks', 'true') },
      { label: 'Leads',        value: fmtNum(data.totals.leads),       accentColor: '#34d399', e: mkEdit('metrics.leads', fmtNum(data.totals.leads)),             eVisible: mkEdit('vis.metrics.leads', 'true') },
      { label: 'CPL Médio',    value: fmtBRL(data.totals.cpl),         accentColor: '#34d399', e: mkEdit('metrics.cpl', fmtBRL(data.totals.cpl)),                eVisible: mkEdit('vis.metrics.cpl', 'true') },
    ]

    return [
      <Cover key="cover" eClient={eClient} ePeriod={ePeriod} clientLogo={clientLogo} />,

      <MetricsOverview key="metrics" data={data} ePeriod={ePeriod} metrics={overviewMetrics} clientLogo={clientLogo} />,

      ...data.campaigns.map((campaign, i) => {
        const pfx = `campaign.${i}`
        const slideKey = `campaign-${i}-${campaign.id || campaign.name}`
        const campaignMetrics = [
          { label: 'Investido',    value: fmtBRL(campaign.spend),                       e: mkEdit(`${pfx}.spend`, fmtBRL(campaign.spend)),                        eVisible: mkEdit(`vis.${pfx}.spend`, 'true') },
          { label: 'Impressões',   value: fmtNum(campaign.impressions),                  e: mkEdit(`${pfx}.impressions`, fmtNum(campaign.impressions)),              eVisible: mkEdit(`vis.${pfx}.impressions`, 'true') },
          { label: 'Leads',        value: fmtNum(campaign.leads), accentColor: '#34d399',e: mkEdit(`${pfx}.leads`, fmtNum(campaign.leads)),                         eVisible: mkEdit(`vis.${pfx}.leads`, 'true') },
          { label: 'CPL',          value: fmtBRL(campaign.cpl),   accentColor: campaign.cpl < (campaign.cplPrevPeriod ?? campaign.cpl + 1) ? '#34d399' : '#f59e0b', e: mkEdit(`${pfx}.cpl`, fmtBRL(campaign.cpl)), eVisible: mkEdit(`vis.${pfx}.cpl`, 'true') },
          { label: 'CPL Anterior', value: campaign.cplPrevPeriod ? fmtBRL(campaign.cplPrevPeriod) : '—', sub: 'período anterior', e: mkEdit(`${pfx}.cplPrev`, campaign.cplPrevPeriod ? fmtBRL(campaign.cplPrevPeriod) : '—'), eVisible: mkEdit(`vis.${pfx}.cplPrev`, 'true') },
          { label: 'Cliques',      value: fmtNum(campaign.clicks),                       e: mkEdit(`${pfx}.clicks`, fmtNum(campaign.clicks)),                       eVisible: mkEdit(`vis.${pfx}.clicks`, 'true') },
        ]
        // SEM fallback — topVideo e topImage são independentes (evita duplicar)
        const v = campaign.topVideo
        const im = campaign.topImage
        return (
          <CampaignSlide
            key={slideKey}
            campaign={campaign}
            clientName={data.client}
            clientLogo={clientLogo}
            metrics={campaignMetrics}
            ePeriod={ePeriod}
            eAnnotation={mkEdit(`${pfx}.annotation`, campaign.annotation)}
            eName={mkEdit(`${pfx}.name`, campaign.name)}
            // Vídeo (mostra sempre, mesmo sem dados — usuário pode adicionar manualmente)
            eVideoImage={mkEdit(`${pfx}.video.image`, v?.thumbnail_url ?? '')}
            eVideoLink={mkEdit(`${pfx}.video.link`, v?.preview_link ?? '')}
            eVideoClicks={mkEdit(`${pfx}.video.clicks`, String(v?.clicks ?? 0))}
            eVideoLeads={mkEdit(`${pfx}.video.leads`, String(v?.leads ?? 0))}
            eVideoCpl={mkEdit(`${pfx}.video.cpl`, v ? `R$ ${v.cpl.toFixed(2)}` : '—')}
            eVideoImpressions={mkEdit(`${pfx}.video.impressions`, String(v?.impressions ?? 0))}
            eVideoCtr={mkEdit(`${pfx}.video.ctr`, v?.ctr ? `${v.ctr.toFixed(2)}%` : '—')}
            eVideoVisible={mkEdit(`vis.${pfx}.video`, 'true')}
            // Estático
            eImageImage={mkEdit(`${pfx}.static.image`, im?.thumbnail_url ?? '')}
            eImageLink={mkEdit(`${pfx}.static.link`, im?.preview_link ?? '')}
            eImageClicks={mkEdit(`${pfx}.static.clicks`, String(im?.clicks ?? 0))}
            eImageLeads={mkEdit(`${pfx}.static.leads`, String(im?.leads ?? 0))}
            eImageCpl={mkEdit(`${pfx}.static.cpl`, im ? `R$ ${im.cpl.toFixed(2)}` : '—')}
            eImageImpressions={mkEdit(`${pfx}.static.impressions`, String(im?.impressions ?? 0))}
            eImageCtr={mkEdit(`${pfx}.static.ctr`, im?.ctr ? `${im.ctr.toFixed(2)}%` : '—')}
            eImageVisible={mkEdit(`vis.${pfx}.static`, 'true')}
          />
        )
      }),

      <TodoSlide
        key="todo"
        clientName={data.client}
        todos3P={data.todos3P}
        todosClient={data.todosClient}
        e3P={mkEdit('todos.3p', data.todos3P.join('\n'))}
        eClient={mkEdit('todos.client', data.todosClient.join('\n'))}
      />,
    ]
  },
}
