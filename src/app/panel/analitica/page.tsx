import { auth } from "@/src/auth"
import { prisma } from "@/src/lib/prisma"
import { redirect } from "next/navigation"
import { BarChart3, TrendingUp, Package, DollarSign, ShoppingBag, AlertTriangle, Activity } from "lucide-react"

export default async function AnaliticaPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  if (!user || (user.role !== "ADMIN" && user.role !== "PHARMACIST")) {
    redirect("/")
  }

  // 1. Pedidos Completados (Para métricas financieras)
  const completedOrders = await prisma.order.findMany({
    where: { status: { in: ['PAID', 'DELIVERED'] } },
    include: {
      items: { 
        include: { 
          product: { 
            // 👇 ¡AQUÍ ESTÁ LA CLAVE! Le pedimos a Prisma que traiga el priceCents
            select: { id: true, name: true, sku: true, priceCents: true } 
          } 
        } 
      }
    }
  })

  // 2. Alerta de Bajo Stock (Calculado a partir de los lotes)
  // Traemos los productos activos y sus lotes correspondientes
  const productsWithLots = await prisma.product.findMany({
    where: { active: true },
    select: { 
      id: true, 
      name: true, 
      sku: true, 
      lots: { 
        select: { quantity: true } // Asumimos que el campo se llama 'quantity' o ajustalo a como lo tengas (ej: 'stock')
      } 
    }
  })

  // Mapeamos, sumamos el stock total de sus lotes, filtramos y ordenamos
  const lowStockProducts = productsWithLots
    .map((p: any) => {
      // Sumamos la cantidad de todos los lotes de este producto
      const totalStock = p.lots.reduce((sum: number, lot: any) => sum + (lot.quantity || 0), 0)
      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        stock: totalStock
      }
    })
    .filter((p: any) => p.stock <= 5) // Solo los que tienen 5 o menos
    .sort((a: any, b: any) => a.stock - b.stock) // Ordenados del más crítico al menos
    .slice(0, 8) // Nos quedamos con los 8 peores

  // 3. Estado Operativo (Agrupamos todos los pedidos por estado para ver el embudo de trabajo)
  const ordersByStatus = await prisma.order.groupBy({
    by: ['status'],
    _count: { status: true }
  })

  // Formateamos los estados para que sea fácil leerlos
  const statusCounts = {
    // 👇 Añadido (s: any) a las tres líneas
    PREPARING: ordersByStatus.find((s: any) => s.status === 'PREPARING')?._count.status || 0,
    PAID: ordersByStatus.find((s: any) => s.status === 'PAID')?._count.status || 0,
    DELIVERED: ordersByStatus.find((s: any) => s.status === 'DELIVERED')?._count.status || 0,
  }

  // Cálculos financieros
  const totalRevenueCents = completedOrders.reduce((acc: number, order: any) => acc + order.totalCents, 0)
  const totalOrders = completedOrders.length
  const averageTicket = totalOrders > 0 ? (totalRevenueCents / totalOrders) : 0

  // Cálculo de Top Productos
  const productSales: Record<string, { name: string, sku: string, qty: number, revenue: number }> = {}
  
  completedOrders.forEach((order: any) => {
    order.items.forEach((item: any) => {
      const pId = item.product.id
      if (!productSales[pId]) {
        productSales[pId] = { name: item.product.name, sku: item.product.sku, qty: 0, revenue: 0 }
      }
      
      productSales[pId].qty += item.qty || 0
      
      // 👇 Cogemos el precio del producto y lo multiplicamos por la cantidad
      const price = item.priceCents ?? item.product.priceCents ?? 0
      productSales[pId].revenue += price * (item.qty || 0)
    })
  })
  
  const topProducts = Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 5)

  return (
    <main className="min-h-screen bg-background p-6 md:p-12 pt-28 md:pt-32 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Cabecera */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <BarChart3 className="text-primary" size={40} />
            Analítica y Rendimiento
          </h1>
          <p className="text-muted-foreground">Visión global del negocio y control de recursos operativos.</p>
        </div>

        {/* FILA 1: KPIs Financieros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold uppercase text-xs tracking-wider text-muted-foreground">Ingresos Totales</h3>
              <div className="p-2 bg-green-500/10 text-green-500 rounded-lg"><DollarSign size={20} /></div>
            </div>
            <p className="text-3xl font-black text-foreground">{(totalRevenueCents / 100).toFixed(2)} €</p>
          </div>

          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold uppercase text-xs tracking-wider text-muted-foreground">Ventas Exitosas</h3>
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><ShoppingBag size={20} /></div>
            </div>
            <p className="text-3xl font-black text-foreground">{totalOrders}</p>
          </div>

          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold uppercase text-xs tracking-wider text-muted-foreground">Ticket Medio</h3>
              <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg"><TrendingUp size={20} /></div>
            </div>
            <p className="text-3xl font-black text-foreground">{(averageTicket / 100).toFixed(2)} €</p>
          </div>
        </div>

        {/* FILA 2: Operativa y Alertas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Columna Izquierda (Ocupa 2/3): Top Productos */}
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <Package className="text-primary" size={24} />
              <h2 className="text-lg font-bold text-foreground">Top 5 Productos de Mayor Rotación</h2>
            </div>
            
            {topProducts.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">Sin datos suficientes.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                      <th className="pb-3 font-semibold">Producto</th>
                      <th className="pb-3 font-semibold text-center">Unidades</th>
                      <th className="pb-3 font-semibold text-right">Ingresos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {topProducts.map((product, index) => (
                      <tr key={product.sku} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 flex items-center gap-3">
                          <span className="text-muted-foreground font-bold text-xs">{index + 1}.</span>
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground text-sm line-clamp-1">{product.name}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">{product.sku}</span>
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          <span className="font-bold text-foreground bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                            {product.qty}
                          </span>
                        </td>
                        <td className="py-3 text-right font-bold text-foreground text-sm">
                          {(product.revenue / 100).toFixed(2)} €
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Columna Derecha (Ocupa 1/3): Alertas y Embudo */}
          <div className="space-y-6">
            
            {/* Alertas de Stock */}
            <div className="bg-card border border-red-500/20 rounded-2xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="text-red-500" size={20} />
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Aviso de Reposición</h2>
              </div>
              
              {lowStockProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">El inventario está sano. Ningún producto por debajo de 5 uds.</p>
              ) : (
                <ul className="space-y-3">
                  {/* 👇 Añadido (p: any) aquí 👇 */}
                  {lowStockProducts.map((p: any) => (
                    <li key={p.id} className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0">
                      <span className="text-muted-foreground truncate pr-2" title={p.name}>{p.name}</span>
                      <span className={`font-black px-2 py-0.5 rounded text-xs ${p.stock === 0 ? 'bg-red-500 text-white' : 'bg-orange-500/10 text-orange-500'}`}>
                        {p.stock} uds
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Embudo de Trabajo */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="text-primary" size={20} />
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Carga Operativa</h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Pendientes de preparar</span>
                  <span className="font-bold text-foreground text-lg">{statusCounts.PREPARING}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5"><div className="bg-amber-500 h-1.5 rounded-full" style={{ width: statusCounts.PREPARING > 0 ? '100%' : '0%' }}></div></div>
                
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-medium text-muted-foreground">Listos esperando recogida</span>
                  <span className="font-bold text-foreground text-lg">{statusCounts.PAID}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{ width: statusCounts.PAID > 0 ? '100%' : '0%' }}></div></div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </main>
  )
}