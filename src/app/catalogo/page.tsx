import { ShieldCheck, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// 👇 Definimos la interfaz exportada para poder reusarla si es necesario
export interface ProductProps {
  id: string;
  name: string;
  slug: string; // ✅ Añadido slug
  description: string | null;
  price: number;
  stock: number;
  imageUrl?: string | null;
  category?: { name: string } | null;
}

export function ProductCard({ product }: { product: ProductProps }) {
  return (
    <Link href={`/producto/${product.slug}`} className="block h-full">
      <div className="group bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-800 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-900/10 flex flex-col h-full backdrop-blur-sm">
        
        {/* Zona de Imagen */}
        <div className="h-56 bg-slate-800/50 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent z-10" />
          
          {product.imageUrl ? (
            <Image 
              src={product.imageUrl} 
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <ShieldCheck className="text-emerald-500/20 w-32 h-32 absolute transform group-hover:scale-110 transition-transform duration-500" />
          )}
          
          {/* Badge de Stock */}
          {product.stock < 10 && product.stock > 0 && (
            <span className="absolute top-3 right-3 z-20 bg-amber-500/90 text-white text-[10px] uppercase font-bold px-2 py-1 rounded shadow-lg">
              Últimas {product.stock} u.
            </span>
          )}
           {product.stock === 0 && (
            <span className="absolute top-3 right-3 z-20 bg-red-500/90 text-white text-[10px] uppercase font-bold px-2 py-1 rounded shadow-lg">
              Agotado
            </span>
          )}
        </div>

        {/* Contenido */}
        <div className="p-6 flex flex-col flex-grow relative z-20">
          <div className="flex justify-between items-start mb-3">
            <span className="px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
              {product.category?.name || 'Farmacia'}
            </span>
            <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
              <Star size={14} fill="currentColor" />
              <span>4.8</span>
            </div>
          </div>
          
          <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-emerald-400 transition-colors line-clamp-1">
            {product.name}
          </h3>
          
          <p className="text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed h-10">
            {product.description || 'Producto de alta calidad farmacéutica.'}
          </p>

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800/50">
            <div className="flex flex-col">
              <span className="text-xs text-slate-500">Precio</span>
              <span className="text-2xl font-bold text-white">
                {product.price.toFixed(2)}€
              </span>
            </div>
            <span className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-emerald-500/20 text-sm">
              Ver Detalle
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}