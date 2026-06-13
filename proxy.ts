import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ADMIN_COOKIE, isValidAdminCookie } from '@/lib/adminAuth'

// Protège toutes les routes /admin sauf la page de connexion elle-même.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  const cookie = request.cookies.get(ADMIN_COOKIE)?.value
  if (!isValidAdminCookie(cookie)) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
