// middleware.ts
export { auth as middleware } from "@/src/auth"

export const config = {
  // Aquí definimos en qué rutas se ejecuta el middleware.
  // Excluimos archivos estáticos y rutas internas de Next.js para mejorar rendimiento.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}