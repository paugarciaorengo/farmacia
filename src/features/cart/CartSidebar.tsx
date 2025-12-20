'use client'

import { useEffect, useState } from 'react'
import { useCartStore } from '@/src/store/cart-store'
import Link from 'next/link'
import { ShoppingBag, X, Trash2, Plus, Minus, Pill } from 'lucide-react'

export default function CartSidebar() {
  const [mounted, setMounted] = useState(false)
  
  const isOpen = useCartStore((state) => state.isOpen)
  const items = useCartStore((state) => state.items)
  const toggleCart = useCartStore((state) => state.toggleCart)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const getTotalPrice = useCartStore((state) => state.getTotalPrice)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted || !isOpen) return null

  return (
    <div className="relative z-50">
      {/* Fondo oscuro con desenfoque */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={toggleCart}
      />

      {/* Panel deslizante */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-0 md:pl-10 pointer-events-none">
        <div className="pointer-events-auto w-screen max-w-md bg-slate-900 shadow-2xl border-l border-slate-800 flex flex-col animate-slide-in">
          
          {/* Cabecera */}
          <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShoppingBag className="text-emerald-500" />
              Tu Cesta
            </h2>
            <button onClick={toggleCart} className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded">
              <X size={24} />
            </button>
          </div>

          {/* Lista de productos */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
                <div className="bg-slate-800/50 p-6 rounded-full mb-4">
                   <ShoppingBag size={48} className="opacity-20" />
                </div>
                <p className="text-lg font-medium text-slate-400">Tu cesta está vacía</p>
                <button onClick={toggleCart} className="mt-4 text-emerald-500 font-medium hover:underline hover:text-emerald-400">
                  Volver al catálogo
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.productId} className="flex gap-4 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 hover:border-emerald-500/30 transition-colors group">
                  {/* Imagen */}
                  <div className="w-20 h-20 bg-slate-800 rounded-lg flex items-center justify-center shrink-0 overflow-hidden border border-slate-700">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Pill size={24} className="text-slate-600" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-slate-200 font-medium line-clamp-1 group-hover:text-emerald-400 transition-colors">{item.name}</h4>
                      <p className="text-emerald-400 font-bold text-lg">{(item.priceCents / 100).toFixed(2)}€</p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Control Cantidad */}
                      <div className="flex items-center bg-slate-900 rounded-lg border border-slate-700 h-8">
                        <button 
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="px-2 h-full hover:text-emerald-400 hover:bg-slate-800 rounded-l-lg transition-colors flex items-center"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-white">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="px-2 h-full hover:text-emerald-400 hover:bg-slate-800 rounded-r-lg transition-colors flex items-center"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button 
                        onClick={() => removeItem(item.productId)}
                        className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Total */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-800 bg-slate-900 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] z-10">
              <div className="flex justify-between mb-2 text-slate-400 text-sm">
                <span>Subtotal (sin IVA)</span>
                <span>{((getTotalPrice() * 0.79) / 100).toFixed(2)}€</span>
              </div>
              <div className="flex justify-between mb-6 text-xl font-bold text-white items-end">
                <span>Total</span>
                <span className="text-2xl text-emerald-400">{(getTotalPrice() / 100).toFixed(2)}€</span>
              </div>
              
              <Link
                href="/checkout"
                onClick={toggleCart}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.98]"
              >
                Tramitar Pedido
                <ShoppingBag size={20} />
              </Link>
              <p className="text-center text-xs text-slate-500 mt-3 flex items-center justify-center gap-1">
                 Pago seguro en farmacia al recoger
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}