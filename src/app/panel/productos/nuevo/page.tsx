import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAuthToken } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export default async function NuevoProductoPage() {
  // 🔐 Proteger ruta
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

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Nuevo producto</h1>

      <form
        action="/api/products"
        method="POST"
        className="space-y-4 bg-neutral-900 p-6 rounded-xl border border-neutral-800"
      >
        <div>
          <label className="block mb-1 text-sm">Nombre del producto</label>
          <input
            type="text"
            name="name"
            required
            className="w-full rounded px-3 py-2 bg-neutral-950 border border-neutral-700"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">SKU interno</label>
          <input
            type="text"
            name="sku"
            placeholder="PARA-650-TAB20"
            required
            className="w-full rounded px-3 py-2 bg-neutral-950 border border-neutral-700"
          />
          <p className="mt-1 text-[11px] text-neutral-500">
            Código interno de tu catálogo (no tiene por qué coincidir con Farmatic).
          </p>
        </div>

        <div>
          <label className="block mb-1 text-sm">Código Farmatic (opcional)</label>
          <input
            type="text"
            name="farmaticCode"
            placeholder="Ej. código del ERP Farmatic"
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
            required
            className="w-full rounded px-3 py-2 bg-neutral-950 border border-neutral-700"
          />
        </div>

        {/* NUEVO: tipo de IVA */}
        <div>
          <label className="block mb-1 text-sm">IVA</label>
          <select
            name="vatRate"
            defaultValue="21"
            className="w-full rounded px-3 py-2 bg-neutral-950 border border-neutral-700"
          >
            <option value="4">4% (medicamentos muy reducidos)</option>
            <option value="10">10% (sanitario / farmacia)</option>
            <option value="21">21% (parafarmacia general)</option>
          </select>
        </div>

        {/* NUEVO: ¿requiere receta? */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPrescription"
            name="isPrescription"
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
            placeholder="paracetamol-650"
            required
            className="w-full rounded px-3 py-2 bg-neutral-950 border border-neutral-700"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">URL de la imagen</label>
          <input
            type="text"
            name="imageUrl"
            placeholder="https://ejemplo.com/imagen.jpg"
            className="w-full rounded px-3 py-2 bg-neutral-950 border border-neutral-700"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">Texto alternativo de la imagen</label>
          <input
            type="text"
            name="imageAlt"
            placeholder="Ej. Imagen del envase del producto"
            className="w-full rounded px-3 py-2 bg-neutral-950 border border-neutral-700"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">Activo</label>
          <select
            name="active"
            className="w-full rounded px-3 py-2 bg-neutral-950 border border-neutral-700"
          >
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-500 text-black py-2 rounded font-semibold hover:bg-emerald-400"
        >
          Crear producto
        </button>
      </form>
    </main>
  );
}
