import type { MetaCampaignInsight } from '../../lib/types'
import type { FranchiseData } from './schema'

function getActionValue(actions: Array<{ action_type: string; value: string }> | undefined, type: string): number {
  const action = actions?.find(a => a.action_type === type)
  return action ? parseFloat(action.value) || 0 : 0
}

export function metaMapper(
  insights: MetaCampaignInsight[],
  clientName: string,
  period: string,
): FranchiseData {
  const units = insights.map((insight, i) => {
    const conversations = getActionValue(
      insight.actions,
      'onsite_conversion.messaging_conversation_started_7d',
    )
    const spend = parseFloat(insight.spend) || 0
    const cpc = conversations > 0 ? spend / conversations : 0
    const city = insight.campaign_name.replace(/[_-]/g, ' ').split(' ')[0] || `Unidade ${i + 1}`

    return {
      id: `unit-${i}`,
      city,
      impressions: parseInt(insight.impressions) || 0,
      reach: parseInt(insight.reach) || 0,
      conversations,
      cpc,
      spend,
      annotation: '',
    }
  })

  return {
    client: clientName,
    period,
    units,
    franchiseHistory: [],
  }
}

export function csvMapper(
  rows: Record<string, string>[],
  clientName: string,
  period: string,
): FranchiseData {
  const units = rows
    .filter(row => row['Campaign name'] || row['Nome da campanha'])
    .map((row, i) => {
      const name = row['Campaign name'] ?? row['Nome da campanha'] ?? `Unidade ${i + 1}`
      const spend = parseFloat((row['Amount spent (BRL)'] ?? row['Valor usado (BRL)'] ?? '0').replace(',', '.')) || 0
      const impressions = parseInt(row['Impressions'] ?? row['Impressões'] ?? '0') || 0
      const reach = parseInt(row['Reach'] ?? row['Alcance'] ?? '0') || 0
      const conversations = parseInt(row['Results'] ?? row['Resultados'] ?? row['Messaging conversations started'] ?? '0') || 0
      const cpc = conversations > 0 ? spend / conversations : 0
      const city = name.split(' ')[0] || `Unidade ${i + 1}`

      return {
        id: `unit-${i}`,
        city,
        impressions,
        reach,
        conversations,
        cpc,
        spend,
        annotation: '',
      }
    })

  return {
    client: clientName,
    period,
    units,
    franchiseHistory: [],
  }
}
