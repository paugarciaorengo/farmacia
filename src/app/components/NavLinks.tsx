'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavLinks() {
  const pathname = usePathname()

  const links = [
    { name: 'Inicio', href: '/' },
    { name: 'Catálogo', href: '/catalogo' },
    // { name: 'Servicios', href: '/servicios' }, // Si tienes más
  ]

  return (
    <nav className="flex items-center gap-6">
      {links.map((link) => {
        const isActive = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive 
                ? 'text-primary font-bold' 
                : 'text-muted-foreground' // Color suave por defecto
            }`}
          >
            {link.name}
          </Link>
        )
      })}
    </nav>
  )
}