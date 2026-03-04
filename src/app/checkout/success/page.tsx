import Link from 'next/link'
import { CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react'

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ orderId: string }> }) {
  const { orderId } = await searchParams

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in pt-24">
      
      {/* Icono Gigante */}
      <div className="bg-green-100 p-6 rounded-full mb-6 shadow-sm ring-8 ring-green-50">
        <CheckCircle className="w-16 h-16 text-green-600" />
      </div>
      
      <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-gray-900 tracking-tight">
        ¡Reserva Confirmada!
      </h1>
      
      <p className="text-gray-500 max-w-lg text-lg mb-10 leading-relaxed">
        Gracias por confiar en nosotros. Hemos recibido tu pedido y nuestro equipo ya está manos a la obra.
      </p>

      {/* ⚠️ AVISO IMPORTANTE (Estrategia Anti-Colisión) */}
      <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl max-w-md mx-auto mb-10 text-left shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
        <div className="flex gap-4">
            <AlertTriangle className="text-amber-600 shrink-0 mt-1" size={24} />
            <div>
                <h3 className="font-bold text-amber-900 mb-1 text-lg">Información Importante</h3>
                <p className="text-sm text-amber-800 leading-relaxed">
                    Por favor, <strong>espera a recibir nuestro email de confirmación</strong> ("Listo para recoger") antes de venir a la farmacia. 
                    <br/><br/>
                    Así te aseguras de que tu pedido está preparado en mostrador y te ahorras esperas innecesarias.
                </p>
            </div>
        </div>
      </div>

      {/* Referencia */}
      <div className="bg-gray-50 px-8 py-4 rounded-xl border border-gray-200 mb-10 inline-block">
        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block mb-1">Referencia del Pedido</span>
        <p className="text-2xl font-mono font-bold text-primary tracking-widest select-all">
            {orderId ? orderId.split('-')[0].toUpperCase() : 'PENDIENTE'}
        </p>
      </div>

      <Link 
        href="/"
        className="group bg-gray-900 text-white px-8 py-3.5 rounded-full font-bold hover:bg-black transition-all flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        Volver a la Tienda
        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  )
}