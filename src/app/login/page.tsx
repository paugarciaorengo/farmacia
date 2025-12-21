import { auth } from '@/src/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LoginForm from '@/src/features/auth/LoginForm'
import { Plus } from 'lucide-react'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const session = await auth()
  if (session) redirect('/')

  const { callbackUrl } = await searchParams

  return (
    // 🎨 Fondo global
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 animate-fade-in">
      
      {/* Logo Centrado */}
      <Link href="/" className="mb-8 flex items-center gap-2 group">
        <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20 group-hover:opacity-90 transition-opacity">
           <Plus className="text-primary-foreground font-bold" size={24} strokeWidth={4} />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          Farma<span className="text-primary">Web</span>
        </h1>
      </Link>

      {/* Tarjeta de Login */}
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground">Bienvenido de nuevo</h2>
          <p className="text-muted-foreground text-sm mt-2">
            Introduce tus credenciales para acceder a tu cuenta
          </p>
        </div>

        <LoginForm callbackUrl={callbackUrl} />

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">¿No tienes cuenta? </span>
          <Link 
            href="/register" 
            className="text-primary font-bold hover:underline"
          >
            Regístrate aquí
          </Link>
        </div>
      </div>

      <p className="mt-8 text-xs text-muted-foreground text-center max-w-xs">
        Al iniciar sesión, aceptas nuestros términos de servicio y política de privacidad.
      </p>
    </div>
  )
}