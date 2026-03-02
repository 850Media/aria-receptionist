// DigitalOcean Gradient API client
const DO_TOKEN = process.env.DO_API_TOKEN!
const BASE = 'https://api.digitalocean.com/v2/gen-ai'
const EMBEDDING_MODEL_UUID = '22653204-79ed-11ef-bf8f-4e013e2ddde4' // GTE Large EN v1.5
const REGION = process.env.DO_REGION || 'tor1'
const PROJECT_ID = process.env.DO_PROJECT_ID!

const headers = {
  Authorization: `Bearer ${DO_TOKEN}`,
  'Content-Type': 'application/json',
}

export async function createKnowledgeBase(name: string, url: string) {
  const res = await fetch(`${BASE}/knowledge_bases`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name,
      region: REGION,
      project_id: PROJECT_ID,
      embedding_model_uuid: EMBEDDING_MODEL_UUID,
      datasources: [{
        web_crawler_data_source: {
          base_url: url,
          crawling_option: 'DOMAIN',
          embed_media: false,
        },
      }],
    }),
  })
  return res.json()
}

export async function queryKnowledgeBase(kbUuid: string, query: string): Promise<string> {
  const res = await fetch(`${BASE}/knowledge_bases/${kbUuid}/query`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, top_k: 5 }),
  })
  const data = await res.json()
  // Extract text chunks from results
  const chunks = data?.results || data?.matches || []
  if (chunks.length === 0) return ''
  return chunks.map((c: any) => c.content || c.text || c.chunk || '').filter(Boolean).join('\n\n')
}
