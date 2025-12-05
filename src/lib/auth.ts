import bcrypt from 'bcryptjs'
import jwt, { JwtPayload } from 'jsonwebtoken'

// Forzamos a TypeScript a tratarlo como string
const AUTH_SECRET = process.env.AUTH_SECRET as string

if (!AUTH_SECRET) {
  throw new Error('AUTH_SECRET is not set in .env')
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

// Payload que vamos a usar en nuestros tokens
export interface AuthPayload extends JwtPayload {
  userId: string
}

export function signAuthToken(payload: { userId: string }): string {
  // AUTH_SECRET ahora es string (no undefined)
  return jwt.sign(payload, AUTH_SECRET, { expiresIn: '7d' })
}

export function verifyAuthToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, AUTH_SECRET) as AuthPayload | string

    // jwt.verify puede devolver string o JwtPayload → comprobamos
    if (!decoded || typeof decoded === 'string') {
      return null
    }

    if (!decoded.userId) {
      return null
    }

    return { userId: decoded.userId }
  } catch (err) {
    console.error('Error verifying token:', err)
    return null
  }
}
