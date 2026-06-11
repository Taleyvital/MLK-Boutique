'use client'

import { useRouter } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { useCart } from '@/hooks/useCart'
import { getWhatsAppUrl } from '@/lib/whatsapp'

const PAYMENT_LOGOS = [
  { name: 'MTN',    src: '/moyen-paiement/MTN-CI.jpg' },
  { name: 'Orange', src: '/moyen-paiement/Orange-money.png' },
  { name: 'Wave',   src: '/moyen-paiement/wave.png' },
]

export function CheckoutButtons() {
  const router = useRouter()
  const { items, total } = useCart()

  function handleWhatsApp() {
    const url = getWhatsAppUrl(items, total(), { name: '', address: 'Abidjan' })
    window.open(url, '_blank')
  }

  return (
    <div className="flex flex-col gap-3">

      {/* Mobile Money — bouton principal avec logos */}
      <button
        onClick={() => router.push('/checkout')}
        className="w-full rounded-xl bg-primary text-white flex flex-col items-center gap-2 py-3.5 px-4 active:scale-[0.98] transition-transform"
      >
        <span className="font-sans font-semibold text-sm">Payer par Mobile Money</span>
        <div className="flex items-center gap-2">
          {PAYMENT_LOGOS.map(({ name, src }) => (
            <div
              key={name}
              className="bg-white rounded-lg flex items-center justify-center overflow-hidden"
              style={{ width: 44, height: 26 }}
            >
              <Image
                src={src}
                alt={name}
                width={36}
                height={20}
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </button>

      {/* WhatsApp */}
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
