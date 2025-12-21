import Link from 'next/link'
import { auth } from '@/src/auth'
import UserMenu from '@/src/features/auth/userMenu' 
import NavLinks from './NavLinks' // Asegúrate de que tus NavLinks se vean bien en fondo oscuro (blanco)
import CartButton from '@/src/features/cart/CartButton'
import { Plus } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

export default async function NavBar() {
  const session = await auth()
  const user = session?.user

  return (
    // 🎨 1. ESTRUCTURA FIXED + DEGRADADO VERDE
    <nav className="fixed top-0 left-0 z-50 w-full h-16 bg-gradient-to-r from-emerald-700/99 to-primary/99 backdrop-blur-md text-primary-foreground shadow-lg shadow-emerald-900/10 transition-all">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        
        {/* 2. LOGOTIPO (Adaptado al fondo verde: Texto blanco) */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-lg border border-white/30 group-hover:scale-105 transition-transform shadow-sm">
            <Plus className="text-white font-bold" size={20} strokeWidth={4} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white leading-none tracking-tight">
              Farma<span className="text-emerald-200">Web</span>
            </h1>
            <p className="text-[10px] text-emerald-100 uppercase tracking-widest font-medium opacity-90">
              Farmacia del Carmel
            </p>
          </div>
        </Link>

        {/* 3. NAVEGACIÓN CENTRAL */}
        <div className="hidden md:block">
          {/* Nota: Asegúrate de que tu componente NavLinks use texto blanco o acepte clases */}
          <NavLinks /> 
        </div>

        {/* 4. ZONA USUARIO Y CARRITO */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          <CartButton />
          
          {/* Separador vertical sutil en blanco/verde */}
          <div className="hidden md:block w-px h-6 bg-emerald-500/50 mx-1"></div>

          {/* 5. LÓGICA DE SESIÓN (Lo que me pediste recuperar) */}
          {user ? (
            <UserMenu user={user} />
          ) : (
            <div className="flex items-center gap-3">
              {/* Botón Acceso: Texto simple claro */}
              <Link
                href="/login"
                className="text-sm font-medium text-emerald-100 hover:text-white transition-colors"
              >
                Acceso
              </Link>
              
              {/* Botón Registro: Fondo blanco para resaltar sobre el verde */}
              <Link
                href="/register"
                className="bg-white text-emerald-700 hover:bg-emerald-50 hover:scale-105 text-sm font-bold px-4 py-2 rounded-lg transition-all shadow-md"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}