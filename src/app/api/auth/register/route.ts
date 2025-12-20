// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { hashPassword } from '@/src/lib/auth' // Importamos desde tu lib limpia

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    // Comprobar si existe
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'El usuario ya existe' }, { status: 400 })
    }

    // Crear usuario
    const hashedPassword = await hashPassword(password)
    await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: hashedPassword,
        role: 'CUSTOMER',
      },
    })

    // IMPORTANTE: Ya no devolvemos token ni seteamos cookies aquí.
    // El frontend redirigirá al usuario a /login tras el registro exitoso.
    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}