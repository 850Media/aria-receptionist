import { NextRequest, NextResponse } from 'next/server'
import { createKnowledgeBase, createAgent } from '../../../lib/gradient'
import { saveSession } from '../../../lib/store'
import { randomBytes } from 'crypto'

export async function POST(req: NextRequest) {
  const { url, businessName } = await req.json()
  if (!url || !businessName) return NextResponse.json({ error: 'Missing url or businessName' }, { status: 400 })

  try {
    const slug = businessName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30)
    const ts = Date.now()

    // 1. Create dedicated KB
    const kb = await createKnowledgeBase(`aria-kb-${slug}-${ts}`, url)
    const kbUuid = kb?.knowledge_base?.uuid
    if (!kbUuid) return NextResponse.json({ error: 'Failed to create knowledge base', detail: kb }, { status: 500 })

    // 2. Create dedicated agent with KB attached
    const { agentUuid, apiKey, endpoint } = await createAgent(`aria-${slug}-${ts}`, kbUuid, businessName)

    // 3. Generate shareable ID
    const chatId = randomBytes(8).toString('hex')
    saveSession(chatId, { businessName, endpoint, apiKey, kbUuid, createdAt: ts })

    const appUrl = process.env.APP_URL || 'https://aria-receptionist-n5zcp.ondigitalocean.app'
    const chatUrl = `${appUrl}/chat/${chatId}`

    return NextResponse.json({ success: true, chatId, chatUrl, agentUuid, kbUuid, businessName })
  } catch (err: any) {
    console.error('Onboard error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
