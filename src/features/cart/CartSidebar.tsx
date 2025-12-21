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
      {/* Overlay oscuro (siempre oscuro para resaltar) */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={toggleCart}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-0 md:pl-10 pointer-events-none">
        {/* 🎨 Panel usando bg-card y text-foreground */}
        <div className="pointer-events-auto w-screen max-w-md bg-card shadow-2xl flex flex-col animate-slide-in">
          
          <div className="p-5 border-b border-border flex justify-between items-center bg-card/95 backdrop-blur">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <ShoppingBag className="text-primary" />
              Tu Cesta
            </h2>
            <button onClick={toggleCart} className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-muted/30">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                <div className="bg-muted p-6 rounded-full mb-4 shadow-sm">
                   <ShoppingBag size={48} className="text-muted-foreground/50" />
                </div>
                <p className="text-lg font-medium">Tu cesta está vacía</p>
                <button onClick={toggleCart} className="mt-4 text-primary font-medium hover:underline">
                  Volver al catálogo
                </button>
              </div>
            ) : (
              items.map((item) => (
                // 🎨 Item del carrito adaptado
                <div key={item.productId} className="flex gap-4 bg-card p-3 rounded-xl border border-border shadow-sm hover:border-primary/50 transition-colors group">
                  <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center shrink-0 overflow-hidden border border-border">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Pill size={24} className="text-muted-foreground/50" />
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-foreground font-medium line-clamp-1 group-hover:text-primary transition-colors">{item.name}</h4>
                      <p className="text-primary font-bold text-lg">{(item.priceCents / 100).toFixed(2)}€</p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center bg-muted rounded-lg border border-border h-8">
                        <button 
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="px-2 h-full hover:text-primary hover:bg-primary/10 rounded-l-lg transition-colors flex items-center text-muted-foreground"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-foreground">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="px-2 h-full hover:text-primary hover:bg-primary/10 rounded-r-lg transition-colors flex items-center text-muted-foreground"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button 
                        onClick={() => removeItem(item.productId)}
                        className="text-muted-foreground hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="p-5 border-t border-border bg-card shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-10">
              <div className="flex justify-between mb-2 text-muted-foreground text-sm">
                <span>Subtotal (sin IVA)</span>
                <span>{((getTotalPrice() * 0.79) / 100).toFixed(2)}€</span>
              </div>
              <div className="flex justify-between mb-6 text-xl font-bold text-foreground items-end">
                <span>Total</span>
                <span className="text-2xl text-primary">{(getTotalPrice() / 100).toFixed(2)}€</span>
              </div>
              
              <Link
                href="/checkout"
                onClick={toggleCart}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:opacity-90 text-primary-foreground font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
              >
                Tramitar Pedido
                <ShoppingBag size={20} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}