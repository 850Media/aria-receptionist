import { NextRequest, NextResponse } from 'next/server'
import { chatWithAgent } from '../../../lib/gradient'

export async function POST(req: NextRequest) {
  const { message, history, businessName, endpoint, apiKey } = await req.json()
  if (!message || !endpoint || !apiKey) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  try {
    const messages = [
      ...(history || []),
      { role: 'user', content: message }
    ]
    const reply = await chatWithAgent(endpoint, apiKey, messages)
    const clean = reply.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')

    return NextResponse.json({
      reply: clean,
      history: [...messages, { role: 'assistant', content: clean }],
    })
  } catch (err: any) {
    console.error('Chat error:', err.message)
    return NextResponse.json({ error: err.message, reply: "I'm having trouble right now. Please try again." }, { status: 500 })
  }
}
