import { ChevronLeft, ShieldCheck, Truck, Clock } from 'lucide-react'
import Link from 'next/link'
import Gallery from './Gallery'
import ProductActions from './ProductActions' // ✅ Importamos el componente nuevo

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

type ApiResponse = {
  product: {
    id: string; // Necesitamos el ID para el carrito
    name: string;
    slug: string;
    description: string | null;
    priceCents: number;
    sku?: string;
    media: { id: string; url: string; alt: string | null; position: number }[];
  };
  availability: number;
};

// Asegúrate de definir esto en tu .env o usa localhost por defecto
const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  // Fetch de datos
  const res = await fetch(`${base}/api/products/${slug}`, {
    cache: "no-store",
  });

  // Manejo de Error 404
  if (!res.ok) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-white">Producto no encontrado</h1>
          <p className="text-slate-400">Lo sentimos, no hemos podido localizar este medicamento.</p>
          <Link 
            href="/catalogo" 
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium"
          >
            <ChevronLeft size={20} /> Volver al catálogo
          </Link>
        </div>
      </main>
    );
  }

  const { product, availability } = (await res.json()) as ApiResponse;
  const priceEuros = (product.priceCents / 100).toFixed(2);

  return (
    // 🎨 Fondo y texto globales
    <main className="min-h-screen bg-background py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto animate-fade-in">
        
        <div className="mb-8">
          <Link 
            href="/catalogo" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
          >
            <ChevronLeft size={16} /> Volver al catálogo
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Galería (Fondo muted para huecos vacíos) */}
          <div>
            {product.media && product.media.length > 0 ? (
              <Gallery media={product.media} name={product.name} />
            ) : (
              <div className="aspect-square w-full bg-muted rounded-2xl flex items-center justify-center border border-border">
                <span className="text-muted-foreground">Sin imagen disponible</span>
              </div>
            )}
          </div>

          <div className="flex flex-col">
             {/* Header */}
            <div className="border-b border-border pb-6 mb-6">
               <div className="flex items-center gap-3 mb-4">
                 <span className="bg-muted text-muted-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-border">
                    {product.sku ? `REF: ${product.sku}` : 'Farmacia'}
                 </span>
                 {/* Stock badges: mantenemos colores semánticos de alerta */}
                 {availability > 0 ? (
                   <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-100/50 text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full border border-emerald-200">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
                     Stock Disponible ({availability})
                   </span>
                 ) : (
                   <span className="text-red-600 bg-red-100/50 text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full border border-red-200">
                     Agotado
                   </span>
                 )}
               </div>

               <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                 {product.name}
               </h1>

               <div className="flex items-baseline gap-2">
                 <span className="text-4xl font-bold text-foreground">{priceEuros}€</span>
                 <span className="text-sm text-muted-foreground">Impuestos incluidos</span>
               </div>
            </div>

            {/* Descripción (Usamos text-muted-foreground en lugar de prose-invert) */}
            <div className="prose prose-slate max-w-none mb-8 text-muted-foreground leading-relaxed">
              <p>{product.description ?? "Sin descripción detallada disponible."}</p>
            </div>

            <div className="mb-8">
              <ProductActions 
                product={{
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  priceCents: product.priceCents,
                  imageUrl: product.media?.[0]?.url,
                  stock: availability
                }} 
              />
            </div>

            {/* Garantías (Variables para fondos y bordes) */}
            <div className="grid grid-cols-2 gap-4 mt-auto">
               <div className="bg-card p-4 rounded-xl border border-border flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Garantía 100%</p>
                    <p className="text-xs text-muted-foreground">Farmacia certificada</p>
                  </div>
               </div>
               <div className="bg-card p-4 rounded-xl border border-border flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                    <Truck size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Recogida Rápida</p>
                    <p className="text-xs text-muted-foreground">Pedido listo en 2h</p>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}