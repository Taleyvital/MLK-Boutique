'use client'

import type { StripItem } from '@/app/(admin)/admin/strip/actions'

export function PromoStrip({ items }: { items: StripItem[] }) {
  if (!items.length) return null

  // Dupliquer les items pour créer un défilement sans rupture
  const doubled = [...items, ...items]

  return (
    <div className="bg-secondary-container overflow-hidden">
      <div className="flex animate-ticker py-2.5">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-2 font-sans text-xs font-medium text-primary whitespace-nowrap px-8"
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.text}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
