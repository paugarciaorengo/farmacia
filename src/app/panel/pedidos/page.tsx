import { auth } from "@/src/auth"
import { prisma } from "@/src/lib/prisma"
import { redirect } from "next/navigation"
import { Package, Clock, User, Phone, ClipboardList } from "lucide-react"
import { StatusSelector } from "./StatusSelector"

export default async function AdminOrdersPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  if (!user || (user.role !== "ADMIN" && user.role !== "PHARMACIST")) {
    redirect("/")
  }

  const orders = await prisma.order.findMany({
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

  return (
    <main className="min-h-screen bg-background p-6 md:p-12 pt-28 md:pt-32">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <ClipboardList className="text-primary" size={40} />
            Gestión de Pedidos
          </h1>
          <p className="text-muted-foreground">Control de preparación y recogida de farmacia.</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border border-dashed">
            <p className="text-muted-foreground text-lg">No hay pedidos pendientes actualmente.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order: any) => (
              <div key={order.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:border-primary/30 transition-all">
                
                {/* Cabecera Pedido */}
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 pb-6 border-b border-border">
                  <div className="flex gap-6">
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Referencia</span>
                      <p className="text-lg font-mono font-bold text-foreground">{order.id.split('-')[0].toUpperCase()}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Fecha y Hora</span>
                      <div className="flex items-center gap-1 text-sm text-foreground font-medium mt-1">
                        <Clock size={14} />
                        {new Date(order.createdAt).toLocaleString('es-ES')}
                      </div>
                    </div>
                  </div>

                  {/* Selector de Estado interactivo */}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hidden md:block">Cambiar Estado:</span>
                    <StatusSelector orderId={order.id} currentStatus={order.status} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Info Cliente */}
                  <div className="bg-muted/30 p-5 rounded-xl border border-border">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase mb-4 flex items-center gap-2">
                      <User size={14} /> Datos del Cliente
                    </h3>
                    <div className="space-y-3">
                      <p className="text-lg font-bold text-foreground">{order.shippingAddr?.fullName || 'Cliente Invitado'}</p>
                      <p className="flex items-center gap-2 text-primary font-medium">
                        <Phone size={16} /> {order.shippingAddr?.phone || 'Sin teléfono'}
                      </p>
                    </div>
                  </div>

                  {/* Productos */}
                  <div>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase mb-4 flex items-center gap-2">
                      <Package size={14} /> Artículos a preparar
                    </h3>
                    <ul className="space-y-3">
                      {order.items.map((item: any) => (
                        <li key={item.id} className="flex justify-between items-center text-sm group">
                          <div className="flex gap-3 items-center">
                            <span className="bg-primary text-primary-foreground font-bold px-2 py-0.5 rounded text-xs">x{item.qty}</span>
                            <span className="text-foreground font-medium">{item.product.name}</span>
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {item.product.sku}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 pt-4 border-t border-border flex justify-between items-end">
                      <span className="text-xs font-bold text-muted-foreground uppercase">Total a Cobrar</span>
                      <span className="text-2xl font-black text-foreground">{(order.totalCents / 100).toFixed(2)} €</span>
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