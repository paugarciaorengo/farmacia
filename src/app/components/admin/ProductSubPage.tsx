// src/components/admin/ProductSubPage.tsx
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface ProductSubPageProps {
  title: string
  subtitle?: string
  productSlug: string
  user: { name?: string | null; email?: string | null; role: string }
  children: React.ReactNode
  extraHeader?: React.ReactNode
}

export function ProductSubPage({
  title,
  subtitle,
  productSlug,
  user,
  children,
  extraHeader
}: ProductSubPageProps) {
  return (
    // ✅ CAMBIO CLAVE: Añadimos 'bg-background text-foreground min-h-screen'
    // Esto fuerza al contenedor a pintar el fondo correcto del tema, arreglando el problema visual.
    <div className="min-h-screen w-full bg-background text-foreground p-6 animate-fade-in">
      
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 🔹 ENCABEZADO */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Link 
                href={`/panel/productos/${productSlug}/editar`}
                className="hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium"
              >
                <ArrowLeft size={16} />
                Volver a Edición
              </Link>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>}
          </div>

          <div className="flex flex-col items-end gap-2">
             <div className="text-xs text-right bg-muted/50 px-3 py-1.5 rounded-full border border-border">
                <span className="text-muted-foreground">Editando como: </span>
                <span className="font-medium">{user.name || user.email}</span>
                <span className="ml-2 px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold text-[10px]">
                  {user.role}
                </span>
             </div>
             {extraHeader}
          </div>
        </header>

        {/* 🔹 CONTENIDO */}
        <div className="space-y-8">
          {children}
        </div>
      </div>
    </div>
  )
}

// Subcomponente para las secciones (Tarjetas)
export function SubPageSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    // Usamos bg-card para que resalte sobre el fondo base (bg-background)
    <section className="bg-card text-card-foreground border border-border rounded-xl p-6 shadow-sm transition-colors">
      <h2 className="text-lg font-bold mb-4 pb-2 border-b border-border/50">
        {title}
      </h2>
      {children}
    </section>
  )
}