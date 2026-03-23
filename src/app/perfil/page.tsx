import { auth, signOut } from "@/src/auth"
import { prisma } from "@/src/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { User, Package, LogOut, Save, ShieldCheck } from "lucide-react"
import { updateProfileAction } from "../actions/update-profile"
import { PasswordForm } from "./PasswordForm"

export default async function PerfilPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    // 👇 AÑADIDO: phone: true para traer el teléfono de la base de datos
    select: { name: true, email: true, role: true, phone: true }
  })

  if (!user) redirect("/login")

  return (
    <main className="min-h-screen bg-background p-6 md:p-12 pt-28 md:pt-32">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
          <User className="text-primary" size={36} />
          Mi Cuenta
        </h1>

        <div className="grid md:grid-cols-3 gap-6">
          
          {/* COLUMNA IZQUIERDA */}
          <div className="md:col-span-1 space-y-4">
            
            <Link 
              href="/perfil/mis-pedidos" 
              className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 hover:border-primary hover:shadow-md transition-all group"
            >
              <div className="bg-primary/10 p-3 rounded-full transition-colors">
                <Package className="text-primary" size={28} />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Mis Reservas</h3>
                <p className="text-xs text-muted-foreground">Historial de pedidos</p>
              </div>
            </Link>

            {(user.role === 'ADMIN' || user.role === 'PHARMACIST') && (
              <Link 
                href="/panel" 
                className="bg-foreground border border-foreground rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 hover:opacity-90 transition-all group"
              >
                <div className="bg-background/20 p-3 rounded-full">
                  <ShieldCheck className="text-background" size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-background">Panel Farmacia</h3>
                  <p className="text-xs text-background/70">Gestión interna</p>
                </div>
              </Link>
            )}

            <form action={async () => {
              'use server'
              await signOut({ redirectTo: '/' })
            }}>
              <button className="w-full bg-card border border-destructive/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 hover:bg-destructive/10 hover:border-destructive/50 transition-all group text-destructive">
                <LogOut size={24} />
                <span className="font-bold text-sm">Cerrar Sesión</span>
              </button>
            </form>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="md:col-span-2">
            
            {/* TARJETA 1: Datos Personales */}
            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-bold text-foreground mb-6 border-b border-border pb-4">
                Mis Datos Personales
              </h2>

              <form 
                action={async (formData) => {
                  'use server'
                  await updateProfileAction(formData)
                }} 
                className="space-y-6"
              >
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-2">Email</label>
                  <input 
                    type="email" 
                    disabled 
                    value={user.email || ''} 
                    className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground cursor-not-allowed"
                  />
                  <p className="text-[10px] text-muted-foreground mt-2">El email no se puede cambiar desde aquí.</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-2">Nombre y Apellidos</label>
                  <input 
                    type="text" 
                    name="name"
                    defaultValue={user.name || ''} 
                    placeholder="Ej: Juan Pérez"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>

                {/* 👇 AÑADIDO: Campo de teléfono 👇 */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-2">Teléfono de Contacto</label>
                  <input 
                    type="tel" 
                    name="phone"
                    defaultValue={user.phone || ''} 
                    placeholder="Ej: 600 123 456"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>

                <div className="pt-6 border-t border-border flex justify-end">
                  <button 
                    type="submit" 
                    className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Save size={18} />
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>

            {/* TARJETA 2: Seguridad (Cambio de contraseña) */}
            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm mt-6">
              <h2 className="text-xl font-bold text-foreground mb-6 border-b border-border pb-4">
                Seguridad
              </h2>
              <PasswordForm />
            </div>

          </div>

        </div>
      </div>
    </main>
  )
}