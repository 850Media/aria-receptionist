import { NextRequest, NextResponse } from 'next/server'
import { createKnowledgeBase } from '../../../lib/gradient'

export async function POST(req: NextRequest) {
  const { url, businessName } = await req.json()
  if (!url || !businessName) return NextResponse.json({ error: 'Missing url or businessName' }, { status: 400 })

  try {
    const kbName = `aria-${businessName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 40)}-${Date.now()}`
    const kb = await createKnowledgeBase(kbName, url)
    const kbUuid = kb?.knowledge_base?.uuid
    if (!kbUuid) return NextResponse.json({ error: 'Failed to create knowledge base', detail: kb }, { status: 500 })

    const systemPrompt = `You are ARIA, the AI receptionist for ${businessName}. You have been trained on ${businessName}'s website. Answer customer questions warmly and accurately. Capture leads by asking for name and contact info when someone shows buying intent. Never make up information not in the context provided.`

    return NextResponse.json({
      success: true,
      kbUuid,
      businessName,
      systemPrompt,
      message: 'ARIA is being trained on your website. Ready in ~60 seconds.',
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
