// src/app/panel/productos/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAuthToken } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  active: boolean;
  createdAt: Date;
};

export default async function ProductosPanelPage() {
  // 🔐 Protección: solo usuarios logueados
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value ?? null;

  if (!token) {
    redirect("/login");
  }

  const payload = verifyAuthToken(token);
  if (!payload?.userId) {
    redirect("/login");
  }

  // buscamos el usuario
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, role: true },
  });

  if (!user) {
    redirect("/login");
  }

  // 👇 bloqueamos acceso a CUSTOMER
  if (user.role !== "ADMIN" && user.role !== "PHARMACIST") {
    redirect("/catalogo");
  }

  // 🗃️ Cargamos productos desde Prisma
  const products: ProductRow[] = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      priceCents: true,
      active: true,
      createdAt: true,
    },
  });

  return (
    <main className="p-6">
      {/* Cabecera con botón + */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestión de productos</h1>
          <p className="text-xs text-neutral-400 mt-1">
            {products.length} productos en el catálogo.
          </p>
        </div>

        <a
          href="/panel/productos/nuevo"
          className="rounded bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
        >
          + Nuevo producto
        </a>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900/80 border-b border-neutral-800">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">Nombre</th>
              <th className="px-4 py-2 text-left font-semibold">Slug</th>
              <th className="px-4 py-2 text-right font-semibold">Precio</th>
              <th className="px-4 py-2 text-center font-semibold">Estado</th>
              <th className="px-4 py-2 text-right font-semibold">Creado</th>
              <th className="px-4 py-2 text-right font-semibold">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-neutral-400"
                >
                  No hay productos en el sistema.
                </td>
              </tr>
            ) : (
              products.map((p: ProductRow) => (
                <tr
                  key={p.id}
                  className="border-t border-neutral-800 hover:bg-neutral-800/60"
                >
                  <td className="px-4 py-2">{p.name}</td>
                  <td className="px-4 py-2 text-xs text-neutral-400">
                    {p.slug}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {(p.priceCents / 100).toFixed(2)} €
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span
                      className={
                        p.active
                          ? "inline-flex rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-300"
                          : "inline-flex rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-medium text-red-300"
                      }
                    >
                      {p.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right text-xs text-neutral-400">
                    {new Date(p.createdAt).toLocaleDateString("es-ES")}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <a
                      href={`/producto/${p.slug}`}
                      className="text-xs text-emerald-400 hover:underline mr-3"
                    >
                      Ver
                    </a>
                    <a
                      href={`/panel/productos/${p.slug}/editar`}
                      className="text-xs text-neutral-300 hover:text-white mr-3"
                    >
                      Editar
                    </a>
                    <form
                      action={`/api/products/${p.slug}/delete`}
                      method="POST"
                      className="inline"
                    >
                      <button
                        type="submit"
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Eliminar
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
