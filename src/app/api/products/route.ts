import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { auth } from "@/src/auth";
import { Prisma } from "@prisma/client";
import { z } from "zod"; // 1. Importamos Zod

// 👇 2. Esquema de validación estricto con Zod para el POST
const productCreateSchema = z.object({
  name: z.string().min(2, "El nombre es demasiado corto"),
  slug: z.string().min(2, "El slug es obligatorio"),
  sku: z.string().min(1, "El SKU es obligatorio"),
  farmaticCode: z.string().optional().nullable(),
  priceCents: z.coerce.number().int().positive("El precio debe ser un número positivo"),
  description: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  imageUrl: z.string().url("La URL de la imagen no es válida").optional().or(z.literal("")),
  isPrescription: z.boolean().default(false),
});

// 👇 3. Definimos el tipo exacto que devuelve la consulta (Payload) para el listado
type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    media: { select: { url: true; alt: true } };
    lots: true;
    category: true;
  }
}>;

// 🔹 GET -> Listado de productos (Optimizado)
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

    const withAvailability = items.map((item: ProductWithRelations) => {
      const availability = item.lots.reduce(
        (acc: number, lot) => acc + lot.quantity,
        0
      );
      return { ...item, availability };
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

// 🔸 POST -> Crear producto (JSON + Auth + Zod Validation)
export async function POST(req: NextRequest) {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;

  // Seguridad: Solo Admin/Farmacéutico
  if (!user || (user.role !== "ADMIN" && user.role !== "PHARMACIST")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    // 👇 4. Validamos el body con Zod
    const result = productCreateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: result.error.format() }, 
        { status: 400 }
      );
    }

    // Datos ya validados y tipados correctamente por Zod
    const data = result.data;

    // Creación en BD
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        sku: data.sku, 
        farmaticCode: data.farmaticCode,
        description: data.description,
        priceCents: data.priceCents,
        isPrescription: data.isPrescription,
        vatRate: 21, 
        active: true,
        categoryId: data.categoryId,
        media: data.imageUrl ? {
          create: {
            url: data.imageUrl,
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
      { error: "Error al crear. Es posible que el SKU o Slug ya existan." },
      { status: 500 }
    );
  }
}