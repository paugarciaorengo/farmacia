'use client'

import { useState } from 'react'
import { MapPin, Clock, Phone, User, Store, CheckCircle2, CreditCard, Wallet } from 'lucide-react'
import { useCartStore } from '@/src/store/cart-store'
import { useRouter } from 'next/navigation'

type PickupFormProps = {
  user?: {
    name?: string | null
    email?: string | null
  }
}

type PaymentMethod = 'store' | 'online'

export default function PickupForm({ user }: PickupFormProps) {
  const router = useRouter()
  const clearCart = useCartStore((state) => state.clearCart)
  const [isLoading, setIsLoading] = useState(false)
  
  // Estados del formulario
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('store')

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // ⏳ SIMULACIÓN
    // Aquí iría la lógica real:
    // - Si es 'store': Crear pedido en BD con estado "Pendiente de pago".
    // - Si es 'online': Llamar a Stripe/Redsys para procesar el pago.
    
    await new Promise(resolve => setTimeout(resolve, 2000))

    clearCart()
    
    const message = paymentMethod === 'online' 
      ? "¡Pago realizado correctamente! Tu pedido ya se está preparando."
      : "¡Reserva confirmada! Paga al recoger en mostrador."
      
    alert(message)
    router.push('/catalogo') 
    setIsLoading(false)
  }

  return (
    <form onSubmit={handlePlaceOrder} className="space-y-6 animate-fade-in">
      
      {/* 1. SELECCIÓN DE MÉTODO DE PAGO (NUEVO) */}
      <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Wallet className="text-purple-500" /> Método de Pago
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Opción: Pagar en Tienda */}
          <button
            type="button"
            onClick={() => setPaymentMethod('store')}
            className={`relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
              paymentMethod === 'store'
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-slate-700 bg-slate-900 hover:border-slate-500'
            }`}
          >
            {paymentMethod === 'store' && (
              <div className="absolute top-3 right-3 text-emerald-500"><CheckCircle2 size={16} /></div>
            )}
            <Store size={32} className={paymentMethod === 'store' ? 'text-emerald-400' : 'text-slate-400'} />
            <div className="text-center">
              <p className={`font-bold ${paymentMethod === 'store' ? 'text-white' : 'text-slate-300'}`}>Pagar en Farmacia</p>
              <p className="text-xs text-slate-500">Efectivo o Tarjeta al recoger</p>
            </div>
          </button>

          {/* Opción: Pagar Online */}
          <button
            type="button"
            onClick={() => setPaymentMethod('online')}
            className={`relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
              paymentMethod === 'online'
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-slate-700 bg-slate-900 hover:border-slate-500'
            }`}
          >
            {paymentMethod === 'online' && (
              <div className="absolute top-3 right-3 text-purple-500"><CheckCircle2 size={16} /></div>
            )}
            <CreditCard size={32} className={paymentMethod === 'online' ? 'text-purple-400' : 'text-slate-400'} />
            <div className="text-center">
              <p className={`font-bold ${paymentMethod === 'online' ? 'text-white' : 'text-slate-300'}`}>Pago Online</p>
              <p className="text-xs text-slate-500">Tarjeta Crédito / Débito</p>
            </div>
          </button>
        </div>

        {/* Formulario Simulado de Tarjeta (Solo visual) */}
        {paymentMethod === 'online' && (
          <div className="mt-6 p-4 bg-slate-950 rounded-xl border border-slate-800 animate-fade-in">
            <p className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
              <CreditCard size={14} /> Datos de la tarjeta (Simulación)
            </p>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="0000 0000 0000 0000" 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-purple-500 transition-colors font-mono"
              />
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="text" 
                  placeholder="MM / AA" 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-purple-500 transition-colors text-center"
                />
                <input 
                  type="text" 
                  placeholder="CVC" 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-purple-500 transition-colors text-center"
                />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 2. Información de Recogida */}
      <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Store className="text-emerald-500" /> Punto de Recogida
        </h2>
        
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex gap-4 items-start">
          <div className="bg-emerald-500 p-2 rounded-lg text-slate-950 shrink-0">
            <MapPin size={24} />
          </div>
          <div>
            <h3 className="font-bold text-emerald-400">Farmacia del Carmel</h3>
            <p className="text-slate-300 text-sm mt-1">Carrer del Llobregós, 123</p>
            <p className="text-slate-400 text-xs">08032 Barcelona</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
              <Clock size={14} />
              <span>Abierto hoy hasta las 21:00</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Datos de Contacto */}
      <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <User className="text-blue-500" /> Tus Datos
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Nombre</label>
            <input 
              type="text" 
              defaultValue={user?.name || ''} 
              readOnly={!!user?.name}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
            <input 
              type="email" 
              defaultValue={user?.email || ''} 
              readOnly={!!user?.email}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none disabled:opacity-50"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Teléfono (para avisarte)</label>
            <div className="relative">
              <Phone size={18} className="absolute left-3 top-3.5 text-slate-500" />
              <input 
                type="tel" 
                required
                placeholder="600 000 000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
          </div>
          
          <div className="space-y-2 md:col-span-2">
             <label className="text-xs font-bold text-slate-400 uppercase">Notas adicionales</label>
             <textarea 
               rows={2}
               placeholder="Ej: Iré a recogerlo mi hermano..."
               value={notes}
               onChange={(e) => setNotes(e.target.value)}
               className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none transition-all resize-none"
             />
          </div>
        </div>
      </section>

      {/* Botón Final Dinámico */}
      <button 
        type="submit" 
        disabled={isLoading}
        className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed ${
          paymentMethod === 'online' 
            ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/20' 
            : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20'
        }`}
      >
        {isLoading ? (
          <span className="animate-pulse">Procesando...</span>
        ) : (
          <>
            {paymentMethod === 'online' ? <CreditCard size={22}/> : <CheckCircle2 size={22}/>}
            {paymentMethod === 'online' ? 'Pagar y Finalizar' : 'Confirmar Reserva'}
          </>
        )}
      </button>

      <p className="text-xs text-center text-slate-500">
        {paymentMethod === 'online' 
          ? 'Pagos procesados de forma segura con encriptación SSL.'
          : 'Al confirmar, te comprometes a recoger el pedido en 48h.'}
      </p>
    </form>
  )
}