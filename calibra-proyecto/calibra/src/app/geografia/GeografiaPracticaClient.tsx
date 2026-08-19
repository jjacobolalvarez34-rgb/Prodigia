"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Continente, PaisAmerica } from "@/lib/practica/geografia";
import type { Achievement } from "@/types/database";
import Boton from "@/components/Boton";
import BotonesFinPartida from "@/components/BotonesFinPartida";
import LogroBanner from "@/components/LogroBanner";
import ApuestaResultado from "@/components/ApuestaResultado";
import NivelMundoSubio, { type NivelMundoInfo } from "@/components/NivelMundoSubio";
import RangoBadge from "@/components/RangoBadge";
import ResultadoDueloBlock, { type ResultadoDuelo } from "@/components/duelos/ResultadoDueloBlock";
import GeografiaSprintRunner from "./GeografiaSprintRunner";
import { COLOR_GEOGRAFIA } from "./GeografiaMapa";

type Fase = "inicio" | "sprint" | "resumen";

interface FinishResponse {
  sprint: { total: number; correctos: number; precision: number | null; xpGanado: number; avgTimeMs: number | null };
  puntosTotal: number;
  xpGanadoHoy: number;
  metaAlcanzada: boolean;
  metaXpDiaria: number;
  logrosNuevos: Achievement[];
  apuesta?: { gano: boolean; monto: number } | null;
  nivelMundo?: NivelMundoInfo | null;
}

// Fase 3 de Rankeds: info de un duelo de matchmaking para Geografía —
// deliberadamente MÁS simple que DueloInfo de Numeria (practica/page.tsx):
// sin sala de espera sincronizada (ver decisión de alcance en
// docs/PROGRESO.md), así que no hace falta semilla ni datos del rival
// más que para mostrarlos.
export interface DueloGenericoInfo {
  duelId: string;
  rivalNombre: string;
  miElo: number;
  rivalElo: number;
  miTituloNombre: string | null;
  rivalTituloNombre: string | null;
  serieId: string | null;
  rondaNumero: number;
  rondaTotal: number;
}

interface Props {
  continente: Continente;
  nivelInicial: number;
  escudosExtra: number;
  boostActivo: boolean;
  duelo?: DueloGenericoInfo | null;
  miUserId: string;
}

const NOMBRE_CONTINENTE: Record<Continente, string> = {
  america: "América",
  europa: "Europa",
  africa: "África",
  asia_oceania: "Asia y Oceanía",
};

