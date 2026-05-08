import type { MetaCampaignInsight } from '../../lib/types'
import type { LeadGenData } from './schema'

function getActionValue(actions: Array<{ action_type: string; value: string }> | undefined, type: string): number {
  const action = actions?.find(a => a.action_type === type)
  return action ? parseFloat(action.value) || 0 : 0
}

export function metaMapper(
  insights: MetaCampaignInsight[],
  clientName: string,
  period: string,
): LeadGenData {
  const campaigns = insights.map(insight => {
    const leads = getActionValue(insight.actions, 'lead')
    const spend = parseFloat(insight.spend) || 0
    const cpl = leads > 0 ? spend / leads : 0
    const campaignId = insight.campaign_name.match(/\d{4}/)?.[0] ?? insight.campaign_name.slice(0, 8)

    return {
      id: campaignId,
      name: insight.campaign_name,
      spend,
      reach: parseInt(insight.reach) || 0,
      impressions: parseInt(insight.impressions) || 0,
      clicks: parseInt(insight.clicks) || 0,
      leads,
      cpl,
      annotation: '',
    }
  })

  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0)
  const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0)
  const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0)
  const totalLeads = campaigns.reduce((s, c) => s + c.leads, 0)
  const totalReach = insights.reduce((s, i) => s + (parseInt(i.reach) || 0), 0)

  return {
    client: clientName,
    period,
    investment: totalSpend,
    totals: {
      reach: totalReach,
      impressions: totalImpressions,
      clicks: totalClicks,
      leads: totalLeads,
      cpl: totalLeads > 0 ? totalSpend / totalLeads : 0,
    },
    campaigns,
    todos3P: [],
    todosClient: [],
  }
}

export function csvMapper(
  rows: Record<string, string>[],
  clientName: string,
  period: string,
): LeadGenData {
  const campaigns = rows
    .filter(row => row['Campaign name'] || row['Nome da campanha'])
    .map(row => {
      const name = row['Campaign name'] ?? row['Nome da campanha'] ?? 'Campanha'
      const spend = parseFloat((row['Amount spent (BRL)'] ?? row['Valor usado (BRL)'] ?? '0').replace(',', '.')) || 0
      const impressions = parseInt(row['Impressions'] ?? row['Impressões'] ?? '0') || 0
      const clicks = parseInt(row['Link clicks'] ?? row['Cliques no link'] ?? '0') || 0
      const leads = parseInt(row['Leads'] ?? row['Results'] ?? row['Resultados'] ?? '0') || 0
      const cpl = leads > 0 ? spend / leads : 0
      const campaignId = name.match(/\d{4}/)?.[0] ?? name.slice(0, 8)

      const reach = parseInt(row['Reach'] ?? row['Alcance'] ?? '0') || 0
      return {
        id: campaignId,
        name,
        spend,
        reach,
        impressions,
        clicks,
        leads,
        cpl,
        annotation: '',
      }
    })

  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0)
  const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0)
  const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0)
  const totalLeads = campaigns.reduce((s, c) => s + c.leads, 0)
  const totalReach = rows.reduce((s, r) => s + (parseInt(r['Reach'] ?? r['Alcance'] ?? '0') || 0), 0)

  return {
    client: clientName,
    period,
    investment: totalSpend,
    totals: {
      reach: totalReach,
      impressions: totalImpressions,
      clicks: totalClicks,
      leads: totalLeads,
      cpl: totalLeads > 0 ? totalSpend / totalLeads : 0,
    },
    campaigns,
    todos3P: [],
    todosClient: [],
  }
}
