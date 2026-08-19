"use client";

import { useState } from "react";
import { generarProblemaPotencia, type ProblemaPotencia } from "@/lib/practica/potencias";
import type { Achievement } from "@/types/database";
import BotonesFinPartida from "@/components/BotonesFinPartida";
import LogroBanner from "@/components/LogroBanner";
import ApuestaResultado from "@/components/ApuestaResultado";
import NivelMundoSubio, { type NivelMundoInfo } from "@/components/NivelMundoSubio";
import EnunciadoSprintRunner from "@/components/EnunciadoSprintRunner";
import Boton from "@/components/Boton";

type Fase = "inicio" | "sprint" | "resumen";

interface FinishResponse {
  sprint: { total: number; correctos: number; precision: number | null; xpGanado: number; avgTimeMs: number | null };
  historico: { total: number; correctos: number; precision: number | null; avgTimeMs: number | null; avgXpDiario: number | null };
  puntosTotal: number;
  xpGanadoHoy: number;
  metaAlcanzada: boolean;
  metaXpDiaria: number;
  logrosNuevos: Achievement[];
  apuesta?: { gano: boolean; monto: number } | null;
  nivelMundo?: NivelMundoInfo | null;
}

interface Props {
  nivelInicial: number;
  escudosExtra: number;
  boostActivo: boolean;
}

export default function PotenciaPracticaClient({ nivelInicial, escudosExtra, boostActivo }: Props) {
  const [fase, setFase] = useState<Fase>("inicio");
  const [startedAtIso, setStartedAtIso] = useState("");
  const [startedAtPerf, setStartedAtPerf] = useState(0);
  const [resumen, setResumen] = useState<FinishResponse | null>(null);
  const [errores, setErrores] = useState<ProblemaPotencia[]>([]);
  const [error, setError] = useState<string | null>(null);

  function iniciar() {
    setStartedAtIso(new Date().toISOString());
    setStartedAtPerf(performance.now());
    setResumen(null);
    setFase("sprint");
  }

  async function handleFinish(erroresPartida: ProblemaPotencia[]) {
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
      <EnunciadoSprintRunner
        generar={generarProblemaPotencia}
        startedAt={startedAtPerf}
        nivelInicial={nivelInicial}
        escudosExtra={escudosExtra}
        apiPath="/api/attempts"
        problemType="potencias"
        onFinish={handleFinish}
      />
    );
  }

  if (fase === "resumen" && error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <p className="text-error">No pudimos cerrar la partida: {error}</p>
        <Boton onClick={() => setFase("inicio")}>Volver</Boton>
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
          <Fila
            label="Precisión"
            valor={resumen.sprint.precision === null ? "—" : `${Math.round(resumen.sprint.precision * 100)}%`}
          />
          <Fila label="Experiencia hoy" valor={`${resumen.xpGanadoHoy}/${resumen.metaXpDiaria}`} />
        </div>

        {errores.length > 0 ? (
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface px-6 py-4 shadow-sm">
            <p className="mb-3 font-display text-sm font-semibold text-foreground">Repasemos esto</p>
            <div className="flex flex-col gap-2.5">
              {errores.map((p, i) => (
                <div key={i} className="flex items-center justify-between font-mono text-sm">
                  <span className="text-texto-secundario">{p.enunciado}</span>
                  <span className="text-texto-secundario">
                    era <span className="font-semibold text-error">{p.respuesta}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-texto-secundario">Ninguna fallada — así se hace. 🎯</p>
        )}

        <BotonesFinPartida onOtraVez={() => setFase("inicio")} volverHref="/numeria" />
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
      <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Potencias y raíces</h1>
      <p className="text-texto-secundario">Potencias, raíces y notación científica. 10 problemas o 60 segundos.</p>
      <Boton onClick={iniciar} destacado className="w-full py-5 text-lg">
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
