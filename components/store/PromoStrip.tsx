export function PromoStrip() {
  const items = [
    { icon: '🚚', text: 'Livraison Abidjan' },
    { icon: '📱', text: 'Mobile Money' },
    { icon: '💬', text: 'WhatsApp' },
  ]

  return (
    <div className="bg-secondary-container">
      <div className="flex items-center justify-around px-6 py-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="text-base">{item.icon}</span>
            <span className="font-sans text-xs font-medium text-primary whitespace-nowrap">
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
