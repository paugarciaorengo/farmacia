import { redirect } from "next/navigation";
import { auth } from "@/src/auth";
import { prisma } from "@/src/lib/prisma";
import { ProductSubPage, SubPageSection } from "@/src/app/components/admin/ProductSubPage";
import { PackagePlus, Save, Trash2, AlertTriangle } from 'lucide-react';

export default async function StockProductoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();

  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user || (user.role !== "ADMIN" && user.role !== "PHARMACIST")) redirect("/");

  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      id: true, name: true, slug: true, sku: true, lots: { orderBy: { expiresAt: "asc" } },
    },
  });

  if (!product) redirect("/panel/productos");

  // Cálculos
  const totalQuantity = product.lots.reduce((sum: number, lot: any) => sum + lot.quantity, 0);
  const totalReserved = product.lots.reduce((sum: number, lot: any) => sum + lot.reserved, 0);
  const totalAvailable = totalQuantity - totalReserved;

  // Header Extra con resumen
  const StockSummary = (
    <div className="flex gap-4 text-sm mt-2 md:mt-0">
       <div className="bg-card px-3 py-1 rounded border border-border">
          <span className="text-muted-foreground mr-2">Total:</span>
          <span className="font-bold text-foreground">{totalQuantity}</span>
       </div>
       <div className="bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/20">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold mr-2">Disponible:</span>
          <span className="font-bold text-emerald-700 dark:text-emerald-300">{totalAvailable}</span>
       </div>
    </div>
  );

  return (
    <ProductSubPage
      title={`Stock: ${product.name}`}
      subtitle={`Gestión de lotes y caducidades (SKU: ${product.sku})`}
      productSlug={product.slug}
      user={user}
      extraHeader={StockSummary}
    >
      
      {/* 1. Nuevo Lote */}
      <SubPageSection title="Registrar Entrada (Nuevo Lote)">
         <form
          action={`/api/products/${product.slug}/lots`} // Recuerda que esto usa ID o Slug según arreglamos antes
          method="POST"
          className="grid items-end gap-4 md:grid-cols-4"
        >
           <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-muted-foreground">Cód. Lote</label>
              <input name="lotCode" required placeholder="L-2024-01" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
           </div>
           <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-muted-foreground">Caducidad</label>
              <input type="date" name="expiresAt" required className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
           </div>
           <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-muted-foreground">Cantidad</label>
              <input type="number" name="quantity" required min="1" placeholder="0" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
           </div>
           <button type="submit" className="h-10 bg-primary text-primary-foreground font-bold rounded-lg px-4 flex items-center justify-center gap-2 text-sm hover:opacity-90">
              <PackagePlus size={16} /> Añadir Lote
           </button>
        </form>
      </SubPageSection>

      {/* 2. Tabla de Lotes */}
      <SubPageSection title="Inventario por Lotes">
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
               <thead className="text-xs uppercase text-muted-foreground bg-muted/50 border-b border-border">
                  <tr>
                     <th className="px-4 py-3">Lote</th>
                     <th className="px-4 py-3">Caducidad</th>
                     <th className="px-4 py-3 text-right">Cantidad</th>
                     <th className="px-4 py-3 text-right">Reservado</th>
                     <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-border">
                  {product.lots.length === 0 ? (
                     <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No hay lotes registrados.</td></tr>
                  ) : product.lots.map((lot: any) => {
                     const isExpired = new Date(lot.expiresAt) < new Date();
                     return (
                        <tr key={lot.id} className="hover:bg-muted/20 transition-colors group">
                           <form action={`/api/lots/${lot.id}`} method="POST" id={`form-${lot.id}`}>
                              <td className="px-4 py-3 font-mono">
                                 <input name="lotCode" defaultValue={lot.lotCode} className="bg-transparent border-none p-0 focus:ring-0 w-full" />
                              </td>
                              <td className="px-4 py-3">
                                 <div className="flex items-center gap-2">
                                    <input 
                                       type="date" 
                                       name="expiresAt" 
                                       defaultValue={new Date(lot.expiresAt).toISOString().split('T')[0]} 
                                       className={`bg-transparent border-none p-0 focus:ring-0 text-sm ${isExpired ? 'text-red-500 font-bold' : ''}`}
                                    />
                                    {isExpired && <AlertTriangle size={14} className="text-red-500" />}
                                 </div>
                              </td>
                              <td className="px-4 py-3 text-right">
                                 <input type="number" name="quantity" defaultValue={lot.quantity} className="bg-transparent border border-border rounded px-2 py-1 w-20 text-right focus:border-primary" />
                              </td>
                              <td className="px-4 py-3 text-right text-muted-foreground">{lot.reserved}</td>
                              <td className="px-4 py-3 text-right">
                                 <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                    <button type="submit" name="_action" value="update" className="text-emerald-500 hover:bg-emerald-500/10 p-1.5 rounded"><Save size={16} /></button>
                                    <button type="submit" name="_action" value="delete" className="text-red-500 hover:bg-red-500/10 p-1.5 rounded"><Trash2 size={16} /></button>
                                 </div>
                              </td>
                           </form>
                        </tr>
                     )
                  })}
               </tbody>
            </table>
         </div>
      </SubPageSection>
    </ProductSubPage>
  );
}