import { auth } from '@/src/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import RegisterForm from '@/src/features/auth/RegisterForm'
import { Plus } from 'lucide-react'

export default async function RegisterPage() {
  const session = await auth()
  if (session) redirect('/')

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 animate-fade-in">
      
      <Link href="/" className="mb-8 flex items-center gap-2 group">
        <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20 group-hover:opacity-90 transition-opacity">
           <Plus className="text-primary-foreground font-bold" size={24} strokeWidth={4} />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          Farma<span className="text-primary">Web</span>
        </h1>
      </Link>

      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground">Crear cuenta</h2>
          <p className="text-muted-foreground text-sm mt-2">
            Únete a nosotros para gestionar tus pedidos fácilmente
          </p>
        </div>

        <RegisterForm />

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
          <Link 
            href="/login" 
            className="text-primary font-bold hover:underline"
          >
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  )
}