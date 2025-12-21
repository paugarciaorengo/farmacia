// src/app/api/products/[slug]/media/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { auth } from "@/src/auth"; // ✅ Importamos Auth.js

type RouteContext = {
  params: Promise<{ slug: string }>;
};

// 📌 GET → Listar imágenes (PÚBLICO para que la tienda funcione)
export async function GET(req: NextRequest, { params }: RouteContext) {
  const { slug } = await params;

  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        media: {
          orderBy: { position: "asc" },
          select: {
            id: true,
            url: true,
            alt: true,
            position: true, // Útil para ordenar en el frontend
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
        media: product.media,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error obteniendo imágenes:", err);
    return NextResponse.json(
      { error: "Error obteniendo imágenes" },
      { status: 500 }
    );
  }
}

// 📌 POST → Subir/Vincular nueva imagen (PROTEGIDO)
export async function POST(req: NextRequest, { params }: RouteContext) {
  const { slug } = await params;

  try {
    // 🔐 1. Autenticación
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

    // 📥 3. Procesar datos
    const formData = await req.formData();
    const url = String(formData.get("url") ?? "").trim();
    const alt = String(formData.get("alt") ?? "").trim();
    const positionRaw = String(formData.get("position") ?? "").trim();

    if (!url) {
      return NextResponse.json(
        { error: "La URL de la imagen es obligatoria" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        media: { select: { position: true } },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Lógica de posición (mantenemos tu lógica original, es correcta)
    let position: number | null = null;
    if (positionRaw) {
      const parsed = Number(positionRaw);
      if (!Number.isNaN(parsed) && parsed >= 0) {
        position = parsed;
      }
    }

    // Si no hay posición, ponemos la última + 1
    if (position === null) {
      const maxPosition =
        product.media.reduce(
          (max: number, m: { position: number }) => (m.position > max ? m.position : max),
          0
        ) ?? 0;
      position = maxPosition + 1;
    }

    // Crear registro
    await prisma.media.create({
      data: {
        productId: product.id,
        url,
        alt,
        position,
      },
    });

    // Redirigir al panel
    return NextResponse.redirect(
      new URL(`/panel/productos/${product.slug}/imagenes`, req.url)
    );
  } catch (err) {
    console.error("Error creando imagen:", err);
    return NextResponse.json(
      { error: "Error al crear la imagen" },
      { status: 500 }
    );
  }
}