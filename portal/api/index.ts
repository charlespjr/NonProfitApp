/**
 * Vercel serverless entry (Node runtime). With the project's Root Directory
 * set to portal/, every /api/* request lands here; dist/ ships via the CDN.
 * Requires env: DATABASE_URL, JWT_SECRET (+ Stripe vars for billing).
 *
 * Bridges Vercel's Node (req, res) signature to the Hono app's fetch handler.
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import { app } from '../server/app.js'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const proto = (req.headers['x-forwarded-proto'] as string) || 'https'
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost'
    const url = `${proto}://${host}${req.url || '/'}`

    const headers = new Headers()
    for (const [key, value] of Object.entries(req.headers)) {
      if (Array.isArray(value)) value.forEach((v) => headers.append(key, v))
      else if (typeof value === 'string') headers.set(key, value)
    }

    const method = req.method || 'GET'
    let body: Buffer | undefined
    if (method !== 'GET' && method !== 'HEAD') {
      const chunks: Buffer[] = []
      for await (const chunk of req) chunks.push(chunk as Buffer)
      if (chunks.length) body = Buffer.concat(chunks)
    }

    const response = await app.fetch(new Request(url, { method, headers, body }))

    res.statusCode = response.status
    const setCookies = response.headers.getSetCookie?.() ?? []
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'set-cookie') res.setHeader(key, value)
    })
    if (setCookies.length) res.setHeader('set-cookie', setCookies)
    const out = Buffer.from(await response.arrayBuffer())
    res.end(out)
  } catch (err) {
    console.error('api handler error:', err)
    res.statusCode = 500
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({ error: 'internal error' }))
  }
}
