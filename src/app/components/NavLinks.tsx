'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Inicio' },
  { href: '/catalogo', label: 'Catálogo' },
]

export default function NavLinks() {
  const pathname = usePathname()

  return (
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
    </nav>
  )
}