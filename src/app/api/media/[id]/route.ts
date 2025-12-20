// src/app/api/media/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { auth } from "@/src/auth"; // ✅ Importamos Auth.js

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  try {
    // 🔐 1. Autenticación con Auth.js
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

    // 📥 3. Procesar datos del formulario
    const formData = await req.formData();
    const action = String(formData.get("_action") ?? "update");

    // Buscamos la imagen para saber a qué producto pertenece (para el redirect)
    const media = await prisma.media.findUnique({
      where: { id },
      select: { id: true, productId: true },
    });

    if (!media) {
      return NextResponse.json(
        { error: "Imagen no encontrada" },
        { status: 404 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: media.productId },
      select: { slug: true },
    });

    // ⚡ 4. Ejecutar acción
    if (action === "delete") {
      // 🗑 Eliminar imagen
      await prisma.media.delete({ where: { id } });
    } else {
      // ✏️ Actualizar imagen
      const url = String(formData.get("url") ?? "").trim();
      const alt = String(formData.get("alt") ?? "").trim();
      const positionRaw = String(formData.get("position") ?? "").trim();

      if (!url) {
        return NextResponse.json(
          { error: "La URL de la imagen es obligatoria" },
          { status: 400 }
        );
      }

      let position: number | undefined;
      if (positionRaw) {
        const parsed = Number(positionRaw);
        if (!Number.isNaN(parsed) && parsed >= 0) {
          position = parsed;
        }
      }

      await prisma.media.update({
        where: { id },
        data: {
          url,
          alt,
          ...(position !== undefined ? { position } : {}),
        },
      });
    }

    // 🔄 Redirect inteligente
    const redirectPath = product
      ? `/panel/productos/${product.slug}/imagenes`
      : "/panel/productos";

    return NextResponse.redirect(new URL(redirectPath, req.url));

  } catch (err) {
    console.error("Error procesando imagen:", err);
    return NextResponse.json(
      { error: "Error al procesar la imagen" },
      { status: 500 }
    );
  }
}