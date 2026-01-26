'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/src/store/cart-store'
import { placeOrderAction } from '@/src/app/actions/place-order' // 👈 La acción nueva
import { ShoppingBag, Loader2, MapPin, AlertCircle } from 'lucide-react'

export default function PickupForm() {
  const router = useRouter()
  const { items, clearCart } = useCartStore() // Usamos el store del carrito
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    
    // 1. Recogemos datos del cliente
    const customerData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
    }

    // 2. Preparamos los items del carrito para enviarlos
    const cartItems = items.map(i => ({
      id: i.productId,           // ✅ Correcto: en tu store se llama productId
      quantity: i.quantity,
      price: i.priceCents / 100  // ✅ Correcto: pasamos de céntimos a euros para la acción
    }))

    // 3. 🚀 LLAMADA AL SERVIDOR (Aquí ocurre la magia)
    const result = await placeOrderAction(customerData, cartItems)

    if (result.error) {
      // ❌ Si falla (ej: falta stock), mostramos el error
      setError(result.error)
      setLoading(false)
    } else {
      // ✅ Si funciona: vaciamos carrito y redirigimos
      clearCart() 
      router.push(`/checkout/success?orderId=${result.orderId}`)
    }
  }

  // Si el carrito está vacío, ocultamos el formulario
  if (items.length === 0) return null

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-border h-fit sticky top-24">
      <div className="mb-6 border-b border-border pb-4">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
            <ShoppingBag className="text-primary" size={24} />
            Finalizar Reserva
        </h2>
        <p className="text-sm text-muted-foreground">
            Reserva online, recoge y paga en mostrador.
        </p>
      </div>

      {/* 🛑 Mensaje de Error si falla el stock */}
      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex gap-3 animate-pulse">
            <AlertCircle className="shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-bold">No se pudo completar:</p>
              <p>{error}</p>
            </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Nombre Completo</label>
            <input 
                name="name" 
                required 
                placeholder="Ej: Paula García" 
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Móvil</label>
                <input 
                    name="phone" 
                    required 
                    type="tel"
                    placeholder="600 000 000" 
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Email</label>
                <input 
                    name="email" 
                    required 
                    type="email"
                    placeholder="hola@email.com" 
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
            </div>
        </div>

        {/* ℹ️ Información de recogida */}
        <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg flex gap-3 items-start text-sm text-blue-800 mt-2">
            <MapPin className="shrink-0 mt-0.5 text-blue-600" size={18} />
            <p className="text-xs">
                Recogida en: <span className="font-bold">Farmacia Central</span>. 
                <br />
                Te avisaremos por email cuando esté listo.
            </p>
        </div>

        <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
        >
            {loading ? (
                <>
                    <Loader2 className="animate-spin" /> Procesando...
                </>
            ) : (
                <>
                    Confirmar Reserva
                </>
            )}
        </button>
      </form>
    </div>
  )
}