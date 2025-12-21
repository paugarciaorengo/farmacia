import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { auth } from '@/src/auth'

// Interfaz para el rol de usuario
interface ExtendedUser {
  role?: string
}

// ✅ GET: Obtener producto por ID o Slug (Público)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    // Buscamos usando findFirst con OR para que funcione si pasas un ID o un Slug
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: id },   // Caso 1: Es un ID (ej: uuid-123-456)
          { slug: id }  // Caso 2: Es un slug (ej: ibuprofeno-600)
        ]
      },
      include: {
        media: {
          orderBy: { position: 'asc' }
        },
        lots: true // Necesitamos los lotes para calcular el stock real
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    // Calculamos el stock total sumando las cantidades de los lotes
    const availability = product.lots.reduce((acc: number, lot: { quantity: number }) => acc + lot.quantity, 0)

    // Devolvemos exactamente la estructura que espera tu página de producto
    return NextResponse.json({
      product,
      availability
    })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al obtener producto' }, { status: 500 })
  }
}

// 🔐 PATCH: Editar producto (Solo Admin/Farmacéutico)
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
    const { imageUrl, priceCents, media, ...data } = body

    // Si nos envían una URL de imagen, actualizamos la galería
    if (imageUrl) {
      await prisma.media.deleteMany({ where: { productId: id } })
      await prisma.media.create({
        data: {
          url: imageUrl,
          type: 'IMAGE',
          alt: data.name || 'Producto',
          productId: id,
          position: 1
        }
      })
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        priceCents: Number(priceCents),
      }
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    return NextResponse.json({ error: 'Error actualizando producto' }, { status: 500 })
  }
}

// 🔐 DELETE: Borrar producto (Solo Admin)
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
    await prisma.product.delete({
      where: { id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'No se puede borrar. Puede tener pedidos asociados.' }, { status: 500 })
  }
}