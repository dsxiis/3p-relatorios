import { franchiseDataSchema, type FranchiseData } from './schema'
import { metaMapper, csvMapper } from './mapper'
import { claudePrompt } from './prompt'
import { Cover } from './slides/Cover'
import { UnitSlide } from './slides/UnitSlide'
import { FranqueadoraSlide } from './slides/FranqueadoraSlide'
import type { TemplateConfig } from '../types'
import type { EditState } from '../../lib/types'

export const franquiaConfig: TemplateConfig<FranchiseData> = {
  id: 'franquia',
  name: 'Franquia',
  description: 'Redes com múltiplas unidades — foco em WhatsApp',
  clientType: 'franchise',
  dataSchema: franchiseDataSchema,
  metaMapper: (insights, clientName, period) => metaMapper(insights, clientName, period),
  csvMapper: (rows, clientName, period) => csvMapper(rows, clientName, period),
  claudePrompt,
  renderSlides: (data: FranchiseData, mkEdit: (id: string, defaultValue: string) => EditState) => {
    return [
      <Cover key="cover" clientName={data.client} period={data.period} unitCount={data.units.length} />,
      ...data.units.map(unit => (
        <UnitSlide
          key={`unit-${unit.id}`}
          unit={unit}
          clientName={data.client}
          e={mkEdit(`unit-${unit.id}-annotation`, unit.annotation)}
        />
      )),
      <FranqueadoraSlide
        key="franqueadora"
        clientName={data.client}
        period={data.period}
        franchiseHistory={data.franchiseHistory}
        eHistory={mkEdit('franchise-history', data.franchiseHistory.join('\n'))}
      />,
    ]
  },
}
