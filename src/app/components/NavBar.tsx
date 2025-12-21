import Link from 'next/link'
import { auth } from '@/src/auth'
import UserMenu from '@/src/features/auth/userMenu' 
import NavLinks from './NavLinks'
import CartButton from '@/src/features/cart/CartButton'
import { Plus } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

export default async function NavBar() {
  const session = await auth()
  const user = session?.user

  return (
    // 🎨 Usamos bg-card/80 y border-border para que se adapte al tema
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/80 backdrop-blur-lg shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* 1. Logo con Estilo Agnóstica */}
        <Link href="/" className="flex items-center gap-2 group">
          {/* bg-primary y text-primary-foreground cambian según el tema */}
          <div className="bg-primary p-1.5 rounded-lg group-hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
            <Plus className="text-primary-foreground font-bold" size={20} strokeWidth={4} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground leading-none">
              Farma<span className="text-primary">Web</span>
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
              Farmacia del Carmel
            </p>
          </div>
        </Link>

        {/* 2. Navegación Central */}
        <div className="hidden md:block">
          <NavLinks />
        </div>

        {/* 3. Zona Usuario y Carrito */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          <CartButton />
          
          {/* Separador vertical usando border-border o bg-border */}
          <div className="hidden md:block w-px h-6 bg-border"></div>

          {user ? (
            <UserMenu user={user} />
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Acceso
              </Link>
              <Link
                href="/register"
                className="bg-primary hover:opacity-90 text-primary-foreground text-sm font-bold px-4 py-2 rounded-lg transition-all shadow-lg shadow-primary/20"
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