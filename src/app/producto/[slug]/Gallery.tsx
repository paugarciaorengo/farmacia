// src/app/producto/[slug]/Gallery.tsx
"use client";

import { useState } from "react";

type MediaItem = {
  id: string;
  url: string;
  alt: string | null;
  position: number;
};

export default function Gallery({
  media,
  name,
}: {
  media: MediaItem[];
  name: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!media || media.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      {/* Imagen principal */}
      <div className="w-full rounded-xl border border-neutral-200 bg-white p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={media[activeIndex]?.url}
          alt={media[activeIndex]?.alt ?? name}
          className="max-h-[400px] w-full rounded-lg object-cover"
        />
      </div>

      {/* Miniaturas */}
      {media.length > 1 && (
        <div className="flex gap-2">
          {media.map((m, index) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`rounded border p-1 ${
                index === activeIndex
                  ? "border-emerald-500"
                  : "border-neutral-300"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.url}
                alt={m.alt ?? ""}
                className="h-16 w-16 rounded object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
