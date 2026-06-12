import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getStripItems } from './actions'
import { StripEditor } from '@/components/admin/StripEditor'

export default async function StripPage() {
  const items = await getStripItems()

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="w-9 h-9 flex items-center justify-center rounded-full bg-surface shadow-brand hover:bg-surface-rose transition-colors">
          <ArrowLeft size={18} className="text-on-surface" />
        </Link>
        <div>
          <h1 className="font-serif text-2xl text-on-surface">Bandeau défilant</h1>
          <p className="font-sans text-xs text-on-surface-variant">Textes affichés sur la bande rose de l&apos;accueil</p>
        </div>
      </div>

      <StripEditor initialItems={items} />
    </div>
  )
}
