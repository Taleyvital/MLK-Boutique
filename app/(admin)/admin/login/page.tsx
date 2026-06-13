'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { login, type LoginState } from './actions'

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(login, {})
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10 bg-surface-low">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-brand px-6 py-9">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="w-5 h-5 rounded-[5px] bg-primary inline-block" />
          <span className="font-display italic text-xl text-on-surface tracking-tight">MLK Boutique</span>
        </div>

        {/* En-tête */}
        <h1 className="font-display text-3xl font-bold text-on-surface text-center mb-1.5">Bon retour</h1>
        <p className="font-sans text-sm text-on-surface-variant text-center mb-7">
          Connectez-vous pour gérer votre boutique et vos produits
        </p>

        {/* Onglet (un seul espace admin) */}
        <div className="bg-surface-low rounded-2xl p-1 mb-6">
          <div className="w-full rounded-xl bg-white shadow-sm py-2.5 text-center font-sans text-sm font-semibold text-on-surface">
            Connexion
          </div>
        </div>

        <form action={formAction} className="space-y-3">
          <div>
            <label className="font-sans text-sm font-semibold text-on-surface block mb-2">Accédez à votre espace</label>
            <p className="font-sans text-xs text-on-surface-variant mb-3">
              Tableau de bord, produits, commandes et réglages.
            </p>
          </div>

          {/* Identifiant */}
          <div className="relative">
            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" strokeWidth={1.6} />
            <input
              name="username"
              type="text"
              autoComplete="username"
              defaultValue="admin"
              placeholder="Identifiant"
              className="w-full pl-11 pr-4 py-3.5 bg-surface-low rounded-2xl font-sans text-sm text-on-surface placeholder-outline border border-transparent focus:border-primary focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          {/* Mot de passe */}
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" strokeWidth={1.6} />
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
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

          {state.error && (
            <p className="font-sans text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5">{state.error}</p>
          )}

          {/* Bouton */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-2xl bg-primary text-white py-4 font-sans font-bold text-base flex items-center justify-center gap-2 hover:bg-primary-container active:scale-[0.99] transition-all disabled:opacity-60 disabled:pointer-events-none"
          >
            {isPending ? <><Loader2 size={18} className="animate-spin" />Connexion...</> : 'Se connecter'}
          </button>
        </form>

        {/* Pied */}
        <Link
          href="/"
          className="block text-center mt-5 font-sans text-sm font-semibold text-primary hover:underline"
        >
          ← Retour à la boutique
        </Link>
      </div>
    </div>
  )
}
