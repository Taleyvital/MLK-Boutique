'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') || '/compte'
  const { user, signIn, signUp } = useAuth()

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [confirmSent, setConfirmSent] = useState(false)

  // Déjà connecté → on quitte la page de login
  useEffect(() => {
    if (user) router.replace(redirect)
  }, [user, redirect, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setPending(true)

    if (mode === 'signin') {
      const { error } = await signIn(email, password)
      if (error) { setError(error); setPending(false); return }
      router.replace(redirect)
    } else {
      const { error, needsConfirm } = await signUp(email, password)
      if (error) { setError(error); setPending(false); return }
      if (needsConfirm) { setConfirmSent(true); setPending(false); return }
      router.replace(redirect)
    }
  }

  if (confirmSent) {
    return (
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-brand px-6 py-10 text-center">
        <CheckCircle2 size={44} className="text-primary mx-auto mb-4" strokeWidth={1.5} />
        <h1 className="font-display text-2xl font-bold text-on-surface mb-2">Vérifie tes emails</h1>
        <p className="font-sans text-sm text-on-surface-variant mb-6">
          Un lien de confirmation a été envoyé à <span className="font-semibold">{email}</span>.
          Clique dessus pour activer ton compte, puis connecte-toi.
        </p>
        <button
          onClick={() => { setConfirmSent(false); setMode('signin') }}
          className="font-sans text-sm font-semibold text-primary hover:underline"
        >
          Retour à la connexion
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm bg-white rounded-3xl shadow-brand px-6 py-9">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2 mb-7">
        <span className="w-5 h-5 rounded-[5px] bg-primary inline-block" />
        <span className="font-display italic text-xl text-on-surface tracking-tight">MLK Boutique</span>
      </div>

      <h1 className="font-display text-3xl font-bold text-on-surface text-center mb-1.5">
        {mode === 'signin' ? 'Bon retour' : 'Bienvenue'}
      </h1>
      <p className="font-sans text-sm text-on-surface-variant text-center mb-7">
        {mode === 'signin'
          ? 'Connecte-toi pour commander et suivre tes achats'
          : 'Crée ton compte pour commencer tes achats'}
      </p>

      {/* Toggle */}
      <div className="bg-surface-low rounded-2xl p-1 mb-6 flex">
        {(['signin', 'signup'] as const).map(m => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setError('') }}
            className={`flex-1 rounded-xl py-2.5 text-center font-sans text-sm font-semibold transition-colors ${
              mode === m ? 'bg-white shadow-sm text-on-surface' : 'text-on-surface-variant'
            }`}
          >
            {m === 'signin' ? 'Connexion' : 'Créer un compte'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Email */}
        <div className="relative">
          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" strokeWidth={1.6} />
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Adresse email"
            className="w-full pl-11 pr-4 py-3.5 bg-surface-low rounded-2xl font-sans text-sm text-on-surface placeholder-outline border border-transparent focus:border-primary focus:bg-white focus:outline-none transition-colors"
          />
        </div>

        {/* Mot de passe */}
        <div className="relative">
          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" strokeWidth={1.6} />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            minLength={6}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Mot de passe"
            className="w-full pl-11 pr-12 py-3.5 bg-surface-low rounded-2xl font-sans text-sm text-on-surface placeholder-outline border border-transparent focus:border-primary focus:bg-white focus:outline-none transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(s => !s)}
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
          >
            {showPassword ? <EyeOff size={18} strokeWidth={1.6} /> : <Eye size={18} strokeWidth={1.6} />}
          </button>
        </div>

        {error && (
          <p className="font-sans text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5">{error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-2xl bg-primary text-white py-4 font-sans font-bold text-base flex items-center justify-center gap-2 hover:bg-primary-container active:scale-[0.99] transition-all disabled:opacity-60 disabled:pointer-events-none"
        >
          {pending
            ? <><Loader2 size={18} className="animate-spin" />{mode === 'signin' ? 'Connexion...' : 'Création...'}</>
            : (mode === 'signin' ? 'Se connecter' : 'Créer mon compte')}
        </button>
      </form>

      {/* Mode invité */}
      <Link
        href="/boutique"
        className="block text-center mt-5 font-sans text-sm font-semibold text-on-surface-variant hover:text-on-surface"
      >
        Continuer en invité →
      </Link>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-5 py-10">
      <Suspense fallback={<Loader2 size={28} className="animate-spin text-primary" />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
