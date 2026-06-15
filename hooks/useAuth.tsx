'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

interface AuthContextValue {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string) => Promise<{ error?: string; needsConfirm?: boolean }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/** Traduit les messages d'erreur Supabase les plus courants. */
function translateError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login')) return 'Email ou mot de passe incorrect.'
  if (m.includes('already registered') || m.includes('already been registered')) return 'Un compte existe déjà avec cet email.'
  if (m.includes('password should be at least')) return 'Le mot de passe doit contenir au moins 6 caractères.'
  if (m.includes('unable to validate email') || m.includes('invalid email')) return 'Adresse email invalide.'
  if (m.includes('email not confirmed')) return 'Confirme ton email avant de te connecter.'
  if (m.includes('rate limit') || m.includes('over_email_send_rate_limit')) {
    return 'Trop d\'emails envoyés récemment (limite Supabase). Attends 1 heure, connecte-toi si ton compte existe déjà, ou active ALLOW_DIRECT_SIGNUP=true en local.'
  }
  return message
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) return { error: translateError(error.message) }
    return {}
  }

  async function signUp(email: string, password: string) {
    const trimmedEmail = email.trim()

    // Dev : contourne l'envoi d'email Supabase (limite ~6/h)
    if (process.env.NEXT_PUBLIC_ALLOW_DIRECT_SIGNUP === 'true') {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) return { error: translateError(data.error ?? 'Inscription impossible.') }
      return signIn(trimmedEmail, password)
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof window !== 'undefined' ? window.location.origin : '')
    const emailRedirectTo = siteUrl
      ? `${siteUrl}/auth/callback?next=/compte`
      : undefined
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: { emailRedirectTo },
    })
    if (error) return { error: translateError(error.message) }
    // Pas de session = confirmation par email requise (réglage Supabase)
    return { needsConfirm: !data.session }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>')
  return ctx
}
