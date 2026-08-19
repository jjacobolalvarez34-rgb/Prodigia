"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import CountUp from "@/components/CountUp";
import GestoLogo from "@/components/GestoLogo";
import RangoBadge from "@/components/RangoBadge";
import { rangoDeElo } from "@/types/database";
import { reproducirTono } from "@/lib/sonido";

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
}

interface Props {
  duelo: ResultadoDuelo | null | undefined;
}

function BarraComparacion({ miPuntaje, rivalPuntaje }: { miPuntaje: number; rivalPuntaje: number }) {
  const max = Math.max(miPuntaje, rivalPuntaje, 1);
  return (
    <div className="mt-3 flex w-full max-w-xs flex-col gap-2">
      <FilaBarra label="Vos" valor={miPuntaje} max={max} color="var(--primario)" />
      <FilaBarra label="Rival" valor={rivalPuntaje} max={max} color="var(--texto-secundario)" />
    </div>
  );
}

function FilaBarra({ label, valor, max, color }: { label: string; valor: number; max: number; color: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-10 shrink-0 text-texto-secundario">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-foreground/10">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${(valor / max) * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      <span className="w-8 shrink-0 text-right font-mono font-semibold text-foreground">{valor}</span>
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
        <p className="text-sm font-medium text-foreground">Ya jugaste tu parte del duelo.</p>
        <p className="mt-1 text-xs text-texto-secundario">
          En cuanto {duelo.oponente_nombre ?? "tu rival"} termine la suya vas a ver quién ganó.
        </p>
      </div>
    );
  }

  const rangoAnterior = rangoDeElo(duelo.elo_anterior);
  const rangoNuevo = rangoDeElo(duelo.elo_nuevo);
  const subioDeRango = duelo.gane && rangoNuevo.slug !== rangoAnterior.slug;
  const hayPuntajes = duelo.mi_puntaje != null && duelo.rival_puntaje != null;

  const cambioElo = (
    <p className="flex items-center justify-center gap-1.5 text-xs text-texto-secundario">
      ELO <CountUp from={duelo.elo_anterior} value={duelo.elo_nuevo} className="font-mono font-semibold text-foreground" />
    </p>
  );

  if (duelo.empate) {
    return (
      <div className="flex flex-col items-center gap-1 rounded-2xl bg-surface-2 px-5 py-4 text-center">
        <p className="font-display text-sm font-bold text-foreground">
          Empataron con {duelo.oponente_nombre ?? "tu rival"} — ni más ni menos.
        </p>
        {cambioElo}
        {hayPuntajes && <BarraComparacion miPuntaje={duelo.mi_puntaje!} rivalPuntaje={duelo.rival_puntaje!} />}
        {duelo.oponente_id && (
          <Link href={`/perfil/${duelo.oponente_id}`} className="mt-1 block text-xs font-semibold text-primario hover:underline">
            Ver perfil
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
        className="relative flex flex-col items-center gap-1 rounded-2xl bg-correcto/10 px-6 pb-4 pt-2 text-center"
      >
        <div className="pointer-events-none -mb-4 -mt-6">
          <GestoLogo size={subioDeRango ? 130 : 90} colorHex={subioDeRango ? undefined : "#3FB88B"} />
        </div>
        <p className="font-display text-xl font-black tracking-tight text-correcto">
          Le ganaste a {duelo.oponente_nombre ?? "tu rival"}
        </p>
        {cambioElo}
        {hayPuntajes && <BarraComparacion miPuntaje={duelo.mi_puntaje!} rivalPuntaje={duelo.rival_puntaje!} />}
        {subioDeRango && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5, ease: "backOut" }}
            className="mt-2 flex flex-col items-center gap-1 rounded-xl bg-logro/15 px-4 py-3"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-texto-secundario">Subiste de rango</span>
            <RangoBadge elo={duelo.elo_nuevo} size="lg" />
          </motion.div>
        )}
        {duelo.oponente_id && (
          <Link href={`/perfil/${duelo.oponente_id}`} className="mt-1 text-xs font-semibold text-primario hover:underline">
            Ver perfil
          </Link>
        )}
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-surface px-6 py-4 text-center">
      <p className="font-display text-sm font-bold text-foreground">
        Esta vez ganó {duelo.oponente_nombre ?? "tu rival"} — estuviste cerca.
      </p>
      {cambioElo}
      {hayPuntajes && <BarraComparacion miPuntaje={duelo.mi_puntaje!} rivalPuntaje={duelo.rival_puntaje!} />}
      <div className="mt-1 flex items-center gap-3">
        {duelo.oponente_id && (
          <Link href={`/perfil/${duelo.oponente_id}`} className="text-xs font-semibold text-primario hover:underline">
            Ver perfil
          </Link>
        )}
        <Link href="/social?tab=amigos" className="text-xs font-semibold text-primario hover:underline">
          Pedir revancha
        </Link>
      </div>
    </div>
  );
}
