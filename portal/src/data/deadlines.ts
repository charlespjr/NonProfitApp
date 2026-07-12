/** Compliance & trial deadlines that make a fresh portal feel alive from day
 *  one. Everything is computed from a single anchor date (when the org opened
 *  its portal); items disappear as their checklist tasks are completed. */

export interface DeadlineItem {
  id: string
  kind: 'trial' | 'filing' | 'renewal'
  label: string
  detail: string
  due: Date
}

/** Fixed anchor for the demo org so the July 2026 month view — and the
 *  recorded tutorials — stay stable. Real orgs anchor to their signup date. */
export const DEMO_ANCHOR = new Date(2026, 5, 25, 12, 0, 0)
/** "Today" inside the demo (the calendar highlights July 1, 2026). */
export const DEMO_TODAY = new Date(2026, 6, 1, 12, 0, 0)

export const TRIAL_DAYS = 14

const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000)
const addMonths = (d: Date, n: number) => {
  const x = new Date(d)
  x.setMonth(x.getMonth() + n)
  return x
}

export function computeDeadlines(
  anchor: Date,
  tasks: Record<string, boolean>,
  opts?: { trial?: boolean },
): DeadlineItem[] {
  const out: DeadlineItem[] = []
  if (opts?.trial !== false) {
    out.push({
      id: 'trial',
      kind: 'trial',
      label: 'Free trial ends — choose a plan',
      detail: 'Keep the portal, documents, and signatures without interruption.',
      due: addDays(anchor, TRIAL_DAYS),
    })
  }
  if (!tasks.ct1) {
    out.push({
      id: 'ct1',
      kind: 'filing',
      label: 'Registry of Charities (Form CT-1)',
      detail: 'Register within 30 days of first receiving money — and before fundraising.',
      due: addDays(anchor, 30),
    })
  }
  if (!tasks.si100) {
    out.push({
      id: 'si100',
      kind: 'filing',
      label: 'Statement of Information (Form SI-100)',
      detail: 'File with the CA Secretary of State within 90 days of the Articles.',
      due: addDays(anchor, 90),
    })
  }
  if (!tasks.f1023) {
    out.push({
      id: 'f1023',
      kind: 'filing',
      label: 'IRS Form 1023 window',
      detail: 'File within 27 months of formation so the exemption is retroactive to day one.',
      due: addMonths(anchor, 27),
    })
  }
  if (!tasks.rrf) {
    out.push({
      id: 'rrf',
      kind: 'renewal',
      label: 'Annual RRF-1 & Form 990 season',
      detail: 'Due four and a half months after the fiscal year ends.',
      due: new Date(anchor.getFullYear() + 1, 4, 15, 12),
    })
  }
  return out.sort((a, b) => a.due.getTime() - b.due.getTime())
}

export const fmtDue = (d: Date, withYear = false) =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', ...(withYear ? { year: 'numeric' } : {}) })

export const daysUntil = (d: Date, from: Date) => Math.ceil((d.getTime() - from.getTime()) / 86400000)

/** Human phrasing for the rail/cards: "in 8 days", "tomorrow", "overdue". */
export function duePhrase(d: Date, from: Date): string {
  const n = daysUntil(d, from)
  if (n < 0) return 'overdue'
  if (n === 0) return 'today'
  if (n === 1) return 'tomorrow'
  if (n <= 60) return `in ${n} days`
  const months = Math.round(n / 30)
  return `in ${months} months`
}
