'use client'

import Link from 'next/link'
import { ShoppingBag, Truck } from 'lucide-react'
import { CartItem } from '@/components/store/CartItem'
import { CheckoutButtons } from '@/components/store/CheckoutButtons'
import { formatPrice } from '@/lib/formatPrice'
import { useCart } from '@/hooks/useCart'

export default function PanierPage() {
  const { items, total } = useCart()
  const cartTotal = total()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-surface-rose flex items-center justify-center mb-4">
          <ShoppingBag size={32} className="text-outline" strokeWidth={1} />
        </div>
        <h2 className="font-serif text-2xl text-on-surface mb-2">Panier vide</h2>
        <p className="font-sans text-sm text-on-surface-variant mb-6 max-w-xs">
          Explorez notre catalogue et ajoutez les articles qui vous plaisent.
        </p>
        <Link
          href="/boutique"
          className="rounded-full bg-primary text-white font-sans font-semibold px-6 py-3 hover:bg-primary-container transition-colors"
        >
          Découvrir le catalogue
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="px-6 pt-4 pb-2">
        <h1 className="font-serif text-2xl text-on-surface">
          Mon Panier
          <span className="font-sans text-base text-on-surface-variant ml-2 font-normal">
            ({items.length} article{items.length > 1 ? 's' : ''})
          </span>
        </h1>
      </div>

      <div className="px-6">
        {items.map((item) => (
          <CartItem key={`${item.id}-${item.size}`} item={item} />
        ))}
      </div>

      <div className="px-6 pt-4 pb-6">
        <div className="bg-surface-rose rounded-xl p-4 space-y-2.5 mb-4">
          <div className="flex justify-between font-sans text-sm text-on-surface">
            <span>Sous-total</span>
            <span>{formatPrice(cartTotal)}</span>
          </div>
          <div className="flex justify-between font-sans text-sm text-on-surface">
            <span>Livraison</span>
            <span className="text-green-700 font-medium">Gratuit</span>
          </div>
          <div className="w-full h-px bg-surface-mist" />
          <div className="flex justify-between font-sans text-base font-semibold text-on-surface">
            <span>Total</span>
            <span className="text-[#720808] text-lg">{formatPrice(cartTotal)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-surface-mist/50 rounded-xl p-3 mb-5">
          <Truck size={16} className="text-tertiary flex-shrink-0" strokeWidth={1.5} />
          <p className="font-sans text-xs text-on-surface-variant">
            <span className="font-semibold text-on-surface">Livraison estimée : Abidjan 24h</span>{' '}
            après confirmation de votre commande
          </p>
        </div>

        <CheckoutButtons />
      </div>
    </div>
  )
}
