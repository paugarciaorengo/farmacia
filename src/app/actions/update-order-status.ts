'use server'

import { auth } from '@/src/auth'
import { prisma } from '@/src/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateOrderStatusAction(orderId: string, newStatus: string) {
  const session = await auth()
  
  // Solo administradores o farmacéuticos pueden cambiar estados
  if (!session?.user?.id) return { error: 'No autorizado' }
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  if (!user || (user.role !== 'ADMIN' && user.role !== 'PHARMACIST')) {
    return { error: 'No tienes permisos para realizar esta acción' }
  }

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus as any }
    })

    revalidatePath('/panel/pedidos')
    return { success: true }
  } catch (error) {
    return { error: 'Error al actualizar el estado del pedido' }
  }
}