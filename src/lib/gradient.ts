const DO_TOKEN = process.env.DO_API_TOKEN!
const BASE = 'https://api.digitalocean.com/v2/gen-ai'
const EMBEDDING_MODEL_UUID = '22653204-79ed-11ef-bf8f-4e013e2ddde4'
const LLAMA_MODEL_UUID = 'd754f2d7-d1f0-11ef-bf8f-4e013e2ddde4'
const REGION = process.env.DO_REGION || 'tor1'
const PROJECT_ID = process.env.DO_PROJECT_ID!

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

export async function createAgent(name: string, kbUuid: string, businessName: string) {
  const instruction = `You are ARIA, the AI receptionist for ${businessName}. Answer customer questions warmly and accurately using only information from your knowledge base. Be concise and professional. Always ask for name and contact info when someone shows buying intent. If you don't know something, say so and offer to have someone follow up.`

  const res = await fetch(`${BASE}/agents`, {
    method: 'POST', headers,
    body: JSON.stringify({
      name,
      model_uuid: LLAMA_MODEL_UUID,
      instruction,
      project_id: PROJECT_ID,
      region: REGION,
    }),
  })
  const data = await res.json()
  const agentUuid = data?.agent?.uuid
  if (!agentUuid) throw new Error('Failed to create agent: ' + JSON.stringify(data))

  // Attach KB
  await fetch(`${BASE}/agents/${agentUuid}/knowledge_bases/${kbUuid}`, { method: 'POST', headers })

  // Create API key
  const keyRes = await fetch(`${BASE}/agents/${agentUuid}/api_keys`, {
    method: 'POST', headers,
    body: JSON.stringify({ name: 'aria-key' }),
  })
  const keyData = await keyRes.json()
  const apiKey = keyData?.api_key_info?.secret_key
  const endpoint = data?.agent?.deployment?.url || ''

  return { agentUuid, apiKey, endpoint }
}

export async function chatWithAgent(endpoint: string, apiKey: string, messages: { role: string; content: string }[]): Promise<string> {
  const res = await fetch(`${endpoint}/api/v1/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, stream: false }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || data?.detail || `Agent error ${res.status}`)
  return data?.choices?.[0]?.message?.content || ''
}
