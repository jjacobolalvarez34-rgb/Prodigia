"use client";

import { Link } from "@/i18n/navigation";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import CountUp from "@/components/CountUp";
import GestoLogo from "@/components/GestoLogo";
import RangoBadge from "@/components/RangoBadge";
import { rangoDeElo } from "@/types/database";
import { reproducirTono } from "@/lib/sonido";
import PodioDuelo, { mejorDe } from "@/components/duelos/PodioDuelo";

export interface ResultadoDuelo {
  resuelto: boolean;
  elo_nuevo: number;
  elo_anterior: number;
  gane: boolean;
  empate: boolean;
  oponente_nombre: string | null;
  oponente_id: string | null;
  mi_puntaje?: number | null;
  rival_puntaje?: number | null;
  oponente_es_bot?: boolean | null;
  // Casual (false): sin ELO en la pantalla (el ELO no se mueve, 0244/0282).
  clasificatorio?: boolean | null;
  // Sección "Rankeds visual" (tanda nocturna): desglose completo
  // (aciertos/precisión/tiempo) para el tratamiento tetr.io de la
  // pantalla de resultado — ya vivía en duel_results, ver
  // registrar_resultado_duelo en 0066_clan_de_bots.sql.
  mi_precision?: number | null;
  mi_tiempo_promedio?: number | null;
  rival_precision?: number | null;
  rival_tiempo_promedio?: number | null;
}

// Fase 3 (Clan de Bots): mismo tratamiento visual que la etiqueta
// "Casual" que ya existe en el historial de Rankeds — un dato
// secundario discreto, nunca una alerta. Nunca se oculta, pero tampoco
// interrumpe nada.
function TagClanDeBots() {
  const t = useTranslations("Duelos.resultado");
  return (
    <span className="ml-1.5 rounded-full bg-foreground/[0.06] px-2 py-0.5 align-middle text-[10px] font-medium uppercase tracking-wide text-texto-secundario">
      {t("clanDeBots")}
    </span>
  );
}

interface Props {
  duelo: ResultadoDuelo | null | undefined;
}

// Fase 3 (tratamiento tetr.io): el ELO es "el resultado que más
// importa" — el elemento más grande de toda la pantalla, más que el
// título VICTORIA/DERROTA. Los dígitos animados (CountUp) van en un
// tamaño que ningún otro texto de la pantalla iguala.
function BloqueElo({ anterior, nuevo }: { anterior: number; nuevo: number }) {
  const t = useTranslations("Duelos.resultado");
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-texto-secundario">{t("elo")}</span>
      <CountUp
        from={anterior}
        value={nuevo}
        className="font-display text-6xl font-black leading-none tabular-nums text-foreground sm:text-7xl"
      />
    </div>
  );
}

// TOTAL_PREGUNTAS es 10 en todos los mundos (Numeria/Geografía/Enigmia/
// Quimia) — precision ya es correctos/total, así que aciertos se
// deriva sin necesitar una columna nueva.
const TOTAL_PREGUNTAS = 10;

function segundos(ms: number | null | undefined): string {
  return ms == null ? "—" : `${(ms / 1000).toFixed(1)}s`;
}

function pct(p: number | null | undefined): string {
  return p == null ? "—" : `${Math.round(p * 100)}%`;
}

function aciertos(p: number | null | undefined): string {
  return p == null ? "—" : `${Math.round(p * TOTAL_PREGUNTAS)}/${TOTAL_PREGUNTAS}`;
}

// Fase 3: desglose completo lado a lado (aciertos/precisión/tiempo
// promedio), no solo el puntaje final — mismo espíritu que la
// comparativa de tetr.io.
function DesgloseCompleto({ duelo }: { duelo: ResultadoDuelo }) {
  const t = useTranslations("Duelos.resultado");
  const hayDesglose = duelo.mi_precision != null || duelo.rival_precision != null;
  if (!hayDesglose) return null;
  return (
    <div className="mt-3 grid w-full max-w-xs grid-cols-[1fr_auto_1fr] items-center gap-x-3 gap-y-2 text-center">
      <span className="text-xs font-semibold text-foreground">{t("tu")}</span>
      <span />
      <span className="text-xs font-semibold text-foreground">{t("rival")}</span>

      <span className="font-mono text-sm font-bold text-foreground">{aciertos(duelo.mi_precision)}</span>
      <span className="text-[10px] uppercase tracking-wide text-texto-secundario">{t("aciertos")}</span>
      <span className="font-mono text-sm font-bold text-foreground">{aciertos(duelo.rival_precision)}</span>

      <span className="font-mono text-sm font-bold text-foreground">{pct(duelo.mi_precision)}</span>
      <span className="text-[10px] uppercase tracking-wide text-texto-secundario">{t("precision")}</span>
      <span className="font-mono text-sm font-bold text-foreground">{pct(duelo.rival_precision)}</span>

      <span className="font-mono text-sm font-bold text-foreground">{segundos(duelo.mi_tiempo_promedio)}</span>
      <span className="text-[10px] uppercase tracking-wide text-texto-secundario">{t("tiempoProm")}</span>
      <span className="font-mono text-sm font-bold text-foreground">{segundos(duelo.rival_tiempo_promedio)}</span>
    </div>
  );
}

