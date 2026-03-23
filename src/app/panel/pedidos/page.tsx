import { auth } from "@/src/auth"
import { prisma } from "@/src/lib/prisma"
import { redirect } from "next/navigation"
import { Package, Clock, User, Phone, ClipboardList, Filter } from "lucide-react"
import { StatusSelector } from "./StatusSelector"
import Link from "next/link"

export default async function AdminOrdersPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ status?: string }> 
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  if (!user || (user.role !== "ADMIN" && user.role !== "PHARMACIST")) {
    redirect("/")
  }

  // 1. Leemos el estado del filtro de la URL
  const { status } = await searchParams
  // Por defecto, si no hay filtro, mostramos los que están "En Preparación" (modo trabajo)
  const currentFilter = status || 'PREPARING'

  // 2. Filtramos en la base de datos
  const orders = await prisma.order.findMany({
    where: {
      ...(currentFilter !== 'TODOS' ? { status: currentFilter as any } : {})
    },
    orderBy: { createdAt: 'desc' },
    include: {
      shippingAddr: true,
      items: {
        include: {
          product: { select: { name: true, sku: true } }
        }
      }
    }
  })

  // Diccionario de estados para las etiquetas visuales
  const statusMap: Record<string, { label: string, color: string }> = {
    PREPARING: { label: "En Preparación", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    PAID: { label: "Preparado", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    DELIVERED: { label: "Recogido", color: "bg-green-500/10 text-green-500 border-green-500/20" },
    CANCELLED: { label: "Cancelado", color: "bg-red-500/10 text-red-500 border-red-500/20" },
  }

  return (
    <main className="min-h-screen bg-background p-6 md:p-12 pt-28 md:pt-32">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
              <ClipboardList className="text-primary" size={40} />
              Gestión de Pedidos
            </h1>
            <p className="text-muted-foreground">Panel de control de reservas Click & Collect.</p>
          </div>

          {/* 🎛️ FILTROS DE ESTADO (TABS) */}
          <div className="flex items-center gap-2 bg-card border border-border p-1.5 rounded-2xl shadow-sm overflow-x-auto hide-scrollbar">
            {[
              { id: 'PREPARING', label: 'Pendientes' },
              { id: 'PAID', label: 'Preparados' },
              { id: 'DELIVERED', label: 'Historial' },
              { id: 'TODOS', label: 'Todos' }
            ].map((tab) => (
              <Link
                key={tab.id}
                href={`/panel/pedidos?status=${tab.id}`}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  currentFilter === tab.id 
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Listado de Pedidos */}
        {orders.length === 0 ? (
          <div className="text-center py-24 bg-card rounded-3xl border border-border border-dashed space-y-4">
            <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Package className="text-muted-foreground/40" size={32} />
            </div>
            <div className="space-y-1">
                <p className="text-foreground font-bold text-xl">No hay pedidos en esta sección</p>
                <p className="text-muted-foreground">Todo el trabajo está al día. ¡Buen trabajo!</p>
            </div>
            {currentFilter !== 'TODOS' && (
                <Link href="/panel/pedidos?status=TODOS" className="text-primary text-sm font-medium hover:underline">
                    Ver todos los registros
                </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order: any) => (
              <div key={order.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:border-primary/30 transition-all group">
                
                {/* Cabecera del Pedido */}
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 pb-6 border-b border-border">
                  <div className="flex gap-8">
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Referencia</span>
                      <p className="text-lg font-mono font-bold text-foreground">{order.id.split('-')[0].toUpperCase()}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Entrada</span>
                      <div className="flex items-center gap-1.5 text-sm text-foreground font-semibold">
                        <Clock size={14} className="text-primary" />
                        {new Date(order.createdAt).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-muted/50 p-2 rounded-xl border border-border/50">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-2">Estado:</span>
                    <StatusSelector orderId={order.id} currentStatus={order.status} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                  {/* Columna Cliente */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <User size={12} /> Datos de Recogida
                    </h3>
                    <div className="bg-background border border-border p-4 rounded-xl space-y-2">
                      <p className="text-lg font-bold text-foreground">{order.shippingAddr?.fullName || 'Invitado'}</p>
                      <a 
                        href={`tel:${order.shippingAddr?.phone}`} 
                        className="flex items-center gap-2 text-primary font-bold hover:underline"
                      >
                        <Phone size={16} /> {order.shippingAddr?.phone || 'Sin teléfono'}
                      </a>
                    </div>
                  </div>

                  {/* Columna Productos */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <Package size={12} /> Lista de Preparación
                    </h3>
                    <div className="space-y-3">
                        {order.items.map((item: any) => (
                          <div key={item.id} className="flex justify-between items-center bg-background/50 p-3 rounded-lg border border-border/40 group-hover:border-border transition-colors">
                            <div className="flex gap-3 items-center">
                              <span className="bg-primary text-primary-foreground font-black px-2.5 py-0.5 rounded-md text-xs">
                                {item.qty}
                              </span>
                              <span className="text-foreground font-medium text-sm">{item.product.name}</span>
                            </div>
                            <span className="text-[10px] font-mono text-muted-foreground font-bold">
                              {item.product.sku}
                            </span>
                          </div>
                        ))}
                    </div>
                    
                    <div className="pt-4 mt-4 border-t border-border flex justify-between items-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Total a cobrar en caja</span>
                      <span className="text-2xl font-black text-primary">
                        {(order.totalCents / 100).toFixed(2)} €
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}