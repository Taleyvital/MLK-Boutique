import Link from 'next/link'
import Image from 'next/image'
import { PlusCircle, ArrowLeft, Edit } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/formatPrice'
import type { Product } from '@/lib/supabase/types'

async function getProducts(): Promise<Product[]> {
  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    return (data as Product[]) || []
  } catch {
    return []
  }
}

export default async function AdminProduitsPage() {
  const products = await getProducts()

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin"
          className="w-9 h-9 rounded-full bg-surface flex items-center justify-center shadow-brand"
        >
          <ArrowLeft size={16} strokeWidth={1.5} className="text-on-surface" />
        </Link>
        <h1 className="font-serif text-xl text-on-surface">Produits</h1>
        <Link
          href="/admin/produits/nouveau"
          className="ml-auto flex items-center gap-1.5 rounded-full bg-primary text-white font-sans font-semibold text-sm px-4 py-2"
        >
          <PlusCircle size={15} strokeWidth={1.5} />
          Ajouter
        </Link>
      </div>

      <div className="space-y-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-surface rounded-xl p-3 flex items-center gap-3 shadow-brand"
          >
            <div className="relative w-14 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface-rose">
              {product.images[0] && (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sans text-sm font-medium text-on-surface truncate">{product.name}</p>
              <p className="font-sans text-sm text-[#720808] font-semibold">{formatPrice(product.price)}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`rounded-full px-2 py-0.5 font-sans text-[10px] font-medium ${
                  product.is_active ? 'bg-green-50 text-green-700' : 'bg-surface-rose text-outline'
                }`}>
                  {product.is_active ? 'Actif' : 'Inactif'}
                </span>
                <span className="font-sans text-xs text-on-surface-variant">
                  Stock : {product.stock}
                </span>
              </div>
            </div>
            <Link
              href={`/admin/produits/${product.id}`}
              className="w-8 h-8 rounded-full bg-surface-low flex items-center justify-center flex-shrink-0"
            >
              <Edit size={14} className="text-on-surface-variant" strokeWidth={1.5} />
            </Link>
          </div>
        ))}
        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="font-sans text-sm text-on-surface-variant mb-3">Aucun produit pour l&apos;instant</p>
            <Link
              href="/admin/produits/nouveau"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary text-white font-sans font-semibold text-sm px-5 py-2.5"
            >
              <PlusCircle size={15} strokeWidth={1.5} />
              Créer le premier produit
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
