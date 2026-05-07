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
