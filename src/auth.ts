// src/auth.ts
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { prisma } from "@/src/lib/prisma"
import { verifyPassword } from "@/src/lib/auth"

// 1. Esquema de validación para las credenciales
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      // El nombre que se mostrará en el formulario (opcional si usas uno custom)
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      // 2. Lógica de autorización
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          console.log("Error de validación:", parsed.error);
          return null;
        }

        const { email, password } = parsed.data;

        // Buscar usuario en base de datos
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) {
          return null; // Usuario no encontrado o sin contraseña
        }

        // Verificar contraseña
        const isValid = await verifyPassword(password, user.passwordHash);

        if (!isValid) return null;

        // 3. Retornar el objeto usuario (sin datos sensibles)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role, // Pasamos el rol para usarlo en los permisos
        };
      },
    }),
  ],
  callbacks: {
    // Estas callbacks pasan los datos del usuario a la sesión del frontend
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // @ts-ignore: TypeScript puede quejarse del rol personalizado, lo forzamos aquí
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        // @ts-ignore
        session.user.role = token.role; 
      }
      return session;
    },
  },
  pages: {
    signIn: '/login', // Redirige aquí si falla la auth
  },
  session: {
    strategy: "jwt", // Usamos JWT (estándar moderno) en lugar de sesiones en BD
  },
})