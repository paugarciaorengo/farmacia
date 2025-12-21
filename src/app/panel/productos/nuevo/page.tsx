import { auth } from '@/src/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/src/lib/prisma'
import ProductForm from '@/src/features/admin/ProductForm'

// Definimos un tipo local para evitar el error de "Property 'role' does not exist"
interface ExtendedUser {
  role?: string
}

export default async function NewProductPage() {
  const session = await auth()
  
  // Hacemos un "cast" (as) para decirle a TS que el usuario tiene un rol
  const user = session?.user as ExtendedUser | undefined
  
  // Usamos el usuario casteado para la comprobación
  if (!user || (user.role !== 'ADMIN' && user.role !== 'PHARMACIST')) {
    redirect('/panel')
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true }
  })

  return (
    <main className="min-h-screen bg-background p-6 md:p-12">
      <ProductForm categories={categories} />
    </main>
  )
}