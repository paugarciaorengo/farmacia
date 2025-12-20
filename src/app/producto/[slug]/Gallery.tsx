'use client'

import { useState } from 'react'
import Image from 'next/image'

type Media = {
  id: string
  url: string
  alt: string | null
}

export default function Gallery({ media, name }: { media: Media[], name: string }) {
  const [selectedImage, setSelectedImage] = useState(media[0]?.url)

  if (!media || media.length === 0) return null

  return (
    <div className="flex flex-col gap-4">
      {/* Imagen Principal */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl">
        <Image
          src={selectedImage}
          alt={name}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Miniaturas (solo si hay más de 1) */}
      {media.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {media.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedImage(item.url)}
              className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                selectedImage === item.url 
                  ? 'border-emerald-500 shadow-lg shadow-emerald-500/20' 
                  : 'border-slate-700 hover:border-slate-500'
              }`}
            >
              <Image
                src={item.url}
                alt={item.alt || name}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}