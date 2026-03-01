// DigitalOcean Gradient API client
const DO_TOKEN = process.env.DO_API_TOKEN!
const BASE = 'https://api.digitalocean.com/v2/gen-ai'
const CLAUDE_SONNET_UUID = 'f285d639-769e-11ef-bf8f-4e013e2ddde4' // Claude 3.5 Sonnet
const EMBEDDING_MODEL_UUID = '22653204-79ed-11ef-bf8f-4e013e2ddde4' // GTE Large EN v1.5
const REGION = process.env.DO_REGION || 'tor1'

const headers = {
  Authorization: `Bearer ${DO_TOKEN}`,
  'Content-Type': 'application/json',
}

export async function createKnowledgeBase(name: string, urls: string[]) {
  const res = await fetch(`${BASE}/knowledge_bases`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name,
      region: REGION,
      embedding_model_uuid: EMBEDDING_MODEL_UUID,
      datasources: urls.map(url => ({
        name: `${name}-web`,
        data_source_type: 'WEB_CRAWLER',
        web_crawler_config: {
          base_url: url,
          crawl_type: 'CRAWL_TYPE_SCOPED',
          pages: 20,
        },
      })),
    }),
  })
  return res.json()
}

export async function getKnowledgeBase(uuid: string) {
  const res = await fetch(`${BASE}/knowledge_bases/${uuid}`, { headers })
  return res.json()
}

export async function createAgent(name: string, knowledgeBaseUuid: string, systemPrompt: string) {
  const res = await fetch(`${BASE}/agents`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name,
      region: REGION,
      model: { uuid: CLAUDE_SONNET_UUID },
      instruction: systemPrompt,
      knowledge_bases: [{ uuid: knowledgeBaseUuid }],
    }),
  })
  return res.json()
}

export async function getAgent(uuid: string) {
  const res = await fetch(`${BASE}/agents/${uuid}`, { headers })
  return res.json()
}

export async function chatWithAgent(agentUuid: string, message: string, conversationUuid?: string) {
  const body: any = { message }
  if (conversationUuid) body.conversation_uuid = conversationUuid

  const res = await fetch(`${BASE}/agents/${agentUuid}/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  return res.json()
}
