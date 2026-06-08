import { Pool, PoolClient } from 'pg'

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined
}

function getPool(): Pool {
  if (!global._pgPool) {
    global._pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    })
    global._pgPool.on('error', (err) => {
      console.error('[DB] Pool error:', err)
    })
  }
  return global._pgPool
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function query<T = Record<string, any>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const pool = getPool()
  const result = await pool.query(text, params)
  return result.rows as T[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function queryOne<T = Record<string, any>>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(text, params)
  return rows[0] ?? null
}

export async function withClient<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect()
  try {
    return await fn(client)
  } finally {
    client.release()
  }
}

export async function getContent(): Promise<Record<string, string>> {
  try {
    const rows = await query<{ key: string; value: string }>('SELECT key, value FROM site_content')
    return Object.fromEntries(rows.map((r) => [r.key, r.value]))
  } catch {
    return {}
  }
}

export async function setContent(key: string, value: string): Promise<void> {
  await query(
    `INSERT INTO site_content (key, value, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
    [key, value]
  )
}

export async function initDb(): Promise<void> {
  const pool = getPool()

  await pool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id              SERIAL PRIMARY KEY,
      title           VARCHAR(255) NOT NULL,
      category        VARCHAR(100) NOT NULL DEFAULT 'Design',
      description     TEXT,
      image_url       TEXT,
      thumbnail_url   TEXT,
      project_images  TEXT[]       DEFAULT '{}',
      tags            TEXT[]       DEFAULT '{}',
      featured        BOOLEAN      DEFAULT false,
      published       BOOLEAN      DEFAULT true,
      sort_order      INTEGER      DEFAULT 0,
      created_at      TIMESTAMPTZ  DEFAULT NOW(),
      updated_at      TIMESTAMPTZ  DEFAULT NOW()
    )
  `)

  // Non-destructive migration for existing databases
  await pool.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS thumbnail_url TEXT`).catch(() => {})

  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_content (
      key        VARCHAR(255) PRIMARY KEY,
      value      TEXT         NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ  DEFAULT NOW()
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id         SERIAL PRIMARY KEY,
      name       VARCHAR(255),
      email      VARCHAR(255),
      subject    VARCHAR(500),
      message    TEXT,
      read       BOOLEAN      DEFAULT false,
      created_at TIMESTAMPTZ  DEFAULT NOW()
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS chat_threads (
      id                SERIAL PRIMARY KEY,
      token             VARCHAR(255) UNIQUE NOT NULL,
      name              VARCHAR(255),
      email             VARCHAR(255),
      subject           VARCHAR(500),
      status            VARCHAR(50)  DEFAULT 'open',
      last_seen_admin   TIMESTAMPTZ,
      last_seen_visitor TIMESTAMPTZ,
      created_at        TIMESTAMPTZ  DEFAULT NOW(),
      updated_at        TIMESTAMPTZ  DEFAULT NOW()
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id         SERIAL PRIMARY KEY,
      thread_id  INTEGER     NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
      sender     VARCHAR(50) NOT NULL,
      body       TEXT        NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS store_products (
      id             SERIAL PRIMARY KEY,
      title          VARCHAR(255)   NOT NULL,
      slug           VARCHAR(255),
      description    TEXT,
      short_desc     VARCHAR(500),
      price          DECIMAL(10,2)  NOT NULL DEFAULT 0,
      original_price DECIMAL(10,2),
      category       VARCHAR(100)   NOT NULL DEFAULT 'Design',
      image_url      TEXT,
      thumbnail_url  TEXT,
      product_images TEXT[]         DEFAULT '{}',
      includes       TEXT[]         DEFAULT '{}',
      license        TEXT           DEFAULT 'Personal use',
      tags           TEXT[]         DEFAULT '{}',
      published      BOOLEAN        DEFAULT true,
      featured       BOOLEAN        DEFAULT false,
      sort_order     INTEGER        DEFAULT 0,
      created_at     TIMESTAMPTZ    DEFAULT NOW(),
      updated_at     TIMESTAMPTZ    DEFAULT NOW()
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS custom_orders (
      id               SERIAL PRIMARY KEY,
      name             VARCHAR(255),
      email            VARCHAR(255) NOT NULL,
      discord          VARCHAR(255),
      project_type     VARCHAR(255),
      project_name     VARCHAR(255),
      design_style     TEXT,
      colors           TEXT,
      budget           VARCHAR(100),
      deadline         VARCHAR(100),
      references_text  TEXT,
      notes            TEXT,
      status           VARCHAR(50)  DEFAULT 'new',
      created_at       TIMESTAMPTZ  DEFAULT NOW()
    )
  `)

  await pool.query(`ALTER TABLE store_products ADD COLUMN IF NOT EXISTS thumbnail_url TEXT`).catch(() => {})

  console.log('[DB] Tables initialised')
}
