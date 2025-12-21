import Link from 'next/link'
import { Plus, Facebook, Twitter, Instagram, MapPin, Phone, Mail } from 'lucide-react'

export default function Footer() {
  return (
    // 🎨 Usamos bg-muted para un contraste suave con el fondo blanco de la web
    <footer className="bg-muted border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Columna 1: Marca y Slogan */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-primary p-1.5 rounded-lg shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                <Plus className="text-primary-foreground font-bold" size={20} strokeWidth={4} />
              </div>
              <span className="text-xl font-bold text-foreground">
                Farma<span className="text-primary">Web</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tu farmacia de confianza, ahora digital. Calidad, atención farmacéutica personalizada y rapidez en cada pedido.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="bg-background p-2 rounded-full text-muted-foreground hover:text-primary hover:shadow-md transition-all">
                <Facebook size={18} />
              </a>
              <a href="#" className="bg-background p-2 rounded-full text-muted-foreground hover:text-primary hover:shadow-md transition-all">
                <Twitter size={18} />
              </a>
              <a href="#" className="bg-background p-2 rounded-full text-muted-foreground hover:text-primary hover:shadow-md transition-all">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Columna 2: Explorar */}
          <div>
            <h3 className="font-bold text-foreground mb-4">Explorar</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/catalogo" className="text-muted-foreground hover:text-primary transition-colors">Catálogo Completo</Link></li>
              <li><Link href="/ofertas" className="text-muted-foreground hover:text-primary transition-colors">Ofertas del Mes</Link></li>
              <li><Link href="/servicios" className="text-muted-foreground hover:text-primary transition-colors">Servicios Salud</Link></li>
              <li><Link href="/panel" className="text-muted-foreground hover:text-primary transition-colors">Acceso Profesional</Link></li>
            </ul>
          </div>

          {/* Columna 3: Legal */}
          <div>
            <h3 className="font-bold text-foreground mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacidad" className="text-muted-foreground hover:text-primary transition-colors">Política de Privacidad</Link></li>
              <li><Link href="/cookies" className="text-muted-foreground hover:text-primary transition-colors">Política de Cookies</Link></li>
              <li><Link href="/terminos" className="text-muted-foreground hover:text-primary transition-colors">Términos y Condiciones</Link></li>
              <li><Link href="/contacto" className="text-muted-foreground hover:text-primary transition-colors">Contacto / Ayuda</Link></li>
            </ul>
          </div>

          {/* Columna 4: Contacto */}
          <div>
            <h3 className="font-bold text-foreground mb-4">Farmacia del Carmen</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 text-muted-foreground">
                <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                <span>Rambla del Carmel, 78<br/>08032 Barcelona</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Phone size={18} className="text-primary shrink-0" />
                <span>93 444 55 66</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Mail size={18} className="text-primary shrink-0" />
                <span>hola@farmaweb.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} FarmaWeb S.L. Todos los derechos reservados.</p>
          <div className="flex gap-4">
             <span>Hecho con ❤️ para cuidar de ti</span>
          </div>
        </div>
      </div>
    </footer>
  )
}