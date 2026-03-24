import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/src/auth'
import { prisma } from '@/src/lib/prisma'
import { Package, ShoppingBag, BarChart3, ArrowRight, ClipboardList } from 'lucide-react'

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

  // Obtenemos datos reales para que el panel se sienta "vivo"
  const [productCount, orderCount] = await Promise.all([
    prisma.product.count(),
    prisma.order.count() // Contador de pedidos para la nueva tarjeta activa
  ])

  return (
    <main className="min-h-screen bg-background p-6 md:p-12 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Panel Profesional</h1>
          <p className="text-muted-foreground">
            Bienvenido, <span className="text-primary font-medium">{user.name ?? user.email}</span>. 
            Estás conectado como <span className="bg-muted px-2 py-0.5 rounded text-xs uppercase tracking-wide border border-border text-foreground">{user.role}</span>.
          </p>
        </div>

        {/* Grid de Tarjetas */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {/* Tarjeta 1: Inventario y Stock (ACTIVA) */}
          <Link
            href="/panel/productos"
            className="group relative overflow-hidden rounded-2xl bg-card border border-border p-6 transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Package size={80} className="text-primary" />
            </div>

            <div className="mb-4 bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Package size={24} />
            </div>

            <h2 className="text-lg font-bold text-foreground mb-2">Inventario y Stock</h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Gestiona el catálogo completo, actualiza precios, controla los lotes y revisa caducidades.
            </p>

            <div className="flex items-center justify-between mt-auto">
              <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded border border-border">
                {productCount} referencias
              </span>
              <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                Acceder <ArrowRight size={16} />
              </span>
            </div>
          </Link>

          {/* Tarjeta 2: Pedidos Click & Collect (ACTIVA) */}
          <Link
            href="/panel/pedidos"
            className="group relative overflow-hidden rounded-2xl bg-card border border-border p-6 transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <ClipboardList size={80} className="text-primary" />
            </div>

            <div className="mb-4 bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <ShoppingBag size={24} />
            </div>

            <h2 className="text-lg font-bold text-foreground mb-2">Pedidos Click & Collect</h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Gestión de reservas y preparación de pedidos para recogida en tienda física.
            </p>

            <div className="flex items-center justify-between mt-auto">
              <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded border border-border">
                {orderCount} pedidos
              </span>
              <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                Acceder <ArrowRight size={16} />
              </span>
            </div>
          </Link>

          {/* Tarjeta 3: Analítica y Ventas (ACTIVA) */}
          <Link
            href="/panel/analitica"
            className="group relative overflow-hidden rounded-2xl bg-card border border-border p-6 transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <BarChart3 size={80} className="text-primary" />
            </div>
             <div className="mb-4 bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <BarChart3 size={24} />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">Analítica y Ventas</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Informes de ventas, ingresos totales y ranking de productos con más rotación.
            </p>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded border border-border">
                Dashboard
              </span>
              <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                Acceder <ArrowRight size={16} />
              </span>
            </div>
          </Link>

        </section>
      </div>
    </main>
  )
}