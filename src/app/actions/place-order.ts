'use server'

// 👇 1. Importamos "Prisma" para poder usar sus tipos (TransactionClient)
import { Prisma } from '@prisma/client'
import { prisma } from '@/src/lib/prisma'

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
    // 👇 2. Tipamos explícitamente "tx" como Prisma.TransactionClient
    const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      
      let totalCents = 0
      
      for (const item of cartItems) {
        totalCents += (item.price * 100) * item.quantity

        const lots = await tx.stockLot.findMany({
          where: { productId: item.id, quantity: { gt: 0 } },
          orderBy: { expiresAt: 'asc' } 
        })

        // 👇 3. Ayudamos a "reduce" diciéndole que el acumulador es un número
        // (Aunque al arreglar "tx", esto suele arreglarse solo, lo ponemos por seguridad)
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

      const newOrder = await tx.order.create({
        data: {
          status: 'PENDING_PAYMENT',
          totalCents: totalCents,
          shippingAddr: {
            create: {
              fullName: customer.name,
              phone: customer.phone,
              line1: "Recogida en Farmacia", 
              city: "Farmacia",
              province: "-",
              postal: "00000",
              country: "ES"
            }
          },
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

      return newOrder
    })

    return { success: true, orderId: order.id }

  } catch (error: any) {
    console.error("Error creando pedido:", error)
    return { error: error.message || "Error al procesar el pedido" }
  }
}