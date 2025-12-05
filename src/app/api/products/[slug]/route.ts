// src/app/api/products/[slug]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

// GET /api/products/:slug  -> usado por /producto/[slug]
export async function GET(_req: Request, { params }: RouteContext) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      priceCents: true,
      active: true,
      // 👇 AHORA devolvemos TODAS las imágenes, ordenadas por posición
      media: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          url: true,
          alt: true,
          position: true,
        },
      },
      // 👇 lots solo para calcular disponibilidad
      lots: {
        select: {
          quantity: true,
          reserved: true,
        },
      },
    },
  });

  if (!product) {
    return NextResponse.json(
      { error: "Producto no encontrado" },
      { status: 404 }
    );
  }

  type LotInfo = { quantity: number; reserved: number };

  const availability = product.lots.reduce(
    (acc: number, lot: LotInfo) => acc + (lot.quantity - lot.reserved),
    0
  );

  // Sacamos lots para no enviarlos al front
  const { lots, ...productData } = product;

  return NextResponse.json({ product: productData, availability });
}

// POST /api/products/:slug  -> usado por el formulario de edición
export async function POST(req: Request, { params }: RouteContext) {
  try {
    const { slug: currentSlug } = await params;

    const form = await req.formData();

    const name = form.get("name")?.toString() ?? "";
    const priceStr = form.get("price")?.toString() ?? "";
    const newSlug = form.get("slug")?.toString() ?? currentSlug;
    const active = form.get("active") === "true";
    const sku = form.get("sku")?.toString() ?? "";
    const farmaticCode = form.get("farmaticCode")?.toString() ?? "";
    const vatRateStr = form.get("vatRate")?.toString() ?? "21";
    const isPrescription = form.get("isPrescription") === "on";

    // 👇 NUEVO: categoría opcional
    const categoryId = form.get("categoryId")?.toString() ?? "";

    const price = parseFloat(priceStr);
    const vatRate = parseFloat(vatRateStr);

    if (!name || !newSlug || !sku || isNaN(price) || isNaN(vatRate)) {
      return NextResponse.json(
        { error: "Datos inválidos" },
        { status: 400 }
      );
    }

    await prisma.product.update({
      where: { slug: currentSlug },
      data: {
        name,
        slug: newSlug,
        sku,
        farmaticCode: farmaticCode || null,
        priceCents: Math.round(price * 100),
        vatRate,
        isPrescription,
        active,
        categoryId: categoryId || null, // 👈 aquí guardamos la categoría
      },
    });

    return NextResponse.redirect(
      new URL("/panel/productos", req.url)
    );
  } catch (err) {
    console.error("Error al actualizar producto:", err);
    return NextResponse.json(
      { error: "Error al actualizar producto" },
      { status: 500 }
    );
  }
}

