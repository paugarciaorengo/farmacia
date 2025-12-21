import { auth } from '@/src/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/src/lib/prisma'
import ProductForm from '@/src/features/admin/ProductForm'

// Igual que antes, definimos el tipo para el rol
interface ExtendedUser {
  role?: string
}

export default async function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth()
  const { slug } = await params

  const user = session?.user as ExtendedUser | undefined

  if (!user || (user.role !== 'ADMIN' && user.role !== 'PHARMACIST')) {
    redirect('/panel')
  }

  // 1. Buscamos el producto
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { media: true }
  })

  if (!product) notFound()

  // 2. Buscamos categorías
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true }
  })

  return (
    <main className="min-h-screen bg-background p-6 md:p-12">
      <ProductForm 
        categories={categories} 
        initialData={{
          ...product,
          categoryId: product.categoryId || '',
          // 👇 Aquí corregimos el error del parámetro 'm' tipándolo explícitamente
          media: product.media.map((m: { url: string }) => ({ url: m.url }))
        }}
      />
    </main>
  )
}