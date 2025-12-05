// app/page.tsx
export default function Home() {
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4">
        Panel de gestión de farmacia
      </h1>
      <p className="text-sm text-neutral-300 mb-4 max-w-xl">
        Desde aquí podrás gestionar el catálogo de productos, stock, lotes y pedidos
        de tu farmacia de forma profesional.
      </p>

      <a
        href="/catalogo"
        className="inline-block rounded bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
      >
        Ir al catálogo de productos
      </a>
    </main>
  )
}
