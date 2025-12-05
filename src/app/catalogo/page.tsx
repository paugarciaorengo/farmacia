// src/app/catalogo/page.tsx
const base =
  process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

type CatalogPageProps = {
  searchParams: Promise<{
    search?: string;
    page?: string;
    noRx?: string;
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
};

export default async function CatalogoPage({
  searchParams,
}: CatalogPageProps) {
  // en tu proyecto searchParams es una Promise
  const sp = await searchParams;

  const search = sp.search ?? "";
  const page = Number(sp.page ?? "1");
  const noRx = sp.noRx === "1" || sp.noRx === "true";

  const qs = new URLSearchParams();
  if (search) qs.set("search", search);
  qs.set("page", page.toString());
  if (noRx) qs.set("noRx", "1");

  const res = await fetch(`${base}/api/products?${qs.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <main className="p-6">
        <h1 className="mb-2 text-2xl font-bold">Catálogo</h1>
        <p className="text-sm text-red-400">
          Error cargando productos (código {res.status})
        </p>
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

  const makePageUrl = (p: number) => {
    const sp2 = new URLSearchParams();
    if (search) sp2.set("search", search);
    if (noRx) sp2.set("noRx", "1");
    if (p !== 1) sp2.set("page", p.toString());
    const query = sp2.toString();
    return query ? `/catalogo?${query}` : "/catalogo";
  };

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Catálogo de productos</h1>

      {/* Filtros / buscador */}
      <form
        method="GET"
        className="mb-6 flex flex-col gap-3 rounded-lg border border-neutral-800 bg-neutral-900 p-4 md:flex-row md:items-center md:justify-between"
      >
        <div className="flex-1">
          <label className="mb-1 block text-xs text-neutral-400">
            Buscar por nombre
          </label>
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="paracetamol, ibuprofeno..."
            className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
          />
        </div>

        <div className="mt-2 flex items-center gap-3 md:mt-5">
          <label className="flex items-center gap-2 text-xs text-neutral-300">
            <input
              type="checkbox"
              name="noRx"
              value="1"
              defaultChecked={noRx}
              className="h-4 w-4 rounded border-neutral-700 bg-neutral-950"
            />
            Solo sin receta
          </label>

          <button
            type="submit"
            className="rounded bg-emerald-500 px-4 py-2 text-xs font-semibold text-black hover:bg-emerald-400"
          >
            Aplicar filtros
          </button>
        </div>
      </form>

      {/* Grid de productos */}
      {items.length === 0 ? (
        <p className="text-sm text-neutral-400">
          No se han encontrado productos con esos filtros.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => {
            const cover = p.media?.[0]; // portada del catálogo

            return (
              <a
                key={p.id}
                href={`/producto/${p.slug}`}
                className="rounded-lg border border-neutral-800 bg-neutral-900 transition-shadow hover:border-emerald-500 hover:shadow-md"
              >
                <div className="aspect-square overflow-hidden rounded-t-lg bg-neutral-950 flex items-center justify-center">
                  {cover?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover.url}
                      alt={cover.alt ?? p.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-neutral-500">
                      Sin imagen
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <div className="mb-1 text-xs text-neutral-400">
                    {p.isPrescription
                      ? "Medicamento con receta"
                      : "Sin receta médica"}
                  </div>
                  <div className="line-clamp-2 text-sm font-semibold">
                    {p.name}
                  </div>
                  <div className="mt-1 text-sm">
                    {(p.priceCents / 100).toFixed(2)} €
                    <span className="ml-1 text-[11px] text-neutral-500">
                      IVA {p.vatRate}%
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] text-neutral-400">
                    {p.availability > 0 ? (
                      <span className="text-emerald-400">
                        Disponible ({p.availability} uds.)
                      </span>
                    ) : (
                      <span className="text-red-400">Sin stock</span>
                    )}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}

      {/* Paginación simple */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4 text-xs">
          <a
            href={makePageUrl(Math.max(1, currentPage - 1))}
            className={`rounded px-3 py-1 border ${
              currentPage === 1
                ? "pointer-events-none border-neutral-800 text-neutral-600"
                : "border-neutral-700 hover:border-emerald-500"
            }`}
          >
            ← Anterior
          </a>
          <span className="text-neutral-400">
            Página {currentPage} de {totalPages}
          </span>
          <a
            href={makePageUrl(Math.min(totalPages, currentPage + 1))}
            className={`rounded px-3 py-1 border ${
              currentPage === totalPages
                ? "pointer-events-none border-neutral-800 text-neutral-600"
                : "border-neutral-700 hover:border-emerald-500"
            }`}
          >
            Siguiente →
          </a>
        </div>
      )}
    </main>
  );
}
