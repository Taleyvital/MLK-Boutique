import { createServerClient } from '@/lib/supabase/server'
import { CatalogueClient } from '@/components/store/CatalogueClient'
import type { Product } from '@/lib/supabase/types'

async function getAllProducts(): Promise<{ products: Product[]; categoryMap: Record<string, string> }> {
  try {
    const supabase = createServerClient()

    const [{ data: products }, { data: categories }] = await Promise.all([
      supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false }),
      supabase.from('categories').select('id, slug'),
    ])

    const categoryMap: Record<string, string> = {}
    for (const cat of (categories ?? [])) {
      const c = cat as { id: string; slug: string }
      categoryMap[c.id] = c.slug
    }

    return { products: (products as Product[]) ?? [], categoryMap }
  } catch {
    return { products: [], categoryMap: {} }
  }
}

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>
}) {
  const { cat } = await searchParams
  const { products, categoryMap } = await getAllProducts()
  return <CatalogueClient products={products} categoryMap={categoryMap} initialCategory={cat} />
}
