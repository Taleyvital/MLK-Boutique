import { formatPrice } from './formatPrice'

export const WHATSAPP_NUMBER = '+2250153471556'

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  size: string
  qty: number
  slug: string
}

export function generateWhatsAppMessage(
  items: CartItem[],
  total: number,
  customerInfo: { name: string; address: string }
): string {
  const itemsList = items
    .map((i) => {
      const imageLine = i.image ? `\n  Image : ${i.image}` : ''
      return `• ${i.name} (${i.size}) x${i.qty} — ${formatPrice(i.price * i.qty)}${imageLine}`
    })
    .join('\n')

  return encodeURIComponent(
    `Bonjour MLK-Boutique ! 👋\n\n` +
    `Je souhaite commander :\n${itemsList}\n\n` +
    `💰 Total : ${formatPrice(total)}\n` +
    `📍 Livraison à : ${customerInfo.address}\n` +
    `👤 Nom : ${customerInfo.name}`
  )
}

export function getWhatsAppUrl(
  items: CartItem[],
  total: number,
  customerInfo: { name: string; address: string }
): string {
  const message = generateWhatsAppMessage(items, total, customerInfo)
  return `https://wa.me/${WHATSAPP_NUMBER.replace(/\+/g, '')}?text=${message}`
}
