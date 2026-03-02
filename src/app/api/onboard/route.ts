import { NextRequest, NextResponse } from 'next/server'
import { createAgent } from '../../../lib/gradient'
import { saveAgent, initDB } from '../../../lib/db'
import { randomBytes } from 'crypto'

// Create KB with retries on different URL formats
async function tryCreateKB(name: string, url: string) {
  const { createKnowledgeBase } = await import('../../../lib/gradient')
  
  // Try https first
  try {
    const kb = await createKnowledgeBase(name, url)
    if (kb?.knowledge_base?.uuid) return kb
  } catch {}

  // Try http fallback
  if (url.startsWith('https://')) {
    try {
      const httpUrl = url.replace('https://', 'http://')
      const kb = await createKnowledgeBase(name + '-2', httpUrl)
      if (kb?.knowledge_base?.uuid) return kb
    } catch {}
  }

  // Try without www
  try {
    const noWww = url.replace('://www.', '://')
    const kb = await createKnowledgeBase(name + '-3', noWww)
    if (kb?.knowledge_base?.uuid) return kb
  } catch {}

  return null
}

export async function POST(req: NextRequest) {
  const { url, businessName } = await req.json()
  if (!url || !businessName) return NextResponse.json({ error: 'Missing url or businessName' }, { status: 400 })

  try {
    await initDB()

    const slug = businessName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30)
    const ts = Date.now()

    // 1. Try to create DO Gradient KB (best effort — some sites have SSL issues)
    const kb = await tryCreateKB(`aria-kb-${slug}-${ts}`, url)
    const kbUuid = kb?.knowledge_base?.uuid || null

    // 2. Create dedicated agent (with KB if we got one)
    const { agentUuid, apiKey, endpoint } = await createAgent(
      `aria-${slug}-${ts}`,
      kbUuid,
      businessName,
      url
    )

    // 3. Persist to DB
    const chatId = randomBytes(8).toString('hex')
    await saveAgent({ chatId, businessName, url, agentUuid, kbUuid: kbUuid || '', endpoint, apiKey })

    const appUrl = process.env.APP_URL || 'https://aria-receptionist-n5zcp.ondigitalocean.app'
    const chatUrl = `${appUrl}/chat/${chatId}`

    return NextResponse.json({ success: true, chatId, chatUrl, agentUuid, kbUuid, businessName })
  } catch (err: any) {
    console.error('Onboard error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
