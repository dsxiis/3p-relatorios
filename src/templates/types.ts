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
  renderSlides: (data: TData, mkEdit: (id: string, defaultValue: string) => EditState, clientLogo?: string | null) => React.ReactNode[]
}
