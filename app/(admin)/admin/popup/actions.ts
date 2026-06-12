'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface PromoConfig {
  active: boolean
  title: string
  message: string
  buttonText: string
  buttonLink: string
  imageUrl: string
}

export async function getPromoPopup(): Promise<PromoConfig | null> {
  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'promo_popup')
      .single()
    if (!data) return null
    return JSON.parse((data as { value: string }).value) as PromoConfig
  } catch {
    return null
  }
}

export async function savePromoPopup(config: PromoConfig) {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('settings')
    .upsert({ key: 'promo_popup', value: JSON.stringify(config) } as never)

  if (error) throw new Error(error.message)

  revalidatePath('/', 'layout')
}
