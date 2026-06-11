'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Check, Loader2, Link as LinkIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export function WaveLinkSetting() {
  const [url, setUrl]         = useState('')
  const [saved, setSaved]     = useState('')
  const [saving, setSaving]   = useState(false)
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    supabase
      .from('settings')
      .select('value')
      .eq('key', 'wave_payment_url')
      .single()
      .then(({ data }) => {
        const val = (data as { value: string } | null)?.value ?? ''
        setUrl(val)
        setSaved(val)
        setLoading(false)
      })
  }, [])

  async function handleSave() {
    setSaving(true)
    setSuccess(false)
    await supabase
      .from('settings')
      .update({ value: url } as never)
      .eq('key', 'wave_payment_url')
    setSaved(url)
    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2500)
  }

  const hasChanged = url !== saved

  return (
    <div className="bg-white rounded-2xl shadow-brand overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-outline-variant/20">
        <Image
          src="/moyen-paiement/wave.png"
          alt="Wave"
          width={28}
          height={28}
          className="rounded-lg overflow-hidden object-contain"
        />
        <h2 className="font-sans font-semibold text-on-surface text-sm">Lien de paiement Wave</h2>
      </div>

      <div className="px-5 py-4 space-y-3">
        <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
          Colle ici ton lien Wave Business. Les clients seront redirigés vers ce lien lors du paiement.
        </p>

        <div className="relative">
          <LinkIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" strokeWidth={1.5} />
          <input
            type="url"
            value={loading ? 'Chargement...' : url}
            onChange={e => setUrl(e.target.value)}
            disabled={loading}
            placeholder="https://pay.wave.com/m/..."
            className="w-full pl-9 pr-4 py-3 bg-surface-rose rounded-xl font-sans text-sm text-on-surface placeholder-outline border border-transparent focus:border-primary focus:outline-none transition-colors disabled:opacity-50"
          />
        </div>

        {saved && !hasChanged && (
          <a
            href={saved}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-sans text-xs text-primary underline underline-offset-2"
          >
            <LinkIcon size={11} /> Tester le lien
          </a>
        )}

        <button
          onClick={handleSave}
          disabled={saving || loading || !hasChanged}
          className="w-full rounded-xl bg-primary text-white py-3 font-sans font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 transition-opacity"
        >
          {saving ? (
            <><Loader2 size={15} className="animate-spin" /> Enregistrement...</>
          ) : success ? (
            <><Check size={15} /> Enregistré !</>
          ) : (
            'Enregistrer le lien'
          )}
        </button>
      </div>
    </div>
  )
}
