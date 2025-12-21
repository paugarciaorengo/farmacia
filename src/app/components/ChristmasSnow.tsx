'use client'

import { useEffect, useState } from 'react'
import Snowfall from 'react-snowfall'

export default function ChristmasSnow() {
  const [isChristmas, setIsChristmas] = useState(false)

  useEffect(() => {
    // Lógica para detectar si es Navidad
    const today = new Date()
    const currentMonth = today.getMonth() // 0 = Enero, 11 = Diciembre
    
    // Si estamos en Diciembre (11) O si quieres probarlo hoy mismo (descomenta la linea de abajo)
    if (currentMonth === 11) { 
      setIsChristmas(true)
    }
    
    // 👇 DESCOMENTA ESTO PARA VERLO YA (aunque no sea Diciembre)
    // setIsChristmas(true) 
  }, [])

  if (!isChristmas) return null

  return (
    // z-[60] para que caiga por encima del NavBar y del contenido
    // pointer-events-none es CRUCIAL para que puedas hacer click en los botones a través de la nieve
    <div className="fixed inset-0 w-full h-full pointer-events-none z-[60]">
      <Snowfall 
        // Cantidad de copos (200 es suave, 500 es tormenta)
        snowflakeCount={150}
        // Colores: Blanco y un azul muy clarito hielo
        color="#ffffff"
        style={{
          position: 'fixed',
          width: '100vw',
          height: '100vh',
        }}
      />
    </div>
  )
}