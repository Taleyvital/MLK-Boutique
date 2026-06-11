'use client'

import Image from 'next/image'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { formatPrice } from '@/lib/formatPrice'
import { useCart } from '@/hooks/useCart'
import type { CartItem as CartItemType } from '@/store/cartStore'

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const { updateQty, removeItem } = useCart()

  return (
    <div className="flex gap-3 py-4 border-b border-surface-mist">
      <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-surface-rose">
        <Image
          src={item.image || '/placeholder-product.svg'}
          alt={item.name}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-sans text-sm font-medium text-on-surface leading-tight line-clamp-2">
          {item.name}
        </p>
        <p className="font-sans text-xs text-on-surface-variant mt-0.5">
          Taille : <span className="font-semibold">{item.size}</span>
        </p>
        <p className="font-sans font-semibold text-[#720808] text-sm mt-1">
          {formatPrice(item.price)}
        </p>
      </div>

      <div className="flex flex-col items-end justify-between">
        <button
          onClick={() => removeItem(item.id, item.size)}
          className="p-1 rounded-full hover:bg-surface-rose transition-colors"
          aria-label="Supprimer"
        >
          <Trash2 size={15} className="text-outline" strokeWidth={1.5} />
        </button>

        <div className="flex items-center gap-2 bg-surface-rose rounded-full px-2 py-1">
          <button
            onClick={() => updateQty(item.id, item.size, item.qty - 1)}
            className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-surface transition-colors"
            aria-label="Diminuer"
          >
            <Minus size={12} strokeWidth={2} className="text-on-surface" />
          </button>
          <span className="font-sans font-semibold text-sm text-on-surface w-4 text-center">
            {item.qty}
          </span>
          <button
            onClick={() => updateQty(item.id, item.size, item.qty + 1)}
            className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-surface transition-colors"
            aria-label="Augmenter"
          >
            <Plus size={12} strokeWidth={2} className="text-on-surface" />
          </button>
        </div>
      </div>
    </div>
  )
}
