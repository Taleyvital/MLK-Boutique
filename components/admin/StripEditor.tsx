'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2, Loader2, Check } from 'lucide-react'
import { saveStripItems } from '@/app/(admin)/admin/strip/actions'
import type { StripItem } from '@/app/(admin)/admin/strip/actions'

export function StripEditor({ initialItems }: { initialItems: StripItem[] }) {
  const [items, setItems] = useState<StripItem[]>(initialItems)
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function update(index: number, field: keyof StripItem, value: string) {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  function add() {
    setItems(prev => [...prev, { icon: '✨', text: '' }])
  }

  function remove(index: number) {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  function handleSave() {
    const invalid = items.some(it => !it.text.trim())
    if (invalid) { setError('Chaque ligne doit avoir un texte.'); return }
    setError('')
    startTransition(async () => {
      const result = await saveStripItems(items)
      if (result.success) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 2500)
      } else {
        setError(result.error ?? 'Erreur lors de la sauvegarde')
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="bg-surface rounded-xl p-4 shadow-brand flex items-center gap-3">
            <input
              value={item.icon}
              onChange={e => update(i, 'icon', e.target.value)}
              placeholder="🚚"
              className="w-14 px-2 py-2 bg-surface-rose rounded-xl font-sans text-center text-lg border border-transparent focus:border-primary focus:outline-none"
            />
            <input
              value={item.text}
              onChange={e => update(i, 'text', e.target.value)}
              placeholder="Texte du bandeau..."
              className="flex-1 px-4 py-2 bg-surface-rose rounded-xl font-sans text-sm text-on-surface placeholder-outline border border-transparent focus:border-primary focus:outline-none"
            />
            <button
              onClick={() => remove(i)}
              className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors flex-shrink-0"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={add}
        className="w-full border-2 border-dashed border-secondary-container rounded-xl py-3 flex items-center justify-center gap-2 font-sans text-sm text-on-surface-variant hover:border-primary/40 transition-colors"
      >
        <Plus size={16} /> Ajouter une ligne
      </button>

      {/* Prévisualisation */}
      {items.length > 0 && (
        <div className="border-2 border-dashed border-secondary-container rounded-xl p-4">
          <p className="font-sans text-xs text-on-surface-variant uppercase tracking-widest mb-3">Aperçu défilement</p>
          <div className="bg-secondary-container rounded-xl py-2 overflow-hidden">
            <div className="flex gap-10 w-max animate-ticker">
              {[...items, ...items].map((item, i) => (
                <span key={i} className="flex items-center gap-2 font-sans text-xs font-medium text-primary whitespace-nowrap px-4">
                  <span>{item.icon}</span>
                  <span>{item.text}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && <p className="font-sans text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>}

      <button
        onClick={handleSave}
        disabled={isPending}
        className="w-full rounded-2xl bg-primary text-white py-4 font-sans font-bold text-base flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {isPending ? <><Loader2 size={16} className="animate-spin" />Enregistrement...</> :
         success   ? <><Check size={16} />Bandeau mis à jour ✓</> :
                     'Enregistrer le bandeau'}
      </button>
    </div>
  )
}
