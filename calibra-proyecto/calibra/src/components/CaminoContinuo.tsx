"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { IconCheck, IconCandado } from "@/components/icons";

const OFFSETS = [0, 56, 88, 56, 0, -56, -88, -56];

export type EstadoNodo = "completado" | "activo" | "bloqueado";

export interface NodoCaminoGenerico {
  id: string;
  slug: string;
  nombre: string;
  estado: EstadoNodo;
}

export interface UnidadCaminoGenerico {
  id: string; // usado como ancla de scroll: #unidad-{id}
  nombre: string;
  descripcion?: string;
  nodos: NodoCaminoGenerico[];
}

interface Props {
  unidades: UnidadCaminoGenerico[];
  basePath: string; // ej. "/aprender" o "/enigmia/aprender"
  colorHex: string;
}

// Camino serpenteante ÚNICO y continuo a través de TODAS las unidades de
// un mundo (Fase GG) — reemplaza la vista de "una unidad a la vez": acá
// el offset zigzag no se reinicia por unidad, sigue acumulando para que
// se sienta como un solo recorrido, con las unidades como hitos dentro
// de él, no como pantallas separadas.
export default function CaminoContinuo({ unidades, basePath, colorHex }: Props) {
  let indice = 0;

  return (
    <div className="flex flex-col items-center gap-2 py-4">
      {unidades.map((unidad) => (
        <div key={unidad.id} id={`unidad-${unidad.id}`} className="flex w-full scroll-mt-24 flex-col items-center gap-8">
          <div className="mt-8 flex flex-col items-center gap-1 text-center first:mt-2">
            <span
              className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide"
              style={{ background: `color-mix(in oklab, ${colorHex} 12%, transparent)`, color: colorHex }}
            >
              {unidad.nombre}
            </span>
            {unidad.descripcion && <p className="max-w-xs text-xs text-texto-secundario">{unidad.descripcion}</p>}
          </div>
          {unidad.nodos.length === 0 ? (
            <NodoProximamente />
          ) : (
            unidad.nodos.map((nodo) => {
              const offset = OFFSETS[indice % OFFSETS.length];
              indice += 1;
              return <Nodo key={nodo.id} nodo={nodo} offset={offset} basePath={basePath} colorHex={colorHex} />;
            })
          )}
        </div>
      ))}
    </div>
  );
}

function Nodo({
  nodo,
  offset,
  basePath,
  colorHex,
}: {
  nodo: NodoCaminoGenerico;
  offset: number;
  basePath: string;
  colorHex: string;
}) {
  const circulo = (
    <motion.div
      initial={{ opacity: 0, scale: nodo.estado === "activo" ? 0.5 : 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      style={{ marginLeft: offset }}
      className="flex flex-col items-center gap-2"
    >
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-full border-2 transition-all ${
          nodo.estado === "completado"
            ? "border-correcto bg-correcto text-white"
            : nodo.estado === "bloqueado"
              ? "border-border bg-surface text-texto-secundario"
              : "text-white"
        }`}
        style={
          nodo.estado === "activo"
            ? { borderColor: colorHex, background: colorHex, boxShadow: `0 0 0 6px color-mix(in oklab, ${colorHex} 15%, transparent)` }
            : undefined
        }
      >
        {nodo.estado === "completado" ? (
          <IconCheck className="h-6 w-6" />
        ) : nodo.estado === "bloqueado" ? (
          <IconCandado className="h-5 w-5" />
        ) : (
          <span className="font-display text-xl font-bold">▶</span>
        )}
      </div>
      <span
        className={`max-w-[110px] text-center text-xs font-medium ${
          nodo.estado === "bloqueado" ? "text-texto-secundario/60" : "text-texto-secundario"
        }`}
      >
        {nodo.nombre}
      </span>
    </motion.div>
  );

  if (nodo.estado === "bloqueado") {
    return (
      <div aria-disabled className="cursor-not-allowed">
        {circulo}
      </div>
    );
  }

  return <Link href={`${basePath}/${nodo.slug}`}>{circulo}</Link>;
}

function NodoProximamente() {
  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-border bg-surface text-texto-secundario">
        <span className="text-xl">···</span>
      </div>
      <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-texto-secundario">
        Próximamente
      </span>
    </div>
  );
}
