// src/app/api/lots/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { auth } from "@/src/auth"; // ✅ Importamos Auth.js

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  try {
    // 🔐 1. Autenticación con Auth.js (Reemplaza a cookies/verifyAuthToken)
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // 🔐 2. Verificar Rol en BD
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "PHARMACIST")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // 📥 3. Recoger datos
    const formData = await req.formData();
    const action = String(formData.get("_action") ?? "update");

    // Buscamos el lote actual (necesitamos 'reserved' para validaciones y 'productId' para redirect)
    const lot = await prisma.stockLot.findUnique({
      where: { id },
      select: {
        productId: true,
        reserved: true,
      },
    });

    if (!lot) {
      return NextResponse.json(
        { error: "Lote no encontrado" },
        { status: 404 }
      );
    }

    // Buscamos info del producto (para el redirect final)
    const product = await prisma.product.findUnique({
      where: { id: lot.productId },
      select: { slug: true },
    });

    // ⚡ 4. Ejecutar Acción
    if (action === "delete") {
      // Opción: Podrías bloquear el borrado si (lot.reserved > 0) para extra seguridad
      await prisma.stockLot.delete({
        where: { id },
      });
    } else {
      // 📝 Actualizar lote
      const lotCode = String(formData.get("lotCode") ?? "").trim();
      const quantityRaw = String(formData.get("quantity") ?? "").trim();
      const expiresAtRaw = String(formData.get("expiresAt") ?? "").trim();

      // Validaciones
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

      // ⛔ Protección Crítica: No romper stock reservado
      if (quantity < lot.reserved) {
        return NextResponse.json(
          {
            error: `No puedes bajar el stock a ${quantity} porque hay ${lot.reserved} unidades reservadas en pedidos.`,
          },
          { status: 400 }
        );
      }

      // 📅 Validación de Fecha (Ahora es obligatoria por Schema)
      if (!expiresAtRaw) {
        return NextResponse.json(
          { error: "La fecha de caducidad es obligatoria" },
          { status: 400 }
        );
      }

      const expiresAt = new Date(expiresAtRaw);
      if (Number.isNaN(expiresAt.getTime())) {
        return NextResponse.json(
          { error: "Fecha de caducidad no válida" },
          { status: 400 }
        );
      }

      // Actualizamos
      await prisma.stockLot.update({
        where: { id },
        data: {
          lotCode,
          quantity,
          expiresAt, // Pasamos la fecha ya validada
        },
      });
    }

    // 🔄 Redirect inteligente
    const redirectPath = product
      ? `/panel/productos/${product.slug}/stock`
      : "/panel/productos";

    return NextResponse.redirect(new URL(redirectPath, req.url));

  } catch (err) {
    console.error("Error al procesar lote:", err);
    return NextResponse.json(
      { error: "Error al procesar el lote" },
      { status: 500 }
    );
  }
}