import { ProductCard } from '@/components/ui/ProductCard'
import type { Product } from '@/lib/supabase/types'

interface ProductGridProps {
  products: Product[]
  asymmetric?: boolean
}

export function ProductGrid({ products, asymmetric = false }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 px-6">
        <p className="font-serif text-xl text-on-surface-variant mb-2">Aucun produit trouvé</p>
        <p className="font-sans text-sm text-outline">Revenez bientôt pour découvrir nos nouveautés.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 px-6">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          price={product.price}
          comparePrice={product.compare_price ?? undefined}
          image={product.images[0] || '/placeholder-product.svg'}
          isNew={product.is_new}
          slug={product.slug}
          sizes={product.sizes}
          wavePaymentUrl={product.wave_payment_url ?? undefined}
          className={asymmetric && index % 2 === 0 ? 'mt-4' : ''}
        />
      ))}
    </div>
  )
}
