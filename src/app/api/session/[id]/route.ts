import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '../../../../lib/store'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession(params.id)
  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  return NextResponse.json({ businessName: session.businessName, endpoint: session.endpoint, apiKey: session.apiKey })
}
