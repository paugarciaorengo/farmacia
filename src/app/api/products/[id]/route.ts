import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { auth } from '@/src/auth'

interface ExtendedUser {
  role?: string
}

// ✅ GET: Obtener producto por ID o Slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: id },
          { slug: id }
        ]
      },
      include: {
        media: { orderBy: { position: 'asc' } },
        lots: true 
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    // Tipamos explícitamente para evitar errores de TS
    const availability = product.lots.reduce((acc: number, lot: { quantity: number }) => acc + lot.quantity, 0)

    return NextResponse.json({ product, availability })
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener producto' }, { status: 500 })
  }
}

// 🔐 PATCH: Editar producto
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const { id } = await params
  const user = session?.user as ExtendedUser | undefined

  if (!user || (user.role !== 'ADMIN' && user.role !== 'PHARMACIST')) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    
    // 👇 DESESTRUCTURACIÓN: Sacamos 'price' para que no rompa Prisma
    const { 
      id: _id,          // Ignorar ID
      createdAt,        // Ignorar fechas auto
      updatedAt,        // Ignorar fechas auto
      lots,             // Ignorar array de lotes
      category,         // Ignorar objeto categoría
      media,            // Se gestiona aparte
      imageUrl,         // Se gestiona aparte
      priceCents,       // Lo usaremos convertido
      price,            // 🚨 EXCLUIMOS ESTE CAMPO (Causante del error)
      vatRate,          // Lo tratamos aparte
      categoryId,
      ...rest           // Nos quedamos con: name, slug, description, sku, etc.
    } = body

    // Gestión de Imagen
    if (imageUrl) {
      await prisma.media.deleteMany({ where: { productId: id } })
      await prisma.media.create({
        data: {
          url: imageUrl,
          type: 'IMAGE',
          alt: rest.name || 'Producto',
          productId: id,
          position: 1
        }
      })
    }

    // Actualización
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...rest, // Aquí ya no está 'price', así que funcionará ✅
        priceCents: Number(priceCents),
        categoryId: categoryId || null,
        // Solo actualizamos vatRate si nos lo envían, si no, se mantiene
        ...(vatRate !== undefined ? { vatRate: Number(vatRate) } : {}) 
      }
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Error PATCH:', error)
    return NextResponse.json({ error: 'Error actualizando producto' }, { status: 500 })
  }
}

// 🔐 DELETE: Borrar producto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const { id } = await params
  const user = session?.user as ExtendedUser | undefined

  if (!user || user.role !== 'ADMIN') { 
    return NextResponse.json({ error: 'Solo administradores pueden borrar' }, { status: 403 })
  }

  try {
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'No se puede borrar. Puede tener pedidos asociados.' }, { status: 500 })
  }
}