// src/app/panel/productos/[slug]/stock/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/src/auth"; // ✅ Importamos Auth.js
import { prisma } from "@/src/lib/prisma";

type StockPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function StockProductoPage({ params }: StockPageProps) {
  const { slug } = await params;

  // 🔐 1. Autenticación con Auth.js
  const session = await auth();

  // Si no hay sesión, al login
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

  // 🔎 3. Cargar datos del producto y sus lotes
  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      farmaticCode: true,
      priceCents: true,
      vatRate: true,
      isPrescription: true,
      lots: {
        orderBy: { expiresAt: "asc" }, // Ordenar por caducidad (FEFO)
        select: {
          id: true,
          lotCode: true,
          expiresAt: true,
          quantity: true,
          reserved: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!product) {
    redirect("/panel/productos");
  }

  // Cálculos de stock
  const totalQuantity = product.lots.reduce(
    (sum: number, lot: any) => sum + lot.quantity,
    0
  );

  const totalReserved = product.lots.reduce(
    (sum: number, lot: any) => sum + lot.reserved,
    0
  );

  const totalAvailable = totalQuantity - totalReserved;

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-bold">
            Stock y lotes: {product.name}
          </h1>
          <p className="text-sm text-neutral-400">
            SKU: {product.sku} · Farmatic: {product.farmaticCode ?? "—"} · IVA:{" "}
            {product.vatRate.toString()}%
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Necesita receta: {product.isPrescription ? "Sí" : "No"}
          </p>
        </div>

        <div className="text-right text-sm">
          <p className="text-neutral-400">
            Stock total:{" "}
            <span className="font-semibold text-neutral-50">
              {totalQuantity} uds.
            </span>
          </p>
          <p className="text-neutral-400">
            Reservado:{" "}
            <span className="font-semibold">{totalReserved} uds.</span>
          </p>
          <p className="text-neutral-400">
            Disponible:{" "}
            <span className="font-semibold text-emerald-400">
              {totalAvailable} uds.
            </span>
          </p>
        </div>
      </header>

      <div className="flex items-center justify-between gap-4">
        <a
          href={`/panel/productos/${product.slug}/editar`}
          className="text-xs text-neutral-400 hover:text-neutral-200"
        >
          ← Volver a edición de producto
        </a>
        <p className="text-xs text-neutral-500">
          Usuario: {user.name ?? user.email} · Rol: {user.role}
        </p>
      </div>

      {/* Formulario para crear nuevo lote */}
      <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
        <h2 className="mb-3 text-sm font-semibold">Añadir nuevo lote</h2>

        <form
          action={`/api/products/${product.slug}/lots`}
          method="POST"
          className="grid items-end gap-4 md:grid-cols-4"
        >
          <div className="flex flex-col gap-1">
            <label
              htmlFor="lotCode"
              className="text-xs font-medium text-neutral-300"
            >
              Código de lote
            </label>
            <input
              id="lotCode"
              name="lotCode"
              required
              className="rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              placeholder="Ej: LOTE1234"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="expiresAt"
              className="text-xs font-medium text-neutral-300"
            >
              Fecha de caducidad
            </label>
            <input
              id="expiresAt"
              name="expiresAt"
              type="date"
              required // ✅ AÑADIDO: Ahora es obligatorio en BD
              className="rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="quantity"
              className="text-xs font-medium text-neutral-300"
            >
              Cantidad (unidades)
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min={0}
              step={1}
              required
              className="rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              placeholder="Ej: 50"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
          >
            Guardar lote
          </button>
        </form>
      </section>

      {/* Tabla de lotes existentes */}
      <section className="rounded-xl border border-neutral-800 bg-neutral-900">
        <header className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
          <h2 className="text-sm font-semibold">Lotes registrados</h2>
          <p className="text-xs text-neutral-400">
            {product.lots.length} lotes en total.
          </p>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-950/60 text-xs uppercase text-neutral-400">
              <tr>
                <th className="px-3 py-2 text-left">Código</th>
                <th className="px-3 py-2 text-left">Caducidad</th>
                <th className="px-3 py-2 text-right">Cantidad</th>
                <th className="px-3 py-2 text-right">Reservado</th>
                <th className="px-3 py-2 text-right">Disponible</th>
                <th className="px-3 py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {product.lots.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-4 text-center text-xs text-neutral-500"
                  >
                    Todavía no hay lotes registrados para este producto.
                  </td>
                </tr>
              ) : (
                product.lots.map((lot: any) => {
                  const available = lot.quantity - lot.reserved;

                  const dateInputValue = lot.expiresAt
                    ? new Date(lot.expiresAt).toISOString().slice(0, 10)
                    : "";

                  const isExpired =
                    !!lot.expiresAt && new Date(lot.expiresAt) < new Date();

                  const formId = `lot-form-${lot.id}`;

                  return (
                    <tr key={lot.id} className="border-t border-neutral-800">
                      {/* Código de lote editable */}
                      <td className="px-3 py-2 font-mono text-xs">
                        <input
                          form={formId}
                          name="lotCode"
                          defaultValue={lot.lotCode}
                          className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-xs outline-none focus:border-emerald-500"
                        />
                      </td>

                      {/* Caducidad editable */}
                      <td className="px-3 py-2 text-xs">
                        <div className="flex flex-col gap-1">
                          <input
                            form={formId}
                            type="date"
                            name="expiresAt"
                            defaultValue={dateInputValue}
                            required // ✅ AÑADIDO: Obligatorio al editar también
                            className={`rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-[11px] outline-none focus:border-emerald-500 ${
                              isExpired ? "text-red-400 border-red-900" : ""
                            }`}
                          />
                          {isExpired && (
                            <span className="text-[10px] text-red-500 font-bold">
                              CADUCADO
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Cantidad editable */}
                      <td className="px-3 py-2 text-right">
                        <input
                          form={formId}
                          name="quantity"
                          type="number"
                          min={0}
                          step={1}
                          defaultValue={lot.quantity}
                          className="w-20 rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-right text-xs outline-none focus:border-emerald-500"
                        />
                      </td>

                      {/* Reservado solo lectura */}
                      <td className="px-3 py-2 text-right text-xs">
                        {lot.reserved}
                      </td>

                      {/* Disponible calculado */}
                      <td className="px-3 py-2 text-right text-xs">
                        <span
                          className={
                            available <= 0
                              ? "text-red-400 font-semibold"
                              : "text-emerald-400 font-semibold"
                          }
                        >
                          {available}
                        </span>
                      </td>

                      {/* Acciones: Guardar + Eliminar */}
                      <td className="px-3 py-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            form={formId}
                            type="submit"
                            name="_action"
                            value="update"
                            className="rounded border border-emerald-500/60 px-3 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/10"
                          >
                            Guardar
                          </button>

                          <button
                            form={formId}
                            type="submit"
                            name="_action"
                            value="delete"
                            className="rounded border border-red-500/40 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10"
                          >
                            Eliminar
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

        {/* Formularios "invisibles" asociados a cada fila mediante el atributo form */}
        {product.lots.map((lot: any) => (
          <form
            key={lot.id}
            id={`lot-form-${lot.id}`}
            action={`/api/lots/${lot.id}`}
            method="POST"
          />
        ))}
      </section>
    </main>
  );
}