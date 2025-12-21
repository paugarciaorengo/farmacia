import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { auth } from '@/src/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const product = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        media: { orderBy: { position: 'asc' } }, // ✅ Prisma traerá solo los campos que existen
        lots: true 
      }
    })

    if (!product) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

    const availability = product.lots.reduce((acc: number, lot: { quantity: number }) => acc + lot.quantity, 0)
    return NextResponse.json({ product, availability })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const { id } = await params
  const user = session?.user as { role?: string } | undefined

  if (!user || (user.role !== 'ADMIN' && user.role !== 'PHARMACIST')) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    
    // Filtramos campos peligrosos
    const { 
      id: _id, createdAt, updatedAt, lots, category, media, 
      price, vatRate, categoryId, imageUrl, priceCents,
      ...rest 
    } = body

    // 👇 CORRECCIÓN CLAVE: Lógica de imagen sin el campo 'type'
    if (imageUrl) {
      const existingCover = await prisma.media.findFirst({
        where: { productId: id, position: 0 }
      })

      if (existingCover) {
        await prisma.media.update({
          where: { id: existingCover.id },
          data: { url: imageUrl }
        })
      } else {
        await prisma.media.create({
          data: {
            url: imageUrl,
            alt: rest.name || 'Producto',
            productId: id,
            position: 0
            // ❌ BORRADO: type: 'IMAGE' (No existe en tu BD)
          }
        })
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...rest,
        priceCents: Number(priceCents),
        categoryId: categoryId || null,
        ...(vatRate !== undefined ? { vatRate: Number(vatRate) } : {}) 
      }
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error actualizando' }, { status: 500 })
  }
}

// DELETE (Igual que antes)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
   // ... (Mantén tu código de DELETE o usa el anterior, ese no fallaba)
   const session = await auth()
   const { id } = await params
   const user = session?.user as { role?: string } | undefined
   if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'No admin' }, { status: 403 })
   
   try {
     await prisma.product.delete({ where: { id } })
     return NextResponse.json({ success: true })
   } catch (e) {
     return NextResponse.json({ error: 'Error al borrar' }, { status: 500 })
   }
}