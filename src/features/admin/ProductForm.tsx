'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Category {
  id: string
  name: string
}

interface ProductFormProps {
  categories: Category[]
  initialData?: {
    id?: string
    name: string
    slug: string
    description: string | null
    priceCents: number
    farmaticCode: string | null
    categoryId: string | null
    media?: { url: string }[]
  }
}

export default function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    price: initialData?.priceCents ? initialData.priceCents / 100 : 0,
    farmaticCode: initialData?.farmaticCode || '',
    categoryId: initialData?.categoryId || '',
    imageUrl: initialData?.media?.[0]?.url || ''
  })

  // Generar slug automáticamente al escribir el nombre (solo si es nuevo)
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData(prev => ({
      ...prev,
      name,
      slug: !initialData ? name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') : prev.slug
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Determinar si es Crear (POST) o Editar (PATCH/PUT)
      const url = initialData?.id ? `/api/products/${initialData.id}` : '/api/products'
      const method = initialData?.id ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          priceCents: Math.round(formData.price * 100) // Convertir a céntimos
        }),
      })

      if (!res.ok) throw new Error('Error al guardar')

      router.refresh()
      router.push('/panel/productos')
    } catch (error) {
      alert('Ocurrió un error al guardar el producto.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      
      {/* Header del Formulario */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {initialData ? 'Editar Producto' : 'Nuevo Producto'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Rellena la información básica del medicamento o producto.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/panel/productos"
            className="px-4 py-2 rounded-xl border border-border bg-background text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors font-medium"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Guardar Cambios
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Datos Principales */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="font-bold text-lg text-foreground mb-4">Información General</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Nombre del Producto</label>
                <input
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="Ej: Ibuprofeno 600mg"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Slug (URL)</label>
                <input
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-muted-foreground focus:outline-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Código Farmatic/Nacional</label>
                <input
                  value={formData.farmaticCode}
                  onChange={(e) => setFormData({...formData, farmaticCode: e.target.value})}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono"
                  placeholder="123456"
                />
              </div>
              
              <div className="col-span-2">
                 <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Descripción</label>
                 <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                    placeholder="Descripción detallada del producto..."
                 />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
             <h2 className="font-bold text-lg text-foreground mb-4">Multimedia</h2>
             <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">URL de la Imagen</label>
                  <div className="flex gap-2">
                    <input
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="https://..."
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    * Por ahora usamos URLs externas. Próximamente subida de archivos.
                  </p>
                </div>
             </div>
          </div>
        </div>

        {/* Columna Derecha: Organización y Precio */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-lg text-foreground mb-4">Precio</h2>
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Precio Venta (€)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                  className="w-full bg-background border border-border rounded-xl pl-4 pr-12 py-3 text-foreground font-bold text-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">€</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-lg text-foreground mb-4">Organización</h2>
            <div className="space-y-4">
               <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Categoría</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  >
                    <option value="">Sin categoría</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
               </div>
            </div>
          </div>

          {/* Preview de Imagen */}
          {formData.imageUrl && (
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col items-center text-center">
              <span className="text-xs font-bold uppercase text-muted-foreground mb-3">Vista Previa</span>
              <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-muted border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
        </div>

      </div>
    </form>
  )
}