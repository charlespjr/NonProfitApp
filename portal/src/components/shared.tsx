import type { CSSProperties, ReactNode } from 'react'
import { sx } from '../lib/sx'
import type { DocStatus } from '../types'

export function YouChip({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <span style={sx('display:inline-block;margin-left:7px;font-size:10px;font-weight:700;color:var(--brand);background:var(--accent-soft);padding:1px 7px;border-radius:20px;vertical-align:middle')}>
      You
    </span>
  )
}

export function Avatar({
  initials,
  bg,
  size = 34,
  fontSize = 12,
}: {
  initials: string
  bg: string
  size?: number
  fontSize?: number
}) {
  return (
    <div
      style={{
        ...sx('border-radius:50%;display:grid;place-items:center;font-weight:700;flex:none;color:#fff'),
        width: size,
        height: size,
        fontSize,
        background: bg,
      }}
    >
      {initials}
    </div>
  )
}

export const STATUS_META: Record<DocStatus, { label: string; style: CSSProperties }> = {
  draft: {
    label: 'Draft',
    style: sx('display:inline-flex;font-size:11.5px;font-weight:600;padding:5px 12px;border-radius:20px;background:var(--bg);color:var(--muted);border:1px solid var(--line)'),
  },
  sent: {
    label: 'Awaiting signatures',
    style: sx('display:inline-flex;font-size:11.5px;font-weight:600;padding:5px 12px;border-radius:20px;background:var(--warn-soft);color:var(--warn)'),
  },
  signed: {
    label: 'Fully signed',
    style: sx('display:inline-flex;font-size:11.5px;font-weight:600;padding:5px 12px;border-radius:20px;background:var(--good-soft);color:var(--good)'),
  },
}

export function ModalShell({
  onClose,
  maxWidth,
  children,
  scrollBody,
}: {
  onClose: () => void
  maxWidth: number
  children: ReactNode
  scrollBody?: boolean
}) {
  return (
    <div
      onClick={onClose}
      style={sx('position:fixed;inset:0;background:rgba(20,18,14,.5);backdrop-filter:blur(3px);z-index:100;display:flex;align-items:center;justify-content:center;padding:30px;animation:ailfade .2s ease both')}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          ...sx('background:var(--panel);border-radius:16px;width:100%;max-height:90vh;display:flex;flex-direction:column;animation:ailpop .22s ease both;box-shadow:0 30px 80px rgba(0,0,0,.3)'),
          maxWidth,
          overflow: scrollBody ? 'auto' : 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  )
}

export function Toast({ message }: { message: string }) {
  if (!message) return null
  return (
    <div style={sx('position:fixed;bottom:26px;left:50%;transform:translateX(-50%);z-index:200;background:var(--ink);color:var(--bg);font-size:13px;font-weight:500;padding:12px 20px;border-radius:11px;box-shadow:0 12px 40px rgba(0,0,0,.25);animation:ailfade .25s ease both')}>
      {message}
    </div>
  )
}

export function ProgressRing({
  pct,
  size,
  hole,
  fontSize,
}: {
  pct: number
  size: number
  hole: number
  fontSize: number
}) {
  const ang = pct * 3.6
  const mask = `radial-gradient(farthest-side,transparent ${hole}%,#000 ${hole + 1}%)`
  return (
    <div style={{ position: 'relative', width: size, height: size, flex: 'none' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `conic-gradient(var(--accent) ${ang}deg, var(--line) 0)`,
          WebkitMask: mask,
          mask,
        }}
      />
      <div style={{ ...sx('position:absolute;inset:0;display:grid;place-items:center;font-weight:700;color:var(--brand);white-space:nowrap'), fontSize }}>
        {pct}%
      </div>
    </div>
  )
}
