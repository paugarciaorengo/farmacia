// src/app/actions/place-order.ts
'use server'

import { Prisma } from '@prisma/client'
import { prisma } from '@/src/lib/prisma'
// 👇 Importamos la autenticación
import { auth } from '@/src/auth'

type CartItem = {
  id: string
  quantity: number
  price: number
}

type CustomerData = {
  name: string
  email: string
  phone: string
}

export async function placeOrderAction(customer: CustomerData, cartItems: CartItem[]) {
  if (!cartItems.length) return { error: "El carrito está vacío" }

  try {
    // 1. Obtenemos la sesión del usuario (si está logueado)
    const session = await auth()
    const userId = session?.user?.id || null // Será null si compra como invitado

    const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      
      let totalCents = 0
      
      for (const item of cartItems) {
        totalCents += (item.price * 100) * item.quantity

        const lots = await tx.stockLot.findMany({
          where: { productId: item.id, quantity: { gt: 0 } },
          orderBy: { expiresAt: 'asc' } 
        })

        const totalStock = lots.reduce((acc: number, lot) => acc + lot.quantity, 0)

        if (totalStock < item.quantity) {
           throw new Error(`Lo sentimos, de algún producto solo quedan ${totalStock} unidades.`)
        }

        let quantityNeeded = item.quantity

        for (const lot of lots) {
          if (quantityNeeded === 0) break

          const deduct = Math.min(lot.quantity, quantityNeeded)
          
          await tx.stockLot.update({
            where: { id: lot.id },
            data: { 
              quantity: { decrement: deduct },
              reserved: { increment: deduct }
            }
          })
          
          quantityNeeded -= deduct
        }
      }

      // E. CREAR LA DIRECCIÓN PRIMERO
      const address = await tx.address.create({
        data: {
          userId: userId, // Así la dirección también se guarda en la libreta del cliente
          fullName: customer.name,
          phone: customer.phone,
          line1: "Recogida en Farmacia", 
          city: "Farmacia",
          province: "-",
          postal: "00000",
          country: "ES"
        }
      })

      // F. CREAR EL PEDIDO CON LOS IDs
      const newOrder = await tx.order.create({
        data: {
          userId: userId, 
          shippingAddrId: address.id, // 👈 Pasamos el ID directamente, sin mezclar
          status: 'PREPARING',
          totalCents: totalCents,
          items: {
            create: cartItems.map(item => ({
              productId: item.id,
              qty: item.quantity,
              unitPriceCents: item.price * 100,
              vatRate: 21 
            }))
          }
        }
      })

      // 👇 CUIDADO AQUÍ: Tenemos que devolver el pedido dentro de la transacción
      return newOrder

    }) // 👇 FALTABA ESTE CIERRE DE LA TRANSACCIÓN

    // Al salir de la transacción, ya tenemos "order" con su ID
    return { success: true, orderId: order.id }

  } catch (error: any) {
    console.error("Error creando pedido:", error)
    return { error: error.message || "Error al procesar el pedido" }
  }
}