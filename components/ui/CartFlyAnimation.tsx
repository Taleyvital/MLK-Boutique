'use client'

import { createContext, useContext, useState, useCallback, useRef } from 'react'

const DURATION = 680

interface FlyItem {
  id: number
  imageUrl: string
  fromX: number
  fromY: number
  fromW: number
  fromH: number
  toX: number
  toY: number
  flying: boolean
}

interface CartAnimCtx {
  triggerFly: (imageUrl: string, fromEl: HTMLElement) => void
}

const CartAnimContext = createContext<CartAnimCtx>({ triggerFly: () => {} })

export function CartAnimProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<FlyItem[]>([])
  const counter = useRef(0)

  const triggerFly = useCallback((imageUrl: string, fromEl: HTMLElement) => {
    const fromRect = fromEl.getBoundingClientRect()
    const cartEl = document.getElementById('cart-icon')
    if (!cartEl) return

    const toRect = cartEl.getBoundingClientRect()
    const id = ++counter.current

    const item: FlyItem = {
      id,
      imageUrl,
      fromX: fromRect.left,
      fromY: fromRect.top,
      fromW: fromRect.width,
      fromH: fromRect.height,
      toX: toRect.left + toRect.width / 2,
      toY: toRect.top + toRect.height / 2,
      flying: false,
    }

    setItems(prev => [...prev, item])

    // Deux rAF pour garantir le rendu initial avant la transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, flying: true } : i))
      })
    })

    setTimeout(() => {
      setItems(prev => prev.filter(i => i.id !== id))
      // Bounce du cart icon à l'arrivée
      const cart = document.getElementById('cart-icon')
      if (cart) {
        cart.classList.add('cart-arrived')
        setTimeout(() => cart.classList.remove('cart-arrived'), 600)
      }
    }, DURATION + 50)
  }, [])

  return (
    <CartAnimContext.Provider value={{ triggerFly }}>
      {children}
      {items.map(item => {
        const tx = item.flying ? item.toX - item.fromX - item.fromW / 2 : 0
        const ty = item.flying ? item.toY - item.fromY - item.fromH / 2 : 0
        const scale = item.flying ? 0.12 : 1
        const opacity = item.flying ? 0 : 1

        return (
          <div
            key={item.id}
            style={{
              position: 'fixed',
              left: item.fromX,
              top: item.fromY,
              width: item.fromW,
              height: item.fromH,
              borderRadius: '12px',
              overflow: 'hidden',
              zIndex: 9999,
              pointerEvents: 'none',
              willChange: 'transform, opacity',
              transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
              opacity,
              transition: item.flying
                ? `transform ${DURATION}ms cubic-bezier(0.2, 0.8, 0.4, 1), opacity ${DURATION * 0.7}ms ease ${DURATION * 0.3}ms`
                : 'none',
              boxShadow: '0 8px 32px rgba(76, 0, 2, 0.25)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )
      })}
    </CartAnimContext.Provider>
  )
}

export function useCartAnim() {
  return useContext(CartAnimContext)
}
