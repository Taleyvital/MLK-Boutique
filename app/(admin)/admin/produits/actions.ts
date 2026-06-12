'use server'

import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function deleteProduct(productId: string) {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)

  if (error) throw new Error('Erreur suppression : ' + error.message)

  revalidatePath('/boutique')
  revalidatePath('/')
  revalidatePath('/admin/produits')
  revalidatePath('/admin')
  redirect('/admin/produits')
}

interface ProductPayload {
  name: string
  description: string | null
  price: number
  compare_price: number | null
  categorySlug: string
  images: string[]
  sizes: string[]
  stock: number
  is_active: boolean
  is_new: boolean
  wave_payment_url: string | null
}

async function resolveCategoryId(supabase: ReturnType<typeof createServerClient>, slug: string) {
  const { data } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .single()
  return (data as { id: string } | null)?.id ?? null
}

function buildSlug(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function createProduct(payload: ProductPayload) {
  const supabase = createServerClient()
  const catId = await resolveCategoryId(supabase, payload.categorySlug)
  const slug = `${buildSlug(payload.name)}-${Date.now()}`

  const { error } = await supabase.from('products').insert({
    name: payload.name,
    slug,
    description: payload.description,
    price: payload.price,
    compare_price: payload.compare_price,
    category_id: catId,
    images: payload.images,
    sizes: payload.sizes,
    stock: payload.stock,
    is_active: payload.is_active,
    is_new: payload.is_new,
    wave_payment_url: payload.wave_payment_url,
  } as never)

  if (error) throw new Error('Erreur : ' + error.message)

  revalidatePath('/boutique')
  revalidatePath('/')
  revalidatePath('/admin/produits')
  revalidatePath('/admin')
  redirect('/admin/produits')
}

export async function updateProduct(productId: string, payload: ProductPayload) {
  const supabase = createServerClient()
  const catId = await resolveCategoryId(supabase, payload.categorySlug)

  const { error } = await supabase
    .from('products')
    .update({
      name: payload.name,
      description: payload.description,
      price: payload.price,
      compare_price: payload.compare_price,
      category_id: catId,
      images: payload.images,
      sizes: payload.sizes,
      stock: payload.stock,
      is_active: payload.is_active,
      is_new: payload.is_new,
      wave_payment_url: payload.wave_payment_url,
    } as never)
    .eq('id', productId)

  if (error) throw new Error('Erreur : ' + error.message)

  revalidatePath('/boutique')
  revalidatePath('/')
  revalidatePath('/admin/produits')
  revalidatePath('/admin')
}
