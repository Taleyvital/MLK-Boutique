import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { CartAnimProvider } from '@/components/ui/CartFlyAnimation'
import { PromoPopup } from '@/components/store/PromoPopup'
import { getPromoPopup } from '@/app/(admin)/admin/popup/actions'
import { AuthProvider } from '@/hooks/useAuth'

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const popup = await getPromoPopup()

  return (
    <AuthProvider>
      <CartAnimProvider>
        <Header />
        <main className="pt-14 pb-20">{children}</main>
        <BottomNav />
        {popup?.active && <PromoPopup config={popup} />}
      </CartAnimProvider>
    </AuthProvider>
  )
}
