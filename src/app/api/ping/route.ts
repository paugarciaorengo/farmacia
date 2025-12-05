import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export async function GET() {
  // Consulta simple para verificar conexión a BD
  const productCount = await prisma.product.count()
  return NextResponse.json({ ok: true, productCount })
}
