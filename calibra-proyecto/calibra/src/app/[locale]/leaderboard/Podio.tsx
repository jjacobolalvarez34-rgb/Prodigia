"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import GlareHover from "@/components/reactbits/GlareHover";
import RangoBadge from "@/components/RangoBadge";
import NombreConFuente from "@/components/NombreConFuente";
import type { FuenteNombre } from "@/types/database";

export interface FilaRanking {
  user_id: string;
  display_name: string | null;
  xp_semana: number;
  avatar_url: string | null;
  elo_rating: number;
  titulo_activo: string | null;
  titulo_nombre: string | null;
  fuente_nombre?: FuenteNombre | null;
}

interface Props {
  top3: FilaRanking[];
  miUserId: string;
  // Fase 1 del rediseño: sigue al filtro activo (dorado por defecto en
  // "Experiencia total", el color del mundo cuando el filtro es "Por
  // mundo") — se usa en el destello de las 3 tarjetas, no solo la del 1°.
  colorAcento?: string;
}

// Fase R3: el top 3 tiene que sentirse como el lugar más codiciado de
// la app — nunca una fila más con un número al lado. Alturas de podio
// real (2-1-3 de izquierda a derecha), oro/plata/bronce como acento, y
// un destello (GlareHover) que cruza la tarjeta del 1° apenas carga.
//
// El fondo se mezcla contra var(--surface), no contra "transparent"
// (así lo hacía bg-[color]/10 de Tailwind) — mismo patrón que ya usan
// las tarjetas de Quimia/Tienda. Con "transparent", el 10% de color
// queda relativo a lo que sea que esté DETRÁS (el fondo de la página),
// así que en tema oscuro (fondo casi negro) la tarjeta y la base del
// podio se ven casi negras — mismo número, resultado final bien
// distinto entre temas. Contra var(--surface) el mínimo de luminosidad
// es siempre el de la superficie del tema activo, se vea como se vea
// el fondo de la página.
const ESTILO: Record<number, { alto: string; color: string; medalla: string; texto: string }> = {
  0: { alto: "h-40", color: "#FFC53D", medalla: "🥇", texto: "text-[#B8860B]" },
  1: { alto: "h-28", color: "#C0C5CE", medalla: "🥈", texto: "text-[#6B7280]" },
  2: { alto: "h-20", color: "#CD7F32", medalla: "🥉", texto: "text-[#8B5A2B]" },
};

function fondoPodio(color: string): string {
  return `color-mix(in oklab, ${color} 14%, var(--surface))`;
}

function TarjetaPodio({ fila, indice, esUsuarioActual }: { fila: FilaRanking; indice: number; esUsuarioActual: boolean }) {
  const estilo = ESTILO[indice];
  return (
    <Link
      href={`/perfil/${fila.user_id}`}
      // max-w-[8.5rem]: GlareHover centra su contenido (place-items:
      // center en su CSS, no stretch) — sin un tope explícito acá, esta
      // tarjeta se dibuja tan ancha como pida su contenido más ancho
      // (la insignia de rango con título largo), sin importar que sus
      // ancestros ya puedan achicarse. El truncate de más abajo
      // necesita ESTE límite concreto para tener algo contra qué
      // truncar (ver auditoría del "podio cortado" más abajo).
      className={`flex max-w-[8.5rem] flex-col items-center gap-2 rounded-t-2xl border-2 border-b-0 px-4 pt-5 pb-3 transition-transform hover:-translate-y-0.5 ${
        esUsuarioActual ? "ring-2 ring-primario/50" : ""
      }`}
      style={{ borderColor: estilo.color, background: fondoPodio(estilo.color) }}
    >
      <span className="text-2xl">{estilo.medalla}</span>
      <Avatar url={fila.avatar_url} nombre={fila.display_name} size={indice === 0 ? 64 : 48} />
      <span className="max-w-full truncate text-center text-sm font-semibold text-foreground">
        <NombreConFuente nombre={fila.display_name} fuente={fila.fuente_nombre} />
      </span>
      {/* Fase 9: rango de Rankeds, información aparte de la Experiencia
          semanal que ordena este ranking — no lo reemplaza. */}
      <RangoBadge elo={fila.elo_rating} tituloNombre={fila.titulo_nombre} size="sm" className="max-w-full" />
      <span className={`font-mono text-xs font-bold ${estilo.texto}`}>{fila.xp_semana} Exp</span>
    </Link>
  );
}

export default function Podio({ top3, miUserId, colorAcento = "#FFC53D" }: Props) {
  const [destello, setDestello] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDestello(true), 400);
    return () => clearTimeout(t);
  }, []);

  if (top3.length === 0) return null;

  const [primero, segundo, tercero] = top3;

  // "Podio cortado" (reportado como arreglado 2 veces antes, sin
  // resultado real): NO era un problema de border-radius — se verificó
  // con Playwright que el border-radius calculado siempre coincidió
  // exactamente con lo que pide el código, en las 4 combinaciones de
  // tema/viewport, sin overflow:hidden de por medio en ningún ancestro.
  // El bug real, medido con getBoundingClientRect(): a 375px de ancho,
  // la tarjeta de "Lumy" (con una insignia de título larga, "Bautismo
  // de Fuego") terminaba con left:-14.6px y la de "Padre" con
  // right:389.6px — width total de scroll 391px contra un viewport de
  // 375px. Causa: cada columna es `flex-1` pero un hijo flex tiene
  // min-width:auto por default (no min-width:0), así que el navegador
  // nunca la achica más allá del ancho mínimo de SU contenido — una
  // insignia de título larga en una sola columna empuja esa columna más
  // ancha que 1/3 del contenedor, y como el conjunto se centra con
  // justify-center, las dos columnas de los costados terminan
  // recortadas por igual a cada lado. `min-w-0` en cada columna deja
  // que sí se achiquen (el nombre ya trunca con max-w-[8rem] truncate;
  // ahora la insignia de RangoBadge también queda contenida).
  return (
    <div className="flex items-end justify-center gap-2 sm:gap-4">
      {segundo && (
        <div className="flex min-w-0 flex-1 flex-col items-center">
          <GlareHover
            width="100%"
            height="auto"
            background="transparent"
            borderColor="transparent"
            borderRadius="1rem 1rem 0 0"
            glareColor={colorAcento}
            glareOpacity={0.22}
            className="w-full"
          >
            <TarjetaPodio fila={segundo} indice={1} esUsuarioActual={segundo.user_id === miUserId} />
          </GlareHover>
          <div
            className={`w-full ${ESTILO[1].alto} flex items-start justify-center rounded-b-2xl border-2 border-t-0 pt-1`}
            style={{ borderColor: ESTILO[1].color, background: fondoPodio(ESTILO[1].color) }}
          >
            <span className="font-display text-lg font-black text-foreground/70">2</span>
          </div>
        </div>
      )}

      {primero && (
        <div className="flex min-w-0 flex-1 flex-col items-center">
          <GlareHover
            width="100%"
            height="auto"
            background="transparent"
            borderColor="transparent"
            borderRadius="1rem 1rem 0 0"
            glareColor={colorAcento}
            glareOpacity={0.35}
            playOnce
            trigger={destello}
            className="w-full"
          >
            <TarjetaPodio fila={primero} indice={0} esUsuarioActual={primero.user_id === miUserId} />
          </GlareHover>
          <div
            className={`w-full ${ESTILO[0].alto} flex items-start justify-center rounded-b-2xl border-2 border-t-0 pt-1`}
            style={{ borderColor: ESTILO[0].color, background: fondoPodio(ESTILO[0].color) }}
          >
            <span className="font-display text-2xl font-black text-foreground/70">1</span>
          </div>
        </div>
      )}

      {tercero && (
        <div className="flex min-w-0 flex-1 flex-col items-center">
          <GlareHover
            width="100%"
            height="auto"
            background="transparent"
            borderColor="transparent"
            borderRadius="1rem 1rem 0 0"
            glareColor={colorAcento}
            glareOpacity={0.22}
            className="w-full"
          >
            <TarjetaPodio fila={tercero} indice={2} esUsuarioActual={tercero.user_id === miUserId} />
          </GlareHover>
          <div
            className={`w-full ${ESTILO[2].alto} flex items-start justify-center rounded-b-2xl border-2 border-t-0 pt-1`}
            style={{ borderColor: ESTILO[2].color, background: fondoPodio(ESTILO[2].color) }}
          >
            <span className="font-display text-lg font-black text-foreground/70">3</span>
          </div>
        </div>
      )}
    </div>
  );
}
