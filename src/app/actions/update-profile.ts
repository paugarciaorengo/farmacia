'use server'

import { auth } from '@/src/auth'
import { prisma } from '@/src/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateProfileAction(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { error: 'No autorizado' }
  }

  const name = formData.get('name') as string

  try {
    // Actualizamos el nombre en la base de datos
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: name }
    })

    // Refrescamos la página para que se vea el nuevo nombre
    revalidatePath('/perfil')
    return { success: true }
  } catch (error) {
    return { error: 'Error al actualizar el perfil' }
  }
}