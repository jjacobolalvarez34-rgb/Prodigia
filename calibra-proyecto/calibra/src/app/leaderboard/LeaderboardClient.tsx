"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import BorderGlow from "@/components/reactbits/BorderGlow";
import Podio, { type FilaRanking } from "./Podio";
import ListaRanking from "./ListaRanking";

type Alcance = "global" | "amigos";
type Filtro = "total" | "mundo";
type Mundo = "numeria" | "enigmia" | "geografia" | "quimia";

const MUNDOS: { id: Mundo; nombre: string; colorHex: string }[] = [
  { id: "numeria", nombre: "Numeria", colorHex: "#6C4CF1" },
  { id: "enigmia", nombre: "Enigmia", colorHex: "#0E9F6E" },
  { id: "geografia", nombre: "Geografía", colorHex: "#1E7A8C" },
  { id: "quimia", nombre: "Quimia", colorHex: "#C026D3" },
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
                Global
              </button>
              <button
                onClick={() => elegirAlcance("amigos")}
                className={`rounded-full px-4 py-1.5 font-medium transition-colors ${
                  alcance === "amigos" ? "bg-primario text-white" : "text-texto-secundario"
                }`}
              >
                Amigos
              </button>
            </div>
            <div className="flex rounded-full border border-border bg-background p-0.5 text-xs">
              <button
                onClick={() => elegirFiltro("total")}
                className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
                  filtro === "total" ? "bg-primario text-white" : "text-texto-secundario"
                }`}
              >
                Experiencia total
              </button>
              <button
                onClick={() => elegirFiltro("mundo")}
                className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
                  filtro === "mundo" ? "bg-primario text-white" : "text-texto-secundario"
                }`}
              >
                Por mundo
              </button>
            </div>
          </div>

          {filtro === "mundo" && (
            <div className="flex gap-1.5">
              {MUNDOS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => elegirMundo(m.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    mundo === m.id ? "text-white" : "border-border text-texto-secundario"
                  }`}
                  style={mundo === m.id ? { background: m.colorHex, borderColor: m.colorHex } : undefined}
                >
                  {m.nombre}
                </button>
              ))}
            </div>
          )}
        </div>
      </BorderGlow>

      {cargando ? (
        <p className="py-8 text-center text-sm text-texto-secundario">Cargando...</p>
      ) : ranking.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface px-6 py-8 text-center text-texto-secundario">
          {alcance === "amigos"
            ? "Ninguno de tus amigos sumó experiencia esta semana todavía."
            : "Todavía nadie sumó experiencia esta semana — ¡arrancá vos!"}
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
            ? "Todavía no sumaste experiencia esta semana."
            : "Todavía no sumaste experiencia esta semana — practicá para entrar al ranking."}
        </p>
      )}
    </div>
  );
}
