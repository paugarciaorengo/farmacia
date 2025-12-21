import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { auth } from "@/src/auth";
import { revalidatePath } from "next/cache"; // ✅ IMPORTANTE: Necesario para limpiar la caché

type RouteContext = {
  params: Promise<{ id: string }>;
};

// 📌 GET → Listar imágenes
export async function GET(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  try {
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
        media: {
          orderBy: { position: "asc" },
          select: {
            id: true,
            url: true,
            alt: true,
            position: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
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
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// 📌 POST → Subir nueva imagen
export async function POST(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "No auth" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "PHARMACIST")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const formData = await req.formData();
    const url = String(formData.get("url") ?? "").trim();
    const alt = String(formData.get("alt") ?? "").trim();
    const positionRaw = String(formData.get("position") ?? "").trim();

    if (!url) return NextResponse.json({ error: "URL obligatoria" }, { status: 400 });

    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: id },
          { slug: id }
        ]
      },
      select: { id: true, slug: true, name: true, media: { select: { position: true } } },
    });

    if (!product) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });

    let position = positionRaw ? Number(positionRaw) : null;
    if (position === null || isNaN(position)) {
      const max = product.media.reduce((acc: number, m: { position: number }) => Math.max(acc, m.position), 0);
      position = max + 1;
    }

    await prisma.media.create({
      data: {
        productId: product.id,
        url,
        alt: alt || product.name,
        position,
      },
    });

    // 👇 MAGIA ANTI-ZOMBIES 🧟‍♂️
    // Obligamos a Next.js a refrescar estas páginas para que aparezca la foto nueva
    revalidatePath(`/panel/productos/${product.slug}/imagenes`);
    revalidatePath(`/panel/productos/${product.slug}/editar`);
    revalidatePath(`/producto/${product.slug}`); // También la vista pública

    return NextResponse.redirect(new URL(`/panel/productos/${product.slug}/imagenes`, req.url), 303);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error guardando imagen" }, { status: 500 });
  }
}