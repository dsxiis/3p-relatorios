# Templates Config-Driven Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded Rizon/Folks slides with a config-driven template system where data auto-populates from Meta API or CSV upload, Claude generates analysis text, and all text blocks are editable.

**Architecture:** Each template is a `TemplateConfig<TData>` object with schema, mappers, Claude prompt, and slide renderer. The worker processes data in background with `ctx.waitUntil()`. The frontend polls every 2s until `status === 'ready'`.

**Tech Stack:** React 19, TypeScript, Vite, Zod (validation), papaparse (CSV), Cloudflare Workers (Hono), Cloudflare D1, Anthropic SDK

---

## File Map

**New — Frontend**
- `src/templates/index.ts` — template registry
- `src/templates/lead-gen/schema.ts` — LeadGenData + Zod schema
- `src/templates/lead-gen/mapper.ts` — metaMapper + csvMapper
- `src/templates/lead-gen/prompt.ts` — claudePrompt function
- `src/templates/lead-gen/config.ts` — TemplateConfig<LeadGenData>
- `src/templates/lead-gen/slides/Cover.tsx`
- `src/templates/lead-gen/slides/MetricsOverview.tsx`
- `src/templates/lead-gen/slides/CampaignSlide.tsx`
- `src/templates/lead-gen/slides/TodoSlide.tsx`
- `src/templates/franquia/schema.ts` — FranchiseData + Zod schema
- `src/templates/franquia/mapper.ts`
- `src/templates/franquia/prompt.ts`
- `src/templates/franquia/config.ts`
- `src/templates/franquia/slides/Cover.tsx`
- `src/templates/franquia/slides/UnitSlide.tsx`
- `src/templates/franquia/slides/FranqueadoraSlide.tsx`
- `src/components/slides/SlideShell.tsx`
- `src/components/slides/MetricGrid.tsx`
- `src/components/slides/EditableText.tsx`
- `src/components/slides/CreativeSpot.tsx`
- `src/components/slides/SlideLogo.tsx`
- `src/lib/csvParser.ts`

**New — Worker**
- `worker/src/services/claudeService.ts`
- `worker/src/services/metaService.ts`
- `worker/src/services/csvService.ts`

**Modified — Frontend**
- `src/lib/types.ts` — add LeadGenData, FranchiseData, TemplateReportData, update GenerateReportPayload
- `src/screens/FormView.tsx` — add CSV option + file dropzone
- `src/screens/GeneratingView.tsx` — real polling
- `src/screens/ReportView.tsx` — use template registry
- `src/App.tsx` — pass reportId to GeneratingView, handle onReady

**Modified — Worker**
- `worker/src/routes/reports.ts` — real generate endpoint with ctx.waitUntil()

---

## Task 1: Install Dependencies

**Files:** `package.json`, `worker/package.json`

- [ ] **Step 1: Install frontend deps**

```bash
cd "/Users/dsxiia/Claude code/3p-relatorios"
npm install zod papaparse
npm install -D @types/papaparse
```

Expected: `added N packages`

- [ ] **Step 2: Install worker deps**

```bash
cd "/Users/dsxiia/Claude code/3p-relatorios-worker"
npm install @anthropic-ai/sdk
```

Expected: `added N packages`

- [ ] **Step 3: Verify build still passes**

```bash
cd "/Users/dsxiia/Claude code/3p-relatorios"
npm run build
```

Expected: `✓ built in`

- [ ] **Step 4: Commit**

```bash
cd "/Users/dsxiia/Claude code/3p-relatorios"
git add package.json package-lock.json
git commit -m "feat: add zod + papaparse dependencies"
cd "/Users/dsxiia/Claude code/3p-relatorios-worker"
git add package.json package-lock.json
git commit -m "feat: add @anthropic-ai/sdk dependency"
```

---

## Task 2: Extend Types

**Files:** `src/lib/types.ts`

- [ ] **Step 1: Add template data types and update payload**

Replace the content of `src/lib/types.ts` with:

```typescript
/* ── CLIENT ───────────────────────────────────────────── */
export type ClientType = 'lead_gen' | 'franchise'

export interface FranchiseUnit {
  id: string
  client_id: string
  name: string
  meta_account_id: string | null
  sort_order: number
  created_at: string
}

export interface Client {
  id: string
  name: string
  type: ClientType
  description: string | null
  meta_account_id: string | null
  created_at: string
  // hydrated
  reports?: Report[]
  units?: FranchiseUnit[]
}

/* ── TEMPLATE DATA ────────────────────────────────────── */
export interface LeadGenCampaign {
  id: string
  name: string
  spend: number
  impressions: number
  clicks: number
  leads: number
  cpl: number
  cplPrevPeriod?: number
  topCreative?: { clicks: number; leads: number; cpl: number }
  annotation: string
}

export interface LeadGenData {
  client: string
  period: string
  investment: number
  totals: {
    reach: number
    impressions: number
    clicks: number
    leads: number
    cpl: number
  }
  campaigns: LeadGenCampaign[]
  todos3P: string[]
  todosClient: string[]
}

export interface FranchiseUnitData {
  id: string
  city: string
  impressions: number
  reach: number
  conversations: number
  cpc: number
  spend: number
  bestAd?: { clicks: number; messages: number; cpl: number }
  bestVideo?: { clicks: number; messages: number; cpl: number }
  annotation: string
}

export interface FranchiseData {
  client: string
  period: string
  units: FranchiseUnitData[]
  franchiseHistory: string[]
}

export type TemplateReportData = LeadGenData | FranchiseData

/* ── REPORT ───────────────────────────────────────────── */
export type ReportStatus = 'generating' | 'ready' | 'error'

export interface ReportUnit {
  id: string
  report_id: string
  unit_id: string
  unit_name: string
  raw_data: TemplateReportData | null
  edits: Record<string, string>
}

export interface Report {
  id: string
  client_id: string
  period_label: string
  period_start: string
  period_end: string
  status: ReportStatus
  pdf_key: string | null
  error_message: string | null
  raw_data: TemplateReportData | null
  edits: Record<string, string>
  created_at: string
  updated_at: string
  // hydrated
  units?: ReportUnit[]
}

/* ── META API ─────────────────────────────────────────── */
export interface MetaAction {
  action_type: string
  value: string
}

export interface MetaCampaignInsight {
  campaign_name: string
  reach: string
  impressions: string
  clicks: string
  spend: string
  actions?: MetaAction[]
  cost_per_action_type?: MetaAction[]
}

export interface MetaAdAccount {
  id: string
  name: string
  account_status: number
  currency: string
}

/* ── FORM ─────────────────────────────────────────────── */
export type DataSource = 'meta' | 'csv' | 'manual'

export interface GenerateReportPayload {
  client_id: string
  period_start: string
  period_end: string
  period_label: string
  source: DataSource
  csv_data?: string   // raw CSV string, only when source === 'csv'
  unit_ids?: string[]
}

/* ── APP STATE ────────────────────────────────────────── */
export type Screen = 'dashboard' | 'client' | 'form' | 'generating' | 'report'

export interface EditState {
  id: string
  active: boolean
  value: string
  start: () => void
  change: (v: string) => void
  save: () => void
}
```

- [ ] **Step 2: Verify build**

```bash
cd "/Users/dsxiia/Claude code/3p-relatorios"
npm run build 2>&1 | head -40
```

Fix any type errors before continuing.

- [ ] **Step 3: Commit**

```bash
cd "/Users/dsxiia/Claude code/3p-relatorios"
git add src/lib/types.ts
git commit -m "feat: add LeadGenData, FranchiseData, DataSource types"
```

---

## Task 3: Base Slide Components

**Files:** `src/components/slides/SlideShell.tsx`, `MetricGrid.tsx`, `EditableText.tsx`, `CreativeSpot.tsx`, `SlideLogo.tsx`

- [ ] **Step 1: Create SlideShell**

`src/components/slides/SlideShell.tsx`:
```tsx
interface SlideShellProps {
  children: React.ReactNode
  dark?: boolean
  style?: React.CSSProperties
}

export function SlideShell({ children, dark = false, style }: SlideShellProps) {
  return (
    <div style={{
      background: dark ? '#0f0f1a' : '#ffffff',
      borderRadius: 12,
      padding: '28px 32px',
      boxShadow: '0 2px 20px rgba(0,0,0,0.18)',
      color: dark ? '#e8e8e8' : '#1a1a2e',
      position: 'relative',
      overflow: 'hidden',
      ...style,
    }}>
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Create MetricGrid**

`src/components/slides/MetricGrid.tsx`:
```tsx
interface MetricItem {
  label: string
  value: string
  sub?: string
  accentColor?: string
}

interface MetricGridProps {
  metrics: MetricItem[]
  columns?: number
  dark?: boolean
}

