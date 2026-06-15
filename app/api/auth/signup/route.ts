import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

/** Inscription sans email — uniquement si ALLOW_DIRECT_SIGNUP=true (développement). */
export async function POST(req: NextRequest) {
  if (process.env.ALLOW_DIRECT_SIGNUP !== 'true') {
    return Response.json({ error: 'Non autorisé.' }, { status: 403 })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return Response.json({ error: 'SUPABASE_SERVICE_ROLE_KEY manquant.' }, { status: 500 })
  }

  const body = await req.json().catch(() => null)
  const email = String(body?.email ?? '').trim()
  const password = String(body?.password ?? '')

  if (!email || password.length < 6) {
    return Response.json({ error: 'Email ou mot de passe invalide.' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) {
    const msg = error.message.toLowerCase()
    if (msg.includes('already') || msg.includes('registered')) {
      return Response.json({ error: 'Un compte existe déjà avec cet email.' }, { status: 400 })
    }
    return Response.json({ error: error.message }, { status: 400 })
  }

  return Response.json({ ok: true })
}
