// src/app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

// 🔹 GET -> listado de productos para el catálogo y el panel
// (con búsqueda, paginación, filtro sin receta y por categoría)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("search") ?? "";
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = 24;

  const noRxParam = searchParams.get("noRx");
  const onlyNonPrescription =
    noRxParam === "1" || noRxParam === "true";

  const categoryId = searchParams.get("categoryId") ?? "";

  const where: any = { active: true };
  if (q) where.name = { contains: q, mode: "insensitive" };
  if (onlyNonPrescription) where.isPrescription = false;
  if (categoryId) where.categoryId = categoryId; // 👈 filtro por categoría

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        priceCents: true,
        vatRate: true,
        isPrescription: true,
        media: {
          orderBy: { position: "asc" },
          take: 1,
          select: { url: true, alt: true },
        },
        lots: { select: { quantity: true, reserved: true } },
      },
      take: pageSize,
      skip: (page - 1) * pageSize,
      orderBy: { name: "asc" },
    }),
    prisma.product.count({ where }),
  ]);

  type Lot = { quantity: number; reserved: number };
  type ItemWithLots = (typeof items)[number];

  const withAvailability = items.map((item: ItemWithLots) => {
    const availability = item.lots.reduce(
      (acc: number, lot: Lot) => acc + (lot.quantity - lot.reserved),
      0
    );

    const { lots, ...rest } = item;
    return {
      ...rest,
      availability,
    };
  });

  return NextResponse.json({
    items: withAvailability,
    total,
    page,
    pageSize,
  });
}

// 🔸 POST -> crear producto nuevo (sin cambios)
// src/app/api/products/route.ts  (POST)
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const name = form.get("name")?.toString() ?? "";
    const sku = form.get("sku")?.toString() ?? "";
    const farmaticCode = form.get("farmaticCode")?.toString() ?? "";
    const priceStr = form.get("price")?.toString() ?? "";
    const slug = form.get("slug")?.toString() ?? "";
    const vatRateStr = form.get("vatRate")?.toString() ?? "21";
    const isPrescription = form.get("isPrescription") === "on";
    const active = form.get("active") === "true";

    const imageUrl = form.get("imageUrl")?.toString() ?? "";
    const imageAlt = form.get("imageAlt")?.toString() ?? "";

    // 👇 NUEVO: categoría opcional
    const categoryId = form.get("categoryId")?.toString() ?? "";

    const price = parseFloat(priceStr);
    const vatRate = parseFloat(vatRateStr);

    if (!name || !slug || !sku || isNaN(price) || isNaN(vatRate)) {
      return NextResponse.json(
        { error: "Datos inválidos" },
        { status: 400 }
      );
    }

    await prisma.product.create({
      data: {
        name,
        slug,
        sku,
        farmaticCode: farmaticCode || null,
        priceCents: Math.round(price * 100),
        vatRate,
        isPrescription,
        active,
        // 👇 guardamos la categoría si viene
        categoryId: categoryId || null,
        ...(imageUrl
          ? {
              media: {
                create: {
                  url: imageUrl,
                  alt: imageAlt || name,
                  position: 0,
                },
              },
            }
          : {}),
      },
    });

    return NextResponse.redirect(
      new URL("/panel/productos", req.url)
    );
  } catch (err) {
    console.error("Error al crear producto:", err);
    return NextResponse.json(
      { error: "Error al crear producto" },
      { status: 500 }
    );
  }
}

