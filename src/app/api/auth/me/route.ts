import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/src/lib/prisma'
import { verifyAuthToken } from '@/src/lib/auth'

export async function GET(req: Request) {
  const cookieStore = await cookies() // 👈 añadimos await
  const tokenCookie = cookieStore.get('auth_token')
  const cookieToken = tokenCookie?.value ?? null

  const authHeader = req.headers.get('authorization')
  const headerToken =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : null

  const token = cookieToken ?? headerToken

  if (!token) {
    return NextResponse.json(
      {
        loggedIn: false,
        reason: 'no-token',
      },
      { status: 200 }
    )
  }

  const payload = verifyAuthToken(token)
  if (!payload || !payload.userId) {
    return NextResponse.json(
      {
        loggedIn: false,
        reason: 'invalid-token',
      },
      { status: 200 }
    )
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  })

  if (!user) {
    return NextResponse.json(
      {
        loggedIn: false,
        reason: 'user-not-found',
      },
      { status: 200 }
    )
  }

  return NextResponse.json(
    {
      loggedIn: true,
      user,
    },
    { status: 200 }
  )
}
