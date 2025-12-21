import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { auth } from "@/src/auth";
import { Prisma } from "@prisma/client";

// 👇 1. Definimos el tipo exacto que esperamos de la consulta
type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    media: {
      select: { url: true; alt: true }
    };
    lots: true;
    category: true;
  }
}>;

// 🔹 GET -> Listado público para el catálogo
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("search") ?? "";
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = 24;

  const noRxParam = searchParams.get("noRx");
  const onlyNonPrescription = noRxParam === "1" || noRxParam === "true";
  const categoryId = searchParams.get("categoryId") ?? "";

  const where: Prisma.ProductWhereInput = {};
  
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { farmaticCode: { contains: q } }
    ];
  }
  if (onlyNonPrescription) where.isPrescription = false;
  if (categoryId) where.categoryId = categoryId;

  try {
    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        take: pageSize,
        skip: (page - 1) * pageSize,
        include: {
          media: {
            orderBy: { position: "asc" },
            take: 1,
            select: { url: true, alt: true },
          },
          lots: true,
          category: true
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    // 👇 2. Tipamos explícitamente 'item' y los argumentos del reduce
    const withAvailability = items.map((item: ProductWithRelations) => {
      const availability = item.lots.reduce(
        (acc: number, lot) => acc + lot.quantity,
        0
      );

      return {
        ...item,
        availability,
      };
    });

    return NextResponse.json({
      items: withAvailability,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    return NextResponse.json({ error: "Error cargando productos" }, { status: 500 });
  }
}

// 🔸 POST -> Crear producto nuevo (Panel de Admin)
export async function POST(req: NextRequest) {
  const session = await auth();

  const user = session?.user as { role?: string } | undefined;

  if (!user || (user.role !== "ADMIN" && user.role !== "PHARMACIST")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { imageUrl, priceCents, ...data } = body;

    const product = await prisma.product.create({
      data: {
        ...data,
        priceCents: Number(priceCents),
        active: true,
        media: imageUrl ? {
          create: {
            url: imageUrl,
            type: "IMAGE",
            alt: data.name,
            position: 0
          }
        } : undefined
      },
    });

    return NextResponse.json(product);
  } catch (err) {
    console.error("Error al crear producto:", err);
    return NextResponse.json(
      { error: "Error al crear producto. Verifica que el Slug sea único." },
      { status: 500 }
    );
  }
}