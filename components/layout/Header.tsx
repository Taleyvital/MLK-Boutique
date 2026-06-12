'use client'

import Link from 'next/link'
import { Search, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useEffect, useState } from 'react'
import { SearchOverlay } from '@/components/store/SearchOverlay'

export function Header() {
  const count = useCartStore((s) => s.count)()
  const [mounted, setMounted] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30">
        <div className="flex items-center justify-between px-6 h-14">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-rose transition-colors"
            aria-label="Rechercher"
          >
            <Search size={22} className="text-on-surface" strokeWidth={1.5} />
          </button>

          <Link href="/" className="font-display italic text-2xl text-primary tracking-tight">
            MLK-Boutique
          </Link>

          <Link
            id="cart-icon"
            href="/panier"
            className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-rose transition-colors"
            aria-label="Panier"
            suppressHydrationWarning
          >
            <ShoppingBag size={22} className="text-on-surface" strokeWidth={1.5} />
            {mounted && count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary text-white text-[10px] font-sans font-semibold rounded-full flex items-center justify-center px-1">
                {count}
              </span>
            )}
          </Link>
        </div>
      </header>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  )
}
