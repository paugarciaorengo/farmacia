// src/app/components/NavBar.tsx
import Link from 'next/link'
import { auth } from '@/src/auth'
import UserMenu from '@/src/features/auth/userMenu'
import NavLinks from './NavLinks'
import CartButton from '@/src/features/cart/CartButton'
import { Plus } from 'lucide-react'

export default async function NavBar() {
  const session = await auth()
  const user = session?.user

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* 1. Logo con Estilo Premium */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-emerald-500 p-1.5 rounded-lg group-hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-900/20">
            <Plus className="text-slate-950 font-bold" size={20} strokeWidth={4} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white leading-none">
              Farma<span className="text-emerald-500">Web</span>
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Farmacia del Carmen</p>
          </div>
        </Link>

        {/* 2. Navegación Central */}
        <div className="hidden md:block">
          <NavLinks />
        </div>

        {/* 3. Zona Usuario y Carrito */}
        <div className="flex items-center gap-4">
          <CartButton />
          
          <div className="hidden md:block w-px h-6 bg-slate-800"></div>

          {user ? (
            <UserMenu user={user} />
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Acceso
              </Link>
              <Link
                href="/register"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold px-4 py-2 rounded-lg transition-all shadow-lg shadow-emerald-900/20"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}