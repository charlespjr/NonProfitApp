/**
 * Vercel serverless entry. With the project's Root Directory set to portal/,
 * every /api/* request lands here; dist/ ships via the CDN.
 * Requires env: DATABASE_URL, JWT_SECRET (+ Stripe vars for billing).
 */
import { handle } from 'hono/vercel'
import { app } from '../server/app'

export default handle(app)