export function MetricGrid({ metrics, columns = 3, dark = false }: MetricGridProps) {
  const textColor = dark ? '#e8e8e8' : '#1a1a2e'
  const mutedColor = dark ? '#888' : '#6b7280'
  const borderColor = dark ? '#2e2e50' : '#e5e7eb'

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: 12,
    }}>
      {metrics.map((m, i) => (
        <div key={i} style={{
          background: dark ? '#1a1a2e' : '#f9fafb',
          border: `1px solid ${m.accentColor ? m.accentColor + '44' : borderColor}`,
          borderRadius: 8,
          padding: '12px 14px',
        }}>
          <div style={{ fontSize: 10, color: mutedColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
            {m.label}
          </div>
          {m.sub && (
            <div style={{ fontSize: 9, color: mutedColor, marginBottom: 2 }}>{m.sub}</div>
          )}
          <div style={{ fontSize: 20, fontWeight: 800, color: m.accentColor ?? textColor, letterSpacing: '-0.5px' }}>
            {m.value}
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Create EditableText**

`src/components/slides/EditableText.tsx`:
```tsx
import type { EditState } from '../../lib/types'

interface EditableTextProps {
  e: EditState
  placeholder?: string
  dark?: boolean
  style?: React.CSSProperties
}

export function EditableText({ e, placeholder = 'Clique em ✏ para editar', dark = false, style }: EditableTextProps) {
  const bg = dark ? '#1a1a2e' : '#f9fafb'
  const border = dark ? '#2e2e50' : '#e5e7eb'
  const text = dark ? '#e8e8e8' : '#374151'
  const muted = dark ? '#666' : '#9ca3af'

  return (
    <div style={{ position: 'relative', ...style }}>
      {e.active ? (
        <div>
          <textarea
            value={e.value}
            onChange={ev => e.change(ev.target.value)}
            autoFocus
            style={{
              width: '100%',
              minHeight: 100,
              background: bg,
              border: `1.5px solid #8833ff`,
              borderRadius: 6,
              padding: '10px 12px',
              fontSize: 12,
              color: text,
              lineHeight: 1.7,
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={e.save}
            style={{
              marginTop: 6,
              background: '#8833ff',
              color: '#fff',
              border: 'none',
              borderRadius: 5,
              padding: '5px 14px',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ✓ Salvar
          </button>
        </div>
      ) : (
        <div
          style={{
            background: bg,
            border: `1px solid ${border}`,
            borderRadius: 6,
            padding: '10px 36px 10px 12px',
            fontSize: 12,
            color: e.value ? text : muted,
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
            minHeight: 44,
            cursor: 'text',
            position: 'relative',
          }}
          onClick={e.start}
        >
          {e.value || placeholder}
          <button
            onClick={ev => { ev.stopPropagation(); e.start() }}
            style={{
              position: 'absolute', top: 8, right: 8,
              background: 'none', border: 'none',
              cursor: 'pointer', fontSize: 13, color: muted,
              padding: 2,
            }}
          >
            ✏
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Create CreativeSpot**

`src/components/slides/CreativeSpot.tsx`:
```tsx
interface CreativeMetrics {
  clicks?: number
  leads?: number
  messages?: number
  cpl?: number
}

interface CreativeSpotProps {
  label: string
  metrics?: CreativeMetrics
  dark?: boolean
}

export function CreativeSpot({ label, metrics, dark = false }: CreativeSpotProps) {
  const border = dark ? '#2e2e50' : '#e5e7eb'
  const muted = dark ? '#666' : '#9ca3af'
  const text = dark ? '#ccc' : '#374151'

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      {/* Image placeholder */}
      <div style={{
        width: 72, height: 90, flexShrink: 0,
        background: dark ? '#1a1a2e' : '#f3f4f6',
        border: `1px dashed ${border}`,
        borderRadius: 6,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, color: muted,
      }}>
        🖼
      </div>
      {/* Metrics */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: muted, textTransform: 'uppercase', marginBottom: 6 }}>
          {label}
        </div>
        {metrics && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {metrics.clicks !== undefined && (
              <div style={{ fontSize: 11, color: text }}>
                <span style={{ color: muted }}>Cliques: </span>{metrics.clicks}
              </div>
            )}
            {metrics.leads !== undefined && (
              <div style={{ fontSize: 11, color: text }}>
                <span style={{ color: muted }}>Leads: </span>{metrics.leads}
              </div>
            )}
            {metrics.messages !== undefined && (
              <div style={{ fontSize: 11, color: text }}>
                <span style={{ color: muted }}>Msgs: </span>{metrics.messages}
              </div>
            )}
            {metrics.cpl !== undefined && (
              <div style={{ fontSize: 11, fontWeight: 700, color: '#8833ff' }}>
                CPL R$ {metrics.cpl.toFixed(2)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create SlideLogo**

`src/components/slides/SlideLogo.tsx`:
```tsx
interface SlideLogoProps {
  clientName: string
  dark?: boolean
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left'
}

export function SlideLogo({ clientName, dark = false, position = 'top-right' }: SlideLogoProps) {
  const posMap: Record<string, React.CSSProperties> = {
    'top-right':    { top: 20, right: 24 },
    'bottom-right': { bottom: 20, right: 24 },
    'top-left':     { top: 20, left: 24 },
    'bottom-left':  { bottom: 20, left: 24 },
  }
  const color = dark ? '#aaa' : '#6b7280'

  return (
    <div style={{
      position: 'absolute',
      ...posMap[position],
      fontSize: 11,
      fontWeight: 700,
      color,
      letterSpacing: '-0.2px',
    }}>
      {clientName} <span style={{ color: '#8833ff' }}>| 3P.</span>
    </div>
  )
}
```

- [ ] **Step 6: Verify build**

```bash
cd "/Users/dsxiia/Claude code/3p-relatorios"
npm run build 2>&1 | head -30
```

- [ ] **Step 7: Commit**

```bash
cd "/Users/dsxiia/Claude code/3p-relatorios"
git add src/components/slides/
git commit -m "feat: add base slide components (SlideShell, MetricGrid, EditableText, CreativeSpot, SlideLogo)"
```

---

## Task 4: Lead-Gen Schema & Mapper

**Files:** `src/templates/lead-gen/schema.ts`, `src/templates/lead-gen/mapper.ts`

- [ ] **Step 1: Create lead-gen schema**

`src/templates/lead-gen/schema.ts`:
```typescript
import { z } from 'zod'

export const topCreativeSchema = z.object({
  clicks: z.number(),
  leads: z.number(),
  cpl: z.number(),
})

export const leadGenCampaignSchema = z.object({
  id: z.string(),
  name: z.string(),
  spend: z.number(),
  impressions: z.number(),
  clicks: z.number(),
  leads: z.number(),
  cpl: z.number(),
  cplPrevPeriod: z.number().optional(),
  topCreative: topCreativeSchema.optional(),
  annotation: z.string().default(''),
})

export const leadGenDataSchema = z.object({
  client: z.string(),
  period: z.string(),
  investment: z.number(),
  totals: z.object({
    reach: z.number(),
    impressions: z.number(),
    clicks: z.number(),
    leads: z.number(),
    cpl: z.number(),
  }),
  campaigns: z.array(leadGenCampaignSchema),
  todos3P: z.array(z.string()).default([]),
  todosClient: z.array(z.string()).default([]),
})

export type LeadGenData = z.infer<typeof leadGenDataSchema>
```

- [ ] **Step 2: Create lead-gen mapper**

`src/templates/lead-gen/mapper.ts`:
```typescript
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

// CSV columns from Meta Ads export:
// Campaign name, Amount spent (BRL), Reach, Impressions, Link clicks, Leads, Results
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

      return {
        id: campaignId,
        name,
        spend,
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
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd "/Users/dsxiia/Claude code/3p-relatorios"
npm run build 2>&1 | head -30
```

- [ ] **Step 4: Commit**

```bash
cd "/Users/dsxiia/Claude code/3p-relatorios"
git add src/templates/lead-gen/schema.ts src/templates/lead-gen/mapper.ts
git commit -m "feat: lead-gen schema (Zod) and Meta+CSV mappers"
```

---

## Task 5: Lead-Gen Prompt & Slides

**Files:** `src/templates/lead-gen/prompt.ts`, `slides/Cover.tsx`, `slides/MetricsOverview.tsx`, `slides/CampaignSlide.tsx`, `slides/TodoSlide.tsx`

- [ ] **Step 1: Create Claude prompt**

`src/templates/lead-gen/prompt.ts`:
```typescript
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
```

- [ ] **Step 2: Create Cover slide**

`src/templates/lead-gen/slides/Cover.tsx`:
```tsx
import { SlideShell } from '../../../components/slides/SlideShell'
import { SlideLogo } from '../../../components/slides/SlideLogo'

interface CoverProps {
  clientName: string
  period: string
}

export function Cover({ clientName, period }: CoverProps) {
  return (
    <SlideShell dark style={{
      background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1040 60%, #2a1060 100%)',
      minHeight: 200,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }}>
      <SlideLogo clientName={clientName} dark position="top-right" />
      <div style={{ fontSize: 11, color: '#8833ff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 12 }}>
        Relatório de Performance
      </div>
      <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-1px', lineHeight: 1.1 }}>
        {clientName}
      </h1>
      <div style={{ fontSize: 14, color: '#888', marginTop: 10, fontWeight: 500 }}>
        {period}
      </div>
      {/* Decorative line */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
        background: 'linear-gradient(90deg, #8833ff, #5B18A8, transparent)',
      }} />
    </SlideShell>
  )
}
```

- [ ] **Step 3: Create MetricsOverview slide**

`src/templates/lead-gen/slides/MetricsOverview.tsx`:
```tsx
import { SlideShell } from '../../../components/slides/SlideShell'
import { MetricGrid } from '../../../components/slides/MetricGrid'
import { SlideLogo } from '../../../components/slides/SlideLogo'
import type { LeadGenData } from '../schema'

interface MetricsOverviewProps {
  data: LeadGenData
}

function fmtNum(n: number) {
  return n.toLocaleString('pt-BR')
}

function fmtBRL(n: number) {
  return `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function MetricsOverview({ data }: MetricsOverviewProps) {
  const metrics = [
    { label: 'Investimento', value: fmtBRL(data.investment), accentColor: '#8833ff' },
    { label: 'Alcance', value: fmtNum(data.totals.reach) },
    { label: 'Impressões', value: fmtNum(data.totals.impressions) },
    { label: 'Cliques', value: fmtNum(data.totals.clicks) },
    { label: 'Leads', value: fmtNum(data.totals.leads), accentColor: '#34d399' },
    { label: 'CPL Médio', value: fmtBRL(data.totals.cpl), accentColor: '#34d399' },
  ]

  return (
    <SlideShell>
      <SlideLogo clientName={data.client} position="top-right" />
      <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>
        Visão Geral — {data.period}
      </div>
      <MetricGrid metrics={metrics} columns={3} />
    </SlideShell>
  )
}
```

- [ ] **Step 4: Create CampaignSlide**

`src/templates/lead-gen/slides/CampaignSlide.tsx`:
```tsx
import { SlideShell } from '../../../components/slides/SlideShell'
import { MetricGrid } from '../../../components/slides/MetricGrid'
import { EditableText } from '../../../components/slides/EditableText'
import { CreativeSpot } from '../../../components/slides/CreativeSpot'
import { SlideLogo } from '../../../components/slides/SlideLogo'
import type { LeadGenCampaign } from '../../../lib/types'
import type { EditState } from '../../../lib/types'

interface CampaignSlideProps {
  campaign: LeadGenCampaign
  clientName: string
  e: EditState
}

function fmtBRL(n: number) {
  return `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function CampaignSlide({ campaign, clientName, e }: CampaignSlideProps) {
  const metrics = [
    { label: 'Investido', value: fmtBRL(campaign.spend) },
    { label: 'Impressões', value: campaign.impressions.toLocaleString('pt-BR') },
    { label: 'Leads', value: campaign.leads.toLocaleString('pt-BR'), accentColor: '#34d399' },
    { label: 'CPL', value: fmtBRL(campaign.cpl), accentColor: campaign.cpl < (campaign.cplPrevPeriod ?? campaign.cpl + 1) ? '#34d399' : '#f59e0b' },
    { label: 'CPL Anterior', value: campaign.cplPrevPeriod ? fmtBRL(campaign.cplPrevPeriod) : '—', sub: 'período anterior' },
    { label: 'Cliques', value: campaign.clicks.toLocaleString('pt-BR') },
  ]

  return (
    <SlideShell>
      <SlideLogo clientName={clientName} position="top-right" />

      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 10, color: '#8833ff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
          Campanha
        </div>
        <h2 style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.3px' }}>
          {campaign.name}
        </h2>
        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>ID: {campaign.id}</div>
      </div>

      {/* Layout: metrics left, creative right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 20, marginBottom: 16 }}>
        <div>
          <MetricGrid metrics={metrics} columns={3} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {campaign.topCreative && (
            <CreativeSpot
              label="Melhor Criativo"
              metrics={{
                clicks: campaign.topCreative.clicks,
                leads: campaign.topCreative.leads,
                cpl: campaign.topCreative.cpl,
              }}
            />
          )}
        </div>
      </div>

      {/* Annotation */}
      <div style={{ marginTop: 4 }}>
        <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
          Anotações
        </div>
        <EditableText e={e} placeholder="Claude vai gerar a análise desta campanha..." />
      </div>
    </SlideShell>
  )
}
```

- [ ] **Step 5: Create TodoSlide**

`src/templates/lead-gen/slides/TodoSlide.tsx`:
```tsx
import { SlideShell } from '../../../components/slides/SlideShell'
import { SlideLogo } from '../../../components/slides/SlideLogo'
import type { EditState } from '../../../lib/types'

interface TodoSlideProps {
  clientName: string
  todos3P: string[]
  todosClient: string[]
  e3P: EditState
  eClient: EditState
}

// The EditableText component handles its own read/edit toggle.
// defaultValue for e3P = todos3P.join('\n') — shows each todo on its own line.
// When editing active, user sees textarea; when not active, the text block shows with ✏ button.
// This is always editable regardless of whether Claude has already filled content.

export function TodoSlide({ clientName, todos3P, todosClient, e3P, eClient }: TodoSlideProps) {
  return (
    <SlideShell>
      <SlideLogo clientName={clientName} position="top-right" />

      <div style={{ fontSize: 11, color: '#8833ff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>
        To Do — Próximo Mês
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* 3P column */}
        <div>
          <div style={{
            display: 'inline-block', padding: '3px 10px', borderRadius: 20,
            background: 'rgba(136,51,255,0.12)', color: '#8833ff',
            fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', marginBottom: 10,
          }}>
            3P Marketing
          </div>
          {/* EditableText always shown — defaultValue is todos3P.join('\n').
              In read mode, lines render as bullet points via whiteSpace:pre-wrap.
              User can always click ✏ to edit. */}
          <EditableText e={e3P} placeholder="Claude vai gerar os to-dos da 3P..." />
        </div>

        {/* Client column */}
        <div>
          <div style={{
            display: 'inline-block', padding: '3px 10px', borderRadius: 20,
            background: 'rgba(52,211,153,0.12)', color: '#059669',
            fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', marginBottom: 10,
          }}>
            {clientName}
          </div>
          <EditableText e={eClient} placeholder="Claude vai gerar os to-dos do cliente..." />
        </div>
      </div>
    </SlideShell>
  )
}
```

- [ ] **Step 6: Create lead-gen config**

`src/templates/lead-gen/config.ts`:
```typescript
import type { TemplateConfig } from '../types'
import { leadGenDataSchema, type LeadGenData } from './schema'
import { metaMapper, csvMapper } from './mapper'
import { claudePrompt } from './prompt'
import { Cover } from './slides/Cover'
import { MetricsOverview } from './slides/MetricsOverview'
import { CampaignSlide } from './slides/CampaignSlide'
import { TodoSlide } from './slides/TodoSlide'
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
    const annotation3P = data.todos3P.join('\n')
    const annotationClient = data.todosClient.join('\n')

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
        e3P={mkEdit('todos-3p', annotation3P)}
        eClient={mkEdit('todos-client', annotationClient)}
      />,
    ]
  },
}
```

- [ ] **Step 7: Create template types file**

`src/templates/types.ts`:
```typescript
import type { ZodSchema } from 'zod'
import type { MetaCampaignInsight, ClientType, EditState } from '../lib/types'

export interface TemplateConfig<TData> {
  id: string
  name: string
  description: string
  clientType: ClientType
  dataSchema: ZodSchema<TData>
  metaMapper: (insights: MetaCampaignInsight[], clientName: string, period: string) => TData
  csvMapper: (rows: Record<string, string>[], clientName: string, period: string) => TData
  claudePrompt: (data: TData) => string
  renderSlides: (data: TData, mkEdit: (id: string, defaultValue: string) => EditState) => React.ReactNode[]
}
```

- [ ] **Step 8: Verify build**

```bash
cd "/Users/dsxiia/Claude code/3p-relatorios"
npm run build 2>&1 | head -40
```

Fix any TypeScript errors before committing.

- [ ] **Step 9: Commit**

```bash
cd "/Users/dsxiia/Claude code/3p-relatorios"
git add src/templates/lead-gen/ src/templates/types.ts
git commit -m "feat: lead-gen template (prompt, slides, config)"
```

---

## Task 6: Franquia Schema, Mapper, Slides & Config

**Files:** `src/templates/franquia/`

- [ ] **Step 1: Create franquia schema**

`src/templates/franquia/schema.ts`:
```typescript
import { z } from 'zod'

export const franchiseUnitDataSchema = z.object({
  id: z.string(),
  city: z.string(),
  impressions: z.number(),
  reach: z.number(),
  conversations: z.number(),
  cpc: z.number(),
  spend: z.number(),
  bestAd: z.object({ clicks: z.number(), messages: z.number(), cpl: z.number() }).optional(),
  bestVideo: z.object({ clicks: z.number(), messages: z.number(), cpl: z.number() }).optional(),
  annotation: z.string().default(''),
})

export const franchiseDataSchema = z.object({
  client: z.string(),
  period: z.string(),
  units: z.array(franchiseUnitDataSchema),
  franchiseHistory: z.array(z.string()).default([]),
})

export type FranchiseData = z.infer<typeof franchiseDataSchema>
```

- [ ] **Step 2: Create franquia mapper**

`src/templates/franquia/mapper.ts`:
```typescript
import type { MetaCampaignInsight } from '../../lib/types'
import type { FranchiseData } from './schema'

function getActionValue(actions: Array<{ action_type: string; value: string }> | undefined, type: string): number {
  const action = actions?.find(a => a.action_type === type)
  return action ? parseFloat(action.value) || 0 : 0
}

// For franchise, each insight = one unit (campaign name contains city or unit id)
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
    // City extracted from campaign name or fallback to index
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
```

- [ ] **Step 3: Create franquia prompt**

`src/templates/franquia/prompt.ts`:
```typescript
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
```

- [ ] **Step 4: Create franquia Cover slide**

`src/templates/franquia/slides/Cover.tsx`:
```tsx
import { SlideShell } from '../../../components/slides/SlideShell'
import { SlideLogo } from '../../../components/slides/SlideLogo'

interface CoverProps {
  clientName: string
  period: string
  unitCount: number
}

export function Cover({ clientName, period, unitCount }: CoverProps) {
  return (
    <SlideShell dark style={{
      background: 'linear-gradient(135deg, #0f0f1a 0%, #001830 60%, #003060 100%)',
      minHeight: 200,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }}>
      <SlideLogo clientName={clientName} dark position="top-right" />
      <div style={{ fontSize: 11, color: '#34d399', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 12 }}>
        Relatório de Performance — Franquia
      </div>
      <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-1px', lineHeight: 1.1 }}>
        {clientName}
      </h1>
      <div style={{ display: 'flex', gap: 16, marginTop: 12, alignItems: 'center' }}>
        <div style={{ fontSize: 14, color: '#888', fontWeight: 500 }}>{period}</div>
        <div style={{
          padding: '3px 10px', borderRadius: 20,
          background: 'rgba(52,211,153,0.15)', color: '#34d399',
          fontSize: 11, fontWeight: 700,
        }}>
          {unitCount} unidades
        </div>
      </div>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
        background: 'linear-gradient(90deg, #34d399, #0891b2, transparent)',
      }} />
    </SlideShell>
  )
}
```

- [ ] **Step 5: Create UnitSlide**

`src/templates/franquia/slides/UnitSlide.tsx`:
```tsx
import { SlideShell } from '../../../components/slides/SlideShell'
import { MetricGrid } from '../../../components/slides/MetricGrid'
import { EditableText } from '../../../components/slides/EditableText'
import { CreativeSpot } from '../../../components/slides/CreativeSpot'
import { SlideLogo } from '../../../components/slides/SlideLogo'
import type { FranchiseUnitData, EditState } from '../../../lib/types'

interface UnitSlideProps {
  unit: FranchiseUnitData
  clientName: string
  e: EditState
}

function fmtBRL(n: number) {
  return `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function UnitSlide({ unit, clientName, e }: UnitSlideProps) {
  const metrics = [
    { label: 'Impressões', value: unit.impressions.toLocaleString('pt-BR') },
    { label: 'Alcance', value: unit.reach.toLocaleString('pt-BR') },
    { label: 'Conversas', value: unit.conversations.toLocaleString('pt-BR'), accentColor: '#34d399' },
    { label: 'CPC', value: fmtBRL(unit.cpc), accentColor: '#34d399' },
    { label: 'Investimento', value: fmtBRL(unit.spend), accentColor: '#8833ff' },
  ]

  return (
    <SlideShell>
      <SlideLogo clientName={clientName} position="top-right" />

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 10, color: '#0891b2', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
          Unidade
        </div>
        <h2 style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.3px' }}>
          {unit.city}
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 20, marginBottom: 16 }}>
        <div>
          <MetricGrid metrics={metrics} columns={3} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {unit.bestAd && (
            <CreativeSpot
              label="Melhor AD"
              metrics={{ clicks: unit.bestAd.clicks, messages: unit.bestAd.messages, cpl: unit.bestAd.cpl }}
            />
          )}
          {unit.bestVideo && (
            <CreativeSpot
              label="Melhor VID"
              metrics={{ clicks: unit.bestVideo.clicks, messages: unit.bestVideo.messages, cpl: unit.bestVideo.cpl }}
            />
          )}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
          Anotações
        </div>
        <EditableText e={e} placeholder="Claude vai gerar a análise desta unidade..." />
      </div>
    </SlideShell>
  )
}
```

- [ ] **Step 6: Create FranqueadoraSlide**

`src/templates/franquia/slides/FranqueadoraSlide.tsx`:
```tsx
import { SlideShell } from '../../../components/slides/SlideShell'
import { SlideLogo } from '../../../components/slides/SlideLogo'
import { EditableText } from '../../../components/slides/EditableText'
import type { EditState } from '../../../lib/types'

interface FranqueadoraSlideProps {
  clientName: string
  period: string
  franchiseHistory: string[]
  eHistory: EditState
}

export function FranqueadoraSlide({ clientName, period, franchiseHistory, eHistory }: FranqueadoraSlideProps) {
  return (
    <SlideShell dark style={{
      background: 'linear-gradient(135deg, #0f0f1a 0%, #001830 100%)',
    }}>
      <SlideLogo clientName={clientName} dark position="top-right" />

      <div style={{ fontSize: 11, color: '#34d399', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>
        Histórico de Otimizações — {period}
      </div>

      {franchiseHistory.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {franchiseHistory.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(52,211,153,0.15)', border: '1px solid #34d39944',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, color: '#34d399',
              }}>
                {i + 1}
              </div>
              <p style={{ fontSize: 13, color: '#e8e8e8', lineHeight: 1.6, margin: 0 }}>{item}</p>
            </div>
          ))}
        </div>
      ) : (
        <EditableText
          e={eHistory}
          dark
          placeholder="Claude vai gerar o histórico de otimizações da rede..."
        />
      )}
    </SlideShell>
  )
}
```

- [ ] **Step 7: Create franquia config**

`src/templates/franquia/config.ts`:
```typescript
import type { TemplateConfig } from '../types'
import { franchiseDataSchema, type FranchiseData } from './schema'
import { metaMapper, csvMapper } from './mapper'
import { claudePrompt } from './prompt'
import { Cover } from './slides/Cover'
import { UnitSlide } from './slides/UnitSlide'
import { FranqueadoraSlide } from './slides/FranqueadoraSlide'
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
    const historyDefault = data.franchiseHistory.join('\n')

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
        eHistory={mkEdit('franchise-history', historyDefault)}
      />,
    ]
  },
}
```

- [ ] **Step 8: Create template registry**

`src/templates/index.ts`:
```typescript
import { leadGenConfig } from './lead-gen/config'
import { franquiaConfig } from './franquia/config'
import type { TemplateConfig } from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TEMPLATES: Record<string, TemplateConfig<any>> = {
  'lead-gen': leadGenConfig,
  'franquia': franquiaConfig,
}

export function getTemplateForClientType(clientType: 'lead_gen' | 'franchise') {
  return clientType === 'lead_gen' ? TEMPLATES['lead-gen'] : TEMPLATES['franquia']
}
```

- [ ] **Step 9: Verify build**

```bash
cd "/Users/dsxiia/Claude code/3p-relatorios"
npm run build 2>&1 | head -50
```

Fix all TypeScript errors before continuing.

- [ ] **Step 10: Commit**

```bash
cd "/Users/dsxiia/Claude code/3p-relatorios"
git add src/templates/
git commit -m "feat: franquia template + registry (schema, mapper, prompt, slides, config)"
```

---

## Task 7: CSV Parser Utility

**Files:** `src/lib/csvParser.ts`

- [ ] **Step 1: Create csvParser**

`src/lib/csvParser.ts`:
```typescript
import Papa from 'papaparse'

export function parseCsvFile(file: File): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data)
      },
      error: (error) => {
        reject(new Error(`CSV parse error: ${error.message}`))
      },
    })
  })
}

export function parseCsvString(content: string): Record<string, string>[] {
  const result = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
  })
  return result.data
}
```

- [ ] **Step 2: Verify build**

```bash
cd "/Users/dsxiia/Claude code/3p-relatorios"
npm run build 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
cd "/Users/dsxiia/Claude code/3p-relatorios"
git add src/lib/csvParser.ts
git commit -m "feat: CSV parser utility using papaparse"
```

---

## Task 8: Update FormView — CSV Upload + Source Selector

**Files:** `src/screens/FormView.tsx`

- [ ] **Step 1: Replace FormView.tsx**

Replace entire content of `src/screens/FormView.tsx`:

```tsx
import { useState, useRef } from 'react'
import type { Client, Screen, DataSource } from '../lib/types'
import { apiReports } from '../lib/api'
import { parseCsvFile } from '../lib/csvParser'
import { T } from '../styles/tokens'

const PERIOD_OPTIONS = [
  { label: 'Maio / 2026',     start: '2026-05-01', end: '2026-05-31' },
  { label: 'Abril / 2026',    start: '2026-04-01', end: '2026-04-30' },
  { label: 'Março / 2026',    start: '2026-03-01', end: '2026-03-31' },
  { label: 'Fevereiro / 2026',start: '2026-02-01', end: '2026-02-28' },
]

interface FormViewProps {
  client: Client
  onNavigate: (screen: Screen, client?: Client) => void
  onGenerate: (reportId: string) => void
  showToast?: (msg: string) => void
}

export function FormView({ client, onNavigate, onGenerate, showToast }: FormViewProps) {
  const [periodIdx, setPeriodIdx] = useState(0)
  const [src, setSrc] = useState<DataSource>('meta')
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [selectedUnits, setSelectedUnits] = useState<string[]>(
    client.units?.map(u => u.id) ?? []
  )
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isFranchise = client.type === 'franchise'

  const defaultUnitNames = ['Campinas', 'Curitiba', 'Florianópolis', 'Londrina', 'Maringá', 'Ribeirão Preto']
  const unitItems = client.units && client.units.length > 0
    ? client.units.map(u => ({ id: u.id, name: u.name }))
    : defaultUnitNames.map((n, i) => ({ id: `unit-${i}`, name: n }))

  const toggleUnit = (id: string) => {
    setSelectedUnits(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      showToast?.('Arquivo deve ser .csv')
      return
    }
    setCsvFile(file)
  }

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const period = PERIOD_OPTIONS[periodIdx]

      let csvData: string | undefined
      if (src === 'csv' && csvFile) {
        const rows = await parseCsvFile(csvFile)
        // Pass CSV as JSON string to worker (worker will re-process)
        csvData = JSON.stringify(rows)
      }

      const result = await apiReports.generate({
        client_id: client.id,
        period_start: period.start,
        period_end: period.end,
        period_label: period.label,
        source: src,
        csv_data: csvData,
        unit_ids: isFranchise ? selectedUnits : undefined,
      })

      const reportId = (result as { id: string }).id
      onGenerate(reportId)
    } catch (err) {
      showToast?.('Erro ao iniciar geração. Verifique a conexão.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const canGenerate = src !== 'csv' || csvFile !== null
  const btnLabel = loading
    ? 'Iniciando...'
    : isFranchise
    ? `Gerar ${selectedUnits.length} relatórios →`
    : 'Gerar relatório →'

  return (
    <div style={{ padding: '38px 42px', maxWidth: 560, animation: 'fadein 0.25s ease' }}>
      <button
        onClick={() => onNavigate('client', client)}
        className="btn-ghost"
        style={{ marginBottom: 24, fontSize: 13 }}
      >
        ← Voltar
      </button>

      <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.3px', color: T.text, marginBottom: 6 }}>
        Novo relatório
      </h1>
      <p style={{ color: T.muted, fontSize: 13, marginBottom: 32 }}>
        {client.name} · {client.type === 'franchise' ? 'Franquia' : 'Lead Gen — B2B'}
      </p>

      {/* Período */}
      <FormField label="Período">
        <select
          value={periodIdx}
          onChange={e => setPeriodIdx(Number(e.target.value))}
          className="input"
          style={{ cursor: 'pointer' }}
        >
          {PERIOD_OPTIONS.map((p, i) => (
            <option key={p.label} value={i}>{p.label}</option>
          ))}
        </select>
      </FormField>

      {/* Origem dos dados */}
      <FormField label="Origem dos dados">
        {([
          ['meta',   'Meta API',  'Puxa dados automaticamente do Ads Manager'],
          ['csv',    'CSV Upload', 'Importar planilha exportada do Meta Ads'],
          ['manual', 'Manual',    'Relatório em branco — preencher depois'],
        ] as const).map(([id, label, desc]) => (
          <div
            key={id}
            onClick={() => setSrc(id)}
            style={{
              background: T.surface,
              border: src === id ? `1.5px solid ${T.brand}` : `0.5px solid ${T.border}`,
              borderRadius: 9, padding: '11px 13px', cursor: 'pointer',
              marginBottom: 7, display: 'flex', gap: 11, alignItems: 'center',
              transition: 'border-color 0.15s',
            }}
          >
            <div style={{
              width: 15, height: 15, borderRadius: '50%', flexShrink: 0, marginTop: 1,
              border: src === id ? `5px solid ${T.brand}` : `2px solid ${T.border}`,
            }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{label}</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{desc}</div>
            </div>
          </div>
        ))}
      </FormField>

      {/* CSV Dropzone */}
      {src === 'csv' && (
        <FormField label="Arquivo CSV">
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => {
              e.preventDefault()
              setDragOver(false)
              const file = e.dataTransfer.files[0]
              if (file) handleFileSelect(file)
            }}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `1.5px dashed ${dragOver ? T.brand : csvFile ? '#34d399' : T.border}`,
              borderRadius: 9, padding: '18px 14px',
              textAlign: 'center', cursor: 'pointer',
              background: dragOver ? `${T.brand}11` : T.surface,
              transition: 'all 0.15s',
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 6 }}>{csvFile ? '✅' : '📄'}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: csvFile ? '#34d399' : T.text }}>
              {csvFile ? csvFile.name : 'Arraste o CSV aqui ou clique para selecionar'}
            </div>
            <div style={{ fontSize: 10, color: T.muted, marginTop: 4 }}>
              Export do Meta Ads Manager — colunas: Campaign name, Amount spent, Reach, Impressions, Leads
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) handleFileSelect(file)
            }}
          />
          {csvFile && (
            <button
              onClick={() => setCsvFile(null)}
              style={{ marginTop: 6, background: 'none', border: 'none', color: T.muted, fontSize: 11, cursor: 'pointer' }}
            >
              × Remover arquivo
            </button>
          )}
        </FormField>
      )}

      {/* Units (franchise only) */}
      {isFranchise && (
        <FormField label={`Unidades (${selectedUnits.length} selecionadas)`}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
            {unitItems.map(u => {
              const on = selectedUnits.includes(u.id)
              return (
                <div
                  key={u.id}
                  onClick={() => toggleUnit(u.id)}
                  style={{
                    background: T.surface,
                    border: on ? `0.5px solid ${T.brandBorder}` : `0.5px solid ${T.border}`,
                    borderRadius: 8, padding: '8px 11px',
                    display: 'flex', gap: 8, alignItems: 'center',
                    cursor: 'pointer', transition: 'border-color 0.15s',
                  }}
                >
                  <div style={{
                    width: 12, height: 12,
                    background: on ? T.brand : T.surface2,
                    border: on ? 'none' : `0.5px solid ${T.border}`,
                    borderRadius: 3, flexShrink: 0, transition: 'background 0.15s',
                  }} />
                  <span style={{ fontSize: 12, color: on ? T.text : T.muted }}>{u.name}</span>
                </div>
              )
            })}
          </div>
        </FormField>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading || !canGenerate}
        style={{
          width: '100%',
          background: (loading || !canGenerate) ? T.surface2 : `linear-gradient(135deg,#5B18A8,${T.brand})`,
          color: (loading || !canGenerate) ? T.muted : '#fff',
          border: 'none', borderRadius: 9, padding: '13px',
          fontSize: 14, fontWeight: 700,
          cursor: (loading || !canGenerate) ? 'not-allowed' : 'pointer',
          marginTop: 6, letterSpacing: '-0.2px', transition: 'opacity 0.15s',
        }}
      >
        {btnLabel}
      </button>
    </div>
  )
}

interface FormFieldProps {
  label: string
  children: React.ReactNode
}

function FormField({ label, children }: FormFieldProps) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label className="field-label">{label}</label>
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Update api.ts generate function signature**

The `apiReports.generate` function needs to accept the updated `GenerateReportPayload`. Open `src/lib/api.ts` and verify the `generate` function passes the full payload to the worker. It should already work if it just does `JSON.stringify(payload)` in the body. Confirm it does — if not, update it to:

```typescript
generate: async (payload: GenerateReportPayload) => {
  const res = await fetchApi('/api/reports/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return res.json()
},
```

- [ ] **Step 3: Verify build**

```bash
cd "/Users/dsxiia/Claude code/3p-relatorios"
npm run build 2>&1 | head -40
```

- [ ] **Step 4: Commit**

```bash
cd "/Users/dsxiia/Claude code/3p-relatorios"
git add src/screens/FormView.tsx src/lib/api.ts
git commit -m "feat: FormView — CSV upload dropzone + 3 data sources"
```

---

## Task 9: Update GeneratingView + App.tsx (Real Polling)

**Files:** `src/screens/GeneratingView.tsx`, `src/App.tsx`

- [ ] **Step 1: Replace GeneratingView.tsx**

```tsx
import { useEffect, useState } from 'react'
import type { Client, Report } from '../lib/types'
import { apiReports } from '../lib/api'
import { T } from '../styles/tokens'

const STEPS = [
  { label: 'Conectando na Meta API', key: 'connecting' },
  { label: 'Buscando dados de campanhas', key: 'fetching' },
  { label: 'Claude gerando análise e insights', key: 'claude' },
  { label: 'Relatório pronto', key: 'done' },
]

const POLL_INTERVAL_MS = 2000
const POLL_TIMEOUT_MS = 5 * 60 * 1000 // 5 minutes

interface GeneratingViewProps {
  reportId: string
  client: Client | null
  onReady: (report: Report) => void
  onError: (msg: string) => void
}

export function GeneratingView({ reportId, client, onReady, onError }: GeneratingViewProps) {
  const [step, setStep] = useState(0)
  const isFranchise = client?.type === 'franchise'

  useEffect(() => {
    // Animate step progression independently of polling
    const stepTimers = [
      setTimeout(() => setStep(1), 800),
      setTimeout(() => setStep(2), 2400),
    ]

    let elapsed = 0
    const poll = setInterval(async () => {
      elapsed += POLL_INTERVAL_MS
      if (elapsed > POLL_TIMEOUT_MS) {
        clearInterval(poll)
        onError('Tempo limite excedido. Tente novamente.')
        return
      }

      try {
        const report = await apiReports.get(reportId) as Report
        if (report.status === 'ready') {
          clearInterval(poll)
          setStep(3)
          setTimeout(() => onReady(report), 600)
        } else if (report.status === 'error') {
          clearInterval(poll)
          onError(report.error_message ?? 'Erro na geração do relatório.')
        }
      } catch {
        // Network error — keep polling
      }
    }, POLL_INTERVAL_MS)

    return () => {
      stepTimers.forEach(clearTimeout)
      clearInterval(poll)
    }
  }, [reportId, onReady, onError])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 40, animation: 'fadein 0.2s ease',
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: '50%',
        border: `2px solid ${T.brand}`, borderTopColor: 'transparent',
        animation: 'spin 0.8s linear infinite', marginBottom: 26,
      }} />

      <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 5, color: T.text }}>
        Gerando relatório{isFranchise ? 's' : ''}...
      </h2>
      <p style={{ color: T.muted, fontSize: 12, marginBottom: 34 }}>
        {client?.name ?? ''}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280 }}>
        {STEPS.map((s, i) => {
          const done = i < step
          const current = i === step
          return (
            <div key={s.key} style={{ display: 'flex', gap: 11, alignItems: 'center' }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                background: done ? T.brand : current ? T.brandDim : T.surface,
                border: current ? `1px solid ${T.brandBorder}` : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, color: '#fff', transition: 'background 0.3s',
                animation: current ? 'pulse 1s ease infinite' : 'none',
              }}>
                {done ? '✓' : ''}
              </div>
              <span style={{
                fontSize: 12, transition: 'color 0.3s',
                color: done ? T.text : current ? T.muted : T.hint,
              }}>
                {s.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update App.tsx**

Replace `src/App.tsx`:

```tsx
import { useState } from 'react'
import type { Screen, Client, Report } from './lib/types'
import { Sidebar } from './components/Sidebar'
import { Toast } from './components/Toast'
import { Dashboard } from './screens/Dashboard'
import { ClientView } from './screens/ClientView'
import { FormView } from './screens/FormView'
import { GeneratingView } from './screens/GeneratingView'
import { ReportView } from './screens/ReportView'
import './styles/global.css'

export default function App() {
  const [screen, setScreen] = useState<Screen>('dashboard')
  const [client, setClient] = useState<Client | null>(null)
  const [report, setReport] = useState<Report | null>(null)
  const [reportId, setReportId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2800)
  }

  const navigate = (sc: Screen, cl?: Client) => {
    setScreen(sc)
    if (cl !== undefined) setClient(cl)
  }

  const startGeneration = (id: string) => {
    setReportId(id)
    setScreen('generating')
  }

  const handleReportReady = (r: Report) => {
    setReport(r)
    setScreen('report')
  }

  const showSidebar = ['dashboard', 'client', 'form'].includes(screen)

  return (
    <div className="app-layout">
      {showSidebar && (
        <Sidebar
          screen={screen}
          onNavigate={sc => {
            if (sc === 'dashboard') { setClient(null); setReport(null) }
            setScreen(sc)
          }}
        />
      )}

      <main key={screen} className="main-content">
        {screen === 'dashboard' && (
          <Dashboard onSelectClient={setClient} onNavigate={navigate} />
        )}

        {screen === 'client' && client && (
          <ClientView
            client={client}
            onNavigate={navigate}
            onSelectReport={setReport}
            showToast={showToast}
          />
        )}

        {screen === 'form' && client && (
          <FormView
            client={client}
            onNavigate={navigate}
            onGenerate={startGeneration}
            showToast={showToast}
          />
        )}

        {screen === 'generating' && reportId && (
          <GeneratingView
            reportId={reportId}
            client={client}
            onReady={handleReportReady}
            onError={(msg) => { showToast(msg); setScreen('form') }}
          />
        )}

        {screen === 'report' && client && (
          <ReportView
            client={client}
            report={report}
            onNavigate={navigate}
            showToast={showToast}
          />
        )}
      </main>

      {toast && <Toast message={toast} />}
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
cd "/Users/dsxiia/Claude code/3p-relatorios"
npm run build 2>&1 | head -40
```

- [ ] **Step 4: Commit**

```bash
cd "/Users/dsxiia/Claude code/3p-relatorios"
git add src/screens/GeneratingView.tsx src/App.tsx
git commit -m "feat: GeneratingView polls API, App.tsx wires real report flow"
```

---

## Task 10: Update ReportView — Template Registry

**Files:** `src/screens/ReportView.tsx`

- [ ] **Step 1: Replace ReportView.tsx**

```tsx
import { useState } from 'react'
import type { Client, Report, Screen, EditState } from '../lib/types'
import { T } from '../styles/tokens'
import { apiReports } from '../lib/api'
import { getTemplateForClientType } from '../templates/index'
import { MOCK_RIZON, MOCK_FOLKS } from '../lib/mockData'

interface ReportViewProps {
  client: Client
  report: Report | null
  onNavigate: (screen: Screen, client?: Client) => void
  showToast: (msg: string) => void
}

export function ReportView({ client, report, onNavigate, showToast }: ReportViewProps) {
  const [editing, setEditing] = useState<string | null>(null)
  const [edits, setEdits] = useState<Record<string, string>>(report?.edits ?? {})
  const [_saving, setSaving] = useState(false)

  const template = getTemplateForClientType(client.type)

  // Resolve report data: real raw_data > mock fallback
  const resolveData = () => {
    if (report?.raw_data) return report.raw_data

    // Fallback to mock data for dev/preview
    if (client.type === 'lead_gen') {
      const { MOCK_RIZON: r } = { MOCK_RIZON }
      return {
        client: client.name,
        period: '01/03 - 31/03',
        investment: parseFloat(r.investment.replace('.', '').replace(',', '.')),
        totals: {
          reach: parseInt(r.alcance.replace('.', '')),
          impressions: parseInt(r.impressoes.replace('.', '')),
          clicks: parseInt(r.cliques.replace('.', '')),
          leads: parseInt(r.leads.replace('.', '')),
          cpl: parseFloat(r.cpl.replace(',', '.')),
        },
        campaigns: r.vendedores.map(v => ({
          id: v.id,
          name: `Vendedor ${v.id}`,
          spend: parseFloat(v.inv.replace('R$', '').replace('.', '').replace(',', '.')),
          impressions: parseInt(v.impressoes.replace('.', '')),
          clicks: parseInt(v.cliques.replace('.', '')),
          leads: parseInt(v.leads.replace('.', '')),
          cpl: parseFloat(v.cpl.replace('R$', '').replace(',', '.').trim()),
          cplPrevPeriod: parseFloat(v.cplPrev.replace('FEV - R$', '').replace(',', '.').trim()),
          topCreative: { clicks: parseInt(v.cliques), leads: parseInt(v.leadsTop), cpl: parseFloat(v.cplTop.replace('R$', '').replace(',', '.').trim()) },
          annotation: edits[`campaign-${v.id}-annotation`] ?? v.anotacoes,
        })),
        todos3P: r.todos3P,
        todosClient: r.todosCliente,
      }
    } else {
      const { MOCK_FOLKS: f } = { MOCK_FOLKS }
      return {
        client: client.name,
        period: '01/03 - 31/03',
        units: f.units.map((u, i) => ({
          id: `unit-${i}`,
          city: u.city,
          impressions: parseInt(u.impressoes.replace('.', '')),
          reach: parseInt(u.alcance.replace('.', '')),
          conversations: parseInt(u.conversas.replace('.', '')),
          cpc: parseFloat(u.cpc.replace('R$', '').replace(',', '.').trim()),
          spend: parseFloat(u.valor.replace('R$', '').replace('.', '').replace(',', '.')),
          bestAd: { clicks: parseInt(u.adCliques), messages: parseInt(u.adMsg), cpl: parseFloat(u.adCpl.replace('R$', '').replace(',', '.').trim()) },
          bestVideo: { clicks: parseInt(u.vidCliques), messages: parseInt(u.vidMsg), cpl: parseFloat(u.vidCpl.replace('R$', '').replace(',', '.').trim()) },
          annotation: edits[`unit-unit-${i}-annotation`] ?? u.anotacoes,
        })),
        franchiseHistory: [],
      }
    }
  }

  const data = resolveData()
  const periodLabel = report?.period_label ?? 'Março / 2026'

  const mkEdit = (id: string, defaultValue: string): EditState => ({
    id,
    active: editing === id,
    value: edits[id] !== undefined ? edits[id] : defaultValue,
    start: () => {
      setEditing(id)
      if (edits[id] === undefined) {
        setEdits(prev => ({ ...prev, [id]: defaultValue }))
      }
    },
    change: (v: string) => setEdits(prev => ({ ...prev, [id]: v })),
    save: async () => {
      setSaving(true)
      setEditing(null)
      if (report) {
        try {
          await apiReports.saveEdit(report.id, id, edits[id] ?? defaultValue)
          showToast('✓ Alteração salva')
        } catch {
          showToast('✓ Salvo localmente')
        }
      } else {
        showToast('✓ Alteração salva')
      }
      setSaving(false)
    },
  })

  const slides = template.renderSlides(data, mkEdit)

  return (
    <div style={{ padding: '22px 22px 60px', animation: 'fadein 0.2s ease' }}>
      {/* Topbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => onNavigate('client', client)}
            style={{ background: 'none', border: 'none', color: T.muted, fontSize: 18, cursor: 'pointer', lineHeight: 1 }}
          >
            ←
          </button>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
              {client.name} — {periodLabel}
            </div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>
              Clique em ✏ nos blocos de texto para editar
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 7 }}>
          <button className="btn-ghost" onClick={() => showToast('Compartilhamento disponível em breve')}>
            Compartilhar
          </button>
          <button
            className="btn-primary"
            style={{ fontSize: 12 }}
            onClick={() => showToast('PDF via Cloudflare Browser Rendering — disponível em breve')}
          >
            ↓ Exportar PDF
          </button>
        </div>
      </div>

      {/* Slides */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {slides}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
cd "/Users/dsxiia/Claude code/3p-relatorios"
npm run build 2>&1 | head -50
```

- [ ] **Step 3: Run dev server and visually verify both templates render**

```bash
cd "/Users/dsxiia/Claude code/3p-relatorios"
npm run dev
```

Open http://localhost:5173, navigate to a lead_gen client → report, verify slides render. Then a franchise client → report.

- [ ] **Step 4: Commit**

```bash
cd "/Users/dsxiia/Claude code/3p-relatorios"
git add src/screens/ReportView.tsx
git commit -m "feat: ReportView uses template registry (config-driven slides)"
```

---

## Task 11: Worker — Claude Service

**Files:** `worker/src/services/claudeService.ts`

- [ ] **Step 1: Create claudeService.ts**

Note: the worker is a separate package from the frontend — do NOT import from `../../../src/`. Define all types inline.

```typescript
import Anthropic from '@anthropic-ai/sdk'

type Env = {
  ANTHROPIC_API_KEY: string
}

// Inline types (mirrors frontend LeadGenData — keep in sync)
interface LeadGenDataForClaude {
  client: string
  period: string
  investment: number
  totals: { leads: number; cpl: number }
  campaigns: Array<{ id: string; name: string; spend: number; impressions: number; clicks: number; leads: number; cpl: number; cplPrevPeriod?: number }>
  todos3P: string[]
  todosClient: string[]
}

export interface ClaudeLeadGenResult {
  campaigns: Array<{ id: string; annotation: string }>
  todos3P: string[]
  todosClient: string[]
}

export interface ClaudeFranchiseResult {
  units: Array<{ id: string; annotation: string }>
  franchiseHistory: string[]
}

export async function generateLeadGenAnalysis(
  data: LeadGenDataForClaude,
  env: Env,
): Promise<ClaudeLeadGenResult> {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })

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

  const prompt = `Você é analista de mídia paga da 3P Marketing.
Dados do relatório de ${data.client} — período ${data.period}:

Resumo: investimento R$${data.investment.toFixed(2)}, ${data.totals.leads} leads, CPL médio R$${data.totals.cpl.toFixed(2)}

Campanhas:
${JSON.stringify(campaignSummary, null, 2)}

Retorne SOMENTE JSON válido (sem markdown) com:
{
  "campaigns": [{ "id": "<id>", "annotation": "<2-4 parágrafos PT-BR, tom direto: performance, comparação anterior, próxima ação>" }],
  "todos3P": ["<3-5 ações que a 3P deve executar>"],
  "todosClient": ["<1-3 ações que o cliente deve executar>"]
}`

  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
  const result = JSON.parse(text) as ClaudeLeadGenResult
  return result
}

export interface FranchiseDataForClaude {
  client: string
  period: string
  units: Array<{
    id: string; city: string; spend: number
    impressions: number; reach: number
    conversations: number; cpc: number
  }>
}

export async function generateFranchiseAnalysis(
  data: FranchiseDataForClaude,
  env: Env,
): Promise<ClaudeFranchiseResult> {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })

  const unitSummary = data.units.map(u => ({
    id: u.id,
    city: u.city,
    spend: u.spend.toFixed(2),
    impressions: u.impressions,
    reach: u.reach,
    conversations: u.conversations,
    cpc: u.cpc.toFixed(2),
  }))

  const prompt = `Você é analista de mídia paga da 3P Marketing.
Dados de ${data.client} — ${data.units.length} unidades — período ${data.period}:

${JSON.stringify(unitSummary, null, 2)}

Retorne SOMENTE JSON válido (sem markdown) com:
{
  "units": [{ "id": "<id>", "annotation": "<2-3 parágrafos PT-BR: conversas, CPC, criativos, próxima ação>" }],
  "franchiseHistory": ["<3-5 otimizações estratégicas do período para toda a rede>"]
}`

  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
  return JSON.parse(text) as ClaudeFranchiseResult
}
```

- [ ] **Step 2: Verify TypeScript in worker**

```bash
cd "/Users/dsxiia/Claude code/3p-relatorios-worker"
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
cd "/Users/dsxiia/Claude code/3p-relatorios-worker"
git add src/services/claudeService.ts
git commit -m "feat: claudeService — generates lead-gen and franchise analysis via Claude API"
```

---

## Task 12: Worker — Meta Service

**Files:** `worker/src/services/metaService.ts`

- [ ] **Step 1: Create metaService.ts**

```typescript
export interface MetaCampaignInsight {
  campaign_name: string
  reach: string
  impressions: string
  clicks: string
  spend: string
  actions?: Array<{ action_type: string; value: string }>
  cost_per_action_type?: Array<{ action_type: string; value: string }>
}

interface MetaApiResponse {
  data: MetaCampaignInsight[]
  paging?: { cursors: { before: string; after: string }; next?: string }
}

export async function fetchCampaignInsights(
  accountId: string,
  dateStart: string,
  dateEnd: string,
  token: string,
): Promise<MetaCampaignInsight[]> {
  const fields = 'campaign_name,reach,impressions,clicks,spend,actions,cost_per_action_type'
  const url = new URL(`https://graph.facebook.com/v21.0/act_${accountId}/insights`)
  url.searchParams.set('fields', fields)
  url.searchParams.set('time_range', JSON.stringify({ since: dateStart, until: dateEnd }))
  url.searchParams.set('level', 'campaign')
  url.searchParams.set('limit', '100')
  url.searchParams.set('access_token', token)

  const res = await fetch(url.toString())
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Meta API error ${res.status}: ${err}`)
  }

  const json = await res.json() as MetaApiResponse
  return json.data ?? []
}
```

- [ ] **Step 2: Commit**

```bash
cd "/Users/dsxiia/Claude code/3p-relatorios-worker"
git add src/services/metaService.ts
git commit -m "feat: metaService — fetches campaign insights from Meta Graph API v21"
```

---

## Task 13: Worker — CSV Service

**Files:** `worker/src/services/csvService.ts`

- [ ] **Step 1: Create csvService.ts**

The frontend already parses the CSV with papaparse and sends the rows as a JSON string. The worker just parses that JSON back.

```typescript
export interface CsvRow {
  [key: string]: string
}

export function parseCsvRows(csvDataJson: string): CsvRow[] {
  try {
    const rows = JSON.parse(csvDataJson) as CsvRow[]
    if (!Array.isArray(rows)) throw new Error('Expected array')
    return rows
  } catch (e) {
    throw new Error(`Invalid CSV data: ${e instanceof Error ? e.message : 'parse error'}`)
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd "/Users/dsxiia/Claude code/3p-relatorios-worker"
git add src/services/csvService.ts
git commit -m "feat: csvService — parse pre-processed CSV rows from frontend"
```

---

## Task 14: Worker — Real Generate Endpoint

**Files:** `worker/src/routes/reports.ts`

- [ ] **Step 1: Add imports and inline mappers at the top of reports.ts**

Add static imports at the top of `reports.ts` (after the `import { Hono } from 'hono'` line) and the inline mapper functions. Static imports are required — do NOT use dynamic `await import()` inside `waitUntil` as it causes issues in Cloudflare Workers.

```typescript
// ── Inline mappers (mirrored from frontend templates) ──

function getAction(actions: Array<{action_type:string;value:string}>|undefined, type: string): number {
  return parseFloat(actions?.find(a => a.action_type === type)?.value ?? '0') || 0
}

function buildLeadGenData(
  insights: Array<{campaign_name:string;reach:string;impressions:string;clicks:string;spend:string;actions?:Array<{action_type:string;value:string}>}>,
  clientName: string,
  period: string,
) {
  const campaigns = insights.map(insight => {
    const leads = getAction(insight.actions, 'lead')
    const spend = parseFloat(insight.spend) || 0
    return {
      id: insight.campaign_name.match(/\d{4}/)?.[0] ?? insight.campaign_name.slice(0, 8),
      name: insight.campaign_name,
      spend, impressions: parseInt(insight.impressions) || 0,
      clicks: parseInt(insight.clicks) || 0, leads,
      cpl: leads > 0 ? spend / leads : 0, annotation: '',
    }
  })
  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0)
  const totalLeads = campaigns.reduce((s, c) => s + c.leads, 0)
  return {
    client: clientName, period, investment: totalSpend,
    totals: {
      reach: insights.reduce((s, i) => s + (parseInt(i.reach) || 0), 0),
      impressions: campaigns.reduce((s, c) => s + c.impressions, 0),
      clicks: campaigns.reduce((s, c) => s + c.clicks, 0),
      leads: totalLeads,
      cpl: totalLeads > 0 ? totalSpend / totalLeads : 0,
    },
    campaigns, todos3P: [], todosClient: [],
  }
}

function buildFranchiseData(
  insights: Array<{campaign_name:string;reach:string;impressions:string;clicks:string;spend:string;actions?:Array<{action_type:string;value:string}>}>,
  clientName: string,
  period: string,
) {
  const units = insights.map((insight, i) => {
    const conversations = getAction(insight.actions, 'onsite_conversion.messaging_conversation_started_7d')
    const spend = parseFloat(insight.spend) || 0
    return {
      id: `unit-${i}`,
      city: insight.campaign_name.split(/[_\- ]/)[0] || `Unidade ${i + 1}`,
      impressions: parseInt(insight.impressions) || 0,
      reach: parseInt(insight.reach) || 0,
      conversations, cpc: conversations > 0 ? spend / conversations : 0,
      spend, annotation: '',
    }
  })
  return { client: clientName, period, units, franchiseHistory: [] }
}
```

- [ ] **Step 2: Add static imports to top of reports.ts**

At the very top of `worker/src/routes/reports.ts`, AFTER `import { Hono } from 'hono'`, add:

```typescript
import { fetchCampaignInsights } from '../services/metaService'
import { generateLeadGenAnalysis, generateFranchiseAnalysis } from '../services/claudeService'
import { parseCsvRows } from '../services/csvService'
```

- [ ] **Step 3: Replace the generate endpoint**

Replace the `reports.post('/generate', ...)` handler with:

```typescript
reports.post('/generate', async (c) => {
  const body = await c.req.json<{
    client_id: string
    period_start: string
    period_end: string
    period_label: string
    source: 'meta' | 'csv' | 'manual'
    csv_data?: string
    unit_ids?: string[]
  }>()

  if (!body.client_id || !body.period_start || !body.period_end || !body.period_label) {
    return c.json({ error: 'client_id, period_start, period_end e period_label são obrigatórios' }, 400)
  }

  const client = await c.env.DB.prepare('SELECT * FROM clients WHERE id = ?').bind(body.client_id).first() as {
    id: string; name: string; type: 'lead_gen' | 'franchise'; meta_account_id: string | null
  } | null
  if (!client) return c.json({ error: 'Cliente não encontrado' }, 404)

  const id = crypto.randomUUID()
  await c.env.DB.prepare(
    `INSERT INTO reports (id, client_id, period_label, period_start, period_end, status)
     VALUES (?, ?, ?, ?, ?, 'generating')`
  ).bind(id, body.client_id, body.period_label, body.period_start, body.period_end).run()

  // Background processing — use static imports, not dynamic ones
  c.executionCtx.waitUntil((async () => {
    try {
      const period = body.period_label
      let rawData: Record<string, unknown>

      if (body.source === 'manual') {
        // Manual: create empty structure
        rawData = client.type === 'lead_gen'
          ? { client: client.name, period, investment: 0, totals: { reach: 0, impressions: 0, clicks: 0, leads: 0, cpl: 0 }, campaigns: [], todos3P: [], todosClient: [] }
          : { client: client.name, period, units: [], franchiseHistory: [] }
      } else if (body.source === 'csv' && body.csv_data) {
        // CSV source: parse pre-processed rows (parseCsvRows imported at top)
        const rows = parseCsvRows(body.csv_data)
        // Convert CSV rows to MetaCampaignInsight-like shape
        const insights = rows.map(row => ({
          campaign_name: row['Campaign name'] ?? row['Nome da campanha'] ?? '',
          reach: row['Reach'] ?? row['Alcance'] ?? '0',
          impressions: row['Impressions'] ?? row['Impressões'] ?? '0',
          clicks: row['Link clicks'] ?? row['Cliques no link'] ?? '0',
          spend: (row['Amount spent (BRL)'] ?? row['Valor usado (BRL)'] ?? '0').replace(',', '.'),
          actions: [
            { action_type: 'lead', value: row['Leads'] ?? row['Results'] ?? row['Resultados'] ?? '0' },
            { action_type: 'onsite_conversion.messaging_conversation_started_7d', value: row['Results'] ?? row['Resultados'] ?? row['Messaging conversations started'] ?? '0' },
          ],
        }))
        rawData = client.type === 'lead_gen'
          ? buildLeadGenData(insights, client.name, body.period_label)
          : buildFranchiseData(insights, client.name, body.period_label)
      } else {
        // Meta API (fetchCampaignInsights imported at top)
        if (!client.meta_account_id) throw new Error('Cliente sem meta_account_id configurado')
        const insights = await fetchCampaignInsights(
          client.meta_account_id,
          body.period_start,
          body.period_end,
          c.env.META_SYSTEM_USER_TOKEN,
        )
        rawData = client.type === 'lead_gen'
          ? buildLeadGenData(insights, client.name, body.period_label)
          : buildFranchiseData(insights, client.name, body.period_label)
      }

      // Generate analysis with Claude (both functions imported at top)
      if (client.type === 'lead_gen') {
        const analysis = await generateLeadGenAnalysis(rawData as Parameters<typeof generateLeadGenAnalysis>[0], c.env)
        // Merge annotations back into campaigns
        const data = rawData as { campaigns: Array<{ id: string; annotation: string }>; todos3P: string[]; todosClient: string[] }
        data.campaigns.forEach(campaign => {
          const found = analysis.campaigns.find(a => a.id === campaign.id)
          if (found) campaign.annotation = found.annotation
        })
        data.todos3P = analysis.todos3P
        data.todosClient = analysis.todosClient
      } else {
        const data = rawData as { units: Array<{ id: string; annotation: string }>; franchiseHistory: string[] }
        const analysis = await generateFranchiseAnalysis({
          client: client.name,
          period: body.period_label,
          units: data.units.map(u => u as Parameters<typeof generateFranchiseAnalysis>[0]['units'][0]),
        }, c.env)
        data.units.forEach(unit => {
          const found = analysis.units.find(a => a.id === unit.id)
          if (found) unit.annotation = found.annotation
        })
        data.franchiseHistory = analysis.franchiseHistory
      }

      await c.env.DB.prepare(
        `UPDATE reports SET raw_data = ?, status = 'ready', updated_at = datetime('now') WHERE id = ?`
      ).bind(JSON.stringify(rawData), id).run()

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      await c.env.DB.prepare(
        `UPDATE reports SET status = 'error', error_message = ?, updated_at = datetime('now') WHERE id = ?`
      ).bind(msg, id).run()
    }
  })())

  const report = await c.env.DB.prepare('SELECT * FROM reports WHERE id = ?').bind(id).first()
  return c.json(report, 202)
})
```

- [ ] **Step 3: Verify worker TypeScript**

```bash
cd "/Users/dsxiia/Claude code/3p-relatorios-worker"
npx tsc --noEmit 2>&1 | head -40
```

Fix type errors before committing.

- [ ] **Step 4: Commit**

```bash
cd "/Users/dsxiia/Claude code/3p-relatorios-worker"
git add src/routes/reports.ts
git commit -m "feat: generate endpoint — real processing with ctx.waitUntil (Meta/CSV/manual + Claude)"
```

---

## Task 15: Set Worker Secrets & Deploy

**Files:** `wrangler.toml` (no changes needed — secrets already declared)

- [ ] **Step 1: Set secrets (if not already set)**

```bash
cd "/Users/dsxiia/Claude code/3p-relatorios-worker"
# Only if not already set:
echo "YOUR_ANTHROPIC_KEY" | wrangler secret put ANTHROPIC_API_KEY
echo "YOUR_META_TOKEN" | wrangler secret put META_SYSTEM_USER_TOKEN
```

Skip secrets already set.

- [ ] **Step 2: Deploy worker**

```bash
cd "/Users/dsxiia/Claude code/3p-relatorios-worker"
npm run deploy 2>&1 | tail -20
```

Expected: `✨ Successfully deployed`

- [ ] **Step 3: Smoke test**

```bash
# Test generate endpoint with manual source
curl -s -X POST https://3p-relatorios-worker.<your-subdomain>.workers.dev/api/reports/generate \
  -H "Content-Type: application/json" \
  -H "x-api-key: $(cat /Users/dsxiia/Claude\ code/3p-relatorios/.env.local | grep VITE_API_KEY | cut -d= -f2)" \
  -d '{"client_id":"<a_real_client_id>","period_start":"2026-03-01","period_end":"2026-03-31","period_label":"Março / 2026","source":"manual"}' | jq .
```

Expected: `{"id":"...","status":"generating",...}`

- [ ] **Step 4: End-to-end test in dev**

```bash
cd "/Users/dsxiia/Claude code/3p-relatorios"
npm run dev
```

Open http://localhost:5173:
1. Select a lead_gen client
2. Click "Novo relatório"
3. Choose "Manual" source
4. Click "Gerar relatório →"
5. Watch GeneratingView poll
6. After ~10s report becomes `ready` → auto-navigates to ReportView
7. Verify slides render with data

- [ ] **Step 5: Commit**

```bash
cd "/Users/dsxiia/Claude code/3p-relatorios-worker"
git add .
git commit -m "deploy: worker v2 — config-driven templates, Meta API + CSV + Claude"
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ 2 templates: lead-gen + franquia
- ✅ Meta API source
- ✅ CSV upload source
- ✅ Manual fallback
- ✅ Claude API generates annotations + todos/history
- ✅ All text blocks editable (EditableText component)
- ✅ edits[] override raw_data in rendering
- ✅ ctx.waitUntil() background processing
- ✅ Polling 2s, timeout 5min
- ✅ Config-driven TemplateConfig<TData>
- ✅ Zod schema validation
- ✅ papaparse CSV parsing
- ✅ Base slide components (SlideShell, MetricGrid, EditableText, CreativeSpot, SlideLogo)
- ✅ PATCH /api/reports/:id/edits already exists in worker

**Not in scope (spec section 10):**
- ❌ Creative image uploads (placeholder only)
- ❌ PDF export (Fase 5)
- ❌ Multi-conta Meta
