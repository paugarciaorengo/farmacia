import { prisma } from '@/src/lib/prisma';
import { ProductCard } from '@/src/app/components/ProductCard'; 
import { Search, Filter } from 'lucide-react';

const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

type CatalogPageProps = {
  searchParams: Promise<{
    search?: string;
    page?: string;
    noRx?: string;
    categoryId?: string;
  }>;
};

// Tu tipo original para los datos que vienen de la API
type ProductItem = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  availability: number;
  vatRate: number;
  isPrescription: boolean;
  media: { url: string | null; alt: string | null }[];
};

export default async function CatalogoPage({
  searchParams,
}: CatalogPageProps) {
  const sp = await searchParams;

  const search = sp.search ?? "";
  const page = Number(sp.page ?? "1");
  const noRx = sp.noRx === "1" || sp.noRx === "true";
  const categoryId = sp.categoryId ?? "";

  // 👇 Obtenemos las categorías para el selector directamente de BD
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const qs = new URLSearchParams();
  if (search) qs.set("search", search);
  qs.set("page", page.toString());
  if (noRx) qs.set("noRx", "1");
  if (categoryId) qs.set("categoryId", categoryId);

  // Llamada a tu API interna
  const res = await fetch(`${base}/api/products?${qs.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">Error del sistema</h1>
          <p className="text-red-400">
            No se pudieron cargar los productos (código {res.status})
          </p>
        </div>
      </main>
    );
  }

  const {
    items,
    total,
    page: currentPage,
    pageSize,
  }: {
    items: ProductItem[];
    total: number;
    page: number;
    pageSize: number;
  } = await res.json();

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Función auxiliar para URLs de paginación
  const makePageUrl = (p: number) => {
    const sp2 = new URLSearchParams();
    if (search) sp2.set("search", search);
    if (noRx) sp2.set("noRx", "1");
    if (categoryId) sp2.set("categoryId", categoryId);
    if (p !== 1) sp2.set("page", p.toString());
    const query = sp2.toString();
    return query ? `/catalogo?${query}` : "/catalogo";
  };

  return (
    <main className="min-h-screen bg-slate-950 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Cabecera */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Catálogo de productos</h1>
          <p className="text-slate-400">Gestiona y filtra el inventario disponible en tiempo real.</p>
        </div>

        {/* Filtros / Buscador - Estilo Premium Dark */}
        <form
          method="GET"
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Input Búsqueda */}
            <div className="flex-1 space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Search size={14} /> Buscar
              </label>
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Nombre, código o principio activo..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>

            {/* Select Categoría */}
            <div className="w-full md:w-64 space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Filter size={14} /> Categoría
              </label>
              <select
                name="categoryId"
                defaultValue={categoryId}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none appearance-none transition-all"
              >
                <option value="">Todas las categorías</option>
                {categories.map((cat: { id: string; name: string }) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer hover:text-white transition-colors">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  name="noRx"
                  value="1"
                  defaultChecked={noRx}
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-600 bg-slate-950 checked:border-emerald-500 checked:bg-emerald-500 transition-all"
                />
                <svg
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-950 opacity-0 peer-checked:opacity-100 transition-opacity"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  width="12"
                  height="12"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              Solo productos sin receta
            </label>

            <button
              type="submit"
              className="w-full md:w-auto rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-900/20 active:scale-95 transition-all"
            >
              Aplicar filtros
            </button>
          </div>
        </form>

        {/* Grid de productos */}
        {items.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
            <p className="text-slate-500 text-lg">No se han encontrado productos con esos filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  id: p.id,
                  slug: p.slug,
                  name: p.name,
                  price: p.priceCents / 100, // Convertimos céntimos a euros para el componente
                  stock: p.availability,
                  imageUrl: p.media?.[0]?.url,
                  // Usamos la descripción para mostrar info relevante ya que el componente la soporta
                  description: p.isPrescription ? "⚠️ Medicamento sujeto a prescripción médica" : "Venta libre - Sin receta",
                  category: p.category // Opcional, si la API lo devolviera lo pondríamos aquí
                }}
              />
            ))}
          </div>
        )}

        {/* Paginación - Estilo Slate */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 text-sm mt-12">
            <a
              href={makePageUrl(Math.max(1, currentPage - 1))}
              className={`px-4 py-2 rounded-lg border transition-all ${
                currentPage === 1
                  ? "pointer-events-none border-slate-800 text-slate-600 bg-slate-900/50"
                  : "border-slate-700 text-slate-300 hover:border-emerald-500 hover:text-emerald-400 bg-slate-900"
              }`}
            >
              ← Anterior
            </a>
            <span className="text-slate-400 font-medium">
              Página <span className="text-white">{currentPage}</span> de {totalPages}
            </span>
            <a
              href={makePageUrl(Math.min(totalPages, currentPage + 1))}
              className={`px-4 py-2 rounded-lg border transition-all ${
                currentPage === totalPages
                  ? "pointer-events-none border-slate-800 text-slate-600 bg-slate-900/50"
                  : "border-slate-700 text-slate-300 hover:border-emerald-500 hover:text-emerald-400 bg-slate-900"
              }`}
            >
              Siguiente →
            </a>
          </div>
        )}
      </div>
    </main>
  );
}