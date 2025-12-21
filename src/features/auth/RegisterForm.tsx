'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, UserPlus, AlertCircle } from 'lucide-react'

export default function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Validación básica
    if (!name || !email || !password) {
      setError('Todos los campos son obligatorios')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      if (res.ok) {
        router.push('/login?registered=true')
      } else {
        const data = await res.json()
        setError(data.error || 'Error al registrarse')
      }
    } catch (err) {
      setError('Ocurrió un error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2 text-red-600 text-sm font-medium animate-pulse">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Nombre completo</label>
        <div className="relative">
          <User className="absolute left-3 top-3 text-muted-foreground" size={18} />
          <input
            name="name"
            type="text"
            placeholder="Ej: Juan Pérez"
            className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 text-muted-foreground" size={18} />
          <input
            name="email"
            type="email"
            placeholder="tu@email.com"
            className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Contraseña</label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 text-muted-foreground" size={18} />
          <input
            name="password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:opacity-90 text-primary-foreground font-bold py-3 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? 'Registrando...' : <><UserPlus size={20} /> Crear Cuenta</>}
      </button>
    </form>
  )
}