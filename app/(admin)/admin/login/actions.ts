'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ADMIN_COOKIE, adminToken } from '@/lib/adminAuth'

export type LoginState = { error?: string }

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get('username') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  const expectedUser = process.env.ADMIN_USERNAME ?? 'admin'
  const expectedPass = process.env.ADMIN_PASSWORD

  if (!expectedPass) {
    return { error: "Authentification non configurée (ADMIN_PASSWORD manquant)." }
  }
  if (username !== expectedUser || password !== expectedPass) {
    return { error: 'Identifiant ou mot de passe incorrect.' }
  }

  const cookieStore = await cookies()
  cookieStore.set(ADMIN_COOKIE, adminToken(expectedPass), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 jours
  })

  redirect('/admin')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE)
  redirect('/admin/login')
}
