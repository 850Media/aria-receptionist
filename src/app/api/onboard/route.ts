import { NextRequest, NextResponse } from 'next/server'
import { createKnowledgeBase, createAgent } from '../../../lib/gradient'
import { saveAgent, initDB } from '../../../lib/db'
import { randomBytes } from 'crypto'

export async function POST(req: NextRequest) {
  const { url, businessName } = await req.json()
  if (!url || !businessName) return NextResponse.json({ error: 'Missing url or businessName' }, { status: 400 })

  try {
    await initDB()

    const slug = businessName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30)
    const ts = Date.now()

    // 1. Create dedicated KB (try https first, then http fallback)
    let kbUrl = url
    let kb = await createKnowledgeBase(`aria-kb-${slug}-${ts}`, kbUrl)
    if (!kb?.knowledge_base?.uuid && url.startsWith('https://')) {
      kbUrl = url.replace('https://', 'http://')
      kb = await createKnowledgeBase(`aria-kb-${slug}-${ts}-2`, kbUrl)
    }
    const kbUuid = kb?.knowledge_base?.uuid
    if (!kbUuid) return NextResponse.json({ error: 'Failed to create knowledge base', detail: kb }, { status: 500 })

    // 2. Create dedicated agent
    const { agentUuid, apiKey, endpoint } = await createAgent(`aria-${slug}-${ts}`, kbUuid, businessName)

    // 3. Persist to DB
    const chatId = randomBytes(8).toString('hex')
    await saveAgent({ chatId, businessName, url, agentUuid, kbUuid, endpoint, apiKey })

    const appUrl = process.env.APP_URL || 'https://aria-receptionist-n5zcp.ondigitalocean.app'
    const chatUrl = `${appUrl}/chat/${chatId}`

    return NextResponse.json({ success: true, chatId, chatUrl, agentUuid, kbUuid, businessName })
  } catch (err: any) {
    console.error('Onboard error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
