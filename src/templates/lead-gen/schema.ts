import { z } from 'zod'

export const topCreativeSchema = z.object({
  clicks: z.number(),
  leads: z.number(),
  cpl: z.number(),
  impressions: z.number().optional(),
  ctr: z.number().optional(),
  ad_id: z.string().optional(),
  ad_name: z.string().nullable().optional(),
  preview_link: z.string().nullable().optional(),
  thumbnail_url: z.string().nullable().optional(),
})

export const leadGenCampaignSchema = z.object({
  id: z.string(),
  name: z.string(),
  spend: z.number(),
  reach: z.number().default(0),
  impressions: z.number(),
  clicks: z.number(),
  leads: z.number(),
  cpl: z.number(),
  cplPrevPeriod: z.number().optional(),
  topCreative: topCreativeSchema.optional(),
  topVideo: topCreativeSchema.optional(),
  topImage: topCreativeSchema.optional(),
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
