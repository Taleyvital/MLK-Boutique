'use client'

import { useState } from 'react'
import { LayoutGrid, Shirt, Gem, Sparkles, Footprints, ArrowUpNarrowWide, ArrowDownNarrowWide } from 'lucide-react'
import { ProductGrid } from '@/components/store/ProductGrid'
import { useProducts } from '@/hooks/useProducts'
import { cn } from '@/lib/utils'

const categories = [
  { label: 'Tout',       slug: 'tout',        icon: LayoutGrid },
  { label: 'Vêtements',  slug: 'vetements',   icon: Shirt },
  { label: 'Bijoux',     slug: 'bijoux-montres', icon: Gem },
  { label: 'Beauté',     slug: 'beaute',      icon: Sparkles },
  { label: 'Chaussures', slug: 'chaussures',  icon: Footprints },
  { label: 'Prix ↑',     slug: 'prix-asc',    icon: ArrowUpNarrowWide },
  { label: 'Prix ↓',     slug: 'prix-desc',   icon: ArrowDownNarrowWide },
]

export default function CataloguePage() {
  const [activeFilter, setActiveFilter] = useState('tout')

  const categorySlug = ['prix-asc', 'prix-desc'].includes(activeFilter)
    ? undefined
    : activeFilter

  const { products, loading } = useProducts(categorySlug)

  const sortedProducts = [...products].sort((a, b) => {
    if (activeFilter === 'prix-asc') return a.price - b.price
    if (activeFilter === 'prix-desc') return b.price - a.price
    return 0
  })

  return (
    <div className="bg-surface min-h-screen">
      <div className="pt-4 pb-3">
        <h1 className="font-serif text-2xl text-on-surface px-6 mb-4">Catalogue</h1>

        {/* Category icon tabs */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 px-4 pb-1 w-max">
            {categories.map(({ slug, label, icon: Icon }) => {
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

      <div className="px-6 pb-2 flex items-center justify-between">
        <p className="font-sans text-sm text-on-surface-variant">
          {loading ? '...' : `${sortedProducts.length} produit${sortedProducts.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 px-6 pt-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-surface-rose rounded-xl aspect-[4/5] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="pt-2 pb-4">
          <ProductGrid products={sortedProducts} />
        </div>
      )}
    </div>
  )
}
