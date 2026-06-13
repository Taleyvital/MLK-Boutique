'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Heart, ShoppingBag, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { useCartAnim } from '@/components/ui/CartFlyAnimation'
import { SizeChip } from '@/components/ui/SizeChip'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/lib/formatPrice'
import { getWhatsAppUrl } from '@/lib/whatsapp'
import type { Product } from '@/lib/supabase/types'

export function ProductPageContent({ product }: { product: Product }) {
  const router = useRouter()
  const { addItem } = useCart()
  const { user, loading } = useAuth()
  const { triggerFly } = useCartAnim()
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [added, setAdded] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)

  const images = product.images.length > 0 ? product.images : ['/placeholder-product.svg']

  function handleAddToCart() {
    if (!selectedSize && product.sizes.length > 0) return

    // Session pas encore chargée : on ne fait rien (évite de rediriger un connecté par erreur)
    if (loading) return

    // Connexion requise pour ajouter au panier (mode invité : navigation libre)
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(`/boutique/${product.slug}`)}`)
      return
    }

    if (imageRef.current) {
      triggerFly(images[currentImageIndex], imageRef.current)
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: images[0],
      size: selectedSize || 'Unique',
      qty: 1,
      slug: product.slug,
      wavePaymentUrl: product.wave_payment_url ?? undefined,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  function handleWhatsApp() {
    const url = getWhatsAppUrl(
      [{ id: product.id, name: product.name, price: product.price, image: images[0], size: selectedSize || 'Unique', qty: 1, slug: product.slug }],
      product.price,
      { name: '', address: 'Abidjan' }
    )
    window.open(url, '_blank')
  }

  const needsSize = product.sizes.length > 0 && !selectedSize

  return (
    <div className="min-h-screen bg-surface">
      {/* Image Gallery */}
      <div ref={imageRef} className="relative aspect-[4/5] bg-surface-rose overflow-hidden">
        <Image
          src={images[currentImageIndex]}
          alt={product.name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />

        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-surface/80 backdrop-blur-sm flex items-center justify-center shadow-brand"
          aria-label="Retour"
        >
          <ArrowLeft size={18} strokeWidth={1.5} className="text-on-surface" />
        </button>

        <button
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-surface/80 backdrop-blur-sm flex items-center justify-center shadow-brand"
          aria-label="Favoris"
        >
          <Heart size={18} strokeWidth={1.5} className="text-on-surface" />
        </button>

        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
              disabled={currentImageIndex === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-surface/70 backdrop-blur-sm flex items-center justify-center disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentImageIndex(Math.min(images.length - 1, currentImageIndex + 1))}
              disabled={currentImageIndex === images.length - 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-surface/70 backdrop-blur-sm flex items-center justify-center disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentImageIndex(i)}
                className={`rounded-full transition-all duration-200 ${
                  i === currentImageIndex
                    ? 'w-4 h-1.5 bg-white'
                    : 'w-1.5 h-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="px-6 pt-5 pb-32">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h1 className="font-serif text-2xl text-on-surface leading-tight flex-1">
            {product.name}
          </h1>
          {product.is_new && <Badge label="NOUVEAU" variant="new" className="mt-1 flex-shrink-0" />}
        </div>

        <div className="flex items-center gap-3 mb-4">
          <span className="font-sans font-semibold text-2xl text-[#720808]">
            {formatPrice(product.price)}
          </span>
          {product.compare_price && product.compare_price > product.price && (
            <span className="font-sans text-base text-outline line-through">
              {formatPrice(product.compare_price)}
            </span>
          )}
        </div>

        {product.description && (
          <p className="font-sans text-sm text-on-surface-variant leading-relaxed mb-5">
            {product.description}
          </p>
        )}

        <div className="w-full h-px bg-surface-mist mb-5" />

        {product.sizes.length > 0 && (
          <div className="mb-6">
            <p className="font-sans text-sm font-semibold text-on-surface mb-3">
              Taille{' '}
              {needsSize && (
                <span className="text-primary-container font-normal text-xs">(requis)</span>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <SizeChip
                  key={size}
                  size={size}
                  selected={selectedSize === size}
                  onClick={() => setSelectedSize(size)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="bg-surface-low rounded-xl p-3 flex items-center gap-2">
          <span className="text-base">🚚</span>
          <p className="font-sans text-xs text-on-surface-variant">
            <span className="font-semibold text-on-surface">Livraison Abidjan</span> — 24h après confirmation
          </p>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-16 left-0 right-0 bg-surface/95 backdrop-blur-md border-t border-outline-variant/30 px-6 py-3 flex gap-2">
        <Button
          variant="ghost"
          size="md"
          onClick={handleWhatsApp}
          className="flex-shrink-0 gap-1.5"
        >
          <MessageCircle size={16} strokeWidth={1.5} />
          <span className="hidden sm:inline">WhatsApp</span>
        </Button>

        <Button
          variant="primary"
          size="md"
          fullWidth
          onClick={handleAddToCart}
          disabled={needsSize}
          className="gap-2"
        >
          <ShoppingBag size={16} strokeWidth={1.5} />
          {added ? 'Ajouté !' : needsSize ? 'Choisir une taille' : 'Ajouter au panier'}
        </Button>
      </div>
    </div>
  )
}
