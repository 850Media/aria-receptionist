import { NextRequest, NextResponse } from 'next/server'
import { queryKnowledgeBase } from '../../../lib/gradient'

export async function POST(req: NextRequest) {
  const { kbUuid, message, history, businessName, systemPrompt } = await req.json()
  if (!kbUuid || !message) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

  try {
    // 1. Query DO Gradient knowledge base for relevant context
    const context = await queryKnowledgeBase(kbUuid, message)

    // 2. Build messages for Anthropic
    const messages = [
      ...(history || []),
      { role: 'user', content: message }
    ]

    // 3. Call Anthropic Claude directly
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 1024,
        system: `${systemPrompt || `You are ARIA, the AI receptionist for ${businessName}.`}

Here is relevant information from ${businessName}'s website to help answer the customer's question:
<context>
${context || 'No specific context found — answer generally and offer to have someone follow up.'}
</context>

Rules:
- Answer using only the context above when possible
- Be warm, concise, and professional
- Always ask for name + contact info when someone shows buying intent
- If you don't know something specific, say so and offer a callback`,
        messages,
      }),
    })

    const data = await anthropicRes.json()
    const reply = data?.content?.[0]?.text || 'Sorry, I had trouble with that. Please try again.'

    return NextResponse.json({
      reply,
      history: [...messages, { role: 'assistant', content: reply }],
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
