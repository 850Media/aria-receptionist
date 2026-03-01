import { NextRequest, NextResponse } from 'next/server'
import { chatWithAgent } from '../../../lib/gradient'

export async function POST(req: NextRequest) {
  const { agentUuid, message, conversationUuid } = await req.json()
  if (!agentUuid || !message) return NextResponse.json({ error: 'Missing agentUuid or message' }, { status: 400 })

  try {
    const data = await chatWithAgent(agentUuid, message, conversationUuid)
    return NextResponse.json({
      reply: data?.message?.content || data?.content || 'Sorry, I had trouble with that. Please try again.',
      conversationUuid: data?.conversation_uuid || conversationUuid,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
