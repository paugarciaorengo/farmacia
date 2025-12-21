// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { auth } from '@/src/auth'

// Definimos la interfaz para evitar errores de TypeScript con 'role'
interface ExtendedUser {
  role?: string
}

// PATCH: Editar un producto existente
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const { id } = await params
  
  // Casting del usuario para poder leer el rol
  const user = session?.user as ExtendedUser | undefined

  if (!user || (user.role !== 'ADMIN' && user.role !== 'PHARMACIST')) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    // Extraemos campos especiales
    const { imageUrl, priceCents, media, ...data } = body

    // Lógica simple de imagen: si nos mandan una nueva, reemplazamos las anteriores
    // (Esto es opcional, depende de cómo quieras gestionar la galería)
    if (imageUrl) {
      // Borramos imágenes anteriores asociadas a este producto
      await prisma.media.deleteMany({ where: { productId: id } })
      
      // Creamos la nueva
      await prisma.media.create({
        data: {
          url: imageUrl,
          type: 'IMAGE',
          alt: data.name || 'Imagen de producto',
          productId: id,
          position: 1
        }
      })
    }

    // Actualizamos el producto
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        priceCents: Number(priceCents),
      }
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Error actualizando:', error)
    return NextResponse.json({ error: 'Error actualizando producto' }, { status: 500 })
  }
}

// DELETE: Borrar un producto
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