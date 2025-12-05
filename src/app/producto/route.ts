import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const name = form.get("name")?.toString() ?? "";
    const price = parseFloat(form.get("price")?.toString() ?? "0");
    const slug = form.get("slug")?.toString() ?? "";
    const active = form.get("active") === "true";

    if (!name || !slug || isNaN(price)) {
      return NextResponse.json(
        { error: "Datos inválidos" },
        { status: 400 }
      );
    }

    await prisma.product.create({
      data: {
        name,
        slug,
        priceCents: Math.round(price * 100),
        active,
      },
    });

    return NextResponse.redirect("/panel/productos");
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Error al crear producto" },
      { status: 500 }
    );
  }
}
