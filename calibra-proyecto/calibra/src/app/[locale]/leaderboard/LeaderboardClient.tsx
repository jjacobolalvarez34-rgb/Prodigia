"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import BorderGlow from "@/components/reactbits/BorderGlow";
import Podio, { type FilaRanking } from "./Podio";
import ListaRanking from "./ListaRanking";

type Alcance = "global" | "amigos";
type Filtro = "total" | "mundo";
type Mundo = "numeria" | "enigmia" | "geografia" | "quimia" | "anatomia" | "melodia" | "trigonometria" | "historia" | "calculia" | "circuitia" | "estadistica" | "naipia" | "codia";

const MUNDOS: { id: Mundo; colorHex: string }[] = [
  { id: "numeria", colorHex: "#6C4CF1" },
  { id: "enigmia", colorHex: "#0E9F6E" },
  { id: "geografia", colorHex: "#1E7A8C" },
  { id: "quimia", colorHex: "#C026D3" },
  { id: "anatomia", colorHex: "#8B2942" },
  { id: "melodia", colorHex: "#B8860B" },
  { id: "trigonometria", colorHex: "#84CC16" },
  { id: "historia", colorHex: "#A0522D" },
  { id: "calculia", colorHex: "#4338CA" },
  { id: "circuitia", colorHex: "#F59E0B" },
  { id: "estadistica", colorHex: "#0D9488" },
  { id: "naipia", colorHex: "#B91C1C" },
  { id: "codia", colorHex: "#06B6D4" },
];

interface Props {
  rankingInicial: FilaRanking[];
  miUserId: string;
}

// Fase 1 del rediseño de Ranking/Social: el filtro "Experiencia total /
// Por mundo" vivía antes SOLO en RankingRankeds.tsx (dentro de Amigos,
// una versión chica de 8 filas) — se saca de ahí y se trae acá como la
// experiencia completa (podio + lista con buscador), sumando un
// segundo eje "Global / Amigos". Misma función SQL para las 4
// combinaciones (ranking_semanal_filtrado).
export default function LeaderboardClient({ rankingInicial, miUserId }: Props) {
  const t = useTranslations("Leaderboard");
  const tMundos = useTranslations("Mundos.nombres");
  const [alcance, setAlcance] = useState<Alcance>("global");
  const [filtro, setFiltro] = useState<Filtro>("total");
  const [mundo, setMundo] = useState<Mundo>("numeria");
  const [ranking, setRanking] = useState(rankingInicial);
  const [cargando, setCargando] = useState(false);

  function recargar(nuevoAlcance: Alcance, nuevoFiltro: Filtro, nuevoMundo: Mundo) {
    setCargando(true);
    const supabase = createClient();
    supabase
      .rpc("ranking_semanal_filtrado", {
        p_mundo: nuevoFiltro === "mundo" ? nuevoMundo : null,
        p_solo_amigos: nuevoAlcance === "amigos",
      })
      .then(({ data }) => {
        setRanking((data ?? []) as FilaRanking[]);
        setCargando(false);
      });
  }

  function elegirAlcance(v: Alcance) {
    setAlcance(v);
    recargar(v, filtro, mundo);
  }
  function elegirFiltro(v: Filtro) {
    setFiltro(v);
    recargar(alcance, v, mundo);
  }
  function elegirMundo(v: Mundo) {
    setMundo(v);
    recargar(alcance, "mundo", v);
  }

  const colorActivo = filtro === "mundo" ? MUNDOS.find((m) => m.id === mundo)!.colorHex : "#FFC53D";
  const top3 = ranking.slice(0, 3);
  const resto = ranking.slice(3);
  const posicionUsuario = ranking.findIndex((f) => f.user_id === miUserId);

  return (
    <div className="flex flex-col gap-8">
      <BorderGlow
        backgroundColor="transparent"
        borderRadius={20}
        glowRadius={20}
        colors={["#6C4CF1", "#A794FF", "#FFC53D"]}
        glowColor="255 65% 68%"
      >
        <div className="flex flex-col gap-3 px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex rounded-full border border-border bg-background p-0.5 text-sm">
              <button
                onClick={() => elegirAlcance("global")}
                className={`rounded-full px-4 py-1.5 font-medium transition-colors ${
                  alcance === "global" ? "bg-primario text-white" : "text-texto-secundario"
                }`}
              >
                {t("tabs.global")}
              </button>
              <button
                onClick={() => elegirAlcance("amigos")}
                className={`rounded-full px-4 py-1.5 font-medium transition-colors ${
                  alcance === "amigos" ? "bg-primario text-white" : "text-texto-secundario"
                }`}
              >
                {t("tabs.amigos")}
              </button>
            </div>
            <div className="flex rounded-full border border-border bg-background p-0.5 text-xs">
              <button
                onClick={() => elegirFiltro("total")}
                className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
                  filtro === "total" ? "bg-primario text-white" : "text-texto-secundario"
                }`}
              >
                {t("filtros.total")}
              </button>
              <button
                onClick={() => elegirFiltro("mundo")}
                className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
                  filtro === "mundo" ? "bg-primario text-white" : "text-texto-secundario"
                }`}
              >
                {t("filtros.mundo")}
              </button>
            </div>
          </div>

          {filtro === "mundo" && (
            // Bug real (2026-09-15): "el ranking por mundo se desborda en
            // celular" — 8 mundos en una fila sin wrap ni scroll se salían
            // del ancho de la pantalla. overflow-x-auto lo vuelve un
            // carrusel horizontal en vez de desbordar la página entera.
            <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
              {MUNDOS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => elegirMundo(m.id)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    mundo === m.id ? "text-white" : "border-border text-texto-secundario"
                  }`}
                  style={mundo === m.id ? { background: m.colorHex, borderColor: m.colorHex } : undefined}
                >
                  {tMundos(m.id)}
                </button>
              ))}
            </div>
          )}
        </div>
      </BorderGlow>

      {cargando ? (
        <p className="py-8 text-center text-sm text-texto-secundario">{t("cargando")}</p>
      ) : ranking.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface px-6 py-8 text-center text-texto-secundario">
          {alcance === "amigos"
            ? t("vacioAmigos")
            : t("vacioGlobal")}
        </p>
      ) : (
        <>
          <Podio top3={top3} miUserId={miUserId} colorAcento={colorActivo} />
          <ListaRanking resto={resto} miUserId={miUserId} colorAcento={colorActivo} />
        </>
      )}

      {ranking.length > 0 && posicionUsuario === -1 && (
        <p className="text-sm text-texto-secundario">
          {alcance === "amigos"
            ? t("noSumasteAmigos")
            : t("noSumasteGlobal")}
        </p>
      )}
    </div>
  );
}
