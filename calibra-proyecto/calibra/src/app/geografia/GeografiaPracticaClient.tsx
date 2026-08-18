"use client";

import { useState } from "react";
import type { Continente, PaisAmerica } from "@/lib/practica/geografia";
import type { Achievement } from "@/types/database";
import Boton from "@/components/Boton";
import BotonesFinPartida from "@/components/BotonesFinPartida";
import LogroBanner from "@/components/LogroBanner";
import ApuestaResultado from "@/components/ApuestaResultado";
import NivelMundoSubio, { type NivelMundoInfo } from "@/components/NivelMundoSubio";
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

interface Props {
  continente: Continente;
  nivelInicial: number;
  escudosExtra: number;
  boostActivo: boolean;
}

const NOMBRE_CONTINENTE: Record<Continente, string> = {
  america: "América",
  europa: "Europa",
  africa: "África",
  asia_oceania: "Asia y Oceanía",
};

export default function GeografiaPracticaClient({ continente, nivelInicial, escudosExtra, boostActivo }: Props) {
  const [fase, setFase] = useState<Fase>("inicio");
  const [startedAtIso, setStartedAtIso] = useState("");
  const [startedAtPerf, setStartedAtPerf] = useState(0);
  const [resumen, setResumen] = useState<FinishResponse | null>(null);
  const [errores, setErrores] = useState<PaisAmerica[]>([]);
  const [error, setError] = useState<string | null>(null);

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
        body: JSON.stringify({ started_at: startedAtIso }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo cerrar la partida.");
      } else {
        setError(null);
        setResumen(data as FinishResponse);
      }
    } catch {
      // Red caída o el servidor no respondió: no dejamos la partida
      // trabada en la última pregunta, mostramos el resumen con error.
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

        <BotonesFinPartida onOtraVez={() => setFase("inicio")} volverHref="/geografia" colorHex={COLOR_GEOGRAFIA} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-4 py-20 text-center">
      {boostActivo && (
        <div className="flex items-center justify-center gap-2 rounded-full bg-logro/15 px-4 py-2 text-sm font-medium text-foreground">
          ⚡ Boost activo — Puntos ×1.5 en esta partida
        </div>
      )}
      <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{NOMBRE_CONTINENTE[continente]}</h1>
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
