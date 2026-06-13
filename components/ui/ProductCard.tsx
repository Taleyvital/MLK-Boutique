'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, ShoppingBag } from 'lucide-react'
import { Badge } from './Badge'
import { formatPrice } from '@/lib/formatPrice'
import { useCartAnim } from '@/components/ui/CartFlyAnimation'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'

interface ProductCardProps {
  id: string
  name: string
  price: number
  comparePrice?: number
  image: string
  isNew?: boolean
  slug: string
  sizes?: string[]
  wavePaymentUrl?: string
  className?: string
}

export function ProductCard({
  id,
  name,
  price,
  comparePrice,
  image,
  isNew,
  slug,
  sizes = [],
  wavePaymentUrl,
  className,
}: ProductCardProps) {
  const router = useRouter()
  const imageRef = useRef<HTMLDivElement>(null)
  const { triggerFly } = useCartAnim()
  const { addItem } = useCart()
  const { user, loading } = useAuth()

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    // Si le produit a des tailles, on navigue vers la fiche
    if (sizes.length > 1) {
      router.push(`/boutique/${slug}`)
      return
    }

    // Session pas encore chargée : on ne fait rien (évite de rediriger un connecté par erreur)
    if (loading) return

    // Connexion requise pour ajouter au panier (mode invité : navigation libre)
    if (!user) {
      const here = window.location.pathname + window.location.search
      router.push(`/login?redirect=${encodeURIComponent(here)}`)
      return
    }

    // Sinon ajout direct avec animation
    if (imageRef.current) {
      triggerFly(image || '/placeholder-product.svg', imageRef.current)
    }

    addItem({
      id,
      name,
      price,
      image: image || '/placeholder-product.svg',
      size: sizes[0] || 'Unique',
      qty: 1,
      slug,
      wavePaymentUrl,
    })
  }

  return (
    <Link
      href={`/boutique/${slug}`}
      className={`block bg-surface-rose rounded-xl overflow-hidden shadow-brand hover:shadow-md transition-shadow duration-300 ${className || ''}`}
    >
      <div ref={imageRef} className="relative aspect-[4/5]">
        <Image
          src={image || '/placeholder-product.svg'}
          alt={name}
          fill
          className="object-cover rounded-xl"
          sizes="(max-width: 768px) 50vw, 33vw"
        />

        {isNew && (
          <div className="absolute top-3 left-3">
            <Badge label="NOUVEAU" variant="new" />
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface/80 backdrop-blur-sm flex items-center justify-center hover:bg-surface transition-colors"
          aria-label="Ajouter aux favoris"
        >
          <Heart size={16} className="text-on-surface-variant" strokeWidth={1.5} />
        </button>

        {/* Quick add button */}
        <button
          onClick={handleQuickAdd}
          className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shadow-brand opacity-0 translate-y-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-primary-container active:scale-90"
          style={{ opacity: undefined }}
          aria-label="Ajouter au panier"
        >
          <ShoppingBag size={16} strokeWidth={1.5} />
        </button>
      </div>

      <div className="p-3">
        <p className="font-sans text-sm text-on-surface-variant leading-tight mb-1 line-clamp-2">
          {name}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-sans font-semibold text-[#720808] text-base">
              {formatPrice(price)}
            </span>
            {comparePrice && comparePrice > price && (
              <span className="font-sans text-xs text-outline line-through">
                {formatPrice(comparePrice)}
              </span>
            )}
          </div>
          {/* Quick add visible on mobile (no hover) */}
          <button
            onClick={handleQuickAdd}
            className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white active:scale-90 transition-all duration-150"
            aria-label="Ajouter au panier"
          >
            <ShoppingBag size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </Link>
  )
}
