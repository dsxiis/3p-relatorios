import type { Client, Report, MetaAdAccount, MetaCampaignInsight, GenerateReportPayload } from './types'

const WORKER_BASE = import.meta.env.VITE_WORKER_URL ?? 'http://localhost:8787'
const API_KEY = import.meta.env.VITE_API_KEY ?? ''

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${WORKER_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
      ...(init?.headers ?? {}),
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText })) as { error?: string }
    throw new Error(err.error ?? `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

/* ── CLIENTS ──────────────────────────────────────────── */
export const apiClients = {
  list: () => request<Client[]>('/api/clients'),
  get: (id: string) => request<Client>(`/api/clients/${id}`),
  create: (body: { name: string; type: string; description?: string; meta_account_id?: string }) =>
    request<Client>('/api/clients', { method: 'POST', body: JSON.stringify(body) }),
  delete: (id: string) => request<{ ok: boolean }>(`/api/clients/${id}`, { method: 'DELETE' }),
}

/* ── REPORTS ──────────────────────────────────────────── */
export const apiReports = {
  list: (clientId: string) => request<Report[]>(`/api/reports?client_id=${clientId}`),
  get: (id: string) => request<Report>(`/api/reports/${id}`),
  generate: (body: GenerateReportPayload) =>
    request<Report>('/api/reports/generate', { method: 'POST', body: JSON.stringify(body) }),
  saveEdit: (reportId: string, blockId: string, value: string) =>
    request<{ ok: boolean; edits: Record<string, string> }>(`/api/reports/${reportId}/edits`, {
      method: 'PATCH',
      body: JSON.stringify({ block_id: blockId, value }),
    }),
  delete: (id: string) => request<{ ok: boolean }>(`/api/reports/${id}`, { method: 'DELETE' }),
  pdfUrl: (id: string) => `${WORKER_BASE}/api/reports/${id}/pdf`,
}

/* ── META ─────────────────────────────────────────────── */
export const apiMeta = {
  accounts: () => request<MetaAdAccount[]>('/api/meta/accounts'),
  insights: (accountId: string, start: string, end: string) =>
    request<MetaCampaignInsight[]>(
      `/api/meta/insights?account_id=${accountId}&start=${start}&end=${end}`
    ),
}
