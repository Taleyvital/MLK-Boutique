import Link from 'next/link'
import { Package, ShoppingCart, TrendingUp, PlusCircle, Image as ImageIcon, Megaphone } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'

async function getStats() {
  try {
    const supabase = createServerClient()
    const [{ count: productCount }, { count: orderCount }, { data: recentOrders }] =
      await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
      ])
    return { productCount: productCount || 0, orderCount: orderCount || 0, recentOrders: recentOrders || [] }
  } catch {
    return { productCount: 0, orderCount: 0, recentOrders: [] }
  }
}

export default async function AdminDashboard() {
  const { productCount, orderCount, recentOrders } = await getStats()

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display italic text-2xl text-primary">MLK-Boutique</h1>
          <p className="font-sans text-sm text-on-surface-variant">Tableau de bord admin</p>
        </div>
        <Link
          href="/"
          className="font-sans text-sm text-on-surface-variant hover:text-on-surface transition-colors"
        >
          ← Voir la boutique
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-surface rounded-xl p-4 shadow-brand">
          <div className="flex items-center gap-2 mb-1">
            <Package size={16} className="text-primary" strokeWidth={1.5} />
            <p className="font-sans text-xs text-on-surface-variant uppercase tracking-wider">Produits</p>
          </div>
          <p className="font-serif text-3xl text-on-surface">{productCount}</p>
        </div>
        <div className="bg-surface rounded-xl p-4 shadow-brand">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart size={16} className="text-primary" strokeWidth={1.5} />
            <p className="font-sans text-xs text-on-surface-variant uppercase tracking-wider">Commandes</p>
          </div>
          <p className="font-serif text-3xl text-on-surface">{orderCount}</p>
        </div>
      </div>

      <div className="grid gap-3 mb-8">
        <Link
          href="/admin/produits/nouveau"
          className="flex items-center gap-3 bg-primary text-white rounded-xl p-4 hover:bg-primary-container transition-colors"
        >
          <PlusCircle size={20} strokeWidth={1.5} />
          <span className="font-sans font-semibold">Ajouter un produit</span>
        </Link>
        <Link
          href="/admin/produits"
          className="flex items-center gap-3 bg-surface rounded-xl p-4 shadow-brand hover:bg-surface-rose transition-colors"
        >
          <Package size={20} className="text-primary" strokeWidth={1.5} />
          <span className="font-sans font-semibold text-on-surface">Gérer les produits</span>
        </Link>
        <Link
          href="/admin/commandes"
          className="flex items-center gap-3 bg-surface rounded-xl p-4 shadow-brand hover:bg-surface-rose transition-colors"
        >
          <TrendingUp size={20} className="text-primary" strokeWidth={1.5} />
          <span className="font-sans font-semibold text-on-surface">Voir les commandes</span>
        </Link>
        <Link
          href="/admin/hero"
          className="flex items-center gap-3 bg-surface rounded-xl p-4 shadow-brand hover:bg-surface-rose transition-colors"
        >
          <ImageIcon size={20} className="text-primary" strokeWidth={1.5} />
          <span className="font-sans font-semibold text-on-surface">Modifier le hero</span>
        </Link>
        <Link
          href="/admin/popup"
          className="flex items-center gap-3 bg-surface rounded-xl p-4 shadow-brand hover:bg-surface-rose transition-colors"
        >
          <Megaphone size={20} className="text-primary" strokeWidth={1.5} />
          <span className="font-sans font-semibold text-on-surface">Popup promotionnel</span>
        </Link>
      </div>

      {recentOrders.length > 0 && (
        <div>
          <p className="font-sans text-xs text-on-surface-variant uppercase tracking-widest mb-3">
            Commandes récentes
          </p>
          <div className="space-y-2">
            {recentOrders.map((order: any) => (
              <div
                key={order.id}
                className="bg-surface rounded-xl p-3 flex items-center justify-between"
              >
                <div>
                  <p className="font-sans text-sm font-medium text-on-surface">{order.customer_name}</p>
                  <p className="font-sans text-xs text-on-surface-variant">
                    #{order.id.slice(0, 8).toUpperCase()} · {new Date(order.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 font-sans text-xs font-medium ${
                  order.status === 'nouvelle' ? 'bg-secondary-container text-primary' :
                  order.status === 'confirmée' ? 'bg-blue-50 text-blue-700' :
                  order.status === 'livrée' ? 'bg-green-50 text-green-700' :
                  'bg-red-50 text-red-700'
                }`}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
