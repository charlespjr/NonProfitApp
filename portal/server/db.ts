/**
 * Database access. With DATABASE_URL set (Neon / Supabase / any Postgres) we
 * use node-postgres; without it we fall back to an embedded PGlite database —
 * zero-setup local dev and tests, identical SQL surface.
 */
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres'
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite'
import { DDL } from './schema'

export type Db = ReturnType<typeof drizzlePg> | ReturnType<typeof drizzlePglite>

let dbPromise: Promise<Db> | null = null

async function create(): Promise<Db> {
  const url = process.env.DATABASE_URL
  if (url) {
    const { Pool } = await import('pg')
    const pool = new Pool({ connectionString: url, max: 5 })
    const db = drizzlePg(pool)
    await pool.query(DDL)
    return db
  }
  const { PGlite } = await import('@electric-sql/pglite')
  const pglite = new PGlite(process.env.PGLITE_DIR || undefined)
  await pglite.exec(DDL)
  return drizzlePglite(pglite)
}

export function getDb(): Promise<Db> {
  if (!dbPromise) dbPromise = create()
  return dbPromise
}
