'use client'

import { useEffect, useState } from 'react'
import { useCartStore } from '@/src/store/cart-store'
import Image from 'next/image'
import { Pill } from 'lucide-react'

export default function CheckoutSummary() {
  const [mounted, setMounted] = useState(false)
  const items = useCartStore((state) => state.items)
  const getTotalPrice = useCartStore((state) => state.getTotalPrice)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return <div className="animate-pulse h-64 bg-card rounded-2xl" />

  const total = getTotalPrice() / 100

  return (
    <div className="bg-card border border-border rounded-2xl p-6 sticky top-24 shadow-sm">
      <h2 className="text-xl font-bold text-foreground mb-6">Resumen del pedido</h2>
      
      <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
        {items.map((item) => (
          <div key={item.productId} className="flex gap-4 items-center">
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden shrink-0 border border-border">
              {item.imageUrl ? (
                <Image src={item.imageUrl} alt={item.name} width={48} height={48} className="object-cover w-full h-full" />
              ) : (
                <Pill size={20} className="text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">Cant: {item.quantity}</p>
            </div>
            <p className="text-sm font-bold text-primary">
              {((item.priceCents * item.quantity) / 100).toFixed(2)}€
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-4 space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Subtotal</span>
          <span>{(total * 0.79).toFixed(2)}€</span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Impuestos</span>
          <span>{(total * 0.21).toFixed(2)}€</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t border-border mt-2">
          <span>Total</span>
          <span className="text-primary">{total.toFixed(2)}€</span>
        </div>
      </div>
    </div>
  )
}