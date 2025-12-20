import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/src/auth'
import { prisma } from '@/src/lib/prisma'
import { Package, ShoppingBag, BarChart3, ArrowRight } from 'lucide-react'

export default async function PanelPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, role: true },
  })

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'ADMIN' && user.role !== 'PHARMACIST') {
    redirect('/catalogo')
  }

  // Obtenemos un dato real para que el panel se sienta "vivo"
  const productCount = await prisma.product.count()

  return (
    <main className="min-h-screen bg-slate-950 p-6 md:p-12 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Panel Profesional</h1>
          <p className="text-slate-400">
            Bienvenido, <span className="text-emerald-400 font-medium">{user.name ?? user.email}</span>. 
            Estás conectado como <span className="bg-slate-800 px-2 py-0.5 rounded text-xs uppercase tracking-wide border border-slate-700">{user.role}</span>.
          </p>
        </div>

        {/* Grid de Tarjetas */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {/* Tarjeta 1: Inventario y Stock (ACTIVA) */}
          <Link
            href="/panel/productos"
            className="group relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-6 transition-all hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-900/10"
          >
            {/* Icono de fondo decorativo */}
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Package size={80} className="text-emerald-500" />
            </div>

            <div className="mb-4 bg-emerald-500/10 w-12 h-12 rounded-xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
              <Package size={24} />
            </div>

            <h2 className="text-lg font-bold text-white mb-2">Inventario y Stock</h2>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Gestiona el catálogo completo, actualiza precios, controla los lotes y revisa caducidades.
            </p>

            <div className="flex items-center justify-between mt-auto">
              <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                {productCount} referencias
              </span>
              <span className="text-emerald-500 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                Acceder <ArrowRight size={16} />
              </span>
            </div>
          </Link>

          {/* Tarjeta 2: Pedidos (PLACEHOLDER) */}
          <div className="group relative overflow-hidden rounded-2xl bg-slate-900/40 border border-slate-800 p-6 opacity-75 cursor-not-allowed">
             <div className="absolute top-0 right-0 p-4 opacity-5">
              <ShoppingBag size={80} />
            </div>
            <div className="mb-4 bg-slate-800 w-12 h-12 rounded-xl flex items-center justify-center text-slate-500">
              <ShoppingBag size={24} />
            </div>
            <h2 className="text-lg font-bold text-slate-300 mb-2">Pedidos Click & Collect</h2>
            <p className="text-sm text-slate-500 mb-4">
              Gestión de reservas y preparación de pedidos para recogida en tienda.
            </p>
            <span className="inline-block px-2 py-1 bg-slate-800 text-[10px] uppercase font-bold text-slate-400 rounded border border-slate-700">
              Próximamente
            </span>
          </div>

          {/* Tarjeta 3: Analítica (PLACEHOLDER) */}
          <div className="group relative overflow-hidden rounded-2xl bg-slate-900/40 border border-slate-800 p-6 opacity-75 cursor-not-allowed">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <BarChart3 size={80} />
            </div>
             <div className="mb-4 bg-slate-800 w-12 h-12 rounded-xl flex items-center justify-center text-slate-500">
              <BarChart3 size={24} />
            </div>
            <h2 className="text-lg font-bold text-slate-300 mb-2">Analítica y Ventas</h2>
            <p className="text-sm text-slate-500 mb-4">
              Informes de ventas, productos más vendidos y rotación de stock.
            </p>
            <span className="inline-block px-2 py-1 bg-slate-800 text-[10px] uppercase font-bold text-slate-400 rounded border border-slate-700">
              En desarrollo
            </span>
          </div>

        </section>
      </div>
    </main>
  )
}