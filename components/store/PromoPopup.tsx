'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import type { PromoConfig } from '@/app/(admin)/admin/popup/actions'

const SESSION_KEY = 'mlk_popup_seen'

export function PromoPopup({ config }: { config: PromoConfig }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!config.active) return
    const seen = sessionStorage.getItem(SESSION_KEY)
    if (!seen) {
      const t = setTimeout(() => setVisible(true), 1200)
      return () => clearTimeout(t)
    }
  }, [config.active])

  function dismiss() {
    sessionStorage.setItem(SESSION_KEY, '1')
    setVisible(false)
  }

  // Fermeture automatique après la durée d'affichage configurée (0 = jamais)
  useEffect(() => {
    if (!visible) return
    const secs = config.displayDuration ?? 0
    if (secs > 0) {
      const t = setTimeout(() => dismiss(), secs * 1000)
      return () => clearTimeout(t)
    }
  }, [visible, config.displayDuration])

  if (!visible) return null

  // Mode flyer : image seule, sans bouton
  const flyerOnly = !!config.imageUrl && !config.buttonText

  const content = flyerOnly ? (
    <div className="relative rounded-2xl overflow-hidden shadow-2xl w-[90vw] max-w-sm mx-auto">
      <img src={config.imageUrl} alt="Promo" className="w-full object-contain" />
    </div>
  ) : (
    <div className="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-sm mx-auto overflow-hidden">
      {config.imageUrl && (
        <img src={config.imageUrl} alt="" className="block w-full object-contain" />
      )}
      {config.buttonText && config.buttonLink && (
        <div className="p-3">
          <Link
            href={config.buttonLink}
            onClick={dismiss}
            className="block w-full rounded-xl bg-primary text-white text-center py-3.5 font-sans font-semibold text-sm hover:bg-primary-container transition-colors"
          >
            {config.buttonText}
          </Link>
        </div>
      )}
    </div>
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={dismiss}
    >
      <div onClick={e => e.stopPropagation()} className="relative w-full max-w-sm">
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow"
        >
          <X size={15} className="text-on-surface" />
        </button>
        {content}
      </div>
    </div>
  )
}
