import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getPromoPopup } from './actions'
import { PopupEditor } from '@/components/admin/PopupEditor'

export default async function PopupAdminPage() {
  const config = await getPromoPopup()

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
          <h1 className="font-serif text-xl text-on-surface">Popup promotionnel</h1>
          <p className="font-sans text-xs text-on-surface-variant">Affiché une fois par session sur la boutique</p>
        </div>
      </div>

      <PopupEditor initialConfig={config} />
    </div>
  )
}
