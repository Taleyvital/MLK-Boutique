'use client'

import { useRouter } from 'next/navigation'
import { CreditCard, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCart } from '@/hooks/useCart'
import { getWhatsAppUrl } from '@/lib/whatsapp'

export function CheckoutButtons() {
  const router = useRouter()
  const { items, total } = useCart()

  function handleWhatsApp() {
    const url = getWhatsAppUrl(items, total(), {
      name: '',
      address: 'Abidjan',
    })
    window.open(url, '_blank')
  }

  function handleMobileMoney() {
    router.push('/checkout')
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={handleMobileMoney}
        className="gap-2"
      >
        <CreditCard size={18} strokeWidth={1.5} />
        Payer — Mobile Money
      </Button>
      <Button
        variant="ghost"
        size="lg"
        fullWidth
        onClick={handleWhatsApp}
        className="gap-2"
      >
        <MessageCircle size={18} strokeWidth={1.5} />
        Finaliser sur WhatsApp
      </Button>
    </div>
  )
}
