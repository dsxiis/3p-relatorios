import type { LeadGenData } from './schema'

export function claudePrompt(data: LeadGenData): string {
  const campaignSummary = data.campaigns.map(c => ({
    id: c.id,
    name: c.name,
    spend: c.spend.toFixed(2),
    impressions: c.impressions,
    clicks: c.clicks,
    leads: c.leads,
    cpl: c.cpl.toFixed(2),
    cplPrevPeriod: c.cplPrevPeriod?.toFixed(2) ?? 'N/D',
  }))

  return `Você é analista de mídia paga da 3P Marketing.
Dados do relatório de ${data.client} — período ${data.period}:

Resumo geral:
- Investimento: R$${data.investment.toFixed(2)}
- Leads totais: ${data.totals.leads}
- CPL médio: R$${data.totals.cpl.toFixed(2)}
- Impressões: ${data.totals.impressions}

Campanhas:
${JSON.stringify(campaignSummary, null, 2)}

Retorne SOMENTE JSON válido (sem markdown, sem texto fora do JSON) com esta estrutura:
{
  "campaigns": [
    {
      "id": "<id da campanha>",
      "annotation": "<análise 2-4 parágrafos em PT-BR, tom direto e profissional. Destaque performance, compare com período anterior quando disponível, e aponte próxima ação.>"
    }
  ],
  "todos3P": ["<ação 1>", "<ação 2>", "<ação 3>"],
  "todosClient": ["<ação 1>", "<ação 2>"]
}

todos3P: 3-5 ações que a equipe 3P deve executar no próximo mês.
todosClient: 1-3 ações que o cliente deve executar.`
}
