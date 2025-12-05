// src/app/producto/[slug]/page.tsx
import Gallery from "./Gallery";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

type ApiResponse = {
  product: {
    name: string;
    description: string | null;
    priceCents: number;
    media: { id: string; url: string; alt: string | null; position: number }[];
  };
  availability: number;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const res = await fetch(`http://localhost:3000/api/products/${slug}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <main className="p-6">
        <h1 className="mb-2 text-xl font-bold">Producto no encontrado</h1>
        <p>Código de error: {res.status}</p>
        <a href="/" className="mt-4 inline-block text-sm underline">
          ← Volver al catálogo
        </a>
      </main>
    );
  }

  const { product, availability } = (await res.json()) as ApiResponse;

  return (
    <main className="p-6">
      <a href="/" className="text-sm underline">
        ← Volver
      </a>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Galería de imágenes */}
        <div>
          {product.media && product.media.length > 0 ? (
            <Gallery media={product.media} name={product.name} />
          ) : (
            <div className="aspect-square rounded bg-gray-100" />
          )}
        </div>

        {/* Info del producto */}
        <div>
          <h1 className="mb-2 text-2xl font-bold">{product.name}</h1>
          <p className="text-xl">
            {(product.priceCents / 100).toFixed(2)} €
          </p>

          <p className="mt-2">
            {availability > 0 ? (
              <span className="text-green-600">
                Disponible ({availability})
              </span>
            ) : (
              <span className="text-red-600">Sin stock</span>
            )}
          </p>

          {product.description && (
            <p className="mt-4">{product.description}</p>
          )}
        </div>
      </div>
    </main>
  );
}
