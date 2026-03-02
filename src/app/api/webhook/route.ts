import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { upsertCustomer, initDB } from '../../../lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'placeholder')

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 })
  }

  await initDB()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const customerId = session.customer as string
    const email = session.customer_email || session.customer_details?.email || ''
    const plan = session.metadata?.plan || 'starter'
    await upsertCustomer(customerId, email, plan)
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    const customerId = sub.customer as string
    await upsertCustomer(customerId, '', 'free')
  }

  return NextResponse.json({ received: true })
}
