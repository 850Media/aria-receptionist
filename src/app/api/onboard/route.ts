import { NextRequest, NextResponse } from 'next/server'
import { createKnowledgeBase, attachKBToAgent } from '../../../lib/gradient'

export async function POST(req: NextRequest) {
  const { url, businessName } = await req.json()
  if (!url || !businessName) return NextResponse.json({ error: 'Missing url or businessName' }, { status: 400 })

  try {
    const kbName = `aria-${businessName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 40)}-${Date.now()}`

    // 1. Create DO Gradient knowledge base (crawls website)
    const kb = await createKnowledgeBase(kbName, url)
    const kbUuid = kb?.knowledge_base?.uuid
    if (!kbUuid) return NextResponse.json({ error: 'Failed to create knowledge base', detail: kb }, { status: 500 })

    // 2. Attach KB to shared ARIA agent
    await attachKBToAgent(kbUuid)

    return NextResponse.json({ success: true, kbUuid, businessName })
  } catch (err: any) {
    console.error('Onboard error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
