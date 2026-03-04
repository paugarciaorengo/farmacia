import { auth, signOut } from "@/src/auth"
import { prisma } from "@/src/lib/prisma"
import { redirect } from "next/navigation"
import { Package, Clock, User, LogOut, Filter } from "lucide-react"
import Link from "next/link"

export default async function MisPedidosPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ filter?: string }> 
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { filter } = await searchParams
  const currentFilter = filter || 'todos'

  let dateCondition = {}
  const now = new Date()

  if (currentFilter === '30dias') {
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30))
    dateCondition = { gte: thirtyDaysAgo }
  } else if (currentFilter === '6meses') {
    const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6))
    dateCondition = { gte: sixMonthsAgo }
  }

  const orders = await prisma.order.findMany({
    where: { 
      userId: session.user.id,
      ...(Object.keys(dateCondition).length > 0 ? { createdAt: dateCondition } : {})
    },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          product: { select: { name: true } }
        }
      }
    }
  })

  // Diccionario simplificado usando variables semánticas (salvo los colores específicos de estado)
  const statusMap: Record<string, { label: string, color: string }> = {
  PREPARING: { label: "En Preparación", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  PAID: { label: "Preparado", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  DELIVERED: { label: "Recogido", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  CANCELLED: { label: "Cancelado", color: "bg-red-500/10 text-red-500 border-red-500/20" },
}

  return (
    <main className="min-h-screen bg-background p-6 md:p-12 pt-28 md:pt-32">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Cabecera del Perfil */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <User className="text-primary" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Hola, {session.user.name || 'Usuario'}</h1>
              <p className="text-sm text-muted-foreground">{session.user.email}</p>
            </div>
          </div>
          
          <div className="flex gap-3">
             <Link href="/perfil" className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-sm font-medium transition-colors">
                Ver mi perfil
             </Link>
             <form action={async () => {
              'use server'
              await signOut({ redirectTo: '/' })
             }}>
              <button className="flex items-center gap-2 text-sm text-destructive hover:bg-destructive/10 px-4 py-2 rounded-lg transition-colors font-medium">
                <LogOut size={16} /> Salir
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Package className="text-primary" /> Mi Historial de Reservas
          </h2>

          {/* 🎛️ BARRA DE FILTROS */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <Filter size={16} className="text-muted-foreground mr-1 shrink-0" />
            <Link 
              href="/perfil/mis-pedidos?filter=todos" 
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                currentFilter === 'todos' 
                  ? 'bg-foreground text-background border-foreground' 
                  : 'bg-card text-muted-foreground border-border hover:bg-muted'
              }`}
            >
              Todos
            </Link>
            <Link 
              href="/perfil/mis-pedidos?filter=30dias" 
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                currentFilter === '30dias' 
                  ? 'bg-foreground text-background border-foreground' 
                  : 'bg-card text-muted-foreground border-border hover:bg-muted'
              }`}
            >
              Últimos 30 días
            </Link>
            <Link 
              href="/perfil/mis-pedidos?filter=6meses" 
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                currentFilter === '6meses' 
                  ? 'bg-foreground text-background border-foreground' 
                  : 'bg-card text-muted-foreground border-border hover:bg-muted'
              }`}
            >
              Últimos 6 meses
            </Link>
          </div>
        </div>

        {/* Lista de Pedidos */}
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border border-dashed">
            <Package className="mx-auto text-muted-foreground/50 mb-4" size={48} />
            <h3 className="text-lg font-bold text-foreground mb-1">No hay reservas</h3>
            <p className="text-muted-foreground mb-6">No encontramos pedidos en este periodo de tiempo.</p>
            <Link href="/perfil" className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-all">
              Ir a la tienda
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: {
              id: string;
              createdAt: Date;
              status: string;
              totalCents: number;
              items: {
                id: string;
                qty: number;
                product: {
                  name: string;
                };
              }[];
            }) => {
              const statusStyle = statusMap[order.status] || { label: order.status, color: "bg-muted text-foreground border-border" }

              return (
                <div key={order.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:border-primary/50 transition-colors">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4 pb-4 border-b border-border">
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Referencia</span>
                      <p className="text-lg font-mono font-bold text-foreground">{order.id.split('-')[0].toUpperCase()}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Clock size={12} />
                        {new Date(order.createdAt).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                    
                    <div className="text-right">
                       <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mb-1 ${statusStyle.color}`}>
                        {statusStyle.label}
                      </div>
                      <p className="font-bold text-lg text-foreground">{(order.totalCents / 100).toFixed(2)} €</p>
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {order.items.map((item: {
                      id: string;
                      qty: number;
                      product: {
                        name: string;
                      };
                    }) => (
                      <li key={item.id} className="flex justify-between items-center text-sm">
                        <span className="text-foreground">
                           <span className="font-bold text-primary mr-2">{item.qty}x</span> 
                           {item.product.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}