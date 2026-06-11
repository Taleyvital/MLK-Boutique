import Link from 'next/link'
import { ArrowLeft, Phone, MapPin, CreditCard, MessageCircle } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/formatPrice'
import { OrderStatusSelect } from '@/components/admin/OrderStatusSelect'
import type { Order, OrderItem } from '@/lib/supabase/types'

async function getOrders(): Promise<Order[]> {
  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    return (data as Order[]) || []
  } catch {
    return []
  }
}

export default async function CommandesPage() {
  const orders = await getOrders()

  const revenue = orders
    .filter(o => o.status !== 'annulée')
    .reduce((sum, o) => sum + o.total, 0)

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin"
          className="w-9 h-9 rounded-full bg-surface flex items-center justify-center shadow-brand"
        >
          <ArrowLeft size={16} strokeWidth={1.5} className="text-on-surface" />
        </Link>
        <h1 className="font-serif text-xl text-on-surface">Commandes</h1>
        <span className="ml-auto font-sans text-sm text-on-surface-variant">
          {orders.length} commande{orders.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Stats rapides */}
      {orders.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total',      value: orders.length.toString(),                                        sub: 'commandes' },
            { label: 'En attente', value: orders.filter(o => o.status === 'nouvelle').length.toString(),    sub: 'à traiter' },
            { label: 'CA',         value: formatPrice(revenue),                                             sub: 'hors annulées' },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-surface rounded-xl p-3 shadow-brand text-center">
              <p className="font-sans text-[10px] text-on-surface-variant uppercase tracking-wider mb-0.5">{label}</p>
              <p className="font-sans font-bold text-sm text-primary truncate">{value}</p>
              <p className="font-sans text-[10px] text-outline">{sub}</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order) => {
          const items = order.items as OrderItem[]
          return (
            <div key={order.id} className="bg-surface rounded-2xl shadow-brand overflow-hidden">
              {/* Header commande */}
              <div className="flex items-start justify-between px-4 pt-4 pb-3">
                <div>
                  <p className="font-sans font-semibold text-sm text-on-surface">{order.customer_name}</p>
                  <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                    #{order.id.slice(0, 8).toUpperCase()} ·{' '}
                    {new Date(order.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
                {/* Statut modifiable en live */}
                <OrderStatusSelect orderId={order.id} initialStatus={order.status} />
              </div>

              {/* Séparateur */}
              <div className="h-px bg-outline-variant/20 mx-4" />

              {/* Articles */}
              <div className="px-4 py-3 space-y-1.5">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <span className="font-sans text-xs text-on-surface-variant flex-1 truncate">
                      {item.name} <span className="text-outline">({item.size}) ×{item.qty}</span>
                    </span>
                    <span className="font-sans text-xs font-medium text-on-surface flex-shrink-0">
                      {formatPrice(item.price * item.qty)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="h-px bg-outline-variant/20 mx-4" />
              <div className="px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-on-surface-variant">
                    <Phone size={12} strokeWidth={1.5} />
                    <span className="font-sans text-xs">{order.customer_phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-on-surface-variant">
                    <MapPin size={12} strokeWidth={1.5} />
                    <span className="font-sans text-xs">{order.customer_address}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-on-surface-variant">
                    {order.payment_method === 'mobile_money'
                      ? <CreditCard size={12} strokeWidth={1.5} />
                      : <MessageCircle size={12} strokeWidth={1.5} />}
                    <span className="font-sans text-xs">
                      {order.payment_method === 'mobile_money' ? 'Mobile Money' : 'WhatsApp'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-sans text-xs text-on-surface-variant">Total</p>
                  <p className="font-sans font-bold text-base text-primary">{formatPrice(order.total)}</p>
                </div>
              </div>
            </div>
          )
        })}
        {orders.length === 0 && (
          <div className="text-center py-12">
            <p className="font-sans text-sm text-on-surface-variant">Aucune commande pour l&apos;instant</p>
          </div>
        )}
      </div>
    </div>
  )
}
