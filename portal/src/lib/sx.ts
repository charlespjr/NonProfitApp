import type { CSSProperties } from 'react'

const cache = new Map<string, CSSProperties>()

/**
 * Convert a CSS declaration string ("display:flex;gap:8px") into a React
 * style object. The design handoff specifies every element as inline CSS;
 * keeping the declarations verbatim preserves fidelity with the prototype
 * and makes diffs against the design reference trivial.
 */
export function sx(css: string): CSSProperties {
  const hit = cache.get(css)
  if (hit) return hit
  const out: Record<string, string> = {}
  for (const decl of css.split(';')) {
    const i = decl.indexOf(':')
    if (i < 0) continue
    const prop = decl.slice(0, i).trim()
    const value = decl.slice(i + 1).trim()
    if (!prop) continue
    const key = prop.startsWith('--')
      ? prop
      : prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
    out[key] = value
  }
  cache.set(css, out as CSSProperties)
  return out as CSSProperties
}
