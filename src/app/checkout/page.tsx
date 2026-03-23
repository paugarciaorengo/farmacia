// src/app/checkout/page.tsx
import { auth } from "@/src/auth"
import { prisma } from "@/src/lib/prisma"
import { ShoppingCart } from "lucide-react"

// Importamos tus componentes desde la carpeta features
import PickupForm from "@/src/features/checkout/PickupForm"
import CheckoutSummary from "@/src/features/checkout/checkoutSummary"

export default async function CheckoutPage() {
  // 1. Comprobamos si hay un usuario logueado
  const session = await auth()
  
  let userData = undefined

  if (session?.user?.id) {
    // 2. Buscamos el nombre y el email del usuario
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, phone: true }
    })

    // 3. Buscamos su última dirección/reserva para obtener su número de teléfono
    const lastAddress = await prisma.address.findFirst({
      where: { userId: session.user.id },
      orderBy: { id: 'desc' }, // 👈 Cambiamos createdAt por id
      select: { phone: true }
    })

    // 4. Preparamos el objeto para pasarlo al formulario
    if (user) {
      userData = {
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || lastAddress?.phone || ""
      }
    }
  }

  return (
    <main className="min-h-screen bg-background p-6 md:p-12 pt-28 md:pt-32">
      <div className="max-w-6xl mx-auto">
        
        <h1 className="text-3xl font-bold flex items-center gap-3 text-foreground mb-8">
          <ShoppingCart className="text-primary" size={32} />
          Tramitar Pedido
        </h1>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Columna Izquierda: Formulario de Recogida */}
          <div className="lg:col-span-7">
            {/* 👇 AQUÍ LE PASAMOS LOS DATOS AL FORMULARIO 👇 */}
            <PickupForm initialData={userData} />
          </div>

          {/* Columna Derecha: Ticket / Resumen (El otro archivo que me pasaste) */}
          <div className="lg:col-span-5">
            <CheckoutSummary />
          </div>

        </div>
      </div>
    </main>
  )
}