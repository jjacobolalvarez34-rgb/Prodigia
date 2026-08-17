"use client";

import { useEffect, useState } from "react";

export interface UnidadResumenSidebar {
  id: string;
  nombre: string;
  dominadas: number;
  total: number;
}

interface Props {
  unidades: UnidadResumenSidebar[];
  colorHex: string;
}

// Sidebar fijo (Fase GG): no navega a otra pantalla, solo hace scroll
// dentro del mismo camino continuo hasta la unidad clickeada, y usa un
// IntersectionObserver para resaltar en qué unidad está el usuario
// mientras scrollea manualmente.
export default function AprenderSidebar({ unidades, colorHex }: Props) {
  const [activaId, setActivaId] = useState(unidades[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibles = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visibles[0]) {
          setActivaId(visibles[0].target.id.replace("unidad-", ""));
        }
      },
      { rootMargin: "-15% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    unidades.forEach((u) => {
      const el = document.getElementById(`unidad-${u.id}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [unidades]);

  function irA(id: string) {
    document.getElementById(`unidad-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav className="flex flex-col gap-1 md:sticky md:top-6">
      {unidades.map((u) => {
        const activa = u.id === activaId;
        return (
          <button
            key={u.id}
            onClick={() => irA(u.id)}
            className="flex items-center justify-between rounded-xl border-l-4 px-3 py-2.5 text-left text-sm font-medium transition-colors"
            style={{
              borderColor: activa ? colorHex : "transparent",
              background: activa ? `color-mix(in oklab, ${colorHex} 8%, transparent)` : "transparent",
              color: activa ? colorHex : "var(--foreground)",
            }}
          >
            <span>{u.nombre}</span>
            <span className="font-mono text-xs text-texto-secundario">
              {u.total > 0 ? `${u.dominadas}/${u.total}` : "—"}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
