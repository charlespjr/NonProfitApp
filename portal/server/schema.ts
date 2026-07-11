/**
 * Multi-tenant schema.
 *
 * Normalized tables carry what needs transactional integrity and cross-org
 * queries: organizations, login identities, and billing status. The per-org
 * board state (tasks, signatures, motions, votes, notes, integration flags)
 * lives in a versioned JSONB document — it is small (KBs), always read and
 * written as a unit by a single org, and matches the client store 1:1.
 * Normalize individual pieces out of it when a feature needs server-side
 * queries across them (e.g. vote tallies in email digests).
 */
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

export const orgs = pgTable('orgs', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id'),
  /** 'none' | 'growth' | 'launch_partner' */
  plan: text('plan').notNull().default('none'),
  /** Stripe subscription status mirror: 'inactive' | 'active' | 'past_due' | 'canceled' */
  planStatus: text('plan_status').notNull().default('inactive'),
})

export const users = pgTable(
  'users',
  {
    id: text('id').primaryKey(),
    orgId: text('org_id')
      .notNull()
      .references(() => orgs.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    roleTitle: text('role_title').notNull().default('Director'),
    initials: text('initials').notNull(),
    username: text('username').notNull(),
    /** Personal email — where DocuSeal documents are delivered. */
    email: text('email').notNull(),
    passwordHash: text('password_hash'),
    isAdmin: boolean('is_admin').notNull().default(false),
    canVote: boolean('can_vote').notNull().default(true),
    canSign: boolean('can_sign').notNull().default(false),
    /** 'active' | 'invited' | 'none' */
    status: text('status').notNull().default('none'),
    /** Invited members must change the shared temp password on first login. */
    mustChangePassword: boolean('must_change_password').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('users_org_username').on(t.orgId, t.username),
    uniqueIndex('users_org_email').on(t.orgId, t.email),
  ],
)

/** OAuth token storage for the QuickBooks integration. Intuit rotates the
 *  refresh token on every use, so the env var only seeds the first row —
 *  after that this table is the source of truth. */
export const qboTokens = pgTable('qbo_tokens', {
  realmId: text('realm_id').primaryKey(),
  refreshToken: text('refresh_token').notNull(),
  accessToken: text('access_token'),
  accessExpiresAt: timestamp('access_expires_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

/** One row per checkout invoice we created in QuickBooks; the sync job
 *  activates the org's plan when QuickBooks reports the invoice paid. */
export const qboInvoices = pgTable('qbo_invoices', {
  invoiceId: text('invoice_id').primaryKey(),
  orgId: text('org_id')
    .notNull()
    .references(() => orgs.id, { onDelete: 'cascade' }),
  tier: text('tier').notNull(),
  period: text('period').notNull(),
  amount: text('amount').notNull(),
  status: text('status').notNull().default('open'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  paidAt: timestamp('paid_at', { withTimezone: true }),
})

export const orgState = pgTable('org_state', {
  orgId: text('org_id')
    .primaryKey()
    .references(() => orgs.id, { onDelete: 'cascade' }),
  data: jsonb('data').notNull(),
  version: integer('version').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const DDL = `
CREATE TABLE IF NOT EXISTS orgs (
  id text PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  stripe_customer_id text,
  plan text NOT NULL DEFAULT 'none',
  plan_status text NOT NULL DEFAULT 'inactive'
);
CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  org_id text NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name text NOT NULL,
  role_title text NOT NULL DEFAULT 'Director',
  initials text NOT NULL,
  username text NOT NULL,
  email text NOT NULL,
  password_hash text,
  is_admin boolean NOT NULL DEFAULT false,
  can_vote boolean NOT NULL DEFAULT true,
  can_sign boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'none',
  must_change_password boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_org_username ON users(org_id, username);
CREATE UNIQUE INDEX IF NOT EXISTS users_org_email ON users(org_id, email);
CREATE TABLE IF NOT EXISTS org_state (
  org_id text PRIMARY KEY REFERENCES orgs(id) ON DELETE CASCADE,
  data jsonb NOT NULL,
  version integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS qbo_tokens (
  realm_id text PRIMARY KEY,
  refresh_token text NOT NULL,
  access_token text,
  access_expires_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS qbo_invoices (
  invoice_id text PRIMARY KEY,
  org_id text NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  tier text NOT NULL,
  period text NOT NULL,
  amount text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);
`
