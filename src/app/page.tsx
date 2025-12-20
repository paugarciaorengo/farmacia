// app/page.tsx
import { Button } from '@/src/app/components/Button';
import { Pill, ShieldCheck, User } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo decorativo abstracto */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-emerald-500/5 blur-[120px] -z-10 rounded-full pointer-events-none" />

      <main className="container mx-auto px-6 pt-20 pb-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Texto Hero */}
          <div className="flex-1 text-center lg:text-left space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
              <ShieldCheck size={16} />
              <span>Farmacia Autorizada Online</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight tracking-tight">
              Tu salud, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                nuestra prioridad
              </span>
            </h1>
            
            <p className="text-xl text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Gestiona el catálogo de productos, stock y pedidos de tu farmacia con una interfaz profesional diseñada para el rendimiento.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/catalogo">
                <Button className="w-full sm:w-auto text-lg px-8 py-4">
                  Ver Catálogo
                </Button>
              </Link>
            </div>
          </div>

          {/* Elemento Decorativo Visual */}
          <div className="flex-1 relative animate-slide-in hidden lg:block">
            <div className="relative z-10 bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl shadow-emerald-900/20 rotate-3 hover:rotate-0 transition-transform duration-700">
              <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <Pill className="text-slate-900" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Panel Farmacia</h3>
                    <p className="text-xs text-slate-400">Estado: Activo</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>
              <div className="space-y-4 opacity-50 blur-[1px]">
                <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                <div className="h-4 bg-slate-800 rounded w-full"></div>
                <div className="h-4 bg-slate-800 rounded w-5/6"></div>
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -right-6 bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-xl flex items-center gap-3">
                <div className="bg-emerald-500/20 p-2 rounded-lg">
                  <ShieldCheck className="text-emerald-400" size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold">Sistema</p>
                  <p className="text-white font-bold">100% Seguro</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
