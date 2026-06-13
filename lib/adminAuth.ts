import { createHash } from 'node:crypto'

/** Nom du cookie de session admin. */
export const ADMIN_COOKIE = 'mlk_admin'

/** Jeton opaque dérivé du mot de passe (jamais le mot de passe en clair dans le cookie). */
export function adminToken(password: string) {
  return createHash('sha256').update(`mlk-admin::${password}`).digest('hex')
}

/** Vérifie qu'un cookie correspond bien au mot de passe admin configuré. */
export function isValidAdminCookie(value: string | undefined) {
  const pw = process.env.ADMIN_PASSWORD
  if (!pw || !value) return false
  return value === adminToken(pw)
}
