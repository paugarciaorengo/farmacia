import { redirect } from 'next/navigation'
import { auth } from '@/src/auth' // <--- Usamos el nuevo sistema de Auth
import { prisma } from '@/src/lib/prisma'

export default async function PanelPage() {
  // 1. Obtenemos la sesión
  const session = await auth()

  // 2. Si no hay usuario logueado, fuera
  if (!session?.user?.id) {
    redirect('/login')
  }

  // 3. Buscamos al usuario en la BD para confirmar su rol real
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  })

  // Seguridad extra: si el usuario fue borrado de la BD pero tiene cookie
  if (!user) {
    redirect('/login')
  }

  // 4. Protección de Rol (Solo Admin y Farmacéuticos)
  if (user.role !== 'ADMIN' && user.role !== 'PHARMACIST') {
    redirect('/catalogo')
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-2">
        Panel profesional de la farmacia
      </h1>
      <p className="text-sm text-neutral-300 mb-6">
        Bienvenido, {user.name ?? user.email}. Rol: {user.role}
      </p>

      <section className="grid gap-4 md:grid-cols-3">
        <a
          href="/panel/productos"
          className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 hover:border-emerald-500 hover:shadow-md"
        >
          <h2 className="mb-1 text-sm font-semibold">Gestión de productos</h2>
          <p className="text-xs text-neutral-400">
            Consulta y revisa el catálogo de medicamentos y parafarmacia.
          </p>
        </a>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 opacity-60">
          <h2 className="mb-1 text-sm font-semibold">Pedidos</h2>
          <p className="text-xs text-neutral-400">
            Próximamente: seguimiento de pedidos y dispensación.
          </p>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 opacity-60">
          <h2 className="mb-1 text-sm font-semibold">Stock y lotes</h2>
          <p className="text-xs text-neutral-400">
            Próximamente: gestión de lotes, caducidades y trazabilidad.
          </p>
        </div>
      </section>
    </main>
  )
}