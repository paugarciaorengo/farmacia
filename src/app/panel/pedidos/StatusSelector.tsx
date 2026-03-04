'use client'

import { useState } from 'react'
import { updateOrderStatusAction } from '../../actions/update-order-status'
import { Loader2, Check } from 'lucide-react'

export function StatusSelector({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const [loading, setLoading] = useState(false)

  const statuses = [
    { id: 'PREPARING', label: 'En Preparación' },
    { id: 'PAID', label: 'Preparado' },
    { id: 'DELIVERED', label: 'Recogido' },
    { id: 'CANCELLED', label: 'Cancelado' },
  ]

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const nextStatus = e.target.value
    setLoading(true)
    await updateOrderStatusAction(orderId, nextStatus)
    setLoading(false)
  }

  return (
    <div className="relative flex items-center gap-2">
      {loading && <Loader2 size={16} className="animate-spin text-primary absolute -left-6" />}
      <select
        defaultValue={currentStatus}
        onChange={handleChange}
        disabled={loading}
        className="text-xs font-bold uppercase tracking-wider bg-background border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
      >
        {statuses.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  )
}