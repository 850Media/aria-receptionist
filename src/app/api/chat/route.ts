import { NextRequest, NextResponse } from 'next/server'
import { chatWithAgent } from '../../../lib/gradient'

export async function POST(req: NextRequest) {
  const { message, history, businessName } = await req.json()
  if (!message) return NextResponse.json({ error: 'Missing message' }, { status: 400 })

  try {
    const systemMessage = {
      role: 'system',
      content: `You are ARIA, the AI receptionist for ${businessName}. Answer customer questions warmly and accurately using only information from your knowledge base. If you don't know something, say so and offer to have someone follow up. Always ask for name and contact info when someone shows buying intent.`
    }

    const messages = [systemMessage, ...(history || []), { role: 'user', content: message }]
    const reply = await chatWithAgent(messages)

    return NextResponse.json({
      reply,
      history: [...(history || []), { role: 'user', content: message }, { role: 'assistant', content: reply }],
    })
  } catch (err: any) {
    console.error('Chat error:', err.message)
    return NextResponse.json({ error: err.message, reply: "I'm having trouble right now. Please try again." }, { status: 500 })
  }
}
