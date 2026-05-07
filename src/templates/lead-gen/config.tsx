import { leadGenDataSchema, type LeadGenData } from './schema'
import { metaMapper, csvMapper } from './mapper'
import { claudePrompt } from './prompt'
import { Cover } from './slides/Cover'
import { MetricsOverview } from './slides/MetricsOverview'
import { CampaignSlide } from './slides/CampaignSlide'
import { TodoSlide } from './slides/TodoSlide'
import type { TemplateConfig } from '../types'
import type { EditState } from '../../lib/types'

export const leadGenConfig: TemplateConfig<LeadGenData> = {
  id: 'lead-gen',
  name: 'Lead Gen',
  description: 'B2B com múltiplos vendedores/campanhas',
  clientType: 'lead_gen',
  dataSchema: leadGenDataSchema,
  metaMapper: (insights, clientName, period) => metaMapper(insights, clientName, period),
  csvMapper: (rows, clientName, period) => csvMapper(rows, clientName, period),
  claudePrompt,
  renderSlides: (data: LeadGenData, mkEdit: (id: string, defaultValue: string) => EditState) => {
    return [
      <Cover key="cover" clientName={data.client} period={data.period} />,
      <MetricsOverview key="metrics" data={data} />,
      ...data.campaigns.map(campaign => (
        <CampaignSlide
          key={`campaign-${campaign.id}`}
          campaign={campaign}
          clientName={data.client}
          e={mkEdit(`campaign-${campaign.id}-annotation`, campaign.annotation)}
        />
      )),
      <TodoSlide
        key="todo"
        clientName={data.client}
        todos3P={data.todos3P}
        todosClient={data.todosClient}
        e3P={mkEdit('todos-3p', data.todos3P.join('\n'))}
        eClient={mkEdit('todos-client', data.todosClient.join('\n'))}
      />,
    ]
  },
}
