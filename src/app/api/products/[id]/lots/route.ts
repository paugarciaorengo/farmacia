// src/app/api/products/[slug]/lots/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { auth } from "@/src/auth"; // ✅ Importamos Auth.js

type RouteContext = {
  params: Promise<{ slug: string }>;
};

// 📌 GET → listar lotes de un producto
// 🛡️ MEJORA: He añadido protección aquí. Los detalles de lotes son internos.
export async function GET(req: NextRequest, { params }: RouteContext) {
  const { slug } = await params;

  // 1. Verificación de seguridad
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        lots: {
          orderBy: { expiresAt: "asc" }, // Prioridad a lo que caduca antes (FEFO)
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
  const { slug } = await params;

  try {
    // 🔐 1. Autenticación con Auth.js
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // 🔐 2. Verificar Rol (BD)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "PHARMACIST")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // 📥 3. Recibir datos
    const formData = await req.formData();
    const lotCode = String(formData.get("lotCode") ?? "").trim();
    const quantityRaw = String(formData.get("quantity") ?? "").trim();
    const expiresAtRaw = String(formData.get("expiresAt") ?? "").trim();

    // Validaciones básicas
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

    // Validar producto
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

    // 📅 MEJORA CRÍTICA: Validación estricta de fecha (ya no es opcional)
    if (!expiresAtRaw) {
      return NextResponse.json(
        { error: "La fecha de caducidad es obligatoria" },
        { status: 400 }
      );
    }

    const expiresAt = new Date(expiresAtRaw);
    if (Number.isNaN(expiresAt.getTime())) {
      return NextResponse.json(
        { error: "Formato de fecha inválido" },
        { status: 400 }
      );
    }

    // 💾 Guardar en BD
    await prisma.stockLot.create({
      data: {
        productId: product.id,
        lotCode,
        quantity,
        expiresAt, // Ahora pasamos la fecha obligatoria
      },
    });

    // 🔄 Redirección al panel
    return NextResponse.redirect(
      new URL(`/panel/productos/${product.slug}/stock`, req.url)
    );

  } catch (err: any) {
    console.error("Error al crear lote:", err);

    // Error de duplicado (Unique Constraint)
    if (err?.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe un lote con ese código para este producto." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error al crear el lote" },
      { status: 500 }
    );
  }
}