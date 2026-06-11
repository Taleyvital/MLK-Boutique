import { NextRequest, NextResponse } from 'next/server'
import { generateWhatsAppMessage, WHATSAPP_NUMBER } from '@/lib/whatsapp'
import type { CartItem } from '@/lib/whatsapp'

export async function POST(req: NextRequest) {
  const { items, total, customerInfo } = await req.json()
  const message = generateWhatsAppMessage(
    items as CartItem[],
    total as number,
    customerInfo as { name: string; address: string }
  )
  const url = `https://wa.me/${WHATSAPP_NUMBER.replace(/\+/g, '')}?text=${message}`
  return NextResponse.json({ url })
}
