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

  // 👇 Helper para saber si tiene permisos de gestión
  const canAccessPanel = user.role === 'ADMIN' || user.role === 'PHARMACIST'

  return (
    <div className="relative ml-3" ref={menuRef}>
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 rounded-full bg-neutral-800 p-1 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 font-bold text-white">
            {initial}
          </div>
          <span className="hidden text-neutral-200 md:block">
            {user.name || user.email}
          </span>
          <svg className={`h-4 w-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-gray-700">
          <div className="border-b px-4 py-2 text-xs text-gray-500">
            Rol: <span className="font-medium">{user.role || 'Cliente'}</span>
          </div>

          {/* ✅ CONDICIÓN: Solo mostramos el Panel si es Admin o Farmacéutico */}
          {canAccessPanel && (
            <Link
              href="/panel"
              className="block px-4 py-2 text-sm hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              Panel de Gestión
            </Link>
          )}

          {/* Opcional: Enlace para clientes (Mis Pedidos) */}
          {!canAccessPanel && (
             <Link
              href="/perfil" 
              className="block px-4 py-2 text-sm hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              Mi Perfil
            </Link>
          )}
          
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          >
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  )
}