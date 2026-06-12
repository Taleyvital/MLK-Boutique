'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface StripItem {
  icon: string
  text: string
}

const STORAGE_PATH = 'settings/promo_strip.json'
const BUCKET = 'products'

const DEFAULT_STRIP: StripItem[] = [
  { icon: '🚚', text: 'Livraison Abidjan' },
  { icon: '📱', text: 'Mobile Money' },
  { icon: '💬', text: 'WhatsApp' },
]

export async function getStripItems(): Promise<StripItem[]> {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase.storage.from(BUCKET).download(STORAGE_PATH)
    if (error || !data) return DEFAULT_STRIP
    const text = await data.text()
    return JSON.parse(text) as StripItem[]
  } catch {
    return DEFAULT_STRIP
  }
}

export async function saveStripItems(items: StripItem[]): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerClient()
    const blob = new Blob([JSON.stringify(items)], { type: 'application/json' })
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(STORAGE_PATH, blob, { upsert: true, contentType: 'application/json' })
    if (error) return { success: false, error: error.message }
    revalidatePath('/')
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Erreur inconnue' }
  }
}
