'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // Evitar error de hidratación
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-9 h-9" /> // Placeholder invisible para evitar saltos
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-full bg-card border border-border text-muted-foreground hover:text-primary hover:border-primary transition-all shadow-sm"
      title="Cambiar tema"
    >
      {theme === 'dark' ? (
        <Sun size={20} className="text-amber-400 animate-fade-in" /> // Sol para volver a día
      ) : (
        <Moon size={20} className="text-slate-600 animate-fade-in" /> // Luna para ir a noche
      )}
    </button>
  )
}