import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { ProductPageContent } from '@/components/store/ProductPageContent'
import type { Product } from '@/lib/supabase/types'

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from('products')
      .select('*, categories(*)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()
    return (data as unknown as Product) || null
  } catch {
    return null
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) notFound()

  return <ProductPageContent product={product} />
}
