'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface HeroSlide {
  src: string
  title: string
  subtitle: string
  label: string
}

const DEFAULT_SLIDES: HeroSlide[] = [
  { src: '/_ (1).jpeg', title: 'Nouvelle Saison', subtitle: "L'élégance ivoirienne revisitée pour la femme moderne.", label: 'Collection 2025' },
  { src: '/vert-avocat.jpeg', title: 'Style & Élégance', subtitle: 'Des créations uniques pour sublimer chaque silhouette.', label: 'Nouveautés' },
  { src: '/Instagram.jpeg', title: 'Coups de Cœur', subtitle: 'Les pièces incontournables de la saison.', label: 'Sélection' },
]

export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'hero_slides')
      .maybeSingle()
    if (!data) return DEFAULT_SLIDES
    return JSON.parse((data as { value: string }).value) as HeroSlide[]
  } catch {
    return DEFAULT_SLIDES
  }
}

export async function saveHeroSlides(slides: HeroSlide[]) {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('settings')
    .upsert({ key: 'hero_slides', value: JSON.stringify(slides) } as never)

  if (error) throw new Error(error.message)

  revalidatePath('/')
}
