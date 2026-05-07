import type { FranchiseData } from './schema'

export function claudePrompt(data: FranchiseData): string {
  const unitSummary = data.units.map(u => ({
    id: u.id,
    city: u.city,
    spend: u.spend.toFixed(2),
    impressions: u.impressions,
    reach: u.reach,
    conversations: u.conversations,
    cpc: u.cpc.toFixed(2),
  }))

  return `Você é analista de mídia paga da 3P Marketing.
Dados do relatório de ${data.client} — ${data.units.length} unidades — período ${data.period}:

${JSON.stringify(unitSummary, null, 2)}

Retorne SOMENTE JSON válido (sem markdown, sem texto fora do JSON) com esta estrutura:
{
  "units": [
    {
      "id": "<id da unidade>",
      "annotation": "<análise 2-3 parágrafos em PT-BR. Destaque conversas, CPC, performance dos criativos e próxima ação prioritária.>"
    }
  ],
  "franchiseHistory": [
    "<otimização 1 feita neste período em todas as unidades>",
    "<otimização 2>",
    "<otimização 3>"
  ]
}

franchiseHistory: 3-5 otimizações estratégicas aplicadas no período com impacto na rede toda.`
}
