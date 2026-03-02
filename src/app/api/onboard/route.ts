import { NextRequest, NextResponse } from 'next/server'
import { createKnowledgeBase } from '../../../lib/gradient'
import { crawlWebsite } from '../../../lib/crawler'

export async function POST(req: NextRequest) {
  const { url, businessName } = await req.json()
  if (!url || !businessName) return NextResponse.json({ error: 'Missing url or businessName' }, { status: 400 })

  try {
    // 1. Crawl website for content (our own RAG context)
    const websiteContent = await crawlWebsite(url, 5)

    // 2. Create DO Gradient knowledge base (uses DO platform feature)
    const kbName = `aria-${businessName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 40)}-${Date.now()}`
    let kbUuid = null
    try {
      const kb = await createKnowledgeBase(kbName, url)
      kbUuid = kb?.knowledge_base?.uuid
    } catch { /* KB creation is best-effort */ }

    const systemPrompt = `You are ARIA, the AI receptionist for ${businessName}. You have been trained on ${businessName}'s website content below.

WEBSITE CONTENT:
${websiteContent}

END OF WEBSITE CONTENT

Answer customer questions using this content. Be warm, concise, and professional. Always ask for name and contact info when someone shows buying intent. Never make up information not found in the content above.`

    return NextResponse.json({
      success: true,
      kbUuid: kbUuid || 'local',
      businessName,
      systemPrompt,
      message: 'ARIA is ready!',
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
