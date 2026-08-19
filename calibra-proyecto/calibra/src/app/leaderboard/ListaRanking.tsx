"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "@/components/Avatar";
import RangoBadge from "@/components/RangoBadge";
import ScrollFloat from "@/components/reactbits/ScrollFloat";
import { IconLupa, IconX } from "@/components/icons";
import type { FilaRanking } from "./Podio";

interface Props {
  // Puesto 4 en adelante, la lista COMPLETA (no un top 10 recortado) —
  // el buscador solo tiene sentido si hay algo más que buscar más allá
  // de las 7 filas que entraban antes en pantalla.
  resto: FilaRanking[];
  miUserId: string;
}

// Fase R3 v2: antes esto vivía inline en page.tsx y solo mostraba hasta
// el puesto 10. Ahora es su propio componente de cliente porque necesita
// estado (buscador, filtro en vivo) que un server component no puede
// tener.
export default function ListaRanking({ resto, miUserId }: Props) {
  const [buscadorAbierto, setBuscadorAbierto] = useState(false);
  const [query, setQuery] = useState("");

  const filtrado = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return resto;
    return resto.filter((f) => (f.display_name ?? "jugador").toLowerCase().includes(q));
  }, [resto, query]);

  const estoyFueraDelPodio = resto.some((f) => f.user_id === miUserId);

  function irAMiPosicion() {
    document.getElementById(`fila-ranking-${miUserId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function toggleBuscador() {
    if (buscadorAbierto) setQuery("");
    setBuscadorAbierto((v) => !v);
  }

  if (resto.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-texto-secundario">
          Resto del ranking
        </h2>
        <div className="flex items-center gap-2">
          {estoyFueraDelPodio && (
            <button
              type="button"
              onClick={irAMiPosicion}
              className="whitespace-nowrap rounded-full border border-primario/30 bg-primario/5 px-3 py-1.5 text-xs font-medium text-primario transition-colors hover:bg-primario/10"
            >
              Ir a mi posición
            </button>
          )}
          <div className="flex items-center">
            <AnimatePresence initial={false}>
              {buscadorAbierto && (
                <motion.input
                  key="campo-busqueda"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 160, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por nombre..."
                  className="mr-1 overflow-hidden rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:border-primario"
                />
              )}
            </AnimatePresence>
            <button
              type="button"
              onClick={toggleBuscador}
              aria-label={buscadorAbierto ? "Cerrar búsqueda" : "Buscar por nombre"}
              aria-pressed={buscadorAbierto}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-texto-secundario transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              {buscadorAbierto ? <IconX className="h-4 w-4" /> : <IconLupa className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {filtrado.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface px-4 py-6 text-center text-sm text-texto-secundario">
          Nadie con ese nombre en el ranking de esta semana.
        </p>
      ) : (
        <ol className="flex flex-col gap-2">
          {filtrado.map((fila) => (
            <FilaRankingRow
              key={fila.user_id}
              fila={fila}
              posicion={resto.indexOf(fila) + 4}
              esUsuarioActual={fila.user_id === miUserId}
            />
          ))}
        </ol>
      )}
    </div>
  );
}

function FilaRankingRow({
  fila,
  posicion,
  esUsuarioActual,
}: {
  fila: FilaRanking;
  posicion: number;
  esUsuarioActual: boolean;
}) {
  return (
    <li
      id={`fila-ranking-${fila.user_id}`}
      className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-colors ${
        esUsuarioActual ? "border-primario/40 bg-primario/5" : "border-border bg-surface"
      }`}
    >
      <Link href={`/perfil/${fila.user_id}`} className="flex min-w-0 items-center gap-3">
        <span className="w-6 shrink-0 text-center font-mono text-sm text-texto-secundario">{posicion}</span>
        <Avatar url={fila.avatar_url} nombre={fila.display_name} size={32} />
        <span className="min-w-0 truncate font-medium text-foreground hover:underline">
          {/* stagger más chico que el default de React Bits (0.03): con
              nombres cortos el default se siente como una espera larga
              letra por letra — 0.015 lo hace sentir fluido sin perder el
              efecto. scrollStart/scrollEnd quedan en su default (son
              relativos al viewport, no al alto del elemento — ya dan un
              rango de scroll generoso incluso en una fila chica). */}
          <ScrollFloat stagger={0.015} animationDuration={0.7}>
            {fila.display_name ?? "Jugador"}
          </ScrollFloat>
        </span>
        <RangoBadge elo={fila.elo_rating} tituloNombre={fila.titulo_nombre} size="sm" className="shrink-0" />
      </Link>
      <span className="shrink-0 font-mono font-semibold text-primario">
        <ScrollFloat stagger={0.02} animationDuration={0.7}>
          {`${fila.xp_semana} Exp`}
        </ScrollFloat>
      </span>
    </li>
  );
}
