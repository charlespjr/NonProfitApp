/**
 * Client for the Quorum portal API (same-origin /api).
 *
 * The app runs in one of two modes, decided once at boot by `detectMode()`:
 *  - 'api'  — a backend answered /api/health: real auth, server-persisted
 *             per-org state, members with login rows, billing.
 *  - 'demo' — no backend (static hosting): the original single-org demo,
 *             seeded accounts, localStorage persistence.
 */

export interface ApiOrg {
  id: string
  name: string
  plan: 'none' | 'starter' | 'growth' | 'scale' | 'launch_partner'
  planStatus: string
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
  register: (input: { orgName: string; name: string; email: string; username: string; password: string }) =>
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

  billingPlan: () =>
    req<{ plan: string; planStatus: string; configured: boolean; mode: 'stripe' | 'links' | 'none' }>('/billing/plan'),
  checkout: (tier: 'starter' | 'growth' | 'scale' | 'launch_partner', period: 'monthly' | 'yearly' = 'monthly') =>
    req<{ url: string }>('/billing/checkout', { method: 'POST', body: JSON.stringify({ tier, period }) }),
  billingPortal: () => req<{ url: string }>('/billing/portal', { method: 'POST' }),
}
