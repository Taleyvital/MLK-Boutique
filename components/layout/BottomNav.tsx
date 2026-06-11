'use client'

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LayoutGrid, ShoppingBag, User } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/boutique', label: 'Catalogue', icon: LayoutGrid },
  { href: '/panier', label: 'Panier', icon: ShoppingBag },
  { href: '/compte', label: 'Compte', icon: User },
]

function BottomNavInner() {
  const pathname = usePathname()
  const count = useCartStore((s) => s.count)()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <div className="flex items-center justify-around h-16 px-4">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
        const isCart = href === '/panier'

        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 min-w-[56px] py-1 relative"
          >
            <div className="relative">
              <Icon
                size={22}
                strokeWidth={1.5}
                className={cn(
                  'transition-colors',
                  isActive ? 'text-primary' : 'text-on-surface-variant'
                )}
              />
              {mounted && isCart && count > 0 && (
                <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] bg-primary text-white text-[9px] font-sans font-bold rounded-full flex items-center justify-center px-0.5">
                  {count}
                </span>
              )}
            </div>
            <span
              className={cn(
                'text-[10px] font-sans font-medium',
                isActive ? 'text-primary' : 'text-on-surface-variant'
              )}
            >
              {label}
            </span>
            {isActive && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
            )}
          </Link>
        )
      })}
    </div>
  )
}

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-md border-t border-outline-variant/30 pb-safe">
      <Suspense fallback={<div className="h-16" />}>
        <BottomNavInner />
      </Suspense>
    </nav>
  )
}
