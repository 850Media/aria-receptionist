import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'placeholder')
const APP_URL = process.env.APP_URL || 'https://aria-receptionist-n5zcp.ondigitalocean.app'

const PRICES: Record<string, string> = {
  starter: process.env.STRIPE_PRICE_STARTER || 'price_1T6MQE2mxB8h9GvSFr8irvlL',
  pro: process.env.STRIPE_PRICE_PRO || 'price_1T6MQF2mxB8h9GvSpN01Nq68',
}

export async function POST(req: NextRequest) {
  const { plan, email } = await req.json()
  if (!plan || !PRICES[plan]) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: email || undefined,
    line_items: [{ price: PRICES[plan], quantity: 1 }],
    success_url: `${APP_URL}/onboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}/?cancelled=true`,
    metadata: { plan },
  })

  return NextResponse.json({ url: session.url })
}
