'use client'

import { useState } from 'react'
import { useCartStore } from '@/src/store/cart-store'
import { ShoppingBag, Plus, Minus, Check } from 'lucide-react'

type ProductActionsProps = {
  product: {
    id: string
    name: string
    slug: string
    priceCents: number
    imageUrl?: string
    stock: number
  }
}

export default function ProductActions({ product }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      priceCents: product.priceCents,
      imageUrl: product.imageUrl,
      quantity: quantity,
      maxQuantity: product.stock
    })

    // Feedback visual temporal
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  // Si no hay stock, mostramos botón deshabilitado
  if (product.stock <= 0) {
    return (
      <button disabled className="w-full bg-slate-800 text-slate-500 font-bold py-4 rounded-xl cursor-not-allowed">
        Producto Agotado
      </button>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Selector de Cantidad */}
      <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl h-14 w-full sm:w-auto">
        <button 
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="px-4 h-full text-slate-400 hover:text-white transition-colors"
        >
          <Minus size={18} />
        </button>
        <span className="flex-1 w-12 text-center font-bold text-lg text-white">{quantity}</span>
        <button 
          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
          className="px-4 h-full text-slate-400 hover:text-white transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Botón Añadir */}
      <button
        onClick={handleAddToCart}
        className={`flex-1 flex items-center justify-center gap-2 font-bold text-lg py-3 px-6 rounded-xl transition-all duration-300 ${
          isAdded 
            ? 'bg-emerald-500 text-slate-950 scale-95' 
            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 active:scale-95'
        }`}
      >
        {isAdded ? (
          <>
            <Check size={24} /> ¡Añadido!
          </>
        ) : (
          <>
            <ShoppingBag size={24} /> Añadir a la cesta
          </>
        )}
      </button>
    </div>
  )
}