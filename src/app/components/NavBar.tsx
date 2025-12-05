'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface UserInfo {
  id: string
  email: string
  name: string | null
  role: string
}

const links = [
  { href: '/', label: 'Inicio' },
  { href: '/catalogo', label: 'Catálogo' },
]

export default function NavBar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<UserInfo | null>(null)
  const [checking, setChecking] = useState(true)

  // Al montar, consultamos /api/auth/me
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        })
        const data = await res.json()
        if (data.loggedIn && data.user) {
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch (e) {
        console.error(e)
        setUser(null)
      } finally {
        setChecking(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      setUser(null)
      router.push('/login')
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <header className="h-16 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur flex items-center px-6">
      <div className="flex-1 font-semibold">
        <Link href="/">Farmacia del Carmel</Link>
      </div>

      <nav className="flex items-center gap-4 text-sm">
        {links.map(link => {
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={
                active
                  ? 'text-emerald-400 font-medium'
                  : 'text-neutral-300 hover:text-white'
              }
            >
              {link.label}
            </Link>
          )
        })}

        {/* Separador */}
        <span className="mx-2 h-5 w-px bg-neutral-700" />

        {checking ? (
          <span className="text-xs text-neutral-400">Comprobando...</span>
        ) : user ? (
          <>
            <span className="text-xs text-neutral-300">
              {user.name ?? user.email}
            </span>
            <button
              onClick={handleLogout}
              className="rounded bg-neutral-800 px-3 py-1 text-xs hover:bg-neutral-700"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-neutral-300 hover:text-white text-xs"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="rounded bg-emerald-500 px-3 py-1 text-xs font-semibold text-black hover:bg-emerald-400"
            >
              Registrarse
            </Link>
          </>
        )}
      </nav>
    </header>
  )
}
