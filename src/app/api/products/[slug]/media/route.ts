// src/app/api/products/[slug]/media/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import { verifyAuthToken } from "@/src/lib/auth";

type RouteContext = {
  // En tu proyecto params es una Promise
  params: Promise<{ slug: string }>;
};

// GET → listar imágenes de un producto (por si quieres usarlo vía fetch)
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
            position: true,
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

// POST → crear nueva imagen para un producto
export async function POST(req: NextRequest, { params }: RouteContext) {
  const { slug } = await params;

  try {
    // 🔐 Autenticación + rol
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

    let position: number | null = null;

    if (positionRaw) {
      const parsed = Number(positionRaw);
      if (!Number.isNaN(parsed) && parsed >= 0) {
        position = parsed;
      }
    }

    // Si no se indica posición, usamos la siguiente disponible
    if (position === null) {
      const maxPosition =
        product.media.reduce(
          (max: number, m: { position: number }) => (m.position > max ? m.position : max),
          0
        ) ?? 0;
      position = maxPosition + 1;
    }

    await prisma.media.create({
      data: {
        productId: product.id,
        url,
        alt,
        position,
      },
    });

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
