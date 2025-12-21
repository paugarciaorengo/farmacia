'use client'

import { useState, useRef, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'

type UserMenuProps = {
  user: {
    name?: string | null
    email?: string | null
    role?: string
  }
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const initial = user.name ? user.name[0].toUpperCase() : user.email?.[0].toUpperCase() ?? 'U'

  // Helper para saber si tiene permisos de gestión
  const canAccessPanel = user.role === 'ADMIN' || user.role === 'PHARMACIST'

  return (
    <div className="relative ml-3" ref={menuRef}>
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          // 🎨 CAMBIO: bg-card, border-border, text-foreground, focus-ring-primary
          // Quitamos bg-neutral-800 y ponemos colores del tema
          className="flex items-center gap-2 rounded-full border border-border bg-card p-1 pr-3 text-sm text-foreground transition-all hover:bg-muted hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        >
          {/* Avatar: bg-primary y text-primary-foreground */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground shadow-md shadow-primary/20">
            {initial}
          </div>
          
          <span className="hidden md:block font-medium">
            {user.name || user.email}
          </span>
          
          <svg className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isOpen && (
        // 🎨 CAMBIO: Dropdown con bg-card, border-border y sombra suave
        <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl bg-card py-2 shadow-xl border border-border focus:outline-none animate-fade-in">
          
          <div className="border-b border-border px-4 py-3 text-xs text-muted-foreground">
            <p className="mb-1">Conectado como:</p>
            <p className="font-bold text-foreground truncate">{user.email}</p>
            <span className="mt-2 inline-block rounded bg-muted px-2 py-0.5 text-[10px] uppercase font-bold text-foreground border border-border">
              {user.role || 'Cliente'}
            </span>
          </div>

          {canAccessPanel && (
            <Link
              href="/panel"
              className="block px-4 py-2 text-sm text-foreground hover:bg-muted hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Panel de Gestión
            </Link>
          )}

          {!canAccessPanel && (
             <Link
              href="/perfil" 
              className="block px-4 py-2 text-sm text-foreground hover:bg-muted hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Mi Perfil
            </Link>
          )}
          
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            // Estilo de botón rojo suave para cerrar sesión
            className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors mt-1"
          >
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  )
}