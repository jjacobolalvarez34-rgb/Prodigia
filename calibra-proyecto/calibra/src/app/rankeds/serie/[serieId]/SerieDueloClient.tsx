"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { rangoDeElo, type ArithmeticProblemType } from "@/types/database";
import CountUp from "@/components/CountUp";
import RangoBadge from "@/components/RangoBadge";
import GestoLogo from "@/components/GestoLogo";
import LogroBanner from "@/components/LogroBanner";
import { hrefDuelo, type MundoDuelo } from "@/lib/duelos/rutas";
import type { Achievement } from "@/types/database";

export interface FilaRondaSerie {
  duel_id: string;
  ronda_numero: number;
  mundo: MundoDuelo;
  sub_tipo: string | null;
  operation_type: ArithmeticProblemType | null;
  estado: string;
  yo_jugue: boolean;
  rival_jugo: boolean;
  gane_ronda: boolean;
  empate_ronda: boolean;
  oponente_id: string;
  oponente_nombre: string | null;
  serie_finalizada: boolean;
}

interface ResultadoFinal {
  finalizada: boolean;
  gane: boolean;
  empate: boolean;
  elo_nuevo: number | null;
  elo_anterior: number | null;
  victorias_propias: number;
  victorias_rival: number;
  oponente_id: string;
  oponente_nombre: string | null;
  logrosNuevos?: Achievement[];
}

const POLL_MS = 3000;
const NOMBRE_MUNDO: Record<MundoDuelo, string> = { numeria: "Numeria", geografia: "Geografía", enigmia: "Enigmia" };
const NOMBRE_OPERACION: Record<ArithmeticProblemType, string> = {
  suma: "Suma",
  resta: "Resta",
  multiplicacion: "Multiplicación",
  division: "División",
};
const NOMBRE_CONTENIDO: Record<string, string> = {
  america: "América",
  europa: "Europa",
  africa: "África",
  asia_oceania: "Asia y Oceanía",
  memoria: "Memoria",
  patrones: "Patrones",
  deduccion: "Deducción",
  computacional: "Pensamiento computacional",
};

function etiquetaRonda(r: FilaRondaSerie): string {
  if (r.mundo === "numeria" && r.operation_type) return `Numeria · ${NOMBRE_OPERACION[r.operation_type]}`;
  if (r.sub_tipo) return `${NOMBRE_MUNDO[r.mundo]} · ${NOMBRE_CONTENIDO[r.sub_tipo] ?? r.sub_tipo}`;
  return NOMBRE_MUNDO[r.mundo];
}

