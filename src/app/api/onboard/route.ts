import { NextRequest, NextResponse } from 'next/server'
import { createKnowledgeBase, createAgent } from '../../../lib/gradient'

export async function POST(req: NextRequest) {
  const { url, businessName } = await req.json()
  if (!url || !businessName) return NextResponse.json({ error: 'Missing url or businessName' }, { status: 400 })

  try {
    const slug = businessName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30)
    const ts = Date.now()

    // 1. Create dedicated KB for this business
    const kb = await createKnowledgeBase(`aria-kb-${slug}-${ts}`, url)
    const kbUuid = kb?.knowledge_base?.uuid
    if (!kbUuid) return NextResponse.json({ error: 'Failed to create knowledge base', detail: kb }, { status: 500 })

    // 2. Create dedicated agent with KB attached
    const { agentUuid, apiKey, endpoint } = await createAgent(`aria-${slug}-${ts}`, kbUuid, businessName)

    return NextResponse.json({ success: true, agentUuid, apiKey, endpoint, kbUuid, businessName })
  } catch (err: any) {
    console.error('Onboard error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
