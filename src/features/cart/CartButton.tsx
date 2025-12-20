'use client'

import { useEffect, useState } from 'react'
import { useCartStore } from '@/src/store/cart-store'
import { ShoppingBag } from 'lucide-react'

export default function CartButton() {
  const [mounted, setMounted] = useState(false)
  const totalItems = useCartStore((state) => state.getTotalItems())
  const toggleCart = useCartStore((state) => state.toggleCart)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-10 h-10" /> // Placeholder para evitar saltos
  }

  return (
    <button 
      onClick={toggleCart}
      className="relative p-2 hover:bg-slate-800 rounded-full transition-colors group"
      aria-label="Abrir carrito"
    >
      <ShoppingBag 
        size={22} 
        className="text-slate-300 group-hover:text-emerald-400 transition-colors" 
      />
      
      {totalItems > 0 && (
        <span className="absolute top-0 right-0 h-5 w-5 bg-emerald-500 text-slate-950 text-xs font-bold rounded-full flex items-center justify-center border-2 border-slate-950 shadow-sm animate-fade-in">
          {totalItems}
        </span>
      )}
    </button>
  )
}