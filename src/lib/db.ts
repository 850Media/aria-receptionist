import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

export async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      stripe_customer_id TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      plan TEXT DEFAULT 'free',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS agents (
      id SERIAL PRIMARY KEY,
      chat_id TEXT UNIQUE NOT NULL,
      customer_id INTEGER REFERENCES customers(id),
      business_name TEXT NOT NULL,
      url TEXT NOT NULL,
      agent_uuid TEXT NOT NULL,
      kb_uuid TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      api_key TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      agent_id INTEGER REFERENCES agents(id),
      name TEXT,
      email TEXT,
      phone TEXT,
      message TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `)
}

export async function saveAgent(data: {
  chatId: string
  customerId?: number
  businessName: string
  url: string
  agentUuid: string
  kbUuid: string
  endpoint: string
  apiKey: string
}) {
  const res = await pool.query(
    `INSERT INTO agents (chat_id, customer_id, business_name, url, agent_uuid, kb_uuid, endpoint, api_key)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (chat_id) DO NOTHING
     RETURNING id`,
    [data.chatId, data.customerId || null, data.businessName, data.url, data.agentUuid, data.kbUuid, data.endpoint, data.apiKey]
  )
  return res.rows[0]
}

export async function getAgent(chatId: string) {
  const res = await pool.query(`SELECT * FROM agents WHERE chat_id = $1`, [chatId])
  return res.rows[0] || null
}

export async function getCustomerByStripeId(stripeCustomerId: string) {
  const res = await pool.query(`SELECT * FROM customers WHERE stripe_customer_id = $1`, [stripeCustomerId])
  return res.rows[0] || null
}

export async function upsertCustomer(stripeCustomerId: string, email: string, plan: string) {
  const res = await pool.query(
    `INSERT INTO customers (stripe_customer_id, email, plan)
     VALUES ($1, $2, $3)
     ON CONFLICT (stripe_customer_id) DO UPDATE SET plan = $3
     RETURNING *`,
    [stripeCustomerId, email, plan]
  )
  return res.rows[0]
}

export { pool }
