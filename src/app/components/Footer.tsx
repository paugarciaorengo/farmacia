import Link from 'next/link'
import { Plus, Facebook, Twitter, Instagram, MapPin, Phone, Mail } from 'lucide-react'

export default function Footer() {
  return (
    // 🎨 DEGRADADO: El mismo que el NavBar para consistencia visual
    <footer className="bg-gradient-to-r from-emerald-700 to-primary text-primary-foreground mt-auto shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Columna 1: Marca */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-lg border border-white/30 group-hover:scale-105 transition-transform">
                <Plus className="text-white font-bold" size={20} strokeWidth={4} />
              </div>
              <span className="text-xl font-bold">
                Farma<span className="text-emerald-200">Web</span>
              </span>
            </Link>
            <p className="text-sm text-emerald-100 leading-relaxed max-w-xs">
              Tu farmacia de confianza, ahora digital. Calidad y atención farmacéutica personalizada.
            </p>
            <div className="flex gap-4 pt-2">
              {/* Iconos sociales en blanco/transparente */}
              <a href="#" className="bg-white/10 p-2 rounded-full text-white hover:bg-white hover:text-emerald-600 transition-all shadow-sm">
                <Facebook size={18} />
              </a>
              <a href="#" className="bg-white/10 p-2 rounded-full text-white hover:bg-white hover:text-emerald-600 transition-all shadow-sm">
                <Twitter size={18} />
              </a>
              <a href="#" className="bg-white/10 p-2 rounded-full text-white hover:bg-white hover:text-emerald-600 transition-all shadow-sm">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Columna 2: Explorar */}
          <div>
            <h3 className="font-bold text-white mb-4 text-lg">Explorar</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/catalogo" className="text-emerald-100 hover:text-white hover:translate-x-1 transition-all inline-block">Catálogo</Link></li>
              <li><Link href="/ofertas" className="text-emerald-100 hover:text-white hover:translate-x-1 transition-all inline-block">Ofertas</Link></li>
              <li><Link href="/blog" className="text-emerald-100 hover:text-white hover:translate-x-1 transition-all inline-block">Blog de Salud</Link></li>
              <li><Link href="/panel" className="text-emerald-100 hover:text-white hover:translate-x-1 transition-all inline-block">Zona Privada</Link></li>
            </ul>
          </div>

          {/* Columna 3: Legal */}
          <div>
            <h3 className="font-bold text-white mb-4 text-lg">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacidad" className="text-emerald-100 hover:text-white hover:translate-x-1 transition-all inline-block">Privacidad</Link></li>
              <li><Link href="/cookies" className="text-emerald-100 hover:text-white hover:translate-x-1 transition-all inline-block">Cookies</Link></li>
              <li><Link href="/terminos" className="text-emerald-100 hover:text-white hover:translate-x-1 transition-all inline-block">Términos</Link></li>
              <li><Link href="/contacto" className="text-emerald-100 hover:text-white hover:translate-x-1 transition-all inline-block">Ayuda</Link></li>
            </ul>
          </div>

          {/* Columna 4: Contacto */}
          <div>
            <h3 className="font-bold text-white mb-4 text-lg">Contacto</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 text-emerald-100">
                <MapPin size={18} className="text-white shrink-0 mt-0.5" />
                <span>Carrer del Llobregós, 123<br/>08032 Barcelona</span>
              </li>
              <li className="flex items-center gap-3 text-emerald-100">
                <Phone size={18} className="text-white shrink-0" />
                <span>93 444 55 66</span>
              </li>
              <li className="flex items-center gap-3 text-emerald-100">
                <Mail size={18} className="text-white shrink-0" />
                <span>hola@farmaweb.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-emerald-500/30 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-emerald-200/80">
          <p>&copy; {new Date().getFullYear()} FarmaWeb S.L. Todos los derechos reservados.</p>
          <div className="flex gap-4">
             <span>Hecho con 💚</span>
          </div>
        </div>
      </div>
    </footer>
  )
}