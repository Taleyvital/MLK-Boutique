import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MLK-Boutique — Mode Féminine Abidjan',
  description: 'Boutique de mode féminine à Abidjan. Vêtements, bijoux, beauté et chaussures. Livraison rapide, paiement Mobile Money.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full bg-surface font-sans antialiased" suppressHydrationWarning>{children}</body>
    </html>
  )
}
