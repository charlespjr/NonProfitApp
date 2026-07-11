/**
 * Local / self-hosted entry: serves the API and the built SPA from dist/.
 *   npm run build && npm run serve      → http://localhost:3000
 * On Vercel the API is served by api/index.ts instead and dist/ by the CDN.
 */
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { app as api } from './app.js'

const root = new Hono()
root.route('/', api)
root.use('/*', serveStatic({ root: './dist' }))
root.get('*', serveStatic({ path: './dist/index.html' }))

const port = Number(process.env.PORT || 3000)
serve({ fetch: root.fetch, port }, (info) => {
  console.log(`quorum portal listening on http://localhost:${info.port}`)
})