// Podio (2026-11-02, igual que la app): pedestales, por qué ganó quien ganó y la
// comparación fila por fila con lo mejor resaltado.
function PodioDe({ duelo }: { duelo: ResultadoDuelo }) {
  const t = useTranslations("Duelos.resultado");
  const rival = duelo.oponente_nombre ?? t("rivalPorDefecto");
  const num = (p: number | null | undefined) => (p == null ? null : Math.round(p * TOTAL_PREGUNTAS));
  const a1 = num(duelo.mi_precision);
  const a2 = num(duelo.rival_precision);
  const t1 = duelo.mi_tiempo_promedio ?? null;
  const t2 = duelo.rival_tiempo_promedio ?? null;
  let motivo: string;
  if (duelo.empate) motivo = t("motivoEmpate");
  else if (a1 != null && a2 != null && a1 !== a2) motivo = duelo.gane ? t("motivoAciertosTu", { n: Math.abs(a1 - a2) }) : t("motivoAciertosRival", { n: Math.abs(a1 - a2), rival });
  else if (t1 != null && t2 != null && Math.abs(t1 - t2) >= 100) {
    const s = (Math.abs(t1 - t2) / 1000).toFixed(1);
    motivo = duelo.gane ? t("motivoRapidoTu", { s }) : t("motivoRapidoRival", { s, rival });
  } else motivo = duelo.gane ? t("motivoDificilTu") : t("motivoDificilRival", { rival });
  const hayDesglose = duelo.mi_precision != null || duelo.rival_precision != null;
  return (
    <div className="mt-4 flex w-full justify-center">
      <PodioDuelo
        gane={duelo.gane}
        empate={duelo.empate}
        rival={rival}
        puntajes={[duelo.mi_puntaje ?? null, duelo.rival_puntaje ?? null]}
        motivo={motivo}
        filas={
          hayDesglose
            ? [
                { etiqueta: t("aciertos"), mio: aciertos(duelo.mi_precision), suyo: aciertos(duelo.rival_precision), mejor: mejorDe(duelo.mi_precision, duelo.rival_precision, true) },
                { etiqueta: t("precision"), mio: pct(duelo.mi_precision), suyo: pct(duelo.rival_precision), mejor: mejorDe(duelo.mi_precision, duelo.rival_precision, true) },
                { etiqueta: t("tiempoRespuesta"), mio: segundos(t1), suyo: segundos(t2), mejor: mejorDe(t1, t2, false) },
                { etiqueta: t("puntaje"), mio: String(duelo.mi_puntaje ?? "—"), suyo: String(duelo.rival_puntaje ?? "—"), mejor: mejorDe(duelo.mi_puntaje, duelo.rival_puntaje, true) },
              ]
            : undefined
        }
      />
    </div>
  );
}

