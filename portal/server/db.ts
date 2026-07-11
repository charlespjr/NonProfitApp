/**
 * Database access. With DATABASE_URL set (Neon / Supabase / any Postgres) we
 * use node-postgres; without it we fall back to an embedded PGlite database —
 * zero-setup local dev and tests, identical SQL surface.
 *
 * Both drivers are imported lazily: PGlite ships a WASM runtime that must
 * never load in a serverless function (module-init crash), and postgres isn't
 * needed in local demo runs.
 */
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import type { PgliteDatabase } from 'drizzle-orm/pglite'
import { DDL } from './schema.js'

export type Db = NodePgDatabase | PgliteDatabase

let dbPromise: Promise<Db> | null = null

/** Marketplace integrations name the connection string differently
 *  (Neon: DATABASE_URL; Vercel Postgres: POSTGRES_URL; …) — accept them all. */
export function databaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.NEON_DATABASE_URL
  )
}

async function create(): Promise<Db> {
  const url = databaseUrl()
  if (url) {
    const [{ drizzle }, pg] = await Promise.all([
      import('drizzle-orm/node-postgres'),
      import('pg'),
    ])
    const pool = new pg.default.Pool({ connectionString: url, max: 5 })
    await pool.query(DDL)
    return drizzle(pool)
  }
  const [{ drizzle }, { PGlite }] = await Promise.all([
    import('drizzle-orm/pglite'),
    import('@electric-sql/pglite'),
  ])
  const pglite = new PGlite(process.env.PGLITE_DIR || undefined)
  await pglite.exec(DDL)
  return drizzle(pglite as never)
}

export function getDb(): Promise<Db> {
  if (!dbPromise) dbPromise = create()
  return dbPromise
}