export default function GeografiaPracticaClient({ continente, nivelInicial, escudosExtra, boostActivo, duelo, miUserId }: Props) {
  const router = useRouter();
  const [fase, setFase] = useState<Fase>("inicio");
  const [startedAtIso, setStartedAtIso] = useState("");
  const [startedAtPerf, setStartedAtPerf] = useState(0);
  const [resumen, setResumen] = useState<FinishResponse | null>(null);
  const [errores, setErrores] = useState<PaisAmerica[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [resultadoDuelo, setResultadoDuelo] = useState<ResultadoDuelo | null>(null);

  function iniciar() {
    setStartedAtIso(new Date().toISOString());
    setStartedAtPerf(performance.now());
    setResumen(null);
    setFase("sprint");
  }

  async function handleFinish(erroresPartida: PaisAmerica[]) {
    setErrores(erroresPartida);
    try {
      const res = await fetch("/api/practica/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ started_at: startedAtIso, total_problemas: 10 }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo cerrar la partida.");
        setFase("resumen");
        return;
      }
      setError(null);
      const finishData = data as FinishResponse;
      setResumen(finishData);

      if (duelo) {
        try {
          const resDuelo = await fetch("/api/duelos/resultado", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              duel_id: duelo.duelId,
              precision: finishData.sprint.precision ?? 0,
              tiempo_promedio: finishData.sprint.avgTimeMs ?? 0,
              puntaje: finishData.sprint.xpGanado,
            }),
          });
          const dataDuelo = await resDuelo.json();
          if (resDuelo.ok) {
            // Fase 5: si es una ronda de "todas las ciudades", la
            // pantalla de la serie es la única que muestra resultado —
            // no se arma un resumen local acá, para no duplicar la
            // lógica de "cuándo ya está decidida la serie" en 3 lugares.
            if (duelo.serieId) {
              router.push(`/rankeds/serie/${duelo.serieId}`);
              return;
            }
            setResultadoDuelo(dataDuelo as ResultadoDuelo);
          }
        } catch {
          // El duelo no se pudo resolver por un error de red puntual — el
          // resumen de la partida igual se muestra con normalidad.
        }
      }
    } catch {
      setError("No pudimos conectar con el servidor. Probá de nuevo.");
    }
    setFase("resumen");
  }

  if (fase === "sprint") {
    return (
      <GeografiaSprintRunner
        continente={continente}
        startedAt={startedAtPerf}
        nivelInicial={nivelInicial}
        escudosExtra={escudosExtra}
        duelId={duelo?.duelId}
        miUserId={miUserId}
        rivalNombre={duelo?.rivalNombre}
        onFinish={handleFinish}
      />
    );
  }

  if (fase === "resumen" && error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <p className="text-error">No pudimos cerrar la partida: {error}</p>
        <button onClick={() => setFase("inicio")} className="rounded-2xl px-4 py-3 font-medium text-white" style={{ background: COLOR_GEOGRAFIA }}>
          Volver
        </button>
      </div>
    );
  }

  if (fase === "resumen" && resumen) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-20">
        <LogroBanner logros={resumen.logrosNuevos} />
        <NivelMundoSubio nivelMundo={resumen.nivelMundo} />
        <ApuestaResultado apuesta={resumen.apuesta ?? null} />
        <ResultadoDueloBlock duelo={resultadoDuelo} />
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="font-display text-lg font-bold text-foreground">Ahí quedó.</p>
          <p className="font-mono text-3xl font-bold text-foreground">
            +{resumen.sprint.xpGanado} <span className="text-base font-medium text-texto-secundario">Experiencia</span>
          </p>
        </div>

        <div className="w-full max-w-md rounded-2xl border border-border bg-surface px-6 py-4 shadow-sm">
          <Fila label="Aciertos" valor={`${resumen.sprint.correctos}/${resumen.sprint.total}`} />
          <Fila label="Precisión" valor={resumen.sprint.precision === null ? "—" : `${Math.round(resumen.sprint.precision * 100)}%`} />
          <Fila label="Experiencia hoy" valor={`${resumen.xpGanadoHoy}/${resumen.metaXpDiaria}`} />
        </div>

        {errores.length > 0 ? (
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface px-6 py-4 shadow-sm">
            <p className="mb-3 font-display text-sm font-semibold text-foreground">Repasemos esto</p>
            <div className="flex flex-wrap gap-2">
              {errores.map((p, i) => (
                <span key={i} className="rounded-full bg-surface-2 px-3 py-1 text-sm text-foreground">
                  {p.nombre}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-texto-secundario">Ninguno fallado — así se hace. 🎯</p>
        )}

        <BotonesFinPartida
          onOtraVez={duelo ? () => router.push("/rankeds?tab=buscar") : () => setFase("inicio")}
          volverHref={duelo ? "/rankeds" : "/geografia"}
          colorHex={COLOR_GEOGRAFIA}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-4 py-20 text-center">
      {boostActivo && (
        <div className="flex items-center justify-center gap-2 rounded-full bg-logro/15 px-4 py-2 text-sm font-medium text-foreground">
          ⚡ Boost activo — Chispas ×1.5 en esta partida
        </div>
      )}
      {duelo ? (
        <>
          <span className="rounded-full bg-primario/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primario">
            {duelo.serieId ? `Duelo · Ronda ${duelo.rondaNumero}/${duelo.rondaTotal} · Geografía` : "Duelo · Geografía"}
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Vs. {duelo.rivalNombre}</h1>
          <div className="flex items-center gap-6">
            <RangoBadge elo={duelo.miElo} tituloNombre={duelo.miTituloNombre} size="sm" mostrarElo />
            <span className="text-texto-secundario">—</span>
            <RangoBadge elo={duelo.rivalElo} tituloNombre={duelo.rivalTituloNombre} size="sm" mostrarElo />
          </div>
        </>
      ) : (
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{NOMBRE_CONTINENTE[continente]}</h1>
      )}
      <p className="text-texto-secundario">Identificá el país en el mapa. 10 preguntas o 60 segundos.</p>
      <Boton onClick={iniciar} colorHex={COLOR_GEOGRAFIA} destacado className="w-full py-5 text-lg">
        Iniciar partida
      </Boton>
    </div>
  );
}

function Fila({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-3.5 last:border-0">
      <span className="text-sm text-texto-secundario">{label}</span>
      <span className="font-mono font-semibold text-foreground">{valor}</span>
    </div>
  );
}
