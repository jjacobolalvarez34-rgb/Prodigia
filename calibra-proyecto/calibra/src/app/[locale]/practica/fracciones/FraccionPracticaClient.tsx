"use client";

import { useState } from "react";
import { TIPOS_FRACCION, type ProblemaFraccion, type TipoFraccion } from "@/lib/practica/fracciones";
import type { Achievement } from "@/types/database";
import BotonesFinPartida from "@/components/BotonesFinPartida";
import LogroBanner from "@/components/LogroBanner";
import ApuestaResultado from "@/components/ApuestaResultado";
import NivelMundoSubio, { type NivelMundoInfo } from "@/components/NivelMundoSubio";
import SubtemaPicker from "@/components/practica/SubtemaPicker";
import Boton from "@/components/Boton";
import FraccionSprintRunner from "./FraccionSprintRunner";

type Fase = "inicio" | "sprint" | "resumen";

const NOMBRES: Record<TipoFraccion, string> = {
  simplificar: "Simplificar",
  comparar: "Comparar",
  sumar: "Sumar",
};

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
  nivelPorTipo: Record<TipoFraccion, number>;
  escudosExtra: number;
  boostActivo: boolean;
  colorDial?: string;
}

function formatearError(p: ProblemaFraccion): string {
  if (p.tipo === "simplificar" && p.frac) return `Simplificar ${p.frac[0]}/${p.frac[1]}`;
  if (p.tipo === "sumar" && p.frac1 && p.frac2) return `${p.frac1[0]}/${p.frac1[1]} + ${p.frac2[0]}/${p.frac2[1]}`;
  if (p.tipo === "comparar" && p.frac1 && p.frac2) return `${p.frac1[0]}/${p.frac1[1]} vs ${p.frac2[0]}/${p.frac2[1]}`;
  return "";
}

function respuestaCorrecta(p: ProblemaFraccion): string {
  if (p.respuestaFraccion) return `${p.respuestaFraccion[0]}/${p.respuestaFraccion[1]}`;
  return p.respuestaComparacion ?? "";
}

export default function FraccionPracticaClient({ nivelPorTipo, escudosExtra, boostActivo, colorDial }: Props) {
  const [fase, setFase] = useState<Fase>("inicio");
  const [seleccion, setSeleccion] = useState<TipoFraccion[]>([...TIPOS_FRACCION]);
  const [startedAtIso, setStartedAtIso] = useState("");
  const [startedAtPerf, setStartedAtPerf] = useState(0);
  const [resumen, setResumen] = useState<FinishResponse | null>(null);
  const [errores, setErrores] = useState<ProblemaFraccion[]>([]);
  const [error, setError] = useState<string | null>(null);

  function toggle(tipo: TipoFraccion) {
    setSeleccion((prev) => (prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo]));
  }

  function iniciar() {
    if (seleccion.length === 0) return;
    setStartedAtIso(new Date().toISOString());
    setStartedAtPerf(performance.now());
    setResumen(null);
    setFase("sprint");
  }

  async function handleFinish(erroresPartida: ProblemaFraccion[]) {
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
      <FraccionSprintRunner
        startedAt={startedAtPerf}
        nivelPorTipo={nivelPorTipo}
        seleccion={seleccion}
        escudosExtra={escudosExtra}
        colorDial={colorDial}
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
                  <span className="text-texto-secundario">{formatearError(p)}</span>
                  <span className="text-texto-secundario">
                    era <span className="font-semibold text-error">{respuestaCorrecta(p)}</span>
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
    <>
      {boostActivo && (
        <div className="mx-auto mt-6 flex w-full max-w-md items-center justify-center gap-2 rounded-full bg-logro/15 px-4 py-2 text-sm font-medium text-foreground">
          ⚡ Boost activo — Chispas ×1.5 en tu próxima partida
        </div>
      )}
      <SubtemaPicker
        titulo="Fracciones"
        subtitulo="Elegí uno o más sub-temas. 10 problemas o 60 segundos."
        tipos={TIPOS_FRACCION}
        nombres={NOMBRES}
        nivelPorTipo={nivelPorTipo}
        seleccion={seleccion}
        colorHex={colorDial}
        onToggle={toggle}
        onIniciar={iniciar}
      />
    </>
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
