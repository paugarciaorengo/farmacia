import Link from 'next/link'
import { auth } from '@/src/auth'
import UserMenu from '@/src/features/auth/userMenu'
import NavLinks from './NavLinks' // Importamos el componente de enlaces

export default async function NavBar() {
  // 🔐 Obtenemos sesión al instante en el servidor
  const session = await auth()
  const user = session?.user

  return (
    <header className="h-16 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur flex items-center px-6 justify-between">
      {/* 1. Logo */}
      <div className="font-semibold text-lg">
        <Link href="/" className="hover:text-emerald-400 transition-colors">
          Farmacia del Carmel
        </Link>
      </div>

      {/* 2. Enlaces de navegación (Componente Cliente) */}
      <div className="mx-6 hidden md:block">
        <NavLinks />
      </div>

      {/* 3. Zona de Usuario */}
      <div className="flex items-center gap-4 text-sm">
        {/* Separador visual */}
        <span className="h-5 w-px bg-neutral-700 hidden md:block" />

        {user ? (
          // ✅ Si hay usuario: mostramos el Menú Desplegable
          <UserMenu user={user} />
        ) : (
          // ❌ Si no hay usuario: botones de Login/Registro
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-neutral-300 hover:text-white text-xs transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="rounded bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-black hover:bg-emerald-400 transition-colors"
            >
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}