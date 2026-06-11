'use client'

import { useState, useRef } from 'react'
import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Heart, ShoppingBag, MessageCircle, ChevronLeft, ChevronRight, Zap } from 'lucide-react'
import { useProduct } from '@/hooks/useProducts'
import { useCart } from '@/hooks/useCart'
import { useCartAnim } from '@/components/ui/CartFlyAnimation'
import { SizeChip } from '@/components/ui/SizeChip'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/lib/formatPrice'
import { getWhatsAppUrl } from '@/lib/whatsapp'

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter()
  const { slug } = React.use(params)
  const { product, loading } = useProduct(slug)
  const { addItem } = useCart()
  const { triggerFly } = useCartAnim()
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [added, setAdded] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="aspect-[4/5] bg-surface-rose animate-pulse" />
        <div className="px-6 pt-4 space-y-3">
          <div className="h-7 bg-surface-rose rounded animate-pulse w-3/4" />
          <div className="h-6 bg-surface-rose rounded animate-pulse w-1/3" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-6">
        <div className="text-center">
          <h2 className="font-serif text-2xl text-on-surface mb-2">Produit introuvable</h2>
          <p className="font-sans text-on-surface-variant mb-4">Ce produit n&apos;est plus disponible.</p>
          <Button variant="primary" onClick={() => router.push('/boutique')}>
            Retour au catalogue
          </Button>
        </div>
      </div>
    )
  }

  const images = product.images.length > 0 ? product.images : ['/placeholder-product.svg']

  function handleAddToCart() {
    if (!selectedSize && product!.sizes.length > 0) return

    // Déclenche l'animation fly-to-cart depuis l'image principale
    if (imageRef.current) {
      triggerFly(images[currentImageIndex], imageRef.current)
    }

    addItem({
      id: product!.id,
      name: product!.name,
      price: product!.price,
      image: images[0],
      size: selectedSize || 'Unique',
      qty: 1,
      slug: product!.slug,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  function handleWhatsApp() {
    const url = getWhatsAppUrl(
      [{ id: product!.id, name: product!.name, price: product!.price, image: images[0], size: selectedSize || 'Unique', qty: 1, slug: product!.slug }],
      product!.price,
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

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-surface/80 backdrop-blur-sm flex items-center justify-center shadow-brand"
          aria-label="Retour"
        >
          <ArrowLeft size={18} strokeWidth={1.5} className="text-on-surface" />
        </button>

        {/* Wishlist button */}
        <button
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-surface/80 backdrop-blur-sm flex items-center justify-center shadow-brand"
          aria-label="Favoris"
        >
          <Heart size={18} strokeWidth={1.5} className="text-on-surface" />
        </button>

        {/* Image navigation */}
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

        {/* Dots */}
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

        {product.wave_payment_url && (
          <a
            href={product.wave_payment_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center gap-1.5 rounded-xl bg-[#1DC3C3] text-white px-4 py-2 font-sans font-semibold text-sm active:scale-95 transition-transform"
          >
            <Zap size={15} strokeWidth={2} />
            Wave
          </a>
        )}

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
