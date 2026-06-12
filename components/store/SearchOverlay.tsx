'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { X, Search, Loader2 } from 'lucide-react'

interface SearchResult {
  id: string
  name: string
  slug: string
  price: number
  compare_price: number | null
  images: string[]
}

function formatPrice(p: number) {
  return new Intl.NumberFormat('fr-CI', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(p)
}

export function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
    // Bloquer le scroll du body
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setSearched(false); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data)
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => search(val), 300)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[200] bg-surface flex flex-col"
      onKeyDown={handleKey}
    >
      {/* Barre de recherche */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-outline-variant/30 bg-surface/90 backdrop-blur-md flex-shrink-0">
        <Search size={20} className="text-on-surface-variant flex-shrink-0" strokeWidth={1.5} />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleChange}
          placeholder="Rechercher un produit..."
          className="flex-1 bg-transparent font-sans text-base text-on-surface placeholder-outline focus:outline-none"
        />
        {loading && <Loader2 size={18} className="animate-spin text-primary flex-shrink-0" />}
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-rose transition-colors flex-shrink-0"
          aria-label="Fermer"
        >
          <X size={20} className="text-on-surface" strokeWidth={1.5} />
        </button>
      </div>

      {/* Résultats */}
      <div className="flex-1 overflow-y-auto">
        {!searched && !loading && (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Search size={40} className="text-outline-variant" strokeWidth={1} />
            <p className="font-sans text-sm text-on-surface-variant">Tapez pour rechercher un produit</p>
          </div>
        )}

        {searched && results.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <p className="font-sans text-sm text-on-surface-variant">Aucun résultat pour &ldquo;{query}&rdquo;</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="divide-y divide-outline-variant/20">
            {results.map(product => (
              <Link
                key={product.id}
                href={`/boutique/${product.slug}`}
                onClick={onClose}
                className="flex items-center gap-4 px-5 py-4 hover:bg-surface-rose transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-rose flex-shrink-0">
                  {product.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary-container" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm font-medium text-on-surface truncate">{product.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-sans text-sm font-semibold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    {product.compare_price && product.compare_price > product.price && (
                      <span className="font-sans text-xs text-outline line-through">
                        {formatPrice(product.compare_price)}
                      </span>
                    )}
                  </div>
                </div>

                <Search size={16} className="text-outline flex-shrink-0" strokeWidth={1.5} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
