'use client'

import { useEffect, useState } from 'react'
import { useCartStore } from '@/src/store/cart-store'
import Image from 'next/image'
import { Pill } from 'lucide-react'

export default function CheckoutSummary() {
  const [mounted, setMounted] = useState(false)
  const items = useCartStore((state) => state.items)
  const getTotalPrice = useCartStore((state) => state.getTotalPrice)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="animate-pulse h-64 bg-slate-800 rounded-2xl" />

  const total = getTotalPrice() / 100

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 sticky top-24 backdrop-blur-sm">
      <h2 className="text-xl font-bold text-white mb-6">Resumen del pedido</h2>
      
      {/* Lista compacta */}
      <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
        {items.map((item) => (
          <div key={item.productId} className="flex gap-4 items-center">
            <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden shrink-0 border border-slate-700">
              {item.imageUrl ? (
                <Image src={item.imageUrl} alt={item.name} width={48} height={48} className="object-cover w-full h-full" />
              ) : (
                <Pill size={20} className="text-slate-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{item.name}</p>
              <p className="text-xs text-slate-500">Cantidad: {item.quantity}</p>
            </div>
            <p className="text-sm font-bold text-emerald-400">
              {((item.priceCents * item.quantity) / 100).toFixed(2)}€
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-800 pt-4 space-y-2">
        <div className="flex justify-between text-sm text-slate-400">
          <span>Subtotal</span>
          <span>{(total * 0.79).toFixed(2)}€</span>
        </div>
        <div className="flex justify-between text-sm text-slate-400">
          <span>Impuestos (IVA est.)</span>
          <span>{(total * 0.21).toFixed(2)}€</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-white pt-2 border-t border-slate-800 mt-2">
          <span>Total a pagar</span>
          <span className="text-emerald-500">{total.toFixed(2)}€</span>
        </div>
        <p className="text-[10px] text-slate-500 text-center mt-2">
          * El pago se realizará en el mostrador al recoger el pedido.
        </p>
      </div>
    </div>
  )
}