'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/src/store/cart-store' // ✅ Importamos la store
import { Plus, ShieldCheck, Star, Pill } from 'lucide-react'

// Definimos la interfaz que espera tu catálogo
export interface ProductProps {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;     // En euros
  stock: number;
  imageUrl?: string | null;
  category?: { name: string } | null;
  isPrescription?: boolean; // Añadido para lógica de iconos
}

// ✅ Usamos "export function" para que coincida con tu import { ProductCard }
export function ProductCard({ product }: { product: ProductProps }) {
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault() // Evitamos navegar al detalle
    e.stopPropagation()

    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      priceCents: Math.round(product.price * 100), // Convertimos a céntimos para la store
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
      <div className="relative flex flex-col h-full overflow-hidden transition-all duration-300 border rounded-2xl bg-slate-900/50 border-slate-800 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-900/10 backdrop-blur-sm">
        
        {/* Zona de Imagen */}
        <div className="relative flex items-center justify-center overflow-hidden h-56 bg-slate-800/50">
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-900/90 to-transparent" />
          
          {product.imageUrl ? (
            <Image 
              src={product.imageUrl} 
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <IconPlaceholder className="absolute transition-transform duration-500 w-32 h-32 text-emerald-500/20 group-hover:scale-110" />
          )}
          
          {/* Badge de Stock */}
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
            <span className="px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
              {product.category?.name || 'Farmacia'}
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
              <Star size={14} fill="currentColor" />
              <span>4.8</span>
            </div>
          </div>
          
          <h3 className="mb-2 text-lg font-bold transition-colors text-slate-100 group-hover:text-emerald-400 line-clamp-1">
            {product.name}
          </h3>
          
          <p className="h-10 mb-6 text-sm leading-relaxed text-slate-400 line-clamp-2">
            {product.description || 'Producto de alta calidad farmacéutica.'}
          </p>

          <div className="flex items-center justify-between pt-4 mt-auto border-t border-slate-800/50">
            <div className="flex flex-col">
              <span className="text-xs text-slate-500">Precio</span>
              <span className="text-2xl font-bold text-white">
                {product.price.toFixed(2)}€
              </span>
            </div>
            
            {/* Botón de Añadir funcional */}
            <button
              onClick={handleAddToCart}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold transition-colors rounded-lg shadow-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 active:scale-95"
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