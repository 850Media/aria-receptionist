import { NextRequest, NextResponse } from 'next/server'
import { getAgent, initDB } from '../../../../lib/db'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await initDB()
  const agent = await getAgent(params.id)
  if (!agent) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  return NextResponse.json({
    businessName: agent.business_name,
    endpoint: agent.endpoint,
    apiKey: agent.api_key,
  })
}
