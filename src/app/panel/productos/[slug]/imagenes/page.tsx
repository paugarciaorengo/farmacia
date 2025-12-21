import { redirect } from "next/navigation";
import { auth } from "@/src/auth";
import { prisma } from "@/src/lib/prisma";
import { ProductSubPage, SubPageSection } from "@/src/app/components/admin/ProductSubPage";
import { Trash2, Save, ImagePlus, GripVertical } from 'lucide-react'; // Iconos bonitos

export default async function ImagenesProductoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();

  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user || (user.role !== "ADMIN" && user.role !== "PHARMACIST")) redirect("/");

  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      id: true, name: true, slug: true, sku: true, farmaticCode: true,
      media: { orderBy: { position: "asc" }, select: { id: true, url: true, alt: true, position: true } },
    },
  });

  if (!product) redirect("/panel/productos");

  return (
    <ProductSubPage
      title={`Galería: ${product.name}`}
      subtitle={`Gestiona las fotos para SKU: ${product.sku}`}
      productSlug={product.slug}
      user={user}
    >
      {/* 1. Formulario de NUEVA imagen */}
      <SubPageSection title="Añadir nueva imagen">
        <form
          action={`/api/products/${product.slug}/media`} // Recuerda que esto usa ID o Slug según arreglamos antes
          method="POST"
          className="grid items-end gap-4 md:grid-cols-4"
        >
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-bold uppercase text-muted-foreground">URL de la imagen</label>
            <div className="relative">
              <input
                name="url"
                required
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none pl-9"
                placeholder="https://..."
              />
              <ImagePlus className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-muted-foreground">Texto Alternativo (Alt)</label>
            <input
              name="alt"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="Ej: Caja frontal"
            />
          </div>

          <button
            type="submit"
            className="h-10 bg-primary text-primary-foreground font-bold rounded-lg px-4 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm"
          >
            <Save size={16} />
            Añadir
          </button>
        </form>
      </SubPageSection>

      {/* 2. Listado de imágenes existentes */}
      <SubPageSection title={`Imágenes Guardadas (${product.media.length})`}>
        {product.media.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl bg-muted/20">
            <ImagePlus className="mx-auto mb-3 opacity-50" size={48} />
            <p>No hay imágenes. Añade la primera arriba.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {product.media.map((m: any) => (
              <form
                key={m.id}
                action={`/api/media/${m.id}`}
                method="POST"
                className="group relative bg-muted/30 border border-border rounded-xl p-3 hover:border-primary/50 transition-colors flex gap-3"
              >
                {/* Preview Imagen */}
                <div className="w-24 h-24 shrink-0 bg-background rounded-lg border border-border overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.url} alt="preview" className="w-full h-full object-contain" />
                </div>

                {/* Campos Editables */}
                <div className="flex-1 space-y-2 min-w-0">
                   <div>
                      <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-0.5">Posición</label>
                      <input 
                        name="position" 
                        type="number" 
                        defaultValue={m.position ?? 0}
                        className="w-16 bg-background border border-border rounded px-2 py-1 text-xs font-mono"
                      />
                   </div>
                   <div>
                      <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-0.5">Alt Text</label>
                      <input 
                        name="alt" 
                        defaultValue={m.alt ?? ""}
                        className="w-full bg-background border border-border rounded px-2 py-1 text-xs"
                      />
                   </div>
                </div>

                {/* Botones de Acción (flotantes o abajo) */}
                <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        type="submit" 
                        name="_action" 
                        value="update"
                        title="Guardar cambios"
                        className="p-1.5 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 shadow-sm"
                    >
                        <Save size={14} />
                    </button>
                    <button 
                        type="submit" 
                        name="_action" 
                        value="delete"
                        title="Eliminar imagen"
                        className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 shadow-sm"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
                {/* Input oculto para la URL (si no quieres editarla aquí) o visible si prefieres */}
                <input type="hidden" name="url" value={m.url} />
              </form>
            ))}
          </div>
        )}
      </SubPageSection>
    </ProductSubPage>
  );
}