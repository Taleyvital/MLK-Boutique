import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHmac } from 'crypto'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  // Vérification signature Wave (si WAVE_WEBHOOK_SECRET est configuré)
  const webhookSecret = process.env.WAVE_WEBHOOK_SECRET
  if (webhookSecret) {
    const signature = req.headers.get('wave-signature') ?? ''
    const expected = createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex')
    if (signature !== expected) {
      return NextResponse.json({ error: 'Signature invalide.' }, { status: 401 })
    }
  }

  let event: Record<string, unknown>
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'JSON invalide.' }, { status: 400 })
  }

  const { checkout_status, payment_status, client_reference } = event as {
    checkout_status?: string
    payment_status?: string
    client_reference?: string
  }

  if (!client_reference) {
    return NextResponse.json({ received: true })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  if (checkout_status === 'complete' && payment_status === 'succeeded') {
    await supabase
      .from('orders')
      .update({ status: 'confirmée', payment_status: 'paid' } as never)
      .eq('id', client_reference)
  } else if (checkout_status === 'expired' || payment_status === 'failed') {
    await supabase
      .from('orders')
      .update({ status: 'annulée', payment_status: 'failed' } as never)
      .eq('id', client_reference)
  }

  return NextResponse.json({ received: true })
}
