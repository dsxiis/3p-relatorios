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

/* ── REPORT ───────────────────────────────────────────── */
export type ReportStatus = 'generating' | 'ready' | 'error'

export interface ReportUnit {
  id: string
  report_id: string
  unit_id: string
  unit_name: string
  raw_data: MetaInsightsData | null
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
  raw_data: MetaInsightsData | null
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

export interface MetaInsightsData {
  campaigns: MetaCampaignInsight[]
  summary?: {
    total_spend: number
    total_impressions: number
    total_clicks: number
    total_leads: number
    cpl: number
  }
}

export interface MetaAdAccount {
  id: string
  name: string
  account_status: number
  currency: string
}

/* ── FORM ─────────────────────────────────────────────── */
export interface GenerateReportPayload {
  client_id: string
  period_start: string
  period_end: string
  period_label: string
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
