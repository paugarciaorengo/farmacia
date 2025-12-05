import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const cat = await prisma.category.upsert({
    where: { slug: 'analgesicos' },
    update: {},
    create: { name: 'Analgésicos', slug: 'analgesicos' }
  })

  const p1 = await prisma.product.upsert({
    where: { sku: 'IBU-400' },
    update: {},
    create: {
      name: 'Ibuprofeno 400 mg 20 comp.',
      slug: 'ibuprofeno-400-20',
      sku: 'IBU-400',
      ean: '1234567890001',
      farmaticCode: 'FARMATIC-IBU-400',
      description: 'Analgésico y antiinflamatorio.',
      priceCents: 495,
      vatRate: '10.00',
      categoryId: cat.id,
      media: { create: [{ url: '/img/ibuprofeno.jpg', alt: 'Ibuprofeno 400' }] }
    }
  })

  const p2 = await prisma.product.upsert({
    where: { sku: 'PARA-650' },
    update: {},
    create: {
      name: 'Paracetamol 650 mg 20 comp.',
      slug: 'paracetamol-650-20',
      sku: 'PARA-650',
      ean: '1234567890002',
      farmaticCode: 'FARMATIC-PARA-650',
      description: 'Analgésico.',
      priceCents: 425,
      vatRate: '10.00',
      categoryId: cat.id,
      media: { create: [{ url: '/img/paracetamol.jpg', alt: 'Paracetamol 650' }] }
    }
  })

  const p3 = await prisma.product.upsert({
    where: { sku: 'DOLO-GEL' },
    update: {},
    create: {
      name: 'Dolo Gel 100 g',
      slug: 'dolo-gel-100',
      sku: 'DOLO-GEL',
      ean: '1234567890003',
      farmaticCode: 'FARMATIC-DOLO-GEL',
      description: 'Gel tópico.',
      priceCents: 695,
      vatRate: '21.00',
      categoryId: cat.id,
      media: { create: [{ url: '/img/dolo.jpg', alt: 'Dolo Gel' }] }
    }
  })

  await prisma.stockLot.createMany({
    data: [
      { productId: p1.id, lotCode: 'L2026A', expiresAt: new Date('2026-03-31'), quantity: 40 },
      { productId: p2.id, lotCode: 'L2025B', expiresAt: new Date('2025-12-31'), quantity: 60 },
      { productId: p3.id, lotCode: 'L2027C', expiresAt: new Date('2027-06-30'), quantity: 25 },
    ],
    skipDuplicates: true
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
