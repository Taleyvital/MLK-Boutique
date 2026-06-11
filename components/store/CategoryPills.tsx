'use client'

import Link from 'next/link'
import { LayoutGrid, Shirt, Gem, Sparkles, Footprints } from 'lucide-react'
import { cn } from '@/lib/utils'

const categories = [
  { label: 'Tout',       slug: 'tout',           icon: LayoutGrid },
  { label: 'Vêtements',  slug: 'vetements',      icon: Shirt },
  { label: 'Bijoux',     slug: 'bijoux-montres', icon: Gem },
  { label: 'Beauté',     slug: 'beaute',         icon: Sparkles },
  { label: 'Chaussures', slug: 'chaussures',     icon: Footprints },
]

interface CategoryPillsProps {
  activeSlug?: string
  basePath?: string
}

export function CategoryPills({ activeSlug = 'tout', basePath = '/boutique' }: CategoryPillsProps) {
  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-1 px-4 py-1 w-max">
        {categories.map(({ slug, label, icon: Icon }) => {
          const isActive = slug === activeSlug
          const href = slug === 'tout' ? basePath : `${basePath}?categorie=${slug}`
          return (
            <Link
              key={slug}
              href={href}
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
            </Link>
          )
        })}
      </div>
    </div>
  )
}
