"use client";

import { useSyncExternalStore } from "react";
import { useLocale } from "next-intl";
import { PARTICULAS } from "@/lib/temas/dibujos";
import { capaVisible } from "@/lib/temas/temas";
import { decoracionHabilitada, decoracionHabilitadaServerSnapshot, subscribeDecoracion } from "@/lib/decoracion";
import AccesorioTemporada from "./AccesorioTemporada";
import DibujoTema from "./DibujoTema";
import { useTemaHoy } from "./useTemaHoy";

// La pantalla de carga en las festividades (pedido 2026-10-20): las partículas de la
// fecha caen o suben alrededor del logo, el logo lleva el accesorio de la fiesta y
// debajo va su nombre en el color del evento. Solo cuando la fiesta está de verdad
// en el calendario (useTemaHoy), nunca forzada.
export function useAcentoCarga(): string | null {
  const tema = useTemaHoy();
  return tema && capaVisible(tema, "interfaz") ? tema.tema.acento : null;
}

export function ParticulasCarga() {
  const tema = useTemaHoy();
  const decoracion = useSyncExternalStore(subscribeDecoracion, decoracionHabilitada, decoracionHabilitadaServerSnapshot);
  const spec = tema?.tema.particulas;
  if (!tema || !spec || !decoracion || !capaVisible(tema, "ambiente")) return null;
  const dibujo = PARTICULAS[spec.tipo];
  const anim = spec.movimiento === "sube" ? "carga-tema-sube" : spec.movimiento === "flota" ? "carga-tema-flota" : "carga-tema-cae";
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {Array.from({ length: 14 }, (_, i) => {
        const x = (i * 37 + 11) % 100;
        const tam = 14 + ((i * 7) % 12);
        const dur = 7 + ((i * 5) % 6);
        return (
          <DibujoTema
            key={i}
            dibujo={dibujo}
            color={spec.colores[i % spec.colores.length]}
            className="absolute"
            style={{ left: `${x}%`, top: 0, width: tam, height: tam, opacity: 0.55 + ((i * 3) % 4) / 10, animation: `${anim} ${dur}s linear ${-((i * 1.3) % dur)}s infinite` }}
          />
        );
      })}
    </div>
  );
}

export function NombreTemaCarga() {
  const tema = useTemaHoy();
  const en = useLocale() === "en";
  if (!tema || !capaVisible(tema, "interfaz")) return null;
  return (
    <span className="font-mono text-xs font-bold uppercase tracking-[0.25em]" style={{ color: tema.tema.acento }}>
      {en ? tema.tema.nombreEn : tema.tema.nombre}
    </span>
  );
}

export { AccesorioTemporada as AccesorioCarga };
