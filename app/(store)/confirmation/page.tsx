'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { CheckCircle, Home, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/Button'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-6">
        <CheckCircle size={40} className="text-green-600" strokeWidth={1.5} />
      </div>

      <h1 className="font-serif text-2xl text-on-surface mb-2">Commande reçue !</h1>
      <p className="font-sans text-sm text-on-surface-variant mb-2 max-w-xs">
        Merci pour votre commande. Nous vous contacterons sous peu pour confirmer les détails.
      </p>

      {orderId && (
        <div className="bg-surface-rose rounded-xl px-4 py-2 mb-6">
          <p className="font-sans text-xs text-on-surface-variant">
            Référence commande :{' '}
            <span className="font-semibold text-on-surface font-mono text-xs">
              #{orderId.slice(0, 8).toUpperCase()}
            </span>
          </p>
        </div>
      )}

      <div className="bg-surface-rose rounded-xl p-4 mb-8 max-w-sm w-full text-left space-y-2">
        <p className="font-sans text-sm font-semibold text-on-surface">Prochaines étapes :</p>
        <div className="flex items-start gap-2">
          <span className="font-sans text-xs text-white bg-primary rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
          <p className="font-sans text-xs text-on-surface-variant">Vous recevrez un appel pour confirmer votre commande</p>
        </div>
        <div className="flex items-start gap-2">
          <span className="font-sans text-xs text-white bg-primary rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
          <p className="font-sans text-xs text-on-surface-variant">Paiement Mobile Money lors de la livraison ou en ligne</p>
        </div>
        <div className="flex items-start gap-2">
          <span className="font-sans text-xs text-white bg-primary rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
          <p className="font-sans text-xs text-on-surface-variant">Livraison Abidjan sous 24h après confirmation</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <Link href="/" className="w-full">
          <Button variant="primary" size="lg" fullWidth className="gap-2">
            <Home size={16} strokeWidth={1.5} />
            Retour à l&apos;accueil
          </Button>
        </Link>
        <Link href="/boutique" className="w-full">
          <Button variant="ghost" size="md" fullWidth className="gap-2">
            <ShoppingBag size={16} strokeWidth={1.5} />
            Continuer les achats
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>}>
      <ConfirmationContent />
    </Suspense>
  )
}
