import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const WAVE_API_URL = 'https://api.wave.com/v1/checkout/sessions'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { customerName, customerPhone, customerAddress, items, total } = body

  if (!customerName || !customerPhone || !customerAddress || !items || !total) {
    return NextResponse.json({ error: 'Champs manquants.' }, { status: 400 })
  }

  const waveApiKey = process.env.WAVE_API_KEY
  if (!waveApiKey) {
    return NextResponse.json({ error: 'Wave API non configurée.' }, { status: 500 })
  }

  // 1. Créer la commande en base (statut pending)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_address: customerAddress,
      items,
      total,
      payment_method: 'mobile_money',
      payment_status: 'pending',
      status: 'nouvelle',
    } as never)
    .select('id')
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: 'Erreur création commande.' }, { status: 500 })
  }

  const orderId = (order as { id: string }).id
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  // 2. Créer la session de paiement Wave
  const waveRes = await fetch(WAVE_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${waveApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: String(total),
      currency: 'XOF',
      client_reference: orderId,
      success_url: `${siteUrl}/confirmation?orderId=${orderId}`,
      error_url: `${siteUrl}/checkout?error=paiement_annule`,
      checkout_status_url: `${siteUrl}/api/wave/webhook`,
    }),
  })

  if (!waveRes.ok) {
    const err = await waveRes.json().catch(() => ({}))
    console.error('Wave API error:', err)
    return NextResponse.json({ error: 'Erreur Wave, réessayez.' }, { status: 502 })
  }

  const waveData = await waveRes.json()

  return NextResponse.json({
    orderId,
    wave_launch_url: waveData.wave_launch_url,
  })
}
