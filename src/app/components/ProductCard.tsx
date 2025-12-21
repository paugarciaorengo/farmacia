
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/src/store/cart-store'
import { Plus, ShieldCheck, Star, Pill } from 'lucide-react'

// Definimos la interfaz que espera tu catálogo
export interface ProductProps {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl?: string | null;
  category?: { name: string } | null;
  isPrescription?: boolean;
}

export function ProductCard({ product }: { product: ProductProps }) {
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault() // Evitamos navegar al detalle
    e.stopPropagation()

    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      priceCents: Math.round(product.price * 100),
      imageUrl: product.imageUrl || undefined,
      quantity: 1,
      maxQuantity: product.stock > 0 ? product.stock : 10
    })
  }

  // Lógica visual para iconos
  const isPrescription = product.isPrescription ?? false;
  const IconPlaceholder = isPrescription ? Pill : ShieldCheck;

  return (
    <Link href={`/producto/${product.slug}`} className="block h-full group">
      {/* 🎨 Usamos variables semánticas: bg-card, border-border... */}
      <div className="relative flex flex-col h-full overflow-hidden transition-all duration-300 border rounded-2xl bg-card border-border hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 backdrop-blur-sm">
        
        {/* Zona de Imagen: Fondo 'muted' en lugar de slate-800 */}
        <div className="relative flex items-center justify-center overflow-hidden h-56 bg-muted">
          
          {product.imageUrl ? (
            <Image 
              src={product.imageUrl} 
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <IconPlaceholder className="absolute transition-transform duration-500 w-32 h-32 text-muted-foreground/20 group-hover:scale-110" />
          )}
          
          {/* Badge de Stock (Mantenemos colores de alerta explícitos) */}
          {product.stock < 10 && product.stock > 0 && (
            <span className="absolute z-20 px-2 py-1 text-[10px] font-bold text-white uppercase rounded shadow-lg top-3 right-3 bg-amber-500/90">
              Últimas {product.stock} u.
            </span>
          )}
           {product.stock === 0 && (
            <span className="absolute z-20 px-2 py-1 text-[10px] font-bold text-white uppercase rounded shadow-lg top-3 right-3 bg-red-500/90">
              Agotado
            </span>
          )}
        </div>

        {/* Contenido */}
        <div className="relative z-20 flex flex-col flex-grow p-6">
          <div className="flex items-start justify-between mb-3">
            <span className="px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border">
              {product.category?.name || 'Farmacia'}
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
              <Star size={14} fill="currentColor" />
              <span>4.8</span>
            </div>
          </div>
          
          <h3 className="mb-2 text-lg font-bold transition-colors text-card-foreground group-hover:text-primary line-clamp-1">
            {product.name}
          </h3>
          
          <p className="h-10 mb-6 text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {product.description || 'Producto de alta calidad farmacéutica.'}
          </p>

          <div className="flex items-center justify-between pt-4 mt-auto border-t border-border">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Precio</span>
              <span className="text-2xl font-bold text-foreground">
                {product.price.toFixed(2)}€
              </span>
            </div>
            
            {/* Botón usando variable 'primary' */}
            <button
              onClick={handleAddToCart}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold transition-colors rounded-lg shadow-lg bg-primary text-primary-foreground hover:opacity-90 shadow-primary/20 active:scale-95"
            >
              <Plus size={18} strokeWidth={3} />
              Añadir
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}