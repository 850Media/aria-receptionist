import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { message, history, businessName, systemPrompt } = await req.json()
  if (!message || !systemPrompt) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  try {
    const messages = [
      ...(history || []),
      { role: 'user', content: message }
    ]

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data?.error?.message || `Anthropic error ${res.status}`)

    const reply = data?.content?.[0]?.text || 'Sorry, I had trouble with that.'

    return NextResponse.json({
      reply,
      history: [...messages, { role: 'assistant', content: reply }],
    })
  } catch (err: any) {
    console.error('Chat error:', err.message)
    return NextResponse.json({ error: err.message, reply: `I'm having trouble right now. Please try again in a moment.` }, { status: 500 })
  }
}
