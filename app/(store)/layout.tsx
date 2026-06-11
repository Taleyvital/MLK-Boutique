import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { CartAnimProvider } from '@/components/ui/CartFlyAnimation'

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CartAnimProvider>
      <Header />
      <main className="pt-14 pb-20">{children}</main>
      <BottomNav />
    </CartAnimProvider>
  )
}
