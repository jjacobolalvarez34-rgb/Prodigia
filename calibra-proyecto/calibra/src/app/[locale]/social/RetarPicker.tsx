"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ARITHMETIC_PROBLEM_TYPES, NOMBRE_CATEGORIA_ENIGMIA, type ArithmeticProblemType, type CategoriaEnigmia } from "@/types/database";
import { NOMBRE_MODO_QUIMIA, type ModoQuimia } from "@/lib/practica/quimia";
import type { Continente } from "@/lib/practica/geografia";
import type { MundoDuelo } from "@/lib/duelos/rutas";

const MUNDOS: { id: MundoDuelo; nombre: string; colorHex: string }[] = [
  { id: "numeria", nombre: "Numeria", colorHex: "#6C4CF1" },
  { id: "geografia", nombre: "Geografía", colorHex: "#1E7A8C" },
  { id: "enigmia", nombre: "Enigmia", colorHex: "#0E9F6E" },
  { id: "quimia", nombre: "Quimia", colorHex: "#C026D3" },
];

const CONTINENTES: Continente[] = ["america", "europa", "africa", "asia_oceania"];

// nombre/etiqueta de una elección ya hecha (mundo + operación/continente/
// categoría/modo) — usado tanto acá como en AmigosClient (Invitar por
// link), de ahí el hook en vez de funciones sueltas: necesita
// useTranslations, así que solo puede vivir dentro de un componente.
// NOMBRE_CATEGORIA_ENIGMIA/NOMBRE_MODO_QUIMIA vienen de @/types/database y
// @/lib/practica/quimia — capa de datos compartida por más pantallas,
// fuera del alcance de esta tanda (quedan en español por ahora).
export function useEtiquetasDuelo() {
  const tOperaciones = useTranslations("Practica.operationPicker.operaciones");
  const tContinentes = useTranslations("Geografia.continentes");

  function nombreMundo(mundo: MundoDuelo): string {
    return MUNDOS.find((m) => m.id === mundo)?.nombre ?? mundo;
  }

  function etiquetaOpcion(mundo: MundoDuelo, opcion: string): string {
    if (mundo === "numeria") return tOperaciones(opcion as ArithmeticProblemType);
    if (mundo === "geografia") return tContinentes(opcion as Continente);
    if (mundo === "enigmia") return NOMBRE_CATEGORIA_ENIGMIA[opcion as CategoriaEnigmia] ?? opcion;
    return NOMBRE_MODO_QUIMIA[opcion as ModoQuimia] ?? opcion;
  }

  return { nombreMundo, etiquetaOpcion };
}

interface Props {
  onElegir: (mundo: MundoDuelo, opcion: string) => void;
}

// Selector de ciudad + operación/continente/categoría/modo para retar a
// un amigo directamente — un solo componente usado por FeedSidebar
// (barra lateral del Feed) y AmigosClient (pestaña Amigos) en vez de
// que cada uno tenga su propio picker de operaciones (que además solo
// cubría Numeria).
export default function RetarPicker({ onElegir }: Props) {
  const tOperaciones = useTranslations("Practica.operationPicker.operaciones");
  const tContinentes = useTranslations("Geografia.continentes");
  const [mundo, setMundo] = useState<MundoDuelo | null>(null);

  const opcionesPorMundo: Record<Exclude<MundoDuelo, "numeria">, { id: string; nombre: string }[]> = {
    geografia: CONTINENTES.map((c) => ({ id: c, nombre: tContinentes(c) })),
    enigmia: (Object.keys(NOMBRE_CATEGORIA_ENIGMIA) as CategoriaEnigmia[]).map((c) => ({ id: c, nombre: NOMBRE_CATEGORIA_ENIGMIA[c] })),
    quimia: (Object.keys(NOMBRE_MODO_QUIMIA) as ModoQuimia[]).map((m) => ({ id: m, nombre: NOMBRE_MODO_QUIMIA[m] })),
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap gap-1">
        {MUNDOS.map((m) => (
          <button
            key={m.id}
            onClick={() => setMundo(mundo === m.id ? null : m.id)}
            className="rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors"
            style={
              mundo === m.id
                ? { borderColor: m.colorHex, background: `${m.colorHex}1A`, color: m.colorHex }
                : { borderColor: "var(--border)", color: "var(--texto-secundario)" }
            }
          >
            {m.nombre}
          </button>
        ))}
      </div>
      {mundo === "numeria" && (
        <div className="flex flex-wrap gap-1">
          {ARITHMETIC_PROBLEM_TYPES.map((op) => (
            <button
              key={op}
              onClick={() => onElegir("numeria", op)}
              className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-foreground hover:border-primario/40"
            >
              {tOperaciones(op)}
            </button>
          ))}
        </div>
      )}
      {mundo && mundo !== "numeria" && (
        <div className="flex flex-wrap gap-1">
          {opcionesPorMundo[mundo].map((op) => (
            <button
              key={op.id}
              onClick={() => onElegir(mundo, op.id)}
              className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-foreground hover:border-primario/40"
            >
              {op.nombre}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
