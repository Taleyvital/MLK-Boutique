'use client'

import { useRouter } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { useCart } from '@/hooks/useCart'
import { getWhatsAppUrl } from '@/lib/whatsapp'

const MTN_ORANGE_LOGOS = [
  { name: 'MTN',    src: '/moyen-paiement/MTN-CI.jpg' },
  { name: 'Orange', src: '/moyen-paiement/Orange-money.png' },
]

export function CheckoutButtons() {
  const router = useRouter()
  const { items, total } = useCart()

  // Lien Wave du premier article qui en possède un
  const rawWaveUrl = items.find(i => i.wavePaymentUrl)?.wavePaymentUrl ?? null
  const waveUrl = rawWaveUrl && !rawWaveUrl.startsWith('http')
    ? `https://${rawWaveUrl}`
    : rawWaveUrl

  function handleWhatsApp() {
    const url = getWhatsAppUrl(items, total(), { name: '', address: 'Abidjan' })
    window.open(url, '_blank')
  }

  return (
    <div className="flex flex-col gap-3">

      {/* Wave — affiché uniquement si un article a un lien Wave */}
      {waveUrl && (
        <a
          href={waveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full rounded-2xl bg-[#1DC3C3] text-white flex items-center justify-center gap-3 py-4 font-sans font-bold text-base active:scale-[0.98] transition-transform"
        >
          <Image
            src="/moyen-paiement/wave.png"
            alt="Wave"
            width={28}
            height={28}
            className="rounded-lg overflow-hidden object-contain bg-white/20 p-0.5"
          />
          Payer avec Wave
        </a>
      )}

      {/* Mobile Money — MTN / Orange */}
      <button
        onClick={() => router.push('/checkout')}
        className="w-full rounded-2xl bg-primary text-white flex flex-col items-center gap-2 py-3.5 px-4 active:scale-[0.98] transition-transform"
      >
        <span className="font-sans font-semibold text-sm">Payer par Mobile Money</span>
        <div className="flex items-center gap-2">
          {MTN_ORANGE_LOGOS.map(({ name, src }) => (
            <div
              key={name}
              className="bg-white rounded-lg flex items-center justify-center overflow-hidden"
              style={{ width: 44, height: 26 }}
            >
              <Image src={src} alt={name} width={36} height={20} className="object-contain" />
            </div>
          ))}
        </div>
      </button>

      {/* WhatsApp */}
      <Button variant="ghost" size="lg" fullWidth onClick={handleWhatsApp} className="gap-2">
        <MessageCircle size={18} strokeWidth={1.5} />
        Finaliser sur WhatsApp
      </Button>

    </div>
  )
}
