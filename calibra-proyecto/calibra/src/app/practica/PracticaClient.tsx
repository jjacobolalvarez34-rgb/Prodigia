"use client";

import { useState } from "react";
import type { ArithmeticProblemType, ModifierSlug } from "@/types/database";
import type { Problem } from "@/lib/practica/problems";
import type { DueloInfo, RespuestaDuelo } from "./page";
import Boton from "@/components/Boton";
import OperationPicker from "./OperationPicker";
import SprintRunner from "./SprintRunner";
import SalaDuelo from "./SalaDuelo";
import SprintSummary, { type FinishResponse, type ResultadoDuelo } from "./SprintSummary";

type Fase = "seleccion" | "duelo-intro" | "sprint" | "resumen";

interface Props {
  nivelInicial: Record<ArithmeticProblemType, number>;
  modificadoresPorOperacion: Record<ArithmeticProblemType, ModifierSlug[]>;
  operacionPreseleccionada?: ArithmeticProblemType;
  escudosExtra: number;
  boostActivo: boolean;
  duelo: DueloInfo | null;
  miUserId: string;
  colorDial?: string;
}

export default function PracticaClient({
  nivelInicial,
  modificadoresPorOperacion,
  operacionPreseleccionada,
  escudosExtra,
  boostActivo,
  duelo,
  miUserId,
  colorDial,
}: Props) {
  const [fase, setFase] = useState<Fase>(duelo ? "duelo-intro" : "seleccion");
  const [seleccionadas, setSeleccionadas] = useState<ArithmeticProblemType[]>(
    operacionPreseleccionada ? [operacionPreseleccionada] : []
  );
  const [seleccionSprint, setSeleccionSprint] = useState<ArithmeticProblemType[]>(
    duelo ? [duelo.operacion] : []
  );
  const [nivelPorOperacion, setNivelPorOperacion] = useState(
    duelo ? { ...nivelInicial, [duelo.operacion]: duelo.nivel } : nivelInicial
  );
  const [startedAtIso, setStartedAtIso] = useState("");
  const [startedAtPerf, setStartedAtPerf] = useState(0);
  const [resumen, setResumen] = useState<FinishResponse | null>(null);
  const [errorResumen, setErrorResumen] = useState<string | null>(null);
  const [erroresSprint, setErroresSprint] = useState<Problem[]>([]);
  const [resultadoDuelo, setResultadoDuelo] = useState<ResultadoDuelo | null>(null);

  function toggleOperacion(tipo: ArithmeticProblemType) {
    setSeleccionadas((prev) => (prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo]));
  }

  function iniciarSprint(seleccion: ArithmeticProblemType[] = seleccionadas) {
    if (seleccion.length === 0) return;
    setSeleccionSprint(seleccion);
    setStartedAtIso(new Date().toISOString());
    setStartedAtPerf(performance.now());
    setResumen(null);
    setFase("sprint");
  }

  function handleNivelChange(tipo: ArithmeticProblemType, nivel: number) {
    // En un duelo el nivel es fijo (deriva del ELO de ambos), no se
    // recalibra la práctica personal con esos intentos.
    if (duelo) return;
    setNivelPorOperacion((prev) => ({ ...prev, [tipo]: nivel }));
  }

  async function handleFinishSprint(errores: Problem[], respuestas: RespuestaDuelo[]) {
    setErroresSprint(errores);
    try {
      const res = await fetch("/api/practica/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ started_at: startedAtIso }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorResumen(data.error ?? "No se pudo cerrar la partida.");
        setFase("resumen");
        return;
      }
      setErrorResumen(null);
      setResumen(data as FinishResponse);

      if (duelo) {
        try {
          const resDuelo = await fetch("/api/duelos/resultado", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              duel_id: duelo.duelId,
              precision: (data as FinishResponse).sprint.precision ?? 0,
              tiempo_promedio: (data as FinishResponse).sprint.avgTimeMs ?? 0,
              puntaje: (data as FinishResponse).sprint.xpGanado,
              respuestas,
            }),
          });
          const dataDuelo = await resDuelo.json();
          if (resDuelo.ok) setResultadoDuelo(dataDuelo as ResultadoDuelo);
        } catch {
          // El duelo no se pudo resolver por un error de red puntual — el
          // resumen de la partida igual se muestra con normalidad.
        }
      }
    } catch {
      // Red caída o el servidor no respondió: no dejamos la partida
      // trabada en la última pregunta, mostramos el resumen con error.
      setErrorResumen("No pudimos conectar con el servidor. Probá de nuevo.");
    }
    setFase("resumen");
  }

  if (fase === "duelo-intro" && duelo) {
    return (
      <SalaDuelo
        duelId={duelo.duelId}
        operacion={duelo.operacion}
        miUserId={miUserId}
        rivalId={duelo.rivalId}
        rivalNombre={duelo.rivalNombre}
        miElo={duelo.miElo}
        rivalElo={duelo.rivalElo}
        onEmpezar={() => iniciarSprint([duelo.operacion])}
      />
    );
  }

  if (fase === "sprint" && seleccionSprint.length > 0) {
    return (
      <SprintRunner
        seleccion={seleccionSprint}
        startedAt={startedAtPerf}
        nivelPorOperacion={nivelPorOperacion}
        modificadoresPorOperacion={duelo ? { ...modificadoresPorOperacion, [duelo.operacion]: [] } : modificadoresPorOperacion}
        escudosExtra={escudosExtra}
        colorDial={colorDial}
        fantasma={duelo?.rivalRespuestas ? { rivalNombre: duelo.rivalNombre, respuestas: duelo.rivalRespuestas } : null}
        semillaDuelo={duelo?.semilla}
        onNivelChange={handleNivelChange}
        onFinish={handleFinishSprint}
      />
    );
  }

  if (fase === "resumen" && errorResumen) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <p className="text-error">No pudimos cerrar la partida: {errorResumen}</p>
        <Boton onClick={() => setFase("seleccion")}>Volver</Boton>
      </div>
    );
  }

  if (fase === "resumen" && resumen) {
    return (
      <SprintSummary
        resumen={resumen}
        errores={erroresSprint}
        duelo={resultadoDuelo}
        onOtraVez={() => setFase("seleccion")}
      />
    );
  }

  return (
    <>
      {boostActivo && (
        <div className="mx-auto mt-6 flex w-full max-w-md items-center justify-center gap-2 rounded-full bg-logro/15 px-4 py-2 text-sm font-medium text-foreground">
          ⚡ Boost activo — Puntos ×1.5 en tu próxima partida
        </div>
      )}
      <OperationPicker
        nivelPorOperacion={nivelPorOperacion}
        modificadoresPorOperacion={modificadoresPorOperacion}
        seleccion={seleccionadas}
        colorDial={colorDial}
        onToggle={toggleOperacion}
        onIniciar={() => iniciarSprint()}
      />
    </>
  );
}
