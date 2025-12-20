import { redirect } from "next/navigation";
import { auth } from "@/src/auth"; // <--- 1. Importamos la nueva función auth
import { prisma } from "@/src/lib/prisma";

export default async function NuevoProductoPage() {
  // 🔐 2. Proteger ruta usando Auth.js
  const session = await auth();

  // Si no hay sesión, mandamos al login
  if (!session?.user?.id) {
    redirect("/login");
  }

  // 3. Verificamos el rol consultando la BD (Más seguro)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id }, // Usamos el ID de la sesión
    select: { role: true },
  });

  // Si no es admin ni farmacéutico, fuera
  if (!user || (user.role !== "ADMIN" && user.role !== "PHARMACIST")) {
    redirect("/catalogo");
  }

  // 👇 Cargamos categorías para el selector
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Nuevo producto</h1>

      <form
        action="/api/products"
        method="POST"
        className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900 p-6"
      >
        <div>
          <label className="mb-1 block text-sm">Nombre del producto</label>
          <input
            type="text"
            name="name"
            required
            className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm">SKU interno</label>
          <input
            type="text"
            name="sku"
            placeholder="PARA-650-TAB20"
            required
            className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2"
          />
          <p className="mt-1 text-[11px] text-neutral-500">
            Código interno de tu catálogo (no tiene por qué coincidir con
            Farmatic).
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm">
            Código Farmatic (opcional)
          </label>
          <input
            type="text"
            name="farmaticCode"
            placeholder="Ej. código del ERP Farmatic"
            className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2"
          />
        </div>

        {/* 👇 NUEVO: selector de categoría */}
        <div>
          <label className="mb-1 block text-sm">Categoría</label>
          <select
            name="categoryId"
            defaultValue=""
            className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
          >
            <option value="">Sin categoría</option>
            {categories.map((cat: { id: string; name: string }) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm">Precio (€)</label>
          <input
            type="number"
            name="price"
            min="0"
            step="0.01"
            required
            className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2"
          />
        </div>

        {/* Tipo de IVA */}
        <div>
          <label className="mb-1 block text-sm">IVA</label>
          <select
            name="vatRate"
            defaultValue="21"
            className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2"
          >
            <option value="4">4% (medicamentos muy reducidos)</option>
            <option value="10">10% (sanitario / farmacia)</option>
            <option value="21">21% (parafarmacia general)</option>
          </select>
        </div>

        {/* ¿requiere receta? */}
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
          <label className="mb-1 block text-sm">Slug (URL)</label>
          <input
            type="text"
            name="slug"
            placeholder="paracetamol-650"
            required
            className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm">URL de la imagen</label>
          <input
            type="text"
            name="imageUrl"
            placeholder="https://ejemplo.com/imagen.jpg"
            className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm">
            Texto alternativo de la imagen
          </label>
          <input
            type="text"
            name="imageAlt"
            placeholder="Ej. Imagen del envase del producto"
            className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm">Activo</label>
          <select
            name="active"
            className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2"
          >
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full rounded bg-emerald-500 py-2 font-semibold text-black hover:bg-emerald-400"
        >
          Crear producto
        </button>
      </form>
    </main>
  );
}