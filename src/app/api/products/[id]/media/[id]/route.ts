import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { auth } from '@/src/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Esperamos los parámetros (Obligatorio en Next.js 15)
  const { id } = await params 
  const session = await auth()

  // 2. Seguridad básica
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  // (Opcional) Verificar rol si quieres ser estricto
  // const user = await prisma.user.findUnique(...) 

  try {
    const formData = await req.formData()
    // Leemos qué botón pulsó el usuario ("delete" o "update")
    const action = formData.get('_action') as string 

    console.log(`📷 Procesando imagen ${id}. Acción: ${action}`) // Log para depurar

    // 3. Buscamos la imagen para saber a qué producto volver luego
    const media = await prisma.media.findUnique({
      where: { id },
      include: { product: true }
    })

    if (!media) {
      return NextResponse.json({ error: 'Imagen no encontrada' }, { status: 404 })
    }

    const productSlug = media.product?.slug

    // 4. Ejecutamos la acción
    if (action === 'delete') {
      await prisma.media.delete({
        where: { id }
      })
      console.log('✅ Imagen eliminada correctamente')
    } 
    else if (action === 'update') {
      const url = String(formData.get('url') ?? '').trim()
      const alt = String(formData.get('alt') ?? '').trim()
      const position = formData.get('position')

      await prisma.media.update({
        where: { id },
        data: {
          url,
          alt,
          position: position ? Number(position) : 0
        }
      })
      console.log('✅ Imagen actualizada')
    }

    // 5. Redirección forzada (303) para recargar la página del panel
    if (productSlug) {
      return NextResponse.redirect(
        new URL(`/panel/productos/${productSlug}/imagenes`, req.url),
        303
      )
    } else {
      return NextResponse.json({ success: true })
    }

  } catch (error) {
    console.error('❌ Error gestionando imagen:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}