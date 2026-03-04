'use client'

import { useState } from 'react'
import { updatePasswordAction } from '../actions/update-password'
import { Lock, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export function PasswordForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const formData = new FormData(e.currentTarget)
      const result = await updatePasswordAction(formData)

      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSuccess(true)
        e.currentTarget.reset() // Vaciamos los inputs si todo fue bien
      }
    } catch (err) {
      setError('Ocurrió un error inesperado al conectar con el servidor.')
    } finally {
      // ESTO ES LA CLAVE: Pase lo que pase, apagamos el botón de carga
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Mensajes de Feedback */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm flex items-center gap-3 animate-fade-in">
          <AlertCircle size={18} className="shrink-0" /> <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-xl text-sm flex items-center gap-3 animate-fade-in">
          <CheckCircle2 size={18} className="shrink-0" /> <p>¡Contraseña actualizada correctamente!</p>
        </div>
      )}

      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-2">
          <Lock size={14} /> Contraseña Actual
        </label>
        <input
          type="password"
          name="currentPassword"
          required
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Nueva Contraseña</label>
          <input
            type="password"
            name="newPassword"
            required
            minLength={6}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Confirmar Nueva Contraseña</label>
          <input
            type="password"
            name="confirmPassword"
            required
            minLength={6}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>
      </div>

      <div className="pt-6 border-t border-border flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {loading ? 'Guardando...' : 'Cambiar Contraseña'}
        </button>
      </div>
    </form>
  )
}