// src/app/api/products/[slug]/lots/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import { verifyAuthToken } from "@/src/lib/auth";

type RouteContext = {
  // 👈 en tu setup, params viene como Promise
  params: Promise<{ slug: string }>;
};

// 📌 GET → listar lotes de un producto
export async function GET(req: NextRequest, { params }: RouteContext) {
  // 👈 OBLIGATORIO hacer await
  const { slug } = await params;

  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        lots: {
          orderBy: { expiresAt: "asc" },
          select: {
            id: true,
            lotCode: true,
            expiresAt: true,
            quantity: true,
            reserved: true,
            createdAt: true,
            updatedAt: true,
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

    return NextResponse.json(
      {
        productId: product.id,
        productName: product.name,
        lots: product.lots,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error obteniendo lotes:", err);
    return NextResponse.json(
      { error: "Error obteniendo lotes" },
      { status: 500 }
    );
  }
}

// 📌 POST → crear un nuevo lote para un producto
export async function POST(req: NextRequest, { params }: RouteContext) {
  // 👈 OBLIGATORIO hacer await
  const { slug } = await params;

  try {
    // 🔐 Autenticación básica por cookie + rol
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value ?? null;

    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const payload = verifyAuthToken(token);
    if (!payload?.userId) {
      return NextResponse.json({ error: "Token no válido" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "PHARMACIST")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const formData = await req.formData();
    const lotCode = String(formData.get("lotCode") ?? "").trim();
    const quantityRaw = String(formData.get("quantity") ?? "").trim();
    const expiresAtRaw = String(formData.get("expiresAt") ?? "").trim();

    if (!lotCode) {
      return NextResponse.json(
        { error: "El código de lote es obligatorio" },
        { status: 400 }
      );
    }

    const quantity = Number(quantityRaw);
    if (!Number.isFinite(quantity) || quantity < 0) {
      return NextResponse.json(
        { error: "Cantidad no válida" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true, slug: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    let expiresAt: Date | null = null;
    if (expiresAtRaw) {
      const parsed = new Date(expiresAtRaw);
      if (!Number.isNaN(parsed.getTime())) {
        expiresAt = parsed;
      } else {
        return NextResponse.json(
          { error: "Fecha de caducidad no válida" },
          { status: 400 }
        );
      }
    }

    await prisma.stockLot.create({
      data: {
        productId: product.id,
        lotCode,
        quantity,
        expiresAt,
      },
    });

    // Volvemos a la pantalla de stock del producto
    return NextResponse.redirect(
      new URL(`/panel/productos/${product.slug}/stock`, req.url)
    );
  } catch (err: any) {
    console.error("Error al crear lote:", err);

    // Error por UNIQUE (productId + lotCode)
    if (err?.code === "P2002") {
      return NextResponse.json(
        {
          error: "Ya existe un lote con ese código para este producto.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error al crear el lote" },
      { status: 500 }
    );
  }
}
