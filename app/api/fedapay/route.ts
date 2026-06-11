import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event, transaction } = body

    if (event === 'transaction.approved') {
      const supabase = createServerClient()
      await supabase
        .from('orders')
        .update({ payment_status: 'paid', status: 'confirmée' } as never)
        .eq('fedapay_transaction_id', transaction.id)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }
}
