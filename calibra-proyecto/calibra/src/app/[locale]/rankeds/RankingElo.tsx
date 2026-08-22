"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/Avatar";
import GlareHover from "@/components/reactbits/GlareHover";
import RangoBadge from "@/components/RangoBadge";
import NombreConFuente from "@/components/NombreConFuente";
import { IconLupa, IconX } from "@/components/icons";
import type { FuenteNombre } from "@/types/database";

export interface FilaRankingElo {
  user_id: string;
  display_name: string | null;
  elo_rating: number;
  avatar_url: string | null;
  titulo_activo: string | null;
  titulo_nombre: string | null;
  fuente_nombre: FuenteNombre | null;
}

type Alcance = "global" | "amigos";

const ESTILO: Record<number, { alto: string; color: string; medalla: string; texto: string }> = {
  0: { alto: "h-40", color: "#FFC53D", medalla: "🥇", texto: "text-[#B8860B]" },
  1: { alto: "h-28", color: "#C0C5CE", medalla: "🥈", texto: "text-[#6B7280]" },
  2: { alto: "h-20", color: "#CD7F32", medalla: "🥉", texto: "text-[#8B5A2B]" },
};

function fondoPodio(color: string): string {
  return `color-mix(in oklab, ${color} 14%, var(--surface))`;
}

