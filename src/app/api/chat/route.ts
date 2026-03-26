import { google } from '@ai-sdk/google';
import { streamText, convertToModelMessages } from 'ai';
import { z } from 'zod';
import { auth } from '@/src/auth';
import { prisma } from '@/src/lib/prisma';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const session = await auth();
    
    let isAdmin = false;
    let datosInventarioAdmin = "";
    const userId = session?.user?.id;

    if (userId) {
      const userDb = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });
      isAdmin = userDb?.role === 'ADMIN' || userDb?.role === 'PHARMACIST';
    }

    if (isAdmin) {
      const tresMesesVista = new Date();
      tresMesesVista.setMonth(tresMesesVista.getMonth() + 3);
      const productos = await prisma.product.findMany({ include: { lots: true } });

      const alertas = productos.flatMap((p: any) => 
        p.lots.filter((l: any) => l.expiresAt < tresMesesVista || l.quantity < 10).map((l: any) => ({
          producto: p.name,
          precio: `${(p.priceCents / 100).toFixed(2)}€`,
          stock: l.quantity,
          caducidad: l.expiresAt.toLocaleDateString(),
          estado: l.expiresAt < new Date() ? "CADUCADO - URGENTE" : "PRÓXIMO A CADUCAR"
        }))
      );
      datosInventarioAdmin = alertas.length > 0 ? `\n\n--- INFORME DE INVENTARIO ---\n${JSON.stringify(alertas)}\n` : "\n\n--- INFORME INVENTARIO ---\nTodo correcto.\n";
    }

    // AHORA TODAS SON HERRAMIENTAS PERSONALIZADAS (Cero conflictos)
    const tools: any = {
      
      // 1. Buscador Casero (Serper)
      buscarPreciosInternet: {
        description: 'Busca en internet precios o información de mercado.',
        parameters: z.object({ consulta: z.string() }),
        execute: async ({ consulta }: { consulta: string }) => {
          const apiKey = process.env.SERPER_API_KEY;
          if (!apiKey) return { aviso: "Búsqueda en internet no configurada." };
          try {
            const response = await fetch('https://google.serper.dev/search', {
              method: 'POST',
              headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' },
              body: JSON.stringify({ q: consulta, gl: 'es', hl: 'es' }),
            });
            const data = await response.json();
            return data.organic ? data.organic.slice(0, 3).map((res: any) => ({ titulo: res.title, info: res.snippet })) : { aviso: "Sin resultados." };
          } catch (e) {
            return { aviso: "Error de red al buscar en internet." };
          }
        }
      },

      // 2. Pedidos en Prisma
      consultarEstadoPedido: {
        description: 'Consulta el estado de un pedido usando su referencia. Úsalo SIEMPRE que te den un código.',
        parameters: z.object({ referencia: z.string() }),
        execute: async ({ referencia }: { referencia: string }) => {
          try {
            // Usamos findFirst (no falla aunque no sea @unique) y (prisma as any) para evitar quejas de TS
            const pedido = await (prisma as any).order.findFirst({
              where: { reference: referencia }
            });

            if (!pedido) {
               return { referencia: referencia, estado: "No encontrado en el sistema", aviso: "Verifica el código." };
            }
            
            // Cogemos el status (o estado si lo llamaste así en tu BD)
            return { 
              referencia: referencia, 
              estado: pedido.status || pedido.estado || "Preparado", 
              ultimaActualizacion: pedido.updatedAt ? pedido.updatedAt.toLocaleDateString() : "Reciente" 
            };
          } catch (e: any) {
            console.error("LOG ERROR PRISMA PEDIDO:", e.message);
            return { referencia: referencia, estado: "Error de lectura en base de datos" };
          }
        }
      },

      // 3. Prospectos Oficiales (AEMPS)
      buscarProspectoOficial: {
        description: 'Busca el enlace al prospecto oficial (PDF) de un medicamento. Úsalo SIEMPRE que te pidan un prospecto.',
        parameters: z.object({ nombreMedicamento: z.string() }),
        execute: async ({ nombreMedicamento }: { nombreMedicamento: string }) => {
          try {
            const urlApi = `https://cima.aemps.es/cima/rest/medicamentos?nombre=${encodeURIComponent(nombreMedicamento)}`;
            const response = await fetch(urlApi);
            const data = await response.json();

            if (!data.resultados || data.resultados.length === 0) {
              return { resultado: `No se encontró el prospecto para ${nombreMedicamento}.` };
            }
            const registro = data.resultados[0].nregistro;
            return {
              medicamento: data.resultados[0].nombre,
              enlaceProspectoHtml: `https://cima.aemps.es/cima/dochtml/p/${registro}/P_${registro}.html`
            };
          } catch (e) {
            return { resultado: "Fallo temporal de conexión con la AEMPS." };
          }
        }
      }
    };

    const result = await streamText({
      model: google('gemini-2.5-flash'),
      system: isAdmin 
        ? `Eres el 'Director de Negocio' Y Farmacéutico Titular. ${datosInventarioAdmin}
           REGLAS OBLIGATORIAS:
           1. Analiza el INFORME DE INVENTARIO proactivamente.
           2. Si te piden un prospecto, usa 'buscarProspectoOficial'.
           3. Si te dan una referencia de pedido, usa 'consultarEstadoPedido'.
           4. Si necesitas comparar precios, usa 'buscarPreciosInternet'.`
        : `Eres un asistente de Farmacia del Carmel para clientes.
           REGLAS OBLIGATORIAS:
           1. Si te piden un prospecto, usa 'buscarProspectoOficial'.
           2. Si te dan una referencia de pedido, usa 'consultarEstadoPedido'.
           3. Si te preguntan precios online, usa 'buscarPreciosInternet'.
           No diagnostiques enfermedades.`,
      messages: await convertToModelMessages(messages),
      tools: tools, // Ahora todas son "Custom", así que no habrá Warning en la terminal
      // @ts-ignore - Ignoramos a TypeScript, el motor JS sí necesita esto para no quedarse mudo
      maxSteps: 5,
    });

    return result.toUIMessageStreamResponse();

  } catch (err) {
    console.error("ERROR GLOBAL:", err);
    return new Response("Error", { status: 500 });
  }
}