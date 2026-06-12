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

const STORAGE_PATH = 'settings/promo_popup.json'
const BUCKET = 'products'

export async function getPromoPopup(): Promise<PromoConfig | null> {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase.storage.from(BUCKET).download(STORAGE_PATH)
    if (error || !data) return null
    const text = await data.text()
    return JSON.parse(text) as PromoConfig
  } catch {
    return null
  }
}

export async function savePromoPopup(config: PromoConfig): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerClient()
    const blob = new Blob([JSON.stringify(config)], { type: 'application/json' })
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(STORAGE_PATH, blob, { upsert: true, contentType: 'application/json' })
    if (error) return { success: false, error: error.message }
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Erreur inconnue' }
  }
}
