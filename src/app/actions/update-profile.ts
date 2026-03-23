'use server'

import { auth } from '@/src/auth'
import { prisma } from '@/src/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateProfileAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'No autorizado' }

  const name = formData.get('name') as string
  const phone = formData.get('phone') as string // 👈 Recogemos el teléfono

  await prisma.user.update({
    where: { id: session.user.id },
    data: { 
      name: name,
      phone: phone // 👈 Lo guardamos en la base de datos
    }
  })

  // Refrescamos ambas páginas para que los cambios se vean al instante
  revalidatePath('/perfil')
  revalidatePath('/checkout') 
  
  return { success: true }
}