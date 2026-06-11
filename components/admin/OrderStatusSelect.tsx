'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

const STATUSES = [
  { value: 'nouvelle',  label: 'En attente',  color: 'bg-amber-50  text-amber-700' },
  { value: 'confirmée', label: 'Confirmée',   color: 'bg-blue-50   text-blue-700' },
  { value: 'livrée',    label: 'Livrée',      color: 'bg-green-50  text-green-700' },
  { value: 'annulée',   label: 'Annulée',     color: 'bg-red-50    text-red-700' },
]

export function OrderStatusSelect({
  orderId,
  initialStatus,
}: {
  orderId: string
  initialStatus: string
}) {
  const [status, setStatus]   = useState(initialStatus)
  const [loading, setLoading] = useState(false)

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value
    setLoading(true)
    await supabase.from('orders').update({ status: next } as never).eq('id', orderId)
    setStatus(next)
    setLoading(false)
  }

  const current = STATUSES.find(s => s.value === status) ?? STATUSES[0]

  return (
    <div className="relative">
      {loading && (
        <Loader2 size={12} className="absolute right-7 top-1/2 -translate-y-1/2 text-primary animate-spin z-10" />
      )}
      <select
        value={status}
        onChange={handleChange}
        disabled={loading}
        className={`rounded-full px-3 py-1 font-sans text-xs font-semibold appearance-none pr-6 border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${current.color}`}
      >
        {STATUSES.map(s => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
    </div>
  )
}
