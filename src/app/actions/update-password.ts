'use server'

import { auth } from '@/src/auth'
import { prisma } from '@/src/lib/prisma'
import bcrypt from 'bcryptjs'

export async function updatePasswordAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'No autorizado' }

  // 1. Recogemos los datos del formulario
  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  // 2. Validaciones básicas
  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: 'Todos los campos son obligatorios' }
  }
  if (newPassword !== confirmPassword) {
    return { error: 'Las contraseñas nuevas no coinciden' }
  }
  if (newPassword.length < 6) {
    return { error: 'La nueva contraseña debe tener al menos 6 caracteres' }
  }

  // 3. Buscamos al usuario en la base de datos
  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user || !user.passwordHash) {
    return { error: 'Hubo un problema al buscar tu cuenta' }
  }

  // 4. Comprobamos si la contraseña actual es correcta
  const isCorrect = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!isCorrect) {
    return { error: 'La contraseña actual es incorrecta' }
  }

  // 5. Encriptamos la nueva y la guardamos
  const hashedNewPassword = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: hashedNewPassword }
  })

  return { success: true }
}