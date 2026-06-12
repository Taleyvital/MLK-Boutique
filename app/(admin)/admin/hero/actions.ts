'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface HeroSlide {
  src: string
  title: string
  subtitle: string
  label: string
}

const STORAGE_PATH = 'settings/hero_slides.json'
const BUCKET = 'products'

const DEFAULT_SLIDES: HeroSlide[] = [
  { src: '/_ (1).jpeg', title: 'Nouvelle Saison', subtitle: "L'élégance ivoirienne revisitée pour la femme moderne.", label: 'Collection 2025' },
  { src: '/vert-avocat.jpeg', title: 'Style & Élégance', subtitle: 'Des créations uniques pour sublimer chaque silhouette.', label: 'Nouveautés' },
  { src: '/Instagram.jpeg', title: 'Coups de Cœur', subtitle: 'Les pièces incontournables de la saison.', label: 'Sélection' },
]

export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase.storage.from(BUCKET).download(STORAGE_PATH)
    if (error || !data) return DEFAULT_SLIDES
    const text = await data.text()
    return JSON.parse(text) as HeroSlide[]
  } catch {
    return DEFAULT_SLIDES
  }
}

export async function saveHeroSlides(slides: HeroSlide[]): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerClient()
    const blob = new Blob([JSON.stringify(slides)], { type: 'application/json' })
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
