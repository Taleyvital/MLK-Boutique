'use client'

import { useState, useTransition } from 'react'
import { Loader2, Check, Upload, X } from 'lucide-react'
import Image from 'next/image'
import { savePromoPopup } from '@/app/(admin)/admin/popup/actions'
import { supabase } from '@/lib/supabase/client'
import type { PromoConfig } from '@/app/(admin)/admin/popup/actions'

const PAGE_OPTIONS = [
  { label: '— Choisir une page —', value: '' },
  { label: '🏠 Accueil', value: '/' },
  { label: '🛍️ Boutique — tout', value: '/boutique' },
  { label: '👗 Vêtements', value: '/boutique?cat=vetements' },
  { label: '💎 Bijoux & Montres', value: '/boutique?cat=bijoux-montres' },
  { label: '✨ Beauté', value: '/boutique?cat=beaute' },
  { label: '👠 Chaussures', value: '/boutique?cat=chaussures' },
  { label: '🛒 Panier', value: '/panier' },
]

const EMPTY: PromoConfig = {
  active: false,
  title: '',
  message: '',
  buttonText: '',
  buttonLink: '',
  imageUrl: '',
  displayDuration: 0,
}

export function PopupEditor({ initialConfig }: { initialConfig: PromoConfig | null }) {
  const [form, setForm] = useState<PromoConfig>(initialConfig ?? EMPTY)
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const target = e.target as HTMLInputElement
    const value = target.type === 'checkbox' ? target.checked : target.value
    setForm(f => ({ ...f, [target.name]: value }))
  }

  async function handleFlyer(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    const ext = file.name.split('.').pop()
    const fileName = `popup-${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage.from('products').upload(fileName, file)
    if (uploadError) { setError('Erreur upload : ' + uploadError.message); setUploading(false); return }
    const { data } = supabase.storage.from('products').getPublicUrl(fileName)
    setForm(f => ({ ...f, imageUrl: data.publicUrl }))
    setUploading(false)
  }

  function handleSave() {
    if (form.active && !form.imageUrl && !form.buttonText) {
      setError('Ajoutez au moins une image ou un bouton quand le popup est actif.')
      return
    }
    setError('')
    startTransition(async () => {
      // Titre/message retirés de l'éditeur : on les vide pour nettoyer les anciennes valeurs
      const result = await savePromoPopup({ ...form, title: '', message: '' })
      if (result.success) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 2500)
      } else {
        setError(result.error ?? 'Erreur lors de la sauvegarde')
      }
    })
  }

  return (
    <div className="space-y-5">

      {/* Toggle actif */}
      <div className="bg-surface rounded-xl p-4 shadow-brand flex items-center justify-between">
        <div>
          <p className="font-sans text-sm font-semibold text-on-surface">Popup actif</p>
          <p className="font-sans text-xs text-on-surface-variant">Affiché à chaque visiteur (1× par session)</p>
        </div>
        <label className="flex items-center cursor-pointer">
          <input type="checkbox" name="active" checked={form.active} onChange={handleChange} className="sr-only" />
          <div className={`w-12 h-7 rounded-full transition-colors ${form.active ? 'bg-primary' : 'bg-outline-variant'}`}>
            <div className={`w-5 h-5 bg-white rounded-full mt-1 transition-transform ${form.active ? 'translate-x-6' : 'translate-x-1'}`} />
          </div>
        </label>
      </div>

      {/* Durée d'affichage */}
      <div>
        <label className="font-sans text-sm font-semibold text-on-surface block mb-1.5">Durée d'affichage</label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            name="displayDuration"
            min={0}
            max={120}
            value={form.displayDuration ?? 0}
            onChange={e => setForm(f => ({ ...f, displayDuration: Math.max(0, Number(e.target.value) || 0) }))}
            className="w-24 px-4 py-3 bg-surface-rose rounded-xl font-sans text-sm text-on-surface border border-transparent focus:border-primary focus:outline-none"
          />
          <span className="font-sans text-sm text-on-surface-variant">secondes</span>
        </div>
        <p className="font-sans text-xs text-on-surface-variant mt-1.5">
          Le popup se ferme tout seul après ce délai. Mettez <strong>0</strong> pour qu'il reste jusqu'à fermeture manuelle.
        </p>
      </div>

      {/* Flyer / Image */}
      <div>
        <label className="font-sans text-sm font-semibold text-on-surface block mb-1.5">Flyer / Image (optionnel)</label>
        <div className="space-y-2">
          {/* Aperçu du flyer */}
          {form.imageUrl && (
            <div className="relative rounded-xl overflow-hidden bg-surface-rose">
              <Image src={form.imageUrl} alt="Flyer" width={600} height={400} className="w-full object-contain max-h-48" />
              <button
                onClick={() => setForm(f => ({ ...f, imageUrl: '' }))}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center text-white shadow"
              >
                <X size={13} />
              </button>
            </div>
          )}
          {/* Upload fichier */}
          <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-secondary-container rounded-xl px-4 py-3 hover:border-primary/40 transition-colors bg-surface-rose/30">
            <input type="file" accept="image/*" className="hidden" onChange={handleFlyer} disabled={uploading} />
            {uploading ? (
              <><Loader2 size={16} className="animate-spin text-primary" /><span className="font-sans text-sm text-on-surface-variant">Upload en cours...</span></>
            ) : (
              <><Upload size={16} className="text-outline" /><span className="font-sans text-sm text-on-surface-variant">Uploader un flyer (JPG, PNG, WebP)</span></>
            )}
          </label>
          {/* OU URL */}
          <input name="imageUrl" type="url" value={form.imageUrl} onChange={handleChange}
            placeholder="ou coller une URL d'image..."
            className="w-full px-4 py-3 bg-surface-rose rounded-xl font-sans text-sm text-on-surface placeholder-outline border border-transparent focus:border-primary focus:outline-none" />
        </div>
      </div>

      {/* Bouton */}
      <div className="space-y-3">
        <div>
          <label className="font-sans text-sm font-semibold text-on-surface block mb-1.5">Texte du bouton</label>
          <input name="buttonText" value={form.buttonText} onChange={handleChange}
            placeholder="ex : Voir les offres"
            className="w-full px-4 py-3 bg-surface-rose rounded-xl font-sans text-sm text-on-surface placeholder-outline border border-transparent focus:border-primary focus:outline-none" />
        </div>
        <div>
          <label className="font-sans text-sm font-semibold text-on-surface block mb-1.5">Lien du bouton</label>
          {/* Sélecteur rapide */}
          <select
            value={PAGE_OPTIONS.some(o => o.value === form.buttonLink) ? form.buttonLink : '__custom__'}
            onChange={e => {
              if (e.target.value !== '__custom__') setForm(f => ({ ...f, buttonLink: e.target.value }))
            }}
            className="w-full px-4 py-3 bg-surface-rose rounded-xl font-sans text-sm text-on-surface border border-transparent focus:border-primary focus:outline-none appearance-none mb-2"
          >
            {PAGE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
            <option value="__custom__">✏️ Lien personnalisé...</option>
          </select>
          {/* Champ manuel */}
          <input name="buttonLink" value={form.buttonLink} onChange={handleChange}
            placeholder="ou saisir un lien manuellement"
            className="w-full px-4 py-3 bg-surface-rose rounded-xl font-sans text-sm text-on-surface placeholder-outline border border-transparent focus:border-primary focus:outline-none" />
        </div>
      </div>

      {/* Preview */}
      {(form.imageUrl || form.buttonText) && (
        <div className="border-2 border-dashed border-secondary-container rounded-xl p-4">
          <p className="font-sans text-xs text-on-surface-variant uppercase tracking-widest mb-3">Aperçu</p>
          <div className="bg-white rounded-2xl p-5 shadow-brand max-w-xs mx-auto">
            {form.imageUrl && (
              <div className="w-full h-32 rounded-xl overflow-hidden bg-surface-rose mb-3">
                <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            {form.buttonText && (
              <div className="w-full rounded-xl bg-primary text-white text-center py-2.5 font-sans text-sm font-semibold">
                {form.buttonText}
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p className="font-sans text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>}

      <button onClick={handleSave} disabled={isPending}
        className="w-full rounded-2xl bg-primary text-white py-4 font-sans font-bold text-base flex items-center justify-center gap-2 disabled:opacity-60">
        {isPending ? <><Loader2 size={16} className="animate-spin" />Enregistrement...</> :
         success   ? <><Check size={16} />Popup enregistré ✓</> :
                     'Enregistrer le popup'}
      </button>
    </div>
  )
}
