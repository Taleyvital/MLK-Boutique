'use client'

import { useState, useTransition } from 'react'
import { Minus, Plus, Check, Loader2 } from 'lucide-react'
import { updateStock } from '@/app/(admin)/admin/produits/actions'

export function QuickStockEdit({ productId, initialStock }: { productId: string; initialStock: number }) {
  const [stock, setStock] = useState(initialStock)
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      await updateStock(productId, stock)
      setEditing(false)
    })
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="font-sans text-xs text-on-surface-variant hover:text-on-surface transition-colors underline-offset-2 hover:underline"
      >
        Stock : {stock}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setStock(s => Math.max(0, s - 1))}
        className="w-6 h-6 rounded-full bg-surface-rose flex items-center justify-center text-on-surface"
      >
        <Minus size={10} />
      </button>
      <input
        type="number"
        value={stock}
        onChange={e => setStock(Math.max(0, parseInt(e.target.value) || 0))}
        className="w-12 text-center font-sans text-xs bg-surface-rose rounded-lg px-1 py-1 border border-primary focus:outline-none"
      />
      <button
        onClick={() => setStock(s => s + 1)}
        className="w-6 h-6 rounded-full bg-surface-rose flex items-center justify-center text-on-surface"
      >
        <Plus size={10} />
      </button>
      <button
        onClick={handleSave}
        disabled={isPending}
        className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white ml-1"
      >
        {isPending ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
      </button>
    </div>
  )
}
