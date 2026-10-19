"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { alineacionEnCurso } from "@/lib/ciudades/cicloDia";
import { efectosHabilitados, efectosHabilitadosServerSnapshot, subscribeEfectos } from "@/lib/efectos";
import { SOLES } from "@/lib/recompensas/alineacion";

// Durante la Gran Alineación, fuera de las partidas: la web se tiñe de amanecer. Un
// resplandor dorado arriba y en el horizonte, y motas de luz de los colores de las 15
// ciudades que suben despacio. Sutil: se nota sin tapar nada.
export const RUTAS_DE_JUEGO = /\/(practica|duelo|duelos\/|reto-|reto\/|zen|serie|diagnostico|partida|calibracion|sprint)/;

function suscribir(avisar: () => void) {
  const id = setInterval(avisar, 30_000);
  return () => clearInterval(id);
}
const enCurso = () => alineacionEnCurso(Date.now()) !== null;
const nunca = () => false;

const MOTAS = SOLES.map((s, i) => ({ color: s.color, x: 4 + ((i * 61) % 92), d: 9 + ((i * 7) % 8), r: ((i * 13) % 10) * 0.9, t: 2 + (i % 3) }));

export default function CapaAlineacion() {
  const ruta = usePathname() ?? "";
  const activa = useSyncExternalStore(suscribir, enCurso, nunca);
  const efectos = useSyncExternalStore(subscribeEfectos, efectosHabilitados, efectosHabilitadosServerSnapshot);
  if (!activa || RUTAS_DE_JUEGO.test(ruta)) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[1]" aria-hidden="true">
      <div className="absolute inset-x-0 top-0 h-48" style={{ background: "radial-gradient(70% 100% at 50% 0%, rgba(242,193,78,0.14), transparent 70%)" }} />
      <div className="absolute inset-x-0 bottom-0 h-40" style={{ background: "linear-gradient(0deg, rgba(232,163,23,0.12), transparent)" }} />
      {efectos &&
        MOTAS.map((m, i) => (
          <span
            key={i}
            className="alineacion-mota absolute bottom-0 rounded-full"
            style={{ left: `${m.x}%`, width: m.t, height: m.t, background: m.color, boxShadow: `0 0 8px 2px ${m.color}88`, animationDuration: `${m.d}s`, animationDelay: `-${m.r}s` }}
          />
        ))}
    </div>
  );
}
