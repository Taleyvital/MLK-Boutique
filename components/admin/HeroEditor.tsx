'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { Plus, Trash2, Loader2, Check, Upload, GripVertical } from 'lucide-react'
import { saveHeroSlides } from '@/app/(admin)/admin/hero/actions'
import { supabase } from '@/lib/supabase/client'
import type { HeroSlide } from '@/app/(admin)/admin/hero/actions'

export function HeroEditor({ initialSlides }: { initialSlides: HeroSlide[] }) {
  const [slides, setSlides] = useState<HeroSlide[]>(initialSlides)
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState<number | null>(null)

  function updateSlide(index: number, field: keyof HeroSlide, value: string) {
    setSlides(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s))
  }

  function addSlide() {
    if (slides.length >= 5) return
    setSlides(prev => [...prev, { src: '', title: '', subtitle: '', label: '' }])
  }

  function removeSlide(index: number) {
    setSlides(prev => prev.filter((_, i) => i !== index))
  }

  async function handleImageUpload(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(index)
    const ext = file.name.split('.').pop()
    const fileName = `hero-${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage.from('products').upload(fileName, file)
    if (uploadError) { setError('Erreur upload : ' + uploadError.message); setUploading(null); return }
    const { data } = supabase.storage.from('products').getPublicUrl(fileName)
    updateSlide(index, 'src', data.publicUrl)
    setUploading(null)
  }

  function handleSave() {
    const invalid = slides.some(s => !s.src || !s.title)
    if (invalid) { setError('Chaque slide doit avoir une image et un titre.'); return }
    setError('')
    startTransition(async () => {
      try {
        await saveHeroSlides(slides)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 2500)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur')
      }
    })
  }

  return (
    <div className="space-y-4">
      {slides.map((slide, i) => (
        <div key={i} className="bg-surface rounded-xl p-4 shadow-brand space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GripVertical size={16} className="text-outline" />
              <span className="font-sans text-sm font-semibold text-on-surface">Slide {i + 1}</span>
            </div>
            <button
              onClick={() => removeSlide(i)}
              className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>

          {/* Image */}
          <div className="space-y-2">
            <label className="font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Image</label>
            <div className="flex gap-2 items-start">
              {slide.src && (
                <div className="relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-surface-rose">
                  <Image src={slide.src} alt="" fill className="object-cover" sizes="80px" />
                </div>
              )}
              <div className="flex-1 space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer bg-surface-rose rounded-xl px-3 py-2 hover:bg-secondary-container/50 transition-colors">
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(i, e)} disabled={uploading === i} />
                  {uploading === i ? (
                    <><Loader2 size={14} className="animate-spin text-primary" /><span className="font-sans text-xs text-on-surface-variant">Upload...</span></>
                  ) : (
                    <><Upload size={14} className="text-outline" /><span className="font-sans text-xs text-on-surface-variant">Choisir une photo</span></>
                  )}
                </label>
                <input
                  type="url"
                  value={slide.src}
                  onChange={e => updateSlide(i, 'src', e.target.value)}
                  placeholder="ou coller une URL..."
                  className="w-full px-3 py-2 bg-surface-rose rounded-xl font-sans text-xs text-on-surface placeholder-outline border border-transparent focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Textes */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-sans text-xs text-on-surface-variant mb-1 block">Label</label>
              <input value={slide.label} onChange={e => updateSlide(i, 'label', e.target.value)}
                placeholder="ex : Collection 2025"
                className="w-full px-3 py-2 bg-surface-rose rounded-xl font-sans text-xs text-on-surface placeholder-outline border border-transparent focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="font-sans text-xs text-on-surface-variant mb-1 block">Titre *</label>
              <input value={slide.title} onChange={e => updateSlide(i, 'title', e.target.value)}
                placeholder="ex : Nouvelle Saison"
                className="w-full px-3 py-2 bg-surface-rose rounded-xl font-sans text-xs text-on-surface placeholder-outline border border-transparent focus:border-primary focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="font-sans text-xs text-on-surface-variant mb-1 block">Sous-titre</label>
            <input value={slide.subtitle} onChange={e => updateSlide(i, 'subtitle', e.target.value)}
              placeholder="ex : L'élégance revisitée..."
              className="w-full px-3 py-2 bg-surface-rose rounded-xl font-sans text-xs text-on-surface placeholder-outline border border-transparent focus:border-primary focus:outline-none" />
          </div>
        </div>
      ))}

      {slides.length < 5 && (
        <button onClick={addSlide}
          className="w-full border-2 border-dashed border-secondary-container rounded-xl py-3 flex items-center justify-center gap-2 font-sans text-sm text-on-surface-variant hover:border-primary/40 transition-colors">
          <Plus size={16} /> Ajouter un slide
        </button>
      )}

      {error && <p className="font-sans text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>}

      <button onClick={handleSave} disabled={isPending}
        className="w-full rounded-2xl bg-primary text-white py-4 font-sans font-bold text-base flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity">
        {isPending ? <><Loader2 size={16} className="animate-spin" />Enregistrement...</> :
         success   ? <><Check size={16} />Hero mis à jour ✓</> :
                     'Enregistrer le hero'}
      </button>
    </div>
  )
}
