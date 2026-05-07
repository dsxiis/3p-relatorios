# 3P Relatórios — Templates Config-Driven: Design Spec
**Data:** 2026-05-07  
**Status:** Aprovado

---

## 1. Objetivo

Substituir os slides hardcoded (Rizon/Folks) por um sistema **config-driven** com:
- 2 templates: **Lead Gen** e **Franquia**
- Dados vindos da **Meta API** ou **CSV upload** — ambos chegam ao mesmo `ReportData`
- **Claude API** gera os textos de análise automaticamente
- Todos os blocos de texto são **editáveis** pelo usuário após geração
- 100% de fidelidade visual com os PDFs reais entregues aos clientes

---

## 2. Templates

### 2.1 Lead Gen (`lead-gen`)
Baseado no PDF Rizon. Usado para clientes B2B com múltiplos produtos/vendedores.

**Slides em ordem:**
1. `Cover` — nome do cliente, período, logo 3P
2. `MetricsOverview` — totais: investimento, alcance, impressões, cliques, leads, CPL médio (auto)
3. `CampaignSlide` × N — um slide por campanha/vendedor com: impressões, leads, CPL, CPL período anterior, melhores criativos (métricas), bloco de anotações (editável)
4. `TodoSlide` — lista de To Do: responsabilidades 3P e do cliente (editável)

**Schema `LeadGenData`:**
```ts
interface LeadGenData {
  client: string
  period: string           // "01/03 - 31/03"
  investment: number
  totals: {
    reach: number
    impressions: number
    clicks: number
    leads: number
    cpl: number
  }
  campaigns: {
    id: string             // "0110", "1816"
    name: string           // nome da campanha
    spend: number
    impressions: number
    clicks: number
    leads: number
    cpl: number
    cplPrevPeriod?: number // CPL período anterior — buscado do último report do mesmo cliente no D1
    topCreative?: {
      clicks: number
      leads: number
      cpl: number
    }
    annotation: string     // gerado por Claude, editável
  }[]
  todos3P: string[]        // gerado por Claude, editável
  todosClient: string[]    // gerado por Claude, editável
}
```

### 2.2 Franquia (`franquia`)
Baseado no PDF Folks Pub. Usado para redes com múltiplas unidades, foco em WhatsApp/conversas.

**Slides em ordem:**
1. `Cover` — nome do cliente, período, logo 3P
2. `UnitSlide` × N — um slide por unidade com: impressões, alcance, conversas, CPC, valor usado, melhor AD (métricas), melhor VID (métricas), bloco de anotações (editável)
3. `FranqueadoraSlide` — histórico de otimizações de todas as unidades (editável)

**Schema `FranchiseData`:**
```ts
interface FranchiseData {
  client: string
  period: string
  units: {
    id: string
    city: string           // "Campinas", "Florianópolis"
    impressions: number
    reach: number
    conversations: number
    cpc: number            // custo por conversa
    spend: number
    bestAd?: {
      clicks: number
      messages: number
      cpl: number
    }
    bestVideo?: {
      clicks: number
      messages: number
      cpl: number
    }
    annotation: string     // gerado por Claude, editável
  }[]
  franchiseHistory: string[]  // gerado por Claude, editável
}
```

---

## 3. TemplateConfig

Interface que registra cada template no sistema:

```ts
interface TemplateConfig<TData> {
  id: string
  name: string
  description: string
  clientType: 'lead_gen' | 'franchise'
  dataSchema: ZodSchema<TData>
  metaMapper: (insights: MetaCampaignInsight[]) => TData
  csvMapper: (rows: Record<string, string>[]) => TData
  claudePrompt: (data: TData) => string
  renderSlides: (data: TData, edits: Record<string, string>) => React.ReactNode
}
```

Registry em `src/templates/index.ts`:
```ts
export const TEMPLATES: Record<string, TemplateConfig<unknown>> = {
  'lead-gen': leadGenConfig,
  'franquia': franquiaConfig,
}
```

---

## 4. Fontes de dados

### 4.1 Meta API
- Worker chama `GET /v21.0/{account_id}/insights` com campos: `campaign_name, reach, impressions, clicks, spend, actions, cost_per_action_type`
- Para **leads**: `actions[action_type=lead].value`
- Para **conversas WA**: `actions[action_type=onsite_conversion.messaging_conversation_started_7d].value`
- Cada insight de campanha → `CampaignSlide` ou `UnitSlide` via `metaMapper`

### 4.2 CSV Upload
- Frontend: input `<input type="file" accept=".csv">` no `FormView`
- Frontend faz parse com `papaparse` (biblioteca leve)
- Colunas esperadas Meta Ads CSV: `Campaign name, Amount spent, Reach, Impressions, Link clicks, Leads, Results`
- `csvMapper` normaliza nomes de coluna e converte para mesmo `TData`
- Upload do arquivo para o worker via `FormData`, worker faz o parse final e guarda em D1

### 4.3 Fallback manual
- Se nem Meta API nem CSV estiver disponível: campos ficam com valor `0` / `"—"` e o usuário preenche editando os blocos

---

## 5. Claude API — geração de análise

### Fluxo
1. Worker recebe `ReportData` preenchido (métricas já calculadas)
2. Monta prompt específico do template (`claudePrompt(data)`)
3. Chama `anthropic.messages.create()` com o prompt
4. Resposta é JSON com os campos editáveis (`annotation` por campanha/unidade, `todos3P`, `todosClient`)
5. Worker salva no campo `raw_data` do D1 com os textos já dentro