// Fase 1 de la tanda "Rankeds/Clanes: bugs y ranking visible" — un
// ranking global competitivo ordenado por ELO nunca había existido
// (auditado: ni la función SQL ni la pantalla). Mismo tratamiento
// visual que el ranking semanal de Experiencia (podio + lista con
// buscador, insignias de rango) — ver leaderboard/Podio.tsx y
// ListaRanking.tsx — pero acá el ELO ES el valor que ordena y se
// muestra grande, no un dato secundario.
export default function RankingElo({ miUserId }: { miUserId: string }) {
  const t = useTranslations("Rankeds.rankingElo");
  const [alcance, setAlcance] = useState<Alcance>("global");
  const [ranking, setRanking] = useState<FilaRankingElo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [buscadorAbierto, setBuscadorAbierto] = useState(false);
  const [query, setQuery] = useState("");

  function elegirAlcance(v: Alcance) {
    setCargando(true);
    setAlcance(v);
  }

  useEffect(() => {
    let cancelado = false;
    const supabase = createClient();
    supabase
      .rpc("ranking_elo_global", { p_solo_amigos: alcance === "amigos" })
      .then(({ data }) => {
        if (cancelado) return;
        setRanking((data ?? []) as FilaRankingElo[]);
        setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [alcance]);

  const top3 = ranking.slice(0, 3);
  const resto = useMemo(() => ranking.slice(3), [ranking]);
  const filtrado = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return resto;
    return resto.filter((f) => (f.display_name ?? "jugador").toLowerCase().includes(q));
  }, [resto, query]);
  const posicionUsuario = ranking.findIndex((f) => f.user_id === miUserId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex w-fit gap-1 rounded-full border border-border bg-surface p-1">
        <button
          onClick={() => elegirAlcance("global")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            alcance === "global" ? "bg-primario text-white" : "text-texto-secundario hover:text-foreground"
          }`}
        >
          {t("global")}
        </button>
        <button
          onClick={() => elegirAlcance("amigos")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            alcance === "amigos" ? "bg-primario text-white" : "text-texto-secundario hover:text-foreground"
          }`}
        >
          {t("amigos")}
        </button>
      </div>

      {cargando ? (
        <p className="py-8 text-center text-sm text-texto-secundario">{t("cargando")}</p>
      ) : ranking.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface px-6 py-8 text-center text-texto-secundario">
          {alcance === "amigos" ? t("ningunoDeTusAmigos") : t("todaviaNoHayNadie")}
        </p>
      ) : (
        <>
          <div className="flex items-end justify-center gap-2 sm:gap-4">
            {[top3[1], top3[0], top3[2]].map((fila, slot) => {
              if (!fila) return <div key={slot} className="flex-1" />;
              const indice = slot === 0 ? 1 : slot === 1 ? 0 : 2;
              return (
                <div key={fila.user_id} className="flex flex-1 flex-col items-center">
                  <GlareHover
                    width="100%"
                    height="auto"
                    background="transparent"
                    borderColor="transparent"
                    borderRadius="1rem 1rem 0 0"
                    glareColor="#FFC53D"
                    glareOpacity={indice === 0 ? 0.35 : 0.22}
                    className="w-full"
                  >
                    <Link
                      href={`/perfil/${fila.user_id}`}
                      className={`flex flex-col items-center gap-2 rounded-t-2xl border-2 border-b-0 px-4 pt-5 pb-3 transition-transform hover:-translate-y-0.5 ${
                        fila.user_id === miUserId ? "ring-2 ring-primario/50" : ""
                      }`}
                      style={{ borderColor: ESTILO[indice].color, background: fondoPodio(ESTILO[indice].color) }}
                    >
                      <span className="text-2xl">{ESTILO[indice].medalla}</span>
                      <Avatar url={fila.avatar_url} nombre={fila.display_name} size={indice === 0 ? 64 : 48} />
                      <span className="max-w-[8rem] truncate text-center text-sm font-semibold text-foreground">
                        <NombreConFuente nombre={fila.display_name} fuente={fila.fuente_nombre} />
                      </span>
                      <RangoBadge elo={fila.elo_rating} tituloNombre={fila.titulo_nombre} size="sm" />
                      <span className={`font-mono text-xs font-bold ${ESTILO[indice].texto}`}>{fila.elo_rating} ELO</span>
                    </Link>
                  </GlareHover>
                  <div
                    className={`w-full ${ESTILO[indice].alto} flex items-start justify-center rounded-b-2xl border-2 border-t-0 pt-1`}
                    style={{ borderColor: ESTILO[indice].color, background: fondoPodio(ESTILO[indice].color) }}
                  >
                    <span className="font-display text-lg font-black text-foreground/70">{indice + 1}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-texto-secundario">{t("restoDelRanking")}</h2>
              <div className="flex items-center">
                {buscadorAbierto && (
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("buscarPorNombre")}
                    className="mr-1 w-40 overflow-hidden rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:border-primario"
                  />
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (buscadorAbierto) setQuery("");
                    setBuscadorAbierto((v) => !v);
                  }}
                  aria-label={buscadorAbierto ? t("cerrarBusqueda") : t("buscarPorNombre")}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-texto-secundario transition-colors hover:bg-surface-2 hover:text-foreground"
                >
                  {buscadorAbierto ? <IconX className="h-4 w-4" /> : <IconLupa className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {filtrado.length === 0 ? (
              <p className="rounded-xl border border-border bg-surface px-4 py-6 text-center text-sm text-texto-secundario">
                {resto.length === 0 ? t("nadieMasTodavia") : t("nadieConEseNombre")}
              </p>
            ) : (
              <ol className="flex flex-col gap-2">
                {filtrado.map((fila) => (
                  <li
                    key={fila.user_id}
                    id={`fila-ranking-elo-${fila.user_id}`}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-colors ${
                      fila.user_id === miUserId ? "border-primario/40 bg-primario/5" : "border-border bg-surface"
                    }`}
                  >
                    <Link href={`/perfil/${fila.user_id}`} className="flex min-w-0 items-center gap-3">
                      <span className="w-6 shrink-0 text-center font-mono text-sm text-texto-secundario">
                        {resto.indexOf(fila) + 4}
                      </span>
                      <Avatar url={fila.avatar_url} nombre={fila.display_name} size={32} />
                      <span className="min-w-0 truncate font-medium text-foreground hover:underline">
                        <NombreConFuente nombre={fila.display_name} fuente={fila.fuente_nombre} />
                      </span>
                      <RangoBadge elo={fila.elo_rating} tituloNombre={fila.titulo_nombre} size="sm" className="shrink-0" />
                    </Link>
                    <span className="shrink-0 font-mono font-semibold text-[#FFC53D]">{fila.elo_rating} ELO</span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {posicionUsuario === -1 && (
            <p className="text-sm text-texto-secundario">
              {alcance === "amigos" ? t("ningunoDeTusAmigos") : t("todaviaNoJugasteClasificatorio")}
            </p>
          )}
        </>
      )}
    </div>
  );
}
