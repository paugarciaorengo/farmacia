import { auth } from '@/src/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import PickupForm from '@/src/features/checkout/PickupForm'
import CheckoutSummary from '@/src/features/checkout/checkoutSummary'

export default async function CheckoutPage() {
  const session = await auth()

  // 🔒 Opcional: Forzar login para hacer pedido
  // Si prefieres permitir invitados, comenta este bloque.
  if (!session?.user) {
    redirect('/login?callbackUrl=/checkout')
  }

  return (
    <main className="min-h-screen bg-slate-950 py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Cabecera Simple */}
        <div className="mb-8">
          <Link 
            href="/catalogo" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mb-4"
          >
            <ChevronLeft size={16} /> Seguir comprando
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Finalizar Pedido</h1>
          <p className="text-slate-400 mt-1">Confirma tus datos para la recogida.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Izquierda (Formulario) */}
          <div className="lg:col-span-2">
            <PickupForm user={session.user} />
          </div>

          {/* Columna Derecha (Resumen Sticky) */}
          <div className="lg:col-span-1">
            <CheckoutSummary />
          </div>

        </div>
      </div>
    </main>
  )
}