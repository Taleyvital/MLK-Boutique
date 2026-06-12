'use client'

import { useState } from 'react'
import { LayoutGrid, Shirt, Gem, Sparkles, Footprints, ArrowUpNarrowWide, ArrowDownNarrowWide } from 'lucide-react'
import { ProductGrid } from '@/components/store/ProductGrid'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/supabase/types'

const FILTERS = [
  { label: 'Tout',       slug: 'tout',           icon: LayoutGrid },
  { label: 'Vêtements',  slug: 'vetements',      icon: Shirt },
  { label: 'Bijoux',     slug: 'bijoux-montres', icon: Gem },
  { label: 'Beauté',     slug: 'beaute',         icon: Sparkles },
  { label: 'Chaussures', slug: 'chaussures',     icon: Footprints },
  { label: 'Prix ↑',    slug: 'prix-asc',        icon: ArrowUpNarrowWide },
  { label: 'Prix ↓',    slug: 'prix-desc',       icon: ArrowDownNarrowWide },
]

export function CatalogueClient({
  products,
  categoryMap,
  initialCategory,
}: {
  products: Product[]
  categoryMap: Record<string, string>
  initialCategory?: string
}) {
  const [activeFilter, setActiveFilter] = useState(initialCategory ?? 'tout')

  const filtered = products
    .filter((p) => {
      if (activeFilter === 'tout' || activeFilter === 'prix-asc' || activeFilter === 'prix-desc') return true
      return categoryMap[p.category_id ?? ''] === activeFilter
    })
    .sort((a, b) => {
      if (activeFilter === 'prix-asc') return a.price - b.price
      if (activeFilter === 'prix-desc') return b.price - a.price
      return 0
    })

  return (
    <div className="bg-surface min-h-screen">
      <div className="pt-4 pb-3">
        <h1 className="font-serif text-2xl text-on-surface px-6 mb-4">Catalogue</h1>

        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 px-4 pb-1 w-max">
            {FILTERS.map(({ slug, label, icon: Icon }) => {
              const isActive = activeFilter === slug
              return (
                <button
                  key={slug}
                  onClick={() => setActiveFilter(slug)}
                  className={cn(
                    'flex flex-col items-center gap-1 px-3 py-2 rounded-xl min-w-[60px] transition-all duration-200',
                    isActive
                      ? 'bg-primary text-white'
                      : 'bg-surface-rose text-on-surface-variant hover:bg-secondary-container hover:text-primary'
                  )}
                >
                  <Icon size={20} strokeWidth={1.5} />
                  <span className="text-[10px] font-sans font-medium leading-tight whitespace-nowrap">
                    {label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="px-6 pb-2">
        <p className="font-sans text-sm text-on-surface-variant">
          {filtered.length} produit{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="pt-2 pb-4">
        <ProductGrid products={filtered} />
      </div>
    </div>
  )
}
