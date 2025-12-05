// src/app/api/products/[slug]/delete/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(req: Request, { params }: RouteContext) {
  try {
    const { slug } = await params;

    // Borramos el producto por slug
    await prisma.product.delete({
      where: { slug },
    });

    return NextResponse.redirect(
      new URL("/panel/productos", req.url)
    );
  } catch (err) {
    console.error("Error al eliminar producto:", err);
    return NextResponse.json(
      { error: "Error al eliminar producto" },
      { status: 500 }
    );
  }
}