### Prompt Lead Gen (estrutura)
```
Você é analista de mídia paga da 3P Marketing.
Dados do relatório de {client} — período {period}:
[métricas por campanha em JSON]

Retorne JSON com:
- campaigns[i].annotation: análise da campanha i (2-4 parágrafos, PT-BR, tom direto)
- todos3P: array de 3-5 ações que a 3P deve tomar
- todosClient: array de 1-3 ações que o cliente deve tomar
```

### Prompt Franquia (estrutura)
```
Você é analista de mídia paga da 3P Marketing.
Dados do relatório de {client} — {N} unidades — período {period}:
[métricas por unidade em JSON]

Retorne JSON com:
- units[i].annotation: análise da unidade i (2-3 parágrafos, PT-BR)
- franchiseHistory: array de 3-5 otimizações feitas em todas as unidades
```

---

## 6. Edição pós-geração

Cada bloco editável tem um `block_id` único (`campaign-0110-annotation`, `todos-3p`, `unit-campinas-annotation`).

Quando o usuário edita e clica "Salvar":
1. Frontend chama `PATCH /api/reports/:id/edits` com `{ block_id, value }`
2. Worker merge no campo `edits` (JSON) do relatório no D1
3. Na renderização, `edits[block_id]` tem prioridade sobre `raw_data[field]`

---

## 7. Componentes de slide base (reutilizáveis)

Extrair para `src/components/slides/`:

| Componente | Descrição |
|---|---|
| `SlideShell` | Container branco ou escuro com padding e sombra |
| `MetricGrid` | Grid responsivo de MetricBox (N colunas) |
| `EditableText` | Bloco de texto com botão ✏/✓, textarea, save |
| `CreativeSpot` | Placeholder de imagem + mini-métricas ao lado |
| `SlideLogo` | "rizon \| 3P." ou "Folks \| 3P." alinhado ao canto |
| `SlideHeader` | Título à esquerda + label à direita |

---

## 8. FormView — UI de seleção de fonte

Novo flow no `FormView` após escolher o período:

```
[Origem dos dados]
  ○ Meta API  — puxa automaticamente
  ○ CSV       — upload de arquivo
  ○ Manual    — preencher depois

Se CSV: aparece dropzone com instruções
Se Meta API: mostra contas vinculadas (combo)
```

Após clicar "Gerar":
1. Worker cria report com `status: 'generating'`
2. Frontend mostra `GeneratingView` com steps animados
3. Worker processa em background (meta/csv → mapper → claude → salva)
4. Frontend faz polling a cada 2s em `GET /api/reports/:id` até `status: 'ready'`
5. Navega automaticamente para `ReportView`

---

## 9. Worker — endpoint de geração atualizado

`POST /api/reports/generate` passa a:
1. Criar o report no D1 como `generating`
2. Usar `ctx.waitUntil()` para processar em background:
   a. Se `source: 'meta'`: chama Meta API, mapeia
   b. Se `source: 'csv'`: parseia CSV enviado, mapeia
   c. Roda `claudeService.generateAnalysis(templateId, data)`
   d. Atualiza report D1 com `raw_data`, `status: 'ready'`
   e. Em erro: `status: 'error'`, `error_message`
3. Retorna imediatamente com o report `generating`

---

## 10. O que NÃO entra nesta fase

- Upload de imagens de criativos (fica como placeholder)
- PDF export (já planejado para fase 5)
- Multi-conta Meta (uma conta por cliente por ora)
- Templates adicionais além de lead-gen e franquia

---

## 11. Arquivos a criar/modificar

### Novos
- `src/templates/index.ts`
- `src/templates/lead-gen/config.ts`, `schema.ts`, `mapper.ts`, `prompt.ts`
- `src/templates/lead-gen/slides/Cover.tsx`, `MetricsOverview.tsx`, `CampaignSlide.tsx`, `TodoSlide.tsx`
- `src/templates/franquia/config.ts`, `schema.ts`, `mapper.ts`, `prompt.ts`
- `src/templates/franquia/slides/Cover.tsx`, `UnitSlide.tsx`, `FranqueadoraSlide.tsx`
- `src/components/slides/SlideShell.tsx`, `MetricGrid.tsx`, `EditableText.tsx`, `CreativeSpot.tsx`, `SlideLogo.tsx`
- `src/lib/csvParser.ts`
- `worker/src/services/claudeService.ts`
- `worker/src/services/metaService.ts`
- `worker/src/services/csvService.ts`

### Modificados
- `src/screens/FormView.tsx` — adicionar CSV upload + polling
- `src/screens/ReportView.tsx` — usar template registry
- `src/screens/GeneratingView.tsx` — polling status
- `worker/src/routes/reports.ts` — geração real com waitUntil
- `worker/src/lib/types.ts` (novo) — tipos compartilhados

---

## Decisões

| Decisão | Escolha | Motivo |
|---|---|---|
| Arquitetura | Config-driven | Extensível, sem duplicação |
| Parse CSV | papaparse (frontend) | Leve, sem dep server-side |
| Claude output | JSON estruturado | Fácil de mapear nos slides |
| Polling | 2s, timeout 5min | Simple, sem WebSocket |
| Edits storage | D1 campo `edits` JSON | Já existente, simples |
| Zod para schema | Sim | Validação runtime de dados externos |
