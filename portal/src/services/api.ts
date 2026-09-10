/**
 * Client for the Quorum portal API (same-origin /api).
 *
 * The app runs in one of two modes, decided once at boot by `detectMode()`:
 *  - 'api'  — a backend answered /api/health: real auth, server-persisted
 *             per-org state, members with login rows, billing.
 *  - 'demo' — no backend (static hosting): the original single-org demo,
 *             seeded accounts, localStorage persistence.
 */

import type { EntityType } from '../types'

export interface ApiOrg {
  id: string
  name: string
  /** Which kind of organization: drives checklist, docs, and terminology. */
  entityType: EntityType
  plan: 'none' | 'starter' | 'growth' | 'scale' | 'launch_partner'
  planStatus: string
  /** Whether the org has an Anthropic API key on file (the key itself
   *  never reaches the client). */
  aiConfigured?: boolean
  /** Board-email sending address and whether its domain is verified in Resend
   *  (only then do emails send FROM this address rather than the fallback). */
  fromEmail?: string | null
  emailDomain?: string | null
  emailVerified?: boolean
  /** Per-org SMTP relay (e.g. GoDaddy). Password is never returned — only
   *  these display fields plus the smtpConfigured flag. */
  smtpConfigured?: boolean
  smtpHost?: string | null
  smtpPort?: number | null
  smtpSecure?: boolean
  smtpUser?: string | null
}

export interface SmtpSettings {
  host: string
  port: number
  secure: boolean
  user: string
  /** Sent only when setting/changing; never returned by the server. */
  pass?: string
  fromEmail: string
}

/** A DNS record the org must add to verify its sending domain. */
export interface DomainDnsRecord {
  record: string
  name: string
  type: string
  value: string
  priority?: number
}

export interface ApiMember {
  id: string
  orgId: string
  name: string
  roleTitle: string
  initials: string
  username: string
  email: string
  isAdmin: boolean
  canVote: boolean
  canSign: boolean
  status: 'active' | 'invited' | 'none'
  mustChangePassword: boolean
}

export interface ApiSession {
  org: ApiOrg
  me: ApiMember
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch('/api' + path, {
    credentials: 'same-origin',
    headers: init?.body ? { 'content-type': 'application/json' } : undefined,
    ...init,
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(res.status, (body as { error?: string }).error || res.statusText)
  return body as T
}

export const api = {
  async detectMode(): Promise<'api' | 'demo'> {
    try {
      const res = await fetch('/api/health', { credentials: 'same-origin' })
      if (!res.ok) return 'demo'
      const body = (await res.json().catch(() => null)) as { ok?: boolean } | null
      return body?.ok ? 'api' : 'demo'
    } catch {
      return 'demo'
    }
  },

  me: () => req<ApiSession>('/auth/me'),
  register: (input: { orgName: string; name: string; email: string; username: string; password: string; entityType: EntityType }) =>
    req<ApiSession>('/auth/register', { method: 'POST', body: JSON.stringify(input) }),
  login: (identifier: string, password: string) =>
    req<ApiSession>('/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) }),
  logout: () => req<{ ok: true }>('/auth/logout', { method: 'POST' }),
  changePassword: (password: string) =>
    req<{ ok: true }>('/auth/change-password', { method: 'POST', body: JSON.stringify({ password }) }),

  getState: () => req<{ data: Record<string, unknown>; version: number }>('/state'),
  putState: (data: Record<string, unknown>, version: number) =>
    req<{ version: number }>('/state', { method: 'PUT', body: JSON.stringify({ data, version }) }),

  members: () => req<{ members: ApiMember[] }>('/members'),
  createMember: (input: Partial<ApiMember> & { name: string; username: string; email: string; password?: string }) =>
    req<{ member: ApiMember }>('/members', { method: 'POST', body: JSON.stringify(input) }),
  updateMember: (id: string, patch: Partial<ApiMember> & { password?: string }) =>
    req<{ member: ApiMember }>(`/members/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  deleteMember: (id: string) => req<{ ok: true }>(`/members/${id}`, { method: 'DELETE' }),

  setAiKey: (key: string) =>
    req<{ ok: true; aiConfigured: boolean }>('/org/ai-key', { method: 'POST', body: JSON.stringify({ key }) }),
  setEntityType: (entityType: EntityType) =>
    req<{ org: ApiOrg }>('/org/entity-type', { method: 'POST', body: JSON.stringify({ entityType }) }),

  // board-facing transactional email
  notifyVote: (input: { motionTitle: string; motionDesc?: string; meetingTitle?: string }) =>
    req<{ sent: number; dryRun: boolean; configured: boolean }>('/notify/vote', { method: 'POST', body: JSON.stringify(input) }),
  notifySign: (input: { docName: string; memberIds?: string[] }) =>
    req<{ sent: number; dryRun: boolean; configured: boolean }>('/notify/sign', { method: 'POST', body: JSON.stringify(input) }),
  setOrgEmail: (fromEmail: string) =>
    req<{ org: ApiOrg; records: DomainDnsRecord[]; status?: string; error?: string }>('/org/email', { method: 'POST', body: JSON.stringify({ fromEmail }) }),
  verifyOrgEmail: () =>
    req<{ org: ApiOrg; verified: boolean; records: DomainDnsRecord[]; status?: string; error?: string }>('/org/email/verify', { method: 'POST' }),
  setOrgSmtp: (settings: Partial<SmtpSettings> & { host: string }) =>
    req<{ org: ApiOrg }>('/org/smtp', { method: 'POST', body: JSON.stringify(settings) }),
  clearOrgSmtp: () =>
    req<{ org: ApiOrg }>('/org/smtp', { method: 'POST', body: JSON.stringify({ host: '' }) }),
  testOrgSmtp: () =>
    req<{ ok: boolean; to?: string; error?: string }>('/org/smtp/test', { method: 'POST' }),
  aiDraft: (input: { motionTitle: string; motionDesc: string; meetingTitle?: string }) =>
    req<{ text: string }>('/ai/draft', { method: 'POST', body: JSON.stringify(input) }),

  billingPlan: () =>
    req<{ plan: string; planStatus: string; configured: boolean; mode: 'stripe' | 'links' | 'none' }>('/billing/plan'),
  checkout: (tier: 'starter' | 'growth' | 'scale' | 'launch_partner', period: 'monthly' | 'yearly' = 'monthly') =>
    req<{ url: string }>('/billing/checkout', { method: 'POST', body: JSON.stringify({ tier, period }) }),
  billingPortal: () => req<{ url: string }>('/billing/portal', { method: 'POST' }),
}
