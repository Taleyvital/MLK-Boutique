export function loadCustomerInfo() {
  if (typeof window === 'undefined') return { name: '', address: 'Abidjan' }
  try {
    const raw = window.localStorage.getItem('mlk-profile')
    const profile = raw ? JSON.parse(raw) : {}
    return {
      name: typeof profile.name === 'string' ? profile.name.trim() : '',
      address: typeof profile.address === 'string' && profile.address.trim()
        ? profile.address.trim()
        : 'Abidjan',
    }
  } catch {
    return { name: '', address: 'Abidjan' }
  }
}

export function publicImageUrl(src: string) {
  if (typeof window === 'undefined') return src
  if (/^https?:\/\//.test(src)) return src
  return new URL(src, window.location.origin).toString()
}
