import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/admin/ProductForm'
import type { Product } from '@/lib/supabase/types'

async function getProduct(id: string): Promise<Product | null> {
  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
    return (data as Product) || null
  } catch {
    return null
  }
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) notFound()

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/produits"
          className="w-9 h-9 rounded-full bg-surface flex items-center justify-center shadow-brand"
        >
          <ArrowLeft size={16} strokeWidth={1.5} className="text-on-surface" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-serif text-xl text-on-surface truncate">{product.name}</h1>
          <p className="font-sans text-xs text-on-surface-variant">
            Modifier le produit · #{product.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 font-sans text-xs font-semibold flex-shrink-0 ${
          product.is_active ? 'bg-green-50 text-green-700' : 'bg-surface-rose text-outline'
        }`}>
          {product.is_active ? 'Actif' : 'Inactif'}
        </span>
      </div>

      <ProductForm product={product} />
    </div>
  )
}
