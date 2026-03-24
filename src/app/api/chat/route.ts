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
    if (session?.user?.id) {
      const userDb = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
      });
      isAdmin = userDb?.role === 'ADMIN' || userDb?.role === 'PHARMACIST';
    }

    const tools: any = {
      alertasDeInventario: {
        description: 'Consulta productos próximos a caducar o con poco stock.',
        parameters: z.object({}),
        execute: async () => {
          const tresMesesVista = new Date();
          tresMesesVista.setMonth(tresMesesVista.getMonth() + 3);

          const productos = await prisma.product.findMany({
            include: { lots: true }
          });

          return productos.flatMap((p: any) => 
            p.lots.filter((l: any) => l.expiresAt < tresMesesVista || l.quantity < 10).map((l: any) => ({
              nombre: p.name,
              stock: l.quantity,
              caducidad: l.expiresAt.toLocaleDateString(),
              urgencia: l.expiresAt < new Date() ? "CRÍTICA" : "ALTA"
            }))
          );
        }
      }
      // ... aquí podrías añadir la de buscarPreciosInternet igual que antes
    };

    const result = (streamText as any)({
      model: google('gemini-2.5-flash'),
      // 👇 INSTRUCCIONES CRÍTICAS 👇
      system: isAdmin 
        ? `Eres el 'Director de Negocio' de la Farmacia. 
           TU FLUJO DE TRABAJO:
           1. Si el admin pregunta por stock, inventario o problemas, USA la herramienta correspondiente.
           2. Una vez tengas los datos de la herramienta, NO TE DETENGAS. 
           3. Inmediatamente genera un mensaje humano analizando esos datos, priorizando lo urgente y dando consejos.
           4. NUNCA respondas solo con datos técnicos o te quedes en silencio.` 
        : `Eres un asistente amable. No diagnostiques.`,
      messages: await convertToModelMessages(messages),
      tools: isAdmin ? tools : undefined,
      // 👇 Subimos los pasos para que tenga "tiempo" de pensar tras la herramienta
      maxSteps: 5, 
    });

    return result.toUIMessageStreamResponse();

  } catch (err) {
    console.error("ERROR:", err);
    return new Response("Error", { status: 500 });
  }
}