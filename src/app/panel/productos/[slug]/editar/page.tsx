import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAuthToken } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import Link from "next/link";


type EditPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EditarProductoPage({ params }: EditPageProps) {
  const { slug } = await params;

  // 🔐 Autenticación + rol
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value ?? null;

  if (!token) redirect("/login");
  const payload = verifyAuthToken(token);
  if (!payload?.userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { role: true },
  });

  if (!user || (user.role !== "ADMIN" && user.role !== "PHARMACIST")) {
    redirect("/catalogo");
  }

  // 🔎 Cargamos el producto por slug
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
      active: true,
    },
  });

  if (!product) {
    redirect("/panel/productos");
  }

  const priceEuros = (product.priceCents / 100).toFixed(2);
  const vatRateStr = product.vatRate.toString();

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Editar producto</h1>
      <p className="text-xs text-neutral-400 mb-6">{product.slug}</p>

      <form
        action={`/api/products/${product.slug}`}
        method="POST"
        className="space-y-4 bg-neutral-900 p-6 rounded-xl border border-neutral-800"
      >
        <div>
          <label className="block mb-1 text-sm">Nombre del producto</label>
          <input
            type="text"
            name="name"
            defaultValue={product.name}
            required
            className="w-full rounded px-3 py-2 bg-neutral-950 border border-neutral-700"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">SKU interno</label>
          <input
            type="text"
            name="sku"
            defaultValue={product.sku}
            required
            className="w-full rounded px-3 py-2 bg-neutral-950 border border-neutral-700"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">Código Farmatic (opcional)</label>
          <input
            type="text"
            name="farmaticCode"
            defaultValue={product.farmaticCode ?? ""}
            className="w-full rounded px-3 py-2 bg-neutral-950 border border-neutral-700"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">Precio (€)</label>
          <input
            type="number"
            name="price"
            min="0"
            step="0.01"
            defaultValue={priceEuros}
            required
            className="w-full rounded px-3 py-2 bg-neutral-950 border border-neutral-700"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">IVA</label>
          <select
            name="vatRate"
            defaultValue={vatRateStr}
            className="w-full rounded px-3 py-2 bg-neutral-950 border border-neutral-700"
          >
            <option value="4">4% (muy reducido)</option>
            <option value="10">10% (sanitario / farmacia)</option>
            <option value="21">21% (parafarmacia)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPrescription"
            name="isPrescription"
            defaultChecked={product.isPrescription}
            className="h-4 w-4 rounded border-neutral-700 bg-neutral-950"
          />
          <label htmlFor="isPrescription" className="text-sm">
            Requiere receta médica
          </label>
        </div>

        <div>
          <label className="block mb-1 text-sm">Slug (URL)</label>
          <input
            type="text"
            name="slug"
            defaultValue={product.slug}
            required
            className="w-full rounded px-3 py-2 bg-neutral-950 border border-neutral-700"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">Activo</label>
          <select
            name="active"
            defaultValue={product.active ? "true" : "false"}
            className="w-full rounded px-3 py-2 bg-neutral-950 border border-neutral-700"
          >
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <a
            href="/panel/productos"
            className="px-4 py-2 text-sm rounded border border-neutral-700 text-neutral-200 hover:bg-neutral-800"
          >
            Cancelar
          </a>

          <Link
            href={`/panel/productos/${product.slug}/stock`}
            className="inline-flex items-center rounded border border-emerald-500/60 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/10"
          >
            Gestionar stock / lotes
          </Link>

          <Link
           href={`/panel/productos/${product.slug}/imagenes`}
           className="inline-flex items-center rounded border border-sky-500/60 px-3 py-1.5 text-xs font-semibold text-sky-300 hover:bg-sky-500/10"
         >
           Gestionar imágenes
         </Link>

          <button
            type="submit"
            className="px-4 py-2 text-sm rounded bg-emerald-500 text-black font-semibold hover:bg-emerald-400"
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </main>
  );
}
