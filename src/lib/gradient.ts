const DO_TOKEN = process.env.DO_API_TOKEN!
const BASE = 'https://api.digitalocean.com/v2/gen-ai'
const EMBEDDING_MODEL_UUID = '22653204-79ed-11ef-bf8f-4e013e2ddde4'
const REGION = process.env.DO_REGION || 'tor1'
const PROJECT_ID = process.env.DO_PROJECT_ID!
const AGENT_UUID = process.env.DO_AGENT_UUID!
const AGENT_API_KEY = process.env.DO_AGENT_API_KEY!
const AGENT_URL = process.env.DO_AGENT_URL!

const headers = { Authorization: `Bearer ${DO_TOKEN}`, 'Content-Type': 'application/json' }

export async function createKnowledgeBase(name: string, url: string) {
  const res = await fetch(`${BASE}/knowledge_bases`, {
    method: 'POST', headers,
    body: JSON.stringify({
      name, region: REGION, project_id: PROJECT_ID,
      embedding_model_uuid: EMBEDDING_MODEL_UUID,
      datasources: [{ web_crawler_data_source: { base_url: url, crawling_option: 'DOMAIN', embed_media: false } }],
    }),
  })
  return res.json()
}

export async function attachKBToAgent(kbUuid: string) {
  const res = await fetch(`${BASE}/agents/${AGENT_UUID}/knowledge_bases/${kbUuid}`, { method: 'POST', headers })
  return res.json()
}

export async function detachKBFromAgent(kbUuid: string) {
  await fetch(`${BASE}/agents/${AGENT_UUID}/knowledge_bases/${kbUuid}`, { method: 'DELETE', headers })
}

export async function chatWithAgent(messages: { role: string; content: string }[]): Promise<string> {
  const res = await fetch(`${AGENT_URL}/api/v1/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${AGENT_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, stream: false }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || data?.detail || `Agent error ${res.status}`)
  return data?.choices?.[0]?.message?.content || ''
}
