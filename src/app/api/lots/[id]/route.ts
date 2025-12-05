// src/app/api/lots/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import { verifyAuthToken } from "@/src/lib/auth";

type RouteContext = {
  // En tu proyecto params viene como Promise
  params: Promise<{ id: string }>;
};

export async function POST(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  try {
    // 🔐 Comprobamos sesión
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
    const action = String(formData.get("_action") ?? "update");

    // Buscamos el lote (para ambas operaciones) y de paso el reserved
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

    // Buscamos el producto para redirigir a su pantalla de stock
    const product = await prisma.product.findUnique({
      where: { id: lot.productId },
      select: { slug: true },
    });

    if (action === "delete") {
      // (Si quisieras bloquear borrar con reserved > 0, podrías hacerlo aquí)
      await prisma.stockLot.delete({
        where: { id },
      });
    } else {
      // 📝 Actualizar lote
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

      // ⛔ Protección: no permitir cantidad < reserved
      if (quantity < lot.reserved) {
        return NextResponse.json(
          {
            error:
              "No puedes establecer una cantidad menor que la cantidad reservada.",
          },
          { status: 400 }
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

      await prisma.stockLot.update({
        where: { id },
        data: {
          lotCode,
          quantity,
          expiresAt,
        },
      });
    }

    const redirectPath = product
      ? `/panel/productos/${product?.slug}/stock`
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
