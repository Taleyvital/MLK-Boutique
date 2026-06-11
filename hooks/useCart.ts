'use client'

import { useCartStore } from '@/store/cartStore'

export function useCart() {
  const { items, addItem, removeItem, updateQty, clearCart, total, count } =
    useCartStore()

  return { items, addItem, removeItem, updateQty, clearCart, total, count }
}
