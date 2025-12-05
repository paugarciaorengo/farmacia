"use client";

import { useEffect, useState, ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function MaskLayout({ children }: Props) {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    // Igual que el .animated de Bigibai: lanzamos animación al montar
    const t = setTimeout(() => {
      setUnlocked(true);
    }, 1800); // duración aproximada de la animación
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="overflow-hidden">
      <div
        id="mask"
        className={unlocked ? "unlocked" : "animated"}
      >
        <div id="background">
          {children}
        </div>
      </div>
    </div>
  );
}
