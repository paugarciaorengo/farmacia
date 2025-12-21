'use client'

import { useState } from 'react'
import { MapPin, Clock, Phone, User, Store, CheckCircle2, CreditCard, Wallet } from 'lucide-react'
import { useCartStore } from '@/src/store/cart-store'
import { useRouter } from 'next/navigation'

type PickupFormProps = { user?: { name?: string | null; email?: string | null } }
type PaymentMethod = 'store' | 'online'

export default function PickupForm({ user }: PickupFormProps) {
  const router = useRouter()
  const clearCart = useCartStore((state) => state.clearCart)
  const [isLoading, setIsLoading] = useState(false)
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('store')

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    clearCart()
    const message = paymentMethod === 'online' ? "¡Pago realizado!" : "¡Reserva confirmada!"
    alert(message)
    router.push('/catalogo') 
    setIsLoading(false)
  }

  return (
    <form onSubmit={handlePlaceOrder} className="space-y-6 animate-fade-in">
      
      {/* SELECCIÓN DE MÉTODO DE PAGO */}
      <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Wallet className="text-primary" /> Método de Pago
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setPaymentMethod('store')}
            className={`relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
              paymentMethod === 'store'
                ? 'border-primary bg-primary/5' // Usamos opacity para que quede bien en claro y oscuro
                : 'border-border bg-card hover:border-muted-foreground'
            }`}
          >
            {paymentMethod === 'store' && (
              <div className="absolute top-3 right-3 text-primary"><CheckCircle2 size={16} /></div>
            )}
            <Store size={32} className={paymentMethod === 'store' ? 'text-primary' : 'text-muted-foreground'} />
            <div className="text-center">
              <p className={`font-bold ${paymentMethod === 'store' ? 'text-foreground' : 'text-muted-foreground'}`}>Pagar en Farmacia</p>
              <p className="text-xs text-muted-foreground">Efectivo o Tarjeta</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('online')}
            className={`relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
              paymentMethod === 'online'
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card hover:border-muted-foreground'
            }`}
          >
            {paymentMethod === 'online' && (
              <div className="absolute top-3 right-3 text-primary"><CheckCircle2 size={16} /></div>
            )}
            <CreditCard size={32} className={paymentMethod === 'online' ? 'text-primary' : 'text-muted-foreground'} />
            <div className="text-center">
              <p className={`font-bold ${paymentMethod === 'online' ? 'text-foreground' : 'text-muted-foreground'}`}>Pago Online</p>
              <p className="text-xs text-muted-foreground">Tarjeta Crédito / Débito</p>
            </div>
          </button>
        </div>
      </section>

      {/* INFORMACIÓN DE RECOGIDA */}
      <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Store className="text-primary" /> Punto de Recogida
        </h2>
        
        <div className="bg-muted/50 border border-border rounded-xl p-4 flex gap-4 items-start">
          <div className="bg-primary p-2 rounded-lg text-primary-foreground shrink-0">
            <MapPin size={24} />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Farmacia del Carmel</h3>
            <p className="text-muted-foreground text-sm mt-1">Carrer del Llobregós, 123</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock size={14} /> <span>Abierto hoy hasta las 21:00</span>
            </div>
          </div>
        </div>
      </section>

      {/* TUS DATOS */}
      <section className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <User className="text-primary" /> Tus Datos
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Nombre</label>
            <input 
              type="text" 
              defaultValue={user?.name || ''} 
              readOnly={!!user?.name}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:border-primary outline-none disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
             <label className="text-xs font-bold text-muted-foreground uppercase">Email</label>
             <input type="email" defaultValue={user?.email || ''} readOnly={!!user?.email} className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:border-primary outline-none disabled:opacity-50" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Teléfono</label>
            <div className="relative">
              <Phone size={18} className="absolute left-3 top-3.5 text-muted-foreground" />
              <input 
                type="tel" required placeholder="600 000 000" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-3 text-foreground focus:border-primary outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-primary hover:opacity-90 text-primary-foreground font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2 text-lg disabled:opacity-50"
      >
        {isLoading ? "Procesando..." : paymentMethod === 'online' ? "Pagar y Finalizar" : "Confirmar Reserva"}
      </button>
    </form>
  )
}