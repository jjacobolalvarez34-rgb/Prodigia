"use client";

import DibujoTema from "./DibujoTema";
import { useTemaHoy } from "./useTemaHoy";
import { celebracionDe } from "@/lib/temas/celebracion";
import { PARTICULAS } from "@/lib/temas/dibujos";

// La figura de la fecha en la esquina de una tarjeta durante un evento
// (PARIDAD_EVENTOS.md fila 6). El padre tiene que ser `relative`.
export default function EsquinaFecha({ tam = 26, lado = "derecha" }: { tam?: number; lado?: "derecha" | "izquierda" }) {
  const tema = useTemaHoy();
  const esquina = celebracionDe(tema)?.esquina;
  if (!tema || !esquina) return null;
  return (
    <DibujoTema
      dibujo={PARTICULAS[esquina]}
      color={tema.tema.acento}
      className="pointer-events-none absolute z-10 drop-shadow"
      style={{ width: tam, height: tam, top: -tam * 0.35, [lado === "derecha" ? "right" : "left"]: -tam * 0.25, transform: `rotate(${lado === "derecha" ? 18 : -18}deg)` }}
    />
  );
}
