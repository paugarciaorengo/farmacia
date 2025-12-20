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
