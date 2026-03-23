'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/src/store/cart-store'
import { placeOrderAction } from '@/src/app/actions/place-order'
import { ShoppingBag, Loader2, MapPin, AlertCircle } from 'lucide-react'

// 1. Definimos qué datos esperamos recibir desde el servidor
type PickupFormProps = {
  initialData?: {
    name: string;
    email: string;
    phone: string;
  }
}

export default function PickupForm({ initialData }: PickupFormProps) {
  const router = useRouter()
  const { items, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    
    const customerData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
    }

    const cartItems = items.map(i => ({
      id: i.productId,
      quantity: i.quantity,
      price: i.priceCents / 100
    }))

    const result = await placeOrderAction(customerData, cartItems)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      clearCart() 
      router.push(`/checkout/success?orderId=${result.orderId}`)
    }
  }

  if (items.length === 0) return null

  return (
    <div className="bg-white dark:bg-card p-6 rounded-xl shadow-sm border border-border h-fit sticky top-24">
      <div className="mb-6 border-b border-border pb-4">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-1 text-foreground">
            <ShoppingBag className="text-primary" size={24} />
            Finalizar Reserva
        </h2>
        <p className="text-sm text-muted-foreground">
            Reserva online, recoge y paga en mostrador.
        </p>
      </div>

      {error && (
        <div className="mb-5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm flex gap-3 animate-pulse">
            <AlertCircle className="shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-bold">No se pudo completar:</p>
              <p>{error}</p>
            </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">Nombre Completo</label>
            <input 
                name="name" 
                required 
                defaultValue={initialData?.name} // 👈 Rellenado automático
                placeholder="Ej: Paula García" 
                className="w-full px-3 py-2 bg-background text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">Móvil</label>
                <input 
                    name="phone" 
                    required 
                    type="tel"
                    defaultValue={initialData?.phone} // 👈 Rellenado automático
                    placeholder="600 000 000" 
                    className="w-full px-3 py-2 bg-background text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">Email</label>
                <input 
                    name="email" 
                    required 
                    type="email"
                    defaultValue={initialData?.email} // 👈 Rellenado automático
                    placeholder="hola@email.com" 
                    className="w-full px-3 py-2 bg-background text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
            </div>
        </div>

        <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-3 rounded-lg flex gap-3 items-start text-sm text-blue-800 dark:text-blue-300 mt-2">
            <MapPin className="shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" size={18} />
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