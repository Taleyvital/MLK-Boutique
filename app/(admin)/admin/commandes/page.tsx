import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/formatPrice'
import type { Order } from '@/lib/supabase/types'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  nouvelle: { label: 'Nouvelle', color: 'bg-secondary-container text-primary' },
  confirmée: { label: 'Confirmée', color: 'bg-blue-50 text-blue-700' },
  livrée: { label: 'Livrée', color: 'bg-green-50 text-green-700' },
  annulée: { label: 'Annulée', color: 'bg-red-50 text-red-700' },
}

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

      <div className="space-y-3">
        {orders.map((order) => {
          const status = STATUS_LABELS[order.status] || STATUS_LABELS.nouvelle
          const itemCount = Array.isArray(order.items) ? order.items.length : 0
          return (
            <div key={order.id} className="bg-surface rounded-xl p-4 shadow-brand">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-sans font-semibold text-sm text-on-surface">
                    {order.customer_name}
                  </p>
                  <p className="font-sans text-xs text-on-surface-variant">
                    #{order.id.slice(0, 8).toUpperCase()} ·{' '}
                    {new Date(order.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 font-sans text-xs font-medium ${status.color}`}>
                  {status.label}
                </span>
              </div>
              <div className="w-full h-px bg-surface-mist mb-2" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-sans text-xs text-on-surface-variant">
                    {itemCount} article{itemCount !== 1 ? 's' : ''}
                  </span>
                  <span className="font-sans text-xs text-on-surface-variant">
                    {order.payment_method === 'mobile_money' ? '📱 Mobile Money' : '💬 WhatsApp'}
                  </span>
                </div>
                <span className="font-sans font-semibold text-sm text-[#720808]">
                  {formatPrice(order.total)}
                </span>
              </div>
              <p className="font-sans text-xs text-on-surface-variant mt-1.5">
                📍 {order.customer_address}
              </p>
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
