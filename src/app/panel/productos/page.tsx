import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import { Plus, Pencil, Trash2, Package, Search } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/src/auth";
import { Prisma } from "@prisma/client";

type ProductWithLots = Prisma.ProductGetPayload<{
  include: { lots: true };
}>;

export default async function ProductosPanelPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { search, page } = await searchParams;
  const currentPage = Number(page) || 1;
  const pageSize = 10;

  const where = search
    ? {
        OR: [
          { name: { contains: search } }, 
          { farmaticCode: { contains: search } },
        ],
      }
    : {};

  const products = await prisma.product.findMany({
    where,
    take: pageSize,
    skip: (currentPage - 1) * pageSize,
    orderBy: { updatedAt: "desc" },
    include: {
      lots: true,
    },
  });

  const totalProducts = await prisma.product.count({ where });
  const totalPages = Math.ceil(totalProducts / pageSize);

  return (
    // 🎨 CORRECCIÓN: Añadimos 'min-h-screen' y 'bg-background' explícitamente
    // Esto asegura que el fondo sea el correcto (Blanco o Negro según el tema) y tape lo que haya detrás.
    <main className="min-h-screen bg-background space-y-8 p-6 md:p-8 animate-fade-in"> 
      
      {/* Header con más aire */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Inventario</h1>
          <p className="text-muted-foreground mt-1">Gestiona tu catálogo, precios y stock en tiempo real.</p>
        </div>
        <Link
          href="/panel/productos/nuevo"
          className="bg-primary hover:opacity-90 text-primary-foreground px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all font-bold shadow-lg shadow-primary/20 active:scale-95"
        >
          <Plus size={20} strokeWidth={2.5} />
          Nuevo Producto
        </Link>
      </div>

      {/* Buscador Estilizado */}
      <div className="bg-card p-1 rounded-2xl border border-border shadow-sm max-w-2xl">
        <form className="relative flex items-center">
          <Search className="absolute left-4 text-muted-foreground pointer-events-none" size={20} />
          <input
            name="search"
            defaultValue={search}
            placeholder="Buscar por nombre, código o referencia..."
            className="w-full bg-transparent border-none rounded-xl pl-12 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </form>
      </div>

      {/* Contenedor de Tabla "Card Style" */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold text-muted-foreground uppercase text-xs tracking-wider">Producto</th>
                <th className="px-6 py-4 text-center font-semibold text-muted-foreground uppercase text-xs tracking-wider">Código</th>
                <th className="px-6 py-4 text-right font-semibold text-muted-foreground uppercase text-xs tracking-wider">Precio</th>
                <th className="px-6 py-4 text-center font-semibold text-muted-foreground uppercase text-xs tracking-wider">Stock</th>
                <th className="px-6 py-4 text-right font-semibold text-muted-foreground uppercase text-xs tracking-wider">Acciones</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-border">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground space-y-2">
                       <Package size={48} className="opacity-20" />
                       <p>No se encontraron productos.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product: ProductWithLots) => {
                  const totalStock = product.lots.reduce((acc: number, lot) => acc + lot.quantity, 0);
                  const isLowStock = totalStock < 5;

                  return (
                    <tr key={product.id} className="group hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-foreground text-base">{product.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 font-mono opacity-70">{product.slug}</div>
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        <span className="font-mono text-xs bg-muted px-2 py-1 rounded text-muted-foreground border border-border">
                           {product.farmaticCode || "—"}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 text-right font-bold text-foreground">
                        {(product.priceCents / 100).toFixed(2)}€
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                            totalStock === 0
                              ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50"
                              : isLowStock
                              ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/50"
                              : "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/50"
                          }`}
                        >
                          {totalStock} uds.
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/panel/productos/${product.slug}/stock`}
                            className="p-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Gestionar Stock"
                          >
                            <Package size={18} />
                          </Link>

                          <Link
                            href={`/panel/productos/${product.slug}/editar`}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                            title="Editar"
                          >
                            <Pencil size={18} />
                          </Link>

                          <button 
                            className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer de la tabla con paginación */}
        <div className="border-t border-border bg-muted/20 px-6 py-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Mostrando {products.length} de {totalProducts} resultados
            </span>
            
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`/panel/productos?page=${p}${search ? `&search=${search}` : ""}`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    p === currentPage
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-card text-muted-foreground border-border hover:border-primary hover:text-primary"
                  }`}
                >
                  {p}
                </a>
              ))}
            </div>
        </div>
      </div>
    </main>
  );
}