export default function SerieDueloClient({
  serieId,
  rondasIniciales,
}: {
  serieId: string;
  rondasIniciales: FilaRondaSerie[];
}) {
  const [rondas, setRondas] = useState(rondasIniciales);
  const [resultadoFinal, setResultadoFinal] = useState<ResultadoFinal | null>(null);
  const cancelarRef = useRef(false);

  useEffect(() => {
    cancelarRef.current = false;
    const supabase = createClient();

    async function ciclo() {
      while (!cancelarRef.current) {
        const resFinal = await fetch("/api/duelos/finalizar-serie", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ serie_id: serieId }),
        });
        if (cancelarRef.current) return;
        if (resFinal.ok) {
          const dataFinal = (await resFinal.json()) as ResultadoFinal;
          if (dataFinal.finalizada) {
            setResultadoFinal(dataFinal);
            return;
          }
        }

        const { data } = await supabase.rpc("estado_serie_duelo", { p_serie_id: serieId });
        if (cancelarRef.current) return;
        if (data) setRondas(data as FilaRondaSerie[]);

        await new Promise((resolve) => setTimeout(resolve, POLL_MS));
      }
    }

    ciclo();
    return () => {
      cancelarRef.current = true;
    };
  }, [serieId]);

  const oponenteNombre = rondas[0]?.oponente_nombre ?? "tu rival";
  const oponenteId = rondas[0]?.oponente_id ?? null;
  const victoriasMias = rondas.filter((r) => r.gane_ronda).length;
  const victoriasRival = rondas.filter((r) => r.estado === "completado" && !r.gane_ronda && !r.empate_ronda).length;

  if (resultadoFinal?.finalizada) {
    const rangoAnterior = resultadoFinal.elo_anterior !== null ? rangoDeElo(resultadoFinal.elo_anterior) : null;
    const rangoNuevo = resultadoFinal.elo_nuevo !== null ? rangoDeElo(resultadoFinal.elo_nuevo) : null;
    const subioDeRango = resultadoFinal.gane && rangoAnterior && rangoNuevo && rangoAnterior.slug !== rangoNuevo.slug;

    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-4 py-20 text-center">
        <LogroBanner logros={resultadoFinal.logrosNuevos ?? []} />
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "backOut" }}
          className={`relative flex flex-col items-center gap-2 rounded-2xl px-6 pb-5 pt-3 text-center ${
            resultadoFinal.empate ? "bg-surface-2" : resultadoFinal.gane ? "bg-correcto/10" : "border border-border bg-surface"
          }`}
        >
          {resultadoFinal.gane && (
            <div className="pointer-events-none -mb-4 -mt-6">
              <GestoLogo size={subioDeRango ? 130 : 90} colorHex={subioDeRango ? undefined : "#3FB88B"} />
            </div>
          )}
          <p className="font-display text-xl font-black tracking-tight text-foreground">
            {resultadoFinal.empate
              ? `Empataron la serie con ${oponenteNombre}`
              : resultadoFinal.gane
                ? `Ganaste la serie a ${oponenteNombre}`
                : `Esta vez ganó ${oponenteNombre}`}
          </p>
          <p className="font-mono text-2xl font-bold text-foreground">
            {resultadoFinal.victorias_propias} - {resultadoFinal.victorias_rival}
          </p>
          {resultadoFinal.elo_anterior !== null && resultadoFinal.elo_nuevo !== null && (
            <p className="flex items-center justify-center gap-1.5 text-xs text-texto-secundario">
              ELO <CountUp from={resultadoFinal.elo_anterior} value={resultadoFinal.elo_nuevo} className="font-mono font-semibold text-foreground" />
            </p>
          )}
          {subioDeRango && resultadoFinal.elo_nuevo !== null && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5, ease: "backOut" }}
              className="mt-1 flex flex-col items-center gap-1 rounded-xl bg-logro/15 px-4 py-3"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-texto-secundario">Subiste de rango</span>
              <RangoBadge elo={resultadoFinal.elo_nuevo} size="lg" />
            </motion.div>
          )}
          {oponenteId && (
            <Link href={`/perfil/${oponenteId}`} className="mt-1 text-xs font-semibold text-primario hover:underline">
              Ver perfil
            </Link>
          )}
        </motion.div>

        <div className="flex w-full flex-col gap-2">
          {rondas.map((r) => (
            <FilaRondaResumen key={r.duel_id} ronda={r} />
          ))}
        </div>

        <div className="flex w-full max-w-md gap-3">
          <Link
            href="/rankeds?tab=buscar"
            className="flex-1 rounded-2xl px-4 py-4 text-center font-display font-semibold text-white shadow-lg"
            style={{ background: "linear-gradient(120deg, var(--primario), var(--logro))" }}
          >
            Otra partida
          </Link>
          <Link
            href="/rankeds"
            className="flex items-center justify-center rounded-2xl border-2 border-border px-6 py-4 font-display font-semibold text-foreground transition-colors hover:border-primario/40"
          >
            Volver
          </Link>
        </div>
      </div>
    );
  }

  // Todavía no está decidida: muestro el progreso ronda por ronda y el
  // botón para jugar la próxima ronda que me toca a mí.
  const proximaRonda = rondas.find((r) => !r.yo_jugue);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-4 py-20 text-center">
      <span className="rounded-full bg-primario/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primario">
        Todas las ciudades · Mejor de 3
      </span>
      <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Vs. {oponenteNombre}</h1>
      <p className="font-mono text-lg font-bold text-foreground">
        {victoriasMias} - {victoriasRival}
      </p>

      <div className="flex w-full flex-col gap-2">
        {rondas.map((r) => (
          <FilaRondaResumen key={r.duel_id} ronda={r} />
        ))}
      </div>

      {proximaRonda ? (
        <Link
          href={hrefDuelo(proximaRonda.mundo, proximaRonda.operation_type, proximaRonda.duel_id)}
          className="w-full rounded-2xl px-6 py-5 text-center font-display text-lg font-semibold text-white shadow-lg"
          style={{ background: "linear-gradient(120deg, var(--primario), var(--logro))" }}
        >
          Jugar ronda {proximaRonda.ronda_numero} · {etiquetaRonda(proximaRonda)}
        </Link>
      ) : (
        <p className="text-sm text-texto-secundario">
          Ya jugaste tus 3 rondas — esperando a que {oponenteNombre} termine las suyas.
        </p>
      )}
    </div>
  );
}

function FilaRondaResumen({ ronda }: { ronda: FilaRondaSerie }) {
  const resuelta = ronda.estado === "completado";
  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left ${
        resuelta ? (ronda.empate_ronda ? "border-border bg-surface" : ronda.gane_ronda ? "border-correcto/30 bg-correcto/5" : "border-border bg-surface") : "border-dashed border-border bg-surface"
      }`}
    >
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">
          Ronda {ronda.ronda_numero} · {etiquetaRonda(ronda)}
        </span>
        <span className="text-xs text-texto-secundario">
          {!resuelta
            ? ronda.yo_jugue
              ? "Esperando al rival…"
              : "Todavía sin jugar"
            : ronda.empate_ronda
              ? "Empate"
              : ronda.gane_ronda
                ? "Ganaste"
                : "Perdiste"}
        </span>
      </div>
      <span className="text-lg">{resuelta ? (ronda.empate_ronda ? "🤝" : ronda.gane_ronda ? "✅" : "❌") : "⏳"}</span>
    </div>
  );
}
