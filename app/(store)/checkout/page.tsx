'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Phone, User, MapPin } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/formatPrice'
import { useCart } from '@/hooks/useCart'
import { supabase } from '@/lib/supabase/client'
import { WHATSAPP_NUMBER } from '@/lib/whatsapp'
import type { CartItem } from '@/store/cartStore'


const BOUTIQUE_WHATSAPP = WHATSAPP_NUMBER.replace(/\D/g, '')

function buildOwnerNotification(orderId: string, name: string, phone: string, address: string, items: CartItem[], total: number) {
  const lines = items.map(i => `• ${i.name} (${i.size}) ×${i.qty} — ${formatPrice(i.price * i.qty)}`).join('\n')
  const text = `🛍️ *Nouvelle commande* #${orderId.slice(0, 8).toUpperCase()}\n\n👤 ${name}\n📞 ${phone}\n📍 ${address}\n\n${lines}\n\n💰 *Total : ${formatPrice(total)}*`
  return `https://wa.me/${BOUTIQUE_WHATSAPP}?text=${encodeURIComponent(text)}`
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCart()
  const cartTotal = total()

  // Lien Wave du premier article qui en possède un
  const rawWaveUrl = items.find(i => i.wavePaymentUrl)?.wavePaymentUrl ?? ''
  const normalizedWaveUrl = rawWaveUrl && !rawWaveUrl.startsWith('http')
    ? `https://${rawWaveUrl}`
    : rawWaveUrl
  const waveUrl = (() => {
    try {
      const u = new URL(normalizedWaveUrl)
      return u.hostname ? normalizedWaveUrl : ''
    } catch {
      return ''
    }
  })()

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit() {
    if (!form.name || !form.phone || !form.address) {
      setError('Veuillez remplir tous les champs.')
      return
    }
    if (items.length === 0) {
      setError('Votre panier est vide.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data, error: supaErr } = await supabase
        .from('orders')
        .insert({
          customer_name: form.name,
          customer_phone: form.phone,
          customer_address: form.address,
          items: items as unknown as never,
          total: cartTotal,
          payment_method: 'mobile_money',
          payment_status: 'pending',
          status: 'nouvelle',
        } as never)
        .select()
        .single()

      if (supaErr) throw supaErr

      const order = data as { id: string }
      clearCart()

      // Notification WhatsApp automatique à la boutique
      const waUrl = buildOwnerNotification(order.id, form.name, form.phone, form.address, items, cartTotal)
      window.open(waUrl, '_blank')

      router.push(`/confirmation?orderId=${order.id}`)
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
      setLoading(false)
    }
  }

  if (items.length === 0) {
    router.push('/panier')
    return null
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="px-6 pt-4 pb-2 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-surface-rose flex items-center justify-center"
        >
          <ArrowLeft size={16} strokeWidth={1.5} className="text-on-surface" />
        </button>
        <h1 className="font-serif text-xl text-on-surface">Paiement</h1>
      </div>

      <div className="px-6 pt-2 pb-6 space-y-4">
        {/* Order summary */}
        <div className="bg-surface-rose rounded-xl p-4">
          <p className="font-sans text-xs text-on-surface-variant uppercase tracking-widest mb-3">
            Récapitulatif
          </p>
          <div className="space-y-1.5">
            {items.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex justify-between font-sans text-sm">
                <span className="text-on-surface-variant truncate flex-1 pr-2">
                  {item.name} ({item.size}) x{item.qty}
                </span>
                <span className="text-on-surface font-medium flex-shrink-0">
                  {formatPrice(item.price * item.qty)}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full h-px bg-surface-mist my-3" />
          <div className="flex justify-between font-sans font-semibold">
            <span className="text-on-surface">Total</span>
            <span className="text-[#720808] text-lg">{formatPrice(cartTotal)}</span>
          </div>
        </div>

        {/* Customer info */}
        <div className="space-y-3">
          <p className="font-sans text-xs text-on-surface-variant uppercase tracking-widest">
            Vos informations
          </p>

          <div className="relative">
            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" strokeWidth={1.5} />
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nom complet"
              className="w-full pl-10 pr-4 py-3 bg-surface-rose rounded-xl font-sans text-sm text-on-surface placeholder-outline border border-transparent focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div className="relative">
            <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" strokeWidth={1.5} />
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="Numéro de téléphone (ex : 07 XX XX XX)"
              className="w-full pl-10 pr-4 py-3 bg-surface-rose rounded-xl font-sans text-sm text-on-surface placeholder-outline border border-transparent focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div className="relative">
            <MapPin size={16} className="absolute left-4 top-3.5 text-outline" strokeWidth={1.5} />
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Adresse de livraison (quartier, commune, Abidjan)"
              rows={2}
              className="w-full pl-10 pr-4 py-3 bg-surface-rose rounded-xl font-sans text-sm text-on-surface placeholder-outline border border-transparent focus:border-primary focus:outline-none transition-colors resize-none"
            />
          </div>
        </div>

        {/* Payment methods */}
        <div className="bg-tertiary-container/30 rounded-xl p-4">
          <p className="font-sans text-xs text-on-surface-variant uppercase tracking-widest mb-3">
            Mode de paiement pour le moment
          </p>
          {waveUrl ? (
            <a
              href={waveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 w-full rounded-xl bg-[#1DC3C3] text-white px-4 py-3 font-sans font-bold text-base active:scale-[0.98] transition-transform"
            >
              <Image
                src="/moyen-paiement/wave.png"
                alt="Wave"
                width={32}
                height={32}
                className="rounded-lg object-contain bg-white p-0.5"
              />
              Payer avec Wave
            </a>
          ) : (
            <div
              className="bg-white rounded-xl p-2 shadow-sm flex items-center justify-center overflow-hidden"
              style={{ width: 64, height: 40 }}
            >
              <Image
                src="/moyen-paiement/wave.png"
                alt="Wave"
                width={52}
                height={28}
                className="object-contain"
              />
            </div>
          )}
        </div>

        {error && (
          <p className="font-sans text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>
        )}

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Traitement en cours...' : `Confirmer — ${formatPrice(cartTotal)}`}
        </Button>
      </div>
    </div>
  )
}
