'use server'

import { cookies } from 'next/headers'
import { ADMIN_COOKIE, adminToken } from '@/lib/adminAuth'

export async function loginAsAdmin(username: string, password: string) {
  const expectedUser = process.env.ADMIN_USERNAME ?? 'admin'
  const expectedPass = process.env.ADMIN_PASSWORD

  if (!expectedPass) return { ok: false }
  if (username.trim() !== expectedUser || password !== expectedPass) return { ok: false }

  const cookieStore = await cookies()
  cookieStore.set(ADMIN_COOKIE, adminToken(expectedPass), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })

  return { ok: true }
}
