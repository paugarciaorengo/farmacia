import Link from "next/link";
import { Search, MapPin, Clock, ArrowRight, ShieldCheck, Truck, Phone } from "lucide-react";

export default function Home() {
  return (
    // 🎨 Fondo global
    <div className="min-h-screen bg-background">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground tracking-tight">
              Tu salud, nuestra <span className="text-primary">prioridad</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Farmacia del Carmel: atención farmacéutica personalizada, ahora digitalizada para tu comodidad. Haz tu pedido online y recoge sin colas.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link 
                href="/catalogo"
                className="w-full sm:w-auto px-8 py-4 bg-primary hover:opacity-90 text-primary-foreground rounded-xl font-bold text-lg shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2"
              >
                <Search size={20} /> Ver Catálogo
              </Link>
              <Link 
                href="/contacto"
                className="w-full sm:w-auto px-8 py-4 bg-card hover:bg-muted text-foreground border border-border rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
              >
                <MapPin size={20} className="text-primary" /> Dónde estamos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tarjeta de Estado de la Farmacia (Floating Card) */}
      <section className="container mx-auto px-4 -mt-20 relative z-20">
        <div className="bg-card border border-border rounded-2xl shadow-xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8 backdrop-blur-sm">
          
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-xl text-primary">
              <Clock size={28} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Horario Hoy</h3>
              <p className="text-muted-foreground">09:00 - 21:00</p>
              <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                ABIERTO
              </span>
            </div>
          </div>

          <div className="flex items-start gap-4 border-t md:border-t-0 md:border-l border-border pt-6 md:pt-0 md:pl-8">
            <div className="bg-primary/10 p-3 rounded-xl text-primary">
              <MapPin size={28} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Recogida Express</h3>
              <p className="text-muted-foreground">C/ Llobregós 123, BCN</p>
              <Link href="/contacto" className="text-sm font-medium text-primary hover:underline mt-1 inline-block">
                Ver mapa →
              </Link>
            </div>
          </div>

          <div className="flex items-start gap-4 border-t md:border-t-0 md:border-l border-border pt-6 md:pt-0 md:pl-8">
             <div className="bg-primary/10 p-3 rounded-xl text-primary">
              <Phone size={28} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Atención Directa</h3>
              <p className="text-muted-foreground">¿Dudas con tu medicación?</p>
              <p className="text-lg font-bold text-foreground mt-1">93 444 55 66</p>
            </div>
          </div>

        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: ShieldCheck, title: "Farmacia Certificada", desc: "Todos nuestros productos son originales y cuentan con garantía sanitaria." },
                { icon: Truck, title: "Click & Collect", desc: "Reserva online y recoge tu pedido preparado en menos de 2 horas." },
                { icon: Phone, title: "Consejo Farmacéutico", desc: "Equipo profesional disponible para resolver tus dudas de salud." }
              ].map((item, i) => (
                <div key={i} className="bg-card p-8 rounded-2xl border border-border hover:border-primary/30 transition-colors group">
                  <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                    <item.icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
           </div>
        </div>
      </section>
    </div>
  );
}