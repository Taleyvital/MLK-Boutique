import { cookies } from 'next/headers'
import { ADMIN_COOKIE, isValidAdminCookie } from '@/lib/adminAuth'

export async function GET() {
  const cookieStore = await cookies()
  const isAdmin = isValidAdminCookie(cookieStore.get(ADMIN_COOKIE)?.value)
  return Response.json({ isAdmin })
}
