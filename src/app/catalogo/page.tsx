import { prisma } from '@/src/lib/prisma';
import { ProductCard } from '@/src/app/components/ProductCard'; 
import { Search, Filter } from 'lucide-react';
import { Suspense } from 'react'; // AÑADIDO: Importamos Suspense

const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

type CatalogPageProps = {
  searchParams: Promise<{
    search?: string;
    page?: string;
    noRx?: string;
    categoryId?: string;
  }>;
};

type ProductItem = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  availability: number;
  vatRate: number;
  isPrescription: boolean;
  media: { url: string | null; alt: string | null }[];
  category?: { id: string; name: string } | null;
};

// ==========================================
// 1. COMPONENTE ESQUELETO (Muestra mientras carga)
// ==========================================
function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-[400px] bg-card rounded-2xl border border-border animate-pulse p-4 flex flex-col">
          <div className="h-48 bg-muted rounded-xl mb-4 w-full"></div>
          <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
          <div className="mt-auto h-12 bg-muted rounded-xl w-full"></div>
        </div>
      ))}
    </div>
  );
}

// ==========================================
// 2. COMPONENTE ASÍNCRONO (La consulta pesada)
// ==========================================
async function ProductGrid({ 
  queryString, 
  search, 
  noRx, 
  categoryId 
}: { 
  queryString: string;
  search: string;
  noRx: boolean;
  categoryId: string;
}) {
  const res = await fetch(`${base}/api/products?${queryString}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <div className="text-center space-y-4 py-20 bg-red-500/10 rounded-2xl border border-red-500/20">
        <h2 className="text-xl font-bold text-red-500">Error del sistema</h2>
        <p className="text-muted-foreground">No se pudieron cargar los productos (código {res.status})</p>
      </div>
    );
  }

  const { items, total, page: currentPage, pageSize }: {
    items: ProductItem[];
    total: number;
    page: number;
    pageSize: number;
  } = await res.json();

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

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
    <>
      {/* Grid de productos */}
      {items.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border border-dashed">
          <p className="text-muted-foreground text-lg">No se han encontrado productos con esos filtros.</p>
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
                price: p.priceCents / 100, 
                stock: p.availability,
                imageUrl: p.media?.[0]?.url,
                description: p.isPrescription ? "⚠️ Medicamento sujeto a prescripción médica" : "Venta libre - Sin receta",
                category: p.category,
                isPrescription: p.isPrescription
              }}
            />
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 text-sm mt-12">
          <a
            href={makePageUrl(Math.max(1, currentPage - 1))}
            className={`px-4 py-2 rounded-lg border transition-all ${
              currentPage === 1
                ? "pointer-events-none border-border text-muted-foreground/50 bg-muted/50"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary bg-card"
            }`}
          >
            ← Anterior
          </a>
          <span className="text-muted-foreground font-medium">
            Página <span className="text-foreground font-bold">{currentPage}</span> de {totalPages}
          </span>
          <a
            href={makePageUrl(Math.min(totalPages, currentPage + 1))}
            className={`px-4 py-2 rounded-lg border transition-all ${
              currentPage === totalPages
                ? "pointer-events-none border-border text-muted-foreground/50 bg-muted/50"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary bg-card"
            }`}
          >
            Siguiente →
          </a>
        </div>
      )}
    </>
  );
}

// ==========================================
// 3. PÁGINA PRINCIPAL (Carga instantánea)
// ==========================================
export default async function CatalogoPage({
  searchParams,
}: CatalogPageProps) {
  const sp = await searchParams;

  const search = sp.search ?? "";
  const page = Number(sp.page ?? "1");
  const noRx = sp.noRx === "1" || sp.noRx === "true";
  const categoryId = sp.categoryId ?? "";

  // Prisma carga las categorías rapidísimo, no bloquea casi nada
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const qs = new URLSearchParams();
  if (search) qs.set("search", search);
  qs.set("page", page.toString());
  if (noRx) qs.set("noRx", "1");
  if (categoryId) qs.set("categoryId", categoryId);

  return (
    <main className="min-h-screen bg-background p-6 md:p-12 pt-28 md:pt-32">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Cabecera */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Catálogo de productos</h1>
          <p className="text-muted-foreground">Gestiona y filtra el inventario disponible en tiempo real.</p>
        </div>

        {/* Filtros / Buscador */}
        <form
          method="GET"
          className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Search size={14} /> Buscar
              </label>
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Nombre, código o principio activo..."
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>

            <div className="w-full md:w-64 space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Filter size={14} /> Categoría
              </label>
              <select
                name="categoryId"
                defaultValue={categoryId}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none transition-all"
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

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
            <label className="flex items-center gap-3 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  name="noRx"
                  value="1"
                  defaultChecked={noRx}
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-border bg-background checked:border-primary checked:bg-primary transition-all"
                />
                <svg
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity"
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
              className="w-full md:w-auto rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20 active:scale-95 transition-all"
            >
              Aplicar filtros
            </button>
          </div>
        </form>

        {/* 👇 EL MAGNÍFICO SUSPENSE 👇 */}
        {/* Usamos qs.toString() como key para que React vuelva a mostrar el esqueleto si cambias de página o aplicas un filtro */}
        <Suspense key={qs.toString()} fallback={<GridSkeleton />}>
          <ProductGrid 
            queryString={qs.toString()} 
            search={search}
            noRx={noRx}
            categoryId={categoryId}
          />
        </Suspense>

      </div>
    </main>
  );
}