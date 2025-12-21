'use client'

import { useCartStore } from '@/src/store/cart-store'
import { ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function CartButton() {
  const [mounted, setMounted] = useState(false)
  const totalItems = useCartStore((state) => state.getTotalItems())
  const toggleCart = useCartStore((state) => state.toggleCart)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <button
      onClick={toggleCart}
      // 🎨 CAMBIO: bg-card, border-border, text-foreground
      // Hover effects usando variables primarias
      className="group relative flex items-center gap-2 rounded-full border border-border bg-card p-2 pr-4 transition-all hover:border-primary/50 hover:bg-muted hover:shadow-lg hover:shadow-primary/5 active:scale-95"
    >
      <div className="relative">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <ShoppingBag size={18} />
        </div>
        
        {mounted && totalItems > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-card">
            {totalItems}
          </span>
        )}
      </div>
      
      <div className="flex flex-col items-start leading-none">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary">
          Mi Cesta
        </span>
        <span className="text-sm font-bold text-foreground">
          {mounted && totalItems > 0 ? `${totalItems} items` : 'Vacía'}
        </span>
      </div>
    </button>
  )
}