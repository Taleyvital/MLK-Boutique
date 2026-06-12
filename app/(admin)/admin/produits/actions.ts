'use server'

import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function deleteProduct(productId: string) {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)

  if (error) throw new Error('Erreur suppression : ' + error.message)

  redirect('/admin/produits')
}
