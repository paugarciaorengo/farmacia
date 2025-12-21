import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { auth } from "@/src/auth";
import { revalidatePath } from "next/cache"; // ✅ IMPORTANTE: Para actualizar la vista

// 👇 CAMBIO 1: El parámetro se llama 'id' porque la carpeta es [id]
type RouteContext = {
  params: Promise<{ id: string }>;
};

// 📌 GET → listar lotes
export async function GET(req: NextRequest, { params }: RouteContext) {
  const { id } = await params; // 👇 CAMBIO 2: Leemos 'id'

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // 👇 CAMBIO 3: Buscamos por ID o Slug
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: id },
          { slug: id }
        ]
      },
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
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
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
    return NextResponse.json({ error: "Error obteniendo lotes" }, { status: 500 });
  }
}

// 📌 POST → crear un nuevo lote
export async function POST(req: NextRequest, { params }: RouteContext) {
  const { id } = await params; // 👇 CAMBIO 4: Leemos 'id'

  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "PHARMACIST")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const formData = await req.formData();
    const lotCode = String(formData.get("lotCode") ?? "").trim();
    const quantityRaw = String(formData.get("quantity") ?? "").trim();
    const expiresAtRaw = String(formData.get("expiresAt") ?? "").trim();

    if (!lotCode) return NextResponse.json({ error: "Código de lote obligatorio" }, { status: 400 });

    const quantity = Number(quantityRaw);
    if (!Number.isFinite(quantity) || quantity < 0) {
      return NextResponse.json({ error: "Cantidad no válida" }, { status: 400 });
    }

    // 👇 CAMBIO 5: Buscamos por ID o Slug
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: id },
          { slug: id }
        ]
      },
      select: { id: true, slug: true },
    });

    if (!product) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });

    if (!expiresAtRaw) return NextResponse.json({ error: "Fecha obligatoria" }, { status: 400 });

    const expiresAt = new Date(expiresAtRaw);
    if (Number.isNaN(expiresAt.getTime())) {
      return NextResponse.json({ error: "Formato de fecha inválido" }, { status: 400 });
    }

    await prisma.stockLot.create({
      data: {
        productId: product.id,
        lotCode,
        quantity,
        expiresAt,
      },
    });

    // 👇 MAGIA ANTI-CACHÉ: Actualizamos la página de stock inmediatamente
    revalidatePath(`/panel/productos/${product.slug}/stock`);

    return NextResponse.redirect(
      new URL(`/panel/productos/${product.slug}/stock`, req.url),
      303
    );

  } catch (err: any) {
    console.error("Error al crear lote:", err);
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "Lote duplicado para este producto" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al crear el lote" }, { status: 500 });
  }
}