import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import { Plus, Pencil, Trash2, Package, Search } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/src/auth";
import { Prisma } from "@prisma/client"; // ✅ 1. Importamos Prisma

// ✅ 2. Definimos el tipo exacto que esperamos (Producto + Lotes)
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Inventario</h1>
          <p className="text-slate-400 text-sm">Gestiona tu catálogo y stock</p>
        </div>
        <Link
          href="/panel/productos/nuevo"
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium shadow-lg shadow-emerald-900/20"
        >
          <Plus size={18} />
          Nuevo Producto
        </Link>
      </div>

      {/* Buscador */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
        <form className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            name="search"
            defaultValue={search}
            placeholder="Buscar por nombre o código..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:border-emerald-500 outline-none"
          />
        </form>
      </div>

      {/* Tabla */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-950 text-slate-400 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4 text-center">Código</th>
                <th className="px-6 py-4 text-right">Precio</th>
                <th className="px-6 py-4 text-center">Stock Total</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No se encontraron productos.
                  </td>
                </tr>
              ) : (
                // ✅ 3. Tipamos 'product' explícitamente en el map
                products.map((product: ProductWithLots) => {
                  
                  // ✅ 4. Tipamos 'acc' y 'lot' en el reduce
                  const totalStock = product.lots.reduce((acc: number, lot) => acc + lot.quantity, 0);
                  
                  const isLowStock = totalStock < 5;

                  return (
                    <tr key={product.id} className="hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{product.name}</div>
                        <div className="text-xs text-slate-500">{product.slug}</div>
                      </td>
                      <td className="px-6 py-4 text-center font-mono text-slate-400">
                        {product.farmaticCode || "—"}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-emerald-400">
                        {(product.priceCents / 100).toFixed(2)}€
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            totalStock === 0
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : isLowStock
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {totalStock} uds.
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/panel/productos/${product.slug}/stock`}
                            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Gestionar Stock y Lotes"
                          >
                            <Package size={18} />
                          </Link>

                          <Link
                            href={`/panel/productos/${product.slug}/editar`}
                            className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            title="Editar Datos"
                          >
                            <Pencil size={18} />
                          </Link>

                          <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
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
      </div>

      <div className="flex justify-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <a
            key={p}
            href={`/panel/productos?page=${p}${search ? `&search=${search}` : ""}`}
            className={`px-3 py-1 rounded-md text-sm ${
              p === currentPage
                ? "bg-emerald-600 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            {p}
          </a>
        ))}
      </div>
    </div>
  );
}