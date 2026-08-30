"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import GlareHover from "@/components/reactbits/GlareHover";
import { ARITHMETIC_PROBLEM_TYPES, NOMBRE_CATEGORIA_ENIGMIA, type ArithmeticProblemType, type CategoriaEnigmia } from "@/types/database";
import { NOMBRE_MODO_QUIMIA, type ModoQuimia } from "@/lib/practica/quimia";
import { NOMBRE_MODO_ANATOMIA, type ModoAnatomia } from "@/lib/practica/anatomia";
import { NOMBRE_MODO_MELODIA, type ModoMelodia } from "@/lib/practica/melodia";
import type { Continente } from "@/lib/practica/geografia";
import { COLOR_MUNDO, type MundoDuelo } from "@/lib/duelos/rutas";

export type SeleccionMundoDuelo = MundoDuelo | "aleatorio";

const CONTINENTES: Continente[] = ["america", "europa", "africa", "asia_oceania"];

// Los 6 mundos elegibles para duelar, sin descripción — lista base para
// retar a un amigo / invitar por link (Rankeds arma la suya propia, con
// descripciones traducidas y la opción "todas las ciudades").
export const MUNDOS_DUELO: { id: MundoDuelo; nombre: string }[] = [
  { id: "numeria", nombre: "Numeria" },
  { id: "geografia", nombre: "Geografía" },
  { id: "enigmia", nombre: "Enigmia" },
  { id: "quimia", nombre: "Quimia" },
  { id: "anatomia", nombre: "Anatomía" },
  { id: "melodia", nombre: "Melodía" },
];

const NOMBRES_MUNDO: Record<MundoDuelo, string> = {
  numeria: "Numeria",
  geografia: "Geografía",
  enigmia: "Enigmia",
  quimia: "Quimia",
  anatomia: "Anatomía",
  melodia: "Melodía",
};

// nombre/etiqueta de una elección ya hecha (mundo + operación/continente/
// categoría/modo) — usado tanto por SelectorMundoDuelo como por
// AmigosClient (Invitar por link), de ahí el hook en vez de funciones
// sueltas: necesita useTranslations, así que solo puede vivir dentro de
// un componente. NOMBRE_CATEGORIA_ENIGMIA/NOMBRE_MODO_QUIMIA vienen de
// @/types/database y @/lib/practica/quimia — capa de datos compartida
// por más pantallas, fuera del alcance de esta tanda (quedan en español
// por ahora).
export function useEtiquetasDuelo() {
  const tOperaciones = useTranslations("Practica.operationPicker.operaciones");
  const tContinentes = useTranslations("Geografia.continentes");

  function nombreMundo(mundo: MundoDuelo): string {
    return NOMBRES_MUNDO[mundo] ?? mundo;
  }

  function etiquetaOpcion(mundo: MundoDuelo, opcion: string): string {
    if (mundo === "numeria") return tOperaciones(opcion as ArithmeticProblemType);
    if (mundo === "geografia") return tContinentes(opcion as Continente);
    if (mundo === "enigmia") return NOMBRE_CATEGORIA_ENIGMIA[opcion as CategoriaEnigmia] ?? opcion;
    if (mundo === "anatomia") return NOMBRE_MODO_ANATOMIA[opcion as ModoAnatomia] ?? opcion;
    if (mundo === "melodia") return NOMBRE_MODO_MELODIA[opcion as ModoMelodia] ?? opcion;
    return NOMBRE_MODO_QUIMIA[opcion as ModoQuimia] ?? opcion;
  }

  return { nombreMundo, etiquetaOpcion };
}

export interface MundoSeleccionable {
  id: SeleccionMundoDuelo;
  nombre: string;
  descripcion?: string;
}

interface Props {
  mundos: MundoSeleccionable[];
  // Rankeds muestra la descripción de una línea por ciudad (t("ciudades.*")
  // en el namespace Rankeds) — retar a un amigo / invitar por link nunca
  // tuvieron esa copia, así que se omite en vez de inventarla.
  mostrarDescripcion?: boolean;
  // Rankeds solo elige mundo (la operación real la sortea buscar_rival_duelo
  // del lado del servidor). Retar a un amigo / invitar por link necesitan
  // un paso más para elegir operación/continente/categoría/modo.
  requiereSubopcion?: boolean;
  onElegirSubopcion?: (mundo: MundoDuelo, opcion: string) => void;
  // Modo controlado: lo usa Rankeds, que necesita leer el mundo elegido
  // afuera de la grilla (color de fondo, botón de "Buscar partida",
  // armado del polling). Si se omite, el mundo elegido queda como estado
  // interno — es lo que necesitan retar a un amigo / invitar por link,
  // a quienes solo les importa el combo final mundo+opción.
  mundoSeleccionado?: SeleccionMundoDuelo | null;
  onSeleccionarMundo?: (mundo: SeleccionMundoDuelo) => void;
  className?: string;
}

