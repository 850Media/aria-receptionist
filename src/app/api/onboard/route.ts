import { NextRequest, NextResponse } from 'next/server'
import { createKnowledgeBase, attachKBToAgent, detachKBFromAgent, getAgentKBs } from '../../../lib/gradient'

export async function POST(req: NextRequest) {
  const { url, businessName } = await req.json()
  if (!url || !businessName) return NextResponse.json({ error: 'Missing url or businessName' }, { status: 400 })

  try {
    // 1. Detach all existing KBs from agent
    const existingKBs = await getAgentKBs()
    for (const kb of existingKBs) {
      await detachKBFromAgent(kb.uuid)
    }

    // 2. Create new KB for this business
    const kbName = `aria-${businessName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 40)}-${Date.now()}`
    const kb = await createKnowledgeBase(kbName, url)
    const kbUuid = kb?.knowledge_base?.uuid
    if (!kbUuid) return NextResponse.json({ error: 'Failed to create knowledge base', detail: kb }, { status: 500 })

    // 3. Attach new KB to agent
    await attachKBToAgent(kbUuid)

    return NextResponse.json({ success: true, kbUuid, businessName })
  } catch (err: any) {
    console.error('Onboard error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
