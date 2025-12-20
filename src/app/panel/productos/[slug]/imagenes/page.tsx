// src/app/panel/productos/[slug]/imagenes/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/src/auth"; // ✅ Importamos Auth.js
import { prisma } from "@/src/lib/prisma";

type ImagesPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ImagenesProductoPage({
  params,
}: ImagesPageProps) {
  const { slug } = await params;

  // 🔐 1. Autenticación con Auth.js
  const session = await auth();

  // Si no hay sesión, redirigir al login
  if (!session?.user?.id) {
    redirect("/login");
  }

  // 🔐 2. Verificar Rol en BD
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user || (user.role !== "ADMIN" && user.role !== "PHARMACIST")) {
    redirect("/");
  }

  // 🔎 3. Cargar datos del producto
  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      farmaticCode: true,
      media: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          url: true,
          alt: true,
          position: true,
        },
      },
    },
  });

  if (!product) {
    redirect("/panel/productos");
  }

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-bold">
            Imágenes: {product.name}
          </h1>
          <p className="text-sm text-neutral-400">
            SKU: {product.sku} · Farmatic: {product.farmaticCode ?? "—"}
          </p>
        </div>

        <p className="text-xs text-neutral-500">
          Usuario: {user.name ?? user.email} · Rol: {user.role}
        </p>
      </header>

      <div className="flex items-center justify-between gap-4">
        <a
          href={`/panel/productos/${product.slug}/editar`}
          className="text-xs text-neutral-400 hover:text-neutral-200"
        >
          ← Volver a edición de producto
        </a>
      </div>

      {/* Formulario para añadir nueva imagen */}
      <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
        <h2 className="mb-3 text-sm font-semibold">Añadir nueva imagen</h2>

        <form
          action={`/api/products/${product.slug}/media`}
          method="POST"
          className="grid items-end gap-4 md:grid-cols-4"
        >
          <div className="flex flex-col gap-1 md:col-span-2">
            <label
              htmlFor="url"
              className="text-xs font-medium text-neutral-300"
            >
              URL de la imagen
            </label>
            <input
              id="url"
              name="url"
              required
              className="rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              placeholder="https://..."
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="alt"
              className="text-xs font-medium text-neutral-300"
            >
              Texto alternativo (alt)
            </label>
            <input
              id="alt"
              name="alt"
              className="rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              placeholder="Ej: Foto del producto"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="position"
              className="text-xs font-medium text-neutral-300"
            >
              Posición (opcional)
            </label>
            <input
              id="position"
              name="position"
              type="number"
              min={0}
              className="rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              placeholder="Ej: 1"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
          >
            Guardar imagen
          </button>
        </form>
      </section>

      {/* Listado de imágenes existentes (tarjetas) */}
      <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Imágenes guardadas</h2>
          <p className="text-xs text-neutral-400">
            {product.media.length} imágenes en total.
          </p>
        </header>

        {product.media.length === 0 ? (
          <p className="px-1 py-4 text-center text-xs text-neutral-500">
            Todavía no hay imágenes para este producto.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {product.media.map((m: any) => (
              <form
                key={m.id}
                action={`/api/media/${m.id}`}
                method="POST"
                className="flex flex-col gap-3 rounded-lg border border-neutral-800 bg-neutral-950 p-3"
              >
                {/* Preview */}
                <div className="flex items-start gap-3">
                  {m.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.url}
                      alt={m.alt ?? ""}
                      className="h-20 w-20 flex-shrink-0 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded border border-dashed border-neutral-700 text-[11px] text-neutral-500">
                      Sin imagen
                    </div>
                  )}

                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-neutral-300">
                        URL
                      </label>
                      <input
                        name="url"
                        defaultValue={m.url}
                        className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-xs outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-medium text-neutral-300">
                        Alt
                      </label>
                      <input
                        name="alt"
                        defaultValue={m.alt ?? ""}
                        className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-xs outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-neutral-300">
                      Posición
                    </label>
                    <input
                      name="position"
                      type="number"
                      min={0}
                      defaultValue={m.position ?? 0}
                      className="w-20 rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-right text-xs outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="ml-auto flex items-center gap-2">
                    <button
                      type="submit"
                      name="_action"
                      value="update"
                      className="rounded border border-emerald-500/60 px-3 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/10"
                    >
                      Guardar
                    </button>
                    <button
                      type="submit"
                      name="_action"
                      value="delete"
                      className="rounded border border-red-500/40 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </form>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}