"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import GlareHover from "@/components/reactbits/GlareHover";
import RangoBadge from "@/components/RangoBadge";

export interface FilaRanking {
  user_id: string;
  display_name: string | null;
  xp_semana: number;
  avatar_url: string | null;
  elo_rating: number;
  titulo_activo: string | null;
  titulo_nombre: string | null;
}

interface Props {
  top3: FilaRanking[];
  miUserId: string;
}

// Fase R3: el top 3 tiene que sentirse como el lugar más codiciado de
// la app — nunca una fila más con un número al lado. Alturas de podio
// real (2-1-3 de izquierda a derecha), oro/plata/bronce como acento, y
// un destello (GlareHover) que cruza la tarjeta del 1° apenas carga.
const ESTILO: Record<number, { alto: string; borde: string; fondo: string; medalla: string; texto: string }> = {
  0: { alto: "h-40", borde: "border-[#FFC53D]", fondo: "bg-[#FFC53D]/10", medalla: "🥇", texto: "text-[#B8860B]" },
  1: { alto: "h-28", borde: "border-[#C0C5CE]", fondo: "bg-[#C0C5CE]/10", medalla: "🥈", texto: "text-[#6B7280]" },
  2: { alto: "h-20", borde: "border-[#CD7F32]", fondo: "bg-[#CD7F32]/10", medalla: "🥉", texto: "text-[#8B5A2B]" },
};

function TarjetaPodio({ fila, indice, esUsuarioActual }: { fila: FilaRanking; indice: number; esUsuarioActual: boolean }) {
  const estilo = ESTILO[indice];
  return (
    <Link
      href={`/perfil/${fila.user_id}`}
      className={`flex flex-col items-center gap-2 rounded-t-2xl border-2 border-b-0 ${estilo.borde} ${estilo.fondo} px-4 pt-5 pb-3 transition-transform hover:-translate-y-0.5 ${
        esUsuarioActual ? "ring-2 ring-primario/50" : ""
      }`}
    >
      <span className="text-2xl">{estilo.medalla}</span>
      <Avatar url={fila.avatar_url} nombre={fila.display_name} size={indice === 0 ? 64 : 48} />
      <span className="max-w-[8rem] truncate text-center text-sm font-semibold text-foreground">
        {fila.display_name ?? "Jugador"}
      </span>
      {/* Fase 9: rango de Rankeds, información aparte de la Experiencia
          semanal que ordena este ranking — no lo reemplaza. */}
      <RangoBadge elo={fila.elo_rating} tituloNombre={fila.titulo_nombre} size="sm" />
      <span className={`font-mono text-xs font-bold ${estilo.texto}`}>{fila.xp_semana} Exp</span>
    </Link>
  );
}

export default function Podio({ top3, miUserId }: Props) {
  const [destello, setDestello] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDestello(true), 400);
    return () => clearTimeout(t);
  }, []);

  if (top3.length === 0) return null;

  const [primero, segundo, tercero] = top3;

  return (
    <div className="flex items-end justify-center gap-2 sm:gap-4">
      {segundo && (
        <div className="flex flex-1 flex-col items-center">
          <TarjetaPodio fila={segundo} indice={1} esUsuarioActual={segundo.user_id === miUserId} />
          <div className={`w-full ${ESTILO[1].alto} rounded-b-2xl border-2 border-t-0 ${ESTILO[1].borde} ${ESTILO[1].fondo} flex items-start justify-center pt-1`}>
            <span className="font-display text-lg font-black text-foreground/70">2</span>
          </div>
        </div>
      )}

      {primero && (
        <div className="flex flex-1 flex-col items-center">
          <GlareHover
            width="100%"
            height="auto"
            background="transparent"
            borderColor="transparent"
            borderRadius="1rem 1rem 0 0"
            glareColor="#FFC53D"
            glareOpacity={0.35}
            playOnce
            trigger={destello}
            className="w-full"
          >
            <TarjetaPodio fila={primero} indice={0} esUsuarioActual={primero.user_id === miUserId} />
          </GlareHover>
          <div className={`w-full ${ESTILO[0].alto} rounded-b-2xl border-2 border-t-0 ${ESTILO[0].borde} ${ESTILO[0].fondo} flex items-start justify-center pt-1`}>
            <span className="font-display text-2xl font-black text-foreground/70">1</span>
          </div>
        </div>
      )}

      {tercero && (
        <div className="flex flex-1 flex-col items-center">
          <TarjetaPodio fila={tercero} indice={2} esUsuarioActual={tercero.user_id === miUserId} />
          <div className={`w-full ${ESTILO[2].alto} rounded-b-2xl border-2 border-t-0 ${ESTILO[2].borde} ${ESTILO[2].fondo} flex items-start justify-center pt-1`}>
            <span className="font-display text-lg font-black text-foreground/70">3</span>
          </div>
        </div>
      )}
    </div>
  );
}