// Selector unificado de ciudad para duelos: mismas tarjetas GlareHover
// con color por mundo en las 3 pantallas donde se elige una ciudad para
// duelar (Rankeds → BuscarPartida, retar a un amigo y invitar por link
// en Amigos/FeedSidebar). Antes eran dos implementaciones duplicadas —
// pills chiquitas sin color en RetarPicker, la grilla con GlareHover acá
// en Rankeds — que además repetían los mismos 6 mundos cada una.
export default function SelectorMundoDuelo({
  mundos,
  mostrarDescripcion = false,
  requiereSubopcion = false,
  onElegirSubopcion,
  mundoSeleccionado,
  onSeleccionarMundo,
  className = "",
}: Props) {
  const tOperaciones = useTranslations("Practica.operationPicker.operaciones");
  const tContinentes = useTranslations("Geografia.continentes");
  const [mundoInterno, setMundoInterno] = useState<SeleccionMundoDuelo | null>(null);
  const mundo = mundoSeleccionado !== undefined ? mundoSeleccionado : mundoInterno;

  function elegirMundo(id: SeleccionMundoDuelo) {
    if (onSeleccionarMundo) {
      onSeleccionarMundo(id);
      return;
    }
    setMundoInterno((actual) => (requiereSubopcion && actual === id ? null : id));
  }

  const opcionesPorMundo: Record<Exclude<MundoDuelo, "numeria">, { id: string; nombre: string }[]> = {
    geografia: CONTINENTES.map((c) => ({ id: c, nombre: tContinentes(c) })),
    enigmia: (Object.keys(NOMBRE_CATEGORIA_ENIGMIA) as CategoriaEnigmia[]).map((c) => ({ id: c, nombre: NOMBRE_CATEGORIA_ENIGMIA[c] })),
    quimia: (Object.keys(NOMBRE_MODO_QUIMIA) as ModoQuimia[]).map((m) => ({ id: m, nombre: NOMBRE_MODO_QUIMIA[m] })),
    anatomia: (Object.keys(NOMBRE_MODO_ANATOMIA) as ModoAnatomia[]).map((m) => ({ id: m, nombre: NOMBRE_MODO_ANATOMIA[m] })),
    melodia: (Object.keys(NOMBRE_MODO_MELODIA) as ModoMelodia[]).map((m) => ({ id: m, nombre: NOMBRE_MODO_MELODIA[m] })),
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="grid grid-cols-2 gap-2">
        {mundos.map((m) => {
          const activo = mundo === m.id;
          const color = m.id === "aleatorio" ? null : COLOR_MUNDO[m.id as MundoDuelo];
          return (
            <GlareHover
              key={m.id}
              width="100%"
              height="auto"
              background="transparent"
              borderColor="transparent"
              borderRadius="0.75rem"
              glareColor={color ?? "#6C4CF1"}
              glareOpacity={activo ? 0.35 : 0.15}
              className="w-full"
            >
              <button
                type="button"
                onClick={() => elegirMundo(m.id)}
                className="flex w-full flex-col items-start gap-0.5 rounded-xl border px-3 py-2.5 text-left transition-colors"
                style={{
                  borderColor: activo ? (color ?? "var(--primario)") : "var(--border)",
                  background: activo
                    ? color
                      ? `${color}1A`
                      : "color-mix(in oklab, var(--primario) 10%, transparent)"
                    : "transparent",
                }}
              >
                <span
                  className="text-sm font-semibold"
                  style={{ color: activo ? (color ?? "var(--primario)") : "var(--foreground)" }}
                >
                  {m.nombre}
                </span>
                {mostrarDescripcion && m.descripcion && (
                  <span className="text-[11px] text-texto-secundario">{m.descripcion}</span>
                )}
              </button>
            </GlareHover>
          );
        })}
      </div>

      {requiereSubopcion && mundo && mundo !== "aleatorio" && (
        <div className="flex flex-wrap gap-1">
          {mundo === "numeria"
            ? ARITHMETIC_PROBLEM_TYPES.map((op) => (
                <button
                  key={op}
                  onClick={() => onElegirSubopcion?.("numeria", op)}
                  className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-foreground hover:border-primario/40"
                >
                  {tOperaciones(op)}
                </button>
              ))
            : opcionesPorMundo[mundo].map((op) => (
                <button
                  key={op.id}
                  onClick={() => onElegirSubopcion?.(mundo, op.id)}
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
