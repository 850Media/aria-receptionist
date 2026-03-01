import { NextRequest, NextResponse } from 'next/server'
import { createKnowledgeBase, createAgent } from '@/lib/gradient'

export async function POST(req: NextRequest) {
  const { url, businessName } = await req.json()
  if (!url || !businessName) return NextResponse.json({ error: 'Missing url or businessName' }, { status: 400 })

  try {
    // 1. Create knowledge base from website URL
    const kb = await createKnowledgeBase(`aria-${businessName.toLowerCase().replace(/\s+/g, '-')}`, [url])
    const kbUuid = kb?.knowledge_base?.uuid
    if (!kbUuid) return NextResponse.json({ error: 'Failed to create knowledge base', detail: kb }, { status: 500 })

    // 2. Build system prompt
    const systemPrompt = `You are ARIA, the AI receptionist for ${businessName}. 
You have been trained on ${businessName}'s website and know everything about their services, pricing, hours, and policies.

Your role:
- Answer customer questions warmly and accurately using only information from the knowledge base
- Capture leads: always ask for name, phone or email when someone shows buying intent
- Help customers book appointments or get quotes
- Escalate genuine emergencies to a human immediately

Rules:
- Never make up pricing or promises not in the knowledge base
- Stay on topic — you represent ${businessName} only
- Be concise, friendly, and professional
- If you don't know something, say so and offer to have someone follow up

Always greet customers with: "Hi! I'm ARIA, the virtual receptionist for ${businessName}. How can I help you today?"`

    // 3. Create agent
    const agent = await createAgent(`aria-${businessName}`, kbUuid, systemPrompt)
    const agentUuid = agent?.agent?.uuid
    if (!agentUuid) return NextResponse.json({ error: 'Failed to create agent', detail: agent }, { status: 500 })

    return NextResponse.json({
      success: true,
      kbUuid,
      agentUuid,
      businessName,
      message: 'ARIA is being trained on your website. This takes 2-3 minutes.',
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
