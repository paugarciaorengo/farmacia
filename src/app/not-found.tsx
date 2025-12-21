import Link from 'next/link'
import { FileQuestion, Home } from 'lucide-react'

export default function NotFound() {
  return (
    // 🎨 Fondo global
    <div className="min-h-[80vh] bg-background flex flex-col items-center justify-center p-4 text-center animate-fade-in">
      
      <div className="bg-muted p-6 rounded-full mb-6">
        <FileQuestion size={64} className="text-muted-foreground" />
      </div>
      
      <h1 className="text-4xl font-bold text-foreground mb-2">Página no encontrada</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        Lo sentimos, la página que estás buscando no existe o ha sido movida.
      </p>

      <Link 
        href="/"
        className="flex items-center gap-2 bg-primary hover:opacity-90 text-primary-foreground font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95"
      >
        <Home size={20} />
        Volver al Inicio
      </Link>
    </div>
  )
}