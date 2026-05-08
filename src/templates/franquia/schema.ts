import { z } from 'zod'

export const franchiseUnitDataSchema = z.object({
  id: z.string(),
  city: z.string(),
  impressions: z.number(),
  reach: z.number(),
  conversations: z.number(),
  cpc: z.number(),
  spend: z.number(),
  bestAd: z.object({ clicks: z.number(), messages: z.number(), cpl: z.number(), impressions: z.number().optional(), ctr: z.number().optional(), ad_id: z.string().optional(), ad_name: z.string().nullable().optional(), preview_link: z.string().nullable().optional() }).optional(),
  bestVideo: z.object({ clicks: z.number(), messages: z.number(), cpl: z.number(), impressions: z.number().optional(), ctr: z.number().optional(), ad_id: z.string().optional(), ad_name: z.string().nullable().optional(), preview_link: z.string().nullable().optional() }).optional(),
  bestImage: z.object({ clicks: z.number(), messages: z.number(), cpl: z.number(), impressions: z.number().optional(), ctr: z.number().optional(), ad_id: z.string().optional(), ad_name: z.string().nullable().optional(), preview_link: z.string().nullable().optional() }).optional(),
  annotation: z.string().default(''),
})

export const franchiseDataSchema = z.object({
  client: z.string(),
  period: z.string(),
  units: z.array(franchiseUnitDataSchema),
  franchiseHistory: z.array(z.string()).default([]),
})

export type FranchiseData = z.infer<typeof franchiseDataSchema>
