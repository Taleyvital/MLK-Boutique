import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { HeroBanner } from '@/components/store/HeroBanner'
import { CategoryPills } from '@/components/store/CategoryPills'
import { PromoStrip } from '@/components/store/PromoStrip'
import { ProductGrid } from '@/components/store/ProductGrid'
import { createServerClient } from '@/lib/supabase/server'
import { getHeroSlides } from '@/app/(admin)/admin/hero/actions'
import { getStripItems } from '@/app/(admin)/admin/strip/actions'
import type { Product } from '@/lib/supabase/types'

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('is_new', true)
      .order('created_at', { ascending: false })
      .limit(6)
    return (data as Product[]) || []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [featured, heroSlides, stripItems] = await Promise.all([
    getFeaturedProducts(),
    getHeroSlides(),
    getStripItems(),
  ])

  return (
    <div className="bg-surface">
      <HeroBanner slides={heroSlides} />

      <section className="pt-8 pb-2">
        <p className="font-sans text-xs text-on-surface-variant tracking-widest uppercase px-6 mb-3">
          Catégories
        </p>
        <CategoryPills activeSlug="tout" />
      </section>

      <section className="py-4">
        <PromoStrip items={stripItems} />
      </section>

      <section className="pt-8 pb-6">
        <div className="flex items-center justify-between px-6 mb-5">
          <h2 className="font-serif text-2xl text-on-surface">Coups de Cœur</h2>
          <Link
            href="/boutique"
            className="flex items-center gap-1 font-sans text-sm text-primary font-medium hover:gap-2 transition-all"
          >
            Tout voir
            <ArrowRight size={14} strokeWidth={2} />
          </Link>
        </div>
        {featured.length > 0 ? (
          <ProductGrid products={featured} asymmetric />
        ) : (
          <div className="px-6">
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`bg-surface-rose rounded-xl aspect-[4/5] animate-pulse ${i % 2 === 0 ? 'mt-4' : ''}`}
                />
              ))}
            </div>
            <p className="text-center font-sans text-sm text-on-surface-variant mt-6">
              Configurez votre Supabase pour afficher les produits
            </p>
          </div>
        )}
      </section>

      <section className="px-6 py-10 bg-surface-low">
        <div className="bg-primary rounded-2xl p-6 text-center">
          <h3 className="font-display italic text-white text-2xl mb-2">
            Nouveautés chaque semaine
          </h3>
          <p className="font-sans text-white/80 text-sm mb-4">
            Suivez-nous sur WhatsApp pour ne rien manquer
          </p>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\+/g, '') || '2250153471556'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-primary rounded-full px-6 py-2.5 font-sans font-semibold text-sm hover:bg-surface transition-colors"
          >
            💬 Rejoindre
          </a>
        </div>
      </section>
    </div>
  )
}
