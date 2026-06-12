import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getHeroSlides } from './actions'
import { HeroEditor } from '@/components/admin/HeroEditor'

export default async function HeroAdminPage() {
  const slides = await getHeroSlides()

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin"
          className="w-9 h-9 rounded-full bg-surface flex items-center justify-center shadow-brand"
        >
          <ArrowLeft size={16} strokeWidth={1.5} className="text-on-surface" />
        </Link>
        <div>
          <h1 className="font-serif text-xl text-on-surface">Hero de l'accueil</h1>
          <p className="font-sans text-xs text-on-surface-variant">Modifier les slides du bandeau principal</p>
        </div>
      </div>

      <HeroEditor initialSlides={slides} />
    </div>
  )
}