// Fase 7: pantalla de resultado de duelo mejorada — comparativa lado a
// lado, el cambio de ELO animado (cuenta desde el anterior, no un
// "+14" estático), y si el cambio de ELO cruza un umbral de rango, una
// celebración extra más grande que la de un cambio de ELO normal.
// Compartido entre Numeria (SprintSummary) y, a futuro, Geografía/
// Enigmia — un solo lugar para esta lógica.
export default function ResultadoDueloBlock({ duelo }: Props) {
  const t = useTranslations("Duelos.resultado");
  const sonoRef = useRef(false);
  useEffect(() => {
    if (duelo && duelo.resuelto && !duelo.empate && !sonoRef.current) {
      sonoRef.current = true;
      reproducirTono(duelo.gane ? "duelo_gano" : "duelo_perdio");
    }
  }, [duelo]);

  if (!duelo) return null;

  if (!duelo.resuelto) {
    return (
      <div className="rounded-2xl border border-border bg-surface px-5 py-4 text-center">
        {duelo.mi_puntaje != null && (
          <p className="font-mono text-2xl font-bold text-foreground">
            {duelo.mi_puntaje} <span className="text-sm font-normal text-texto-secundario">{t("puntos")}</span>
          </p>
        )}
        <p className="mt-1 text-sm font-medium text-foreground">{t("esperandoRival")}</p>
        <p className="mt-1 text-xs text-texto-secundario">
          {t("enCuantoTermine", { oponente: duelo.oponente_nombre ?? t("rivalPorDefecto") })}
        </p>
        <DesgloseCompleto duelo={duelo} />
      </div>
    );
  }

  const rangoAnterior = rangoDeElo(duelo.elo_anterior);
  const rangoNuevo = rangoDeElo(duelo.elo_nuevo);
  const conElo = duelo.clasificatorio !== false;
  const subioDeRango = conElo && duelo.gane && rangoNuevo.slug !== rangoAnterior.slug;

  if (duelo.empate) {
    return (
      <div className="flex flex-col items-center gap-1 rounded-2xl bg-surface-2 px-6 pb-5 pt-4 text-center">
        <p className="font-display text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl">{t("empate")}</p>
        <p className="mt-1 text-sm font-medium text-texto-secundario">
          {t("empataronCon", { oponente: duelo.oponente_nombre ?? t("rivalPorDefecto") })}
          {duelo.oponente_es_bot && <TagClanDeBots />}
        </p>
        <PodioDe duelo={duelo} />
        {conElo && (
          <div className="mt-3">
            <BloqueElo anterior={duelo.elo_anterior} nuevo={duelo.elo_nuevo} />
          </div>
        )}
        {duelo.oponente_id && !duelo.oponente_es_bot && (
          <Link href={`/perfil/${duelo.oponente_id}`} className="mt-3 block text-xs font-semibold text-primario hover:underline">
            {t("verPerfil")}
          </Link>
        )}
      </div>
    );
  }

  if (duelo.gane) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "backOut" }}
        className="relative flex flex-col items-center gap-1 rounded-2xl bg-correcto/10 px-6 pb-5 pt-2 text-center"
      >
        <div className="pointer-events-none -mb-4 -mt-6">
          <GestoLogo size={subioDeRango ? 130 : 90} colorHex={subioDeRango ? undefined : "#3FB88B"} />
        </div>
        <p className="font-display text-4xl font-black uppercase tracking-tight text-correcto sm:text-5xl">{t("victoria")}</p>
        <p className="mt-1 text-sm font-medium text-foreground">
          {t("leGanasteA", { oponente: duelo.oponente_nombre ?? t("rivalPorDefecto") })}
          {duelo.oponente_es_bot && <TagClanDeBots />}
        </p>
        <PodioDe duelo={duelo} />
        {conElo && (
          <div className="mt-3">
            <BloqueElo anterior={duelo.elo_anterior} nuevo={duelo.elo_nuevo} />
          </div>
        )}
        {subioDeRango && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5, ease: "backOut" }}
            className="mt-3 flex flex-col items-center gap-1 rounded-xl bg-logro/15 px-4 py-3"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-texto-secundario">{t("subisteDeRango")}</span>
            <RangoBadge elo={duelo.elo_nuevo} size="lg" />
          </motion.div>
        )}
        {duelo.oponente_id && !duelo.oponente_es_bot && (
          <Link href={`/perfil/${duelo.oponente_id}`} className="mt-3 text-xs font-semibold text-primario hover:underline">
            {t("verPerfil")}
          </Link>
        )}
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-surface px-6 pb-5 pt-4 text-center">
      {/* Mismo tono suave que ya tenía el texto de derrota — no se
          cambia, solo se le suma el tratamiento tipográfico grande al
          título de arriba. */}
      <p className="font-display text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl">{t("derrota")}</p>
      <p className="mt-1 text-sm font-medium text-texto-secundario">
        {t("estaVezGano", { oponente: duelo.oponente_nombre ?? t("rivalPorDefecto") })}
        {duelo.oponente_es_bot && <TagClanDeBots />}
      </p>
      <PodioDe duelo={duelo} />
      {conElo && (
        <div className="mt-3">
          <BloqueElo anterior={duelo.elo_anterior} nuevo={duelo.elo_nuevo} />
        </div>
      )}
      <div className="mt-3 flex items-center gap-3">
        {duelo.oponente_id && !duelo.oponente_es_bot && (
          <Link href={`/perfil/${duelo.oponente_id}`} className="text-xs font-semibold text-primario hover:underline">
            {t("verPerfil")}
          </Link>
        )}
        <Link href="/social?tab=amigos" className="text-xs font-semibold text-primario hover:underline">
          {t("pedirRevancha")}
        </Link>
      </div>
    </div>
  );
}
