'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

function AuthCallbackHandler() {
  const router = useRouter()
  const params = useSearchParams()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    async function confirmEmail() {
      const next = params.get('next') || '/compte'
      const code = params.get('code')

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          setFailed(true)
          return
        }
        router.replace(next)
        return
      }

      // Flux implicite : les tokens sont dans le hash (#access_token=…)
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.replace(next)
        return
      }

      setFailed(true)
    }

    confirmEmail()
  }, [params, router])

  if (failed) {
    return (
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-brand px-6 py-10 text-center">
        <XCircle size={44} className="text-red-500 mx-auto mb-4" strokeWidth={1.5} />
        <h1 className="font-display text-2xl font-bold text-on-surface mb-2">Lien invalide</h1>
        <p className="font-sans text-sm text-on-surface-variant mb-6">
          Ce lien de confirmation est expiré ou a déjà été utilisé. Réessaie de te connecter ou crée un nouveau compte.
        </p>
        <Link href="/login" className="font-sans text-sm font-semibold text-primary hover:underline">
          Retour à la connexion
        </Link>
      </div>
    )
  }

  return (
    <div className="text-center">
      <Loader2 size={36} className="animate-spin text-primary mx-auto mb-4" />
      <p className="font-sans text-sm text-on-surface-variant">Confirmation de ton compte en cours…</p>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-5 py-10">
      <Suspense fallback={<Loader2 size={36} className="animate-spin text-primary" />}>
        <AuthCallbackHandler />
      </Suspense>
    </div>
  )
}
