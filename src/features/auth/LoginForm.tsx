'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Error al iniciar sesión')
        return
      }

      const data = await res.json().catch(() => ({}));
      const role = data.user?.role ?? "CUSTOMER";

      if (role === "ADMIN" || role === "PHARMACIST") {
        router.push("/panel");
      } else {
        router.push("/catalogo");
      }
    } catch (err) {
      console.error(err)
      setError('Error de red contactando con el servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl bg-neutral-900 p-6 shadow-lg">
        <h1 className="mb-4 text-2xl font-bold">Acceso personal farmacia</h1>

        {error && (
          <p className="mb-3 rounded bg-red-900/50 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-neutral-200">
              Correo electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-neutral-200">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-emerald-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded bg-emerald-500 py-2 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-60"
          >
            {loading ? 'Accediendo...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-neutral-400">
          ¿Aún no tienes cuenta?{' '}
          <a href="/register" className="text-emerald-400 hover:underline">
            Registrarse
          </a>
        </p>
      </div>
    </main>
  )
}
