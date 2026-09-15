"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { obtenerHoraServidor } from "@/lib/practica/horaServidor";
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
  hielosDisponibles: number;
  tiemposExtraDisponibles: number;
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

export default function FraccionPracticaClient({
  nivelPorTipo,
  escudosExtra,
  hielosDisponibles,
  tiemposExtraDisponibles,
  boostActivo,
  colorDial,
}: Props) {
  const t = useTranslations("Practica");
  const tFracciones = useTranslations("Fracciones.tipos");
  const tNumeria = useTranslations("Numeria.temas");
  const NOMBRES: Record<TipoFraccion, string> = {
    simplificar: tFracciones("simplificar"),
    comparar: tFracciones("comparar"),
    sumar: tFracciones("sumar"),
  };
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
    // Bug de reloj de navegador (2026-09-14, ver src/app/api/hora-servidor/route.ts) —
    // se pide la hora real del servidor en paralelo, sin bloquear el arranque,
    // y reemplaza este valor optimista apenas responde.
    obtenerHoraServidor().then((h) => { if (h) setStartedAtIso(h); });
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
        setError(data.error ?? t("cliente.noSePudoCerrar"));
      } else {
        setError(null);
        setResumen(data as FinishResponse);
      }
    } catch {
      // Red caída o el servidor no respondió: no dejamos la partida
      // trabada en la última pregunta, mostramos el resumen con error.
      setError(t("cliente.errorDeRed"));
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
        hielosIniciales={hielosDisponibles}
        tiemposExtraIniciales={tiemposExtraDisponibles}
        colorDial={colorDial}
        onFinish={handleFinish}
      />
    );
  }

  if (fase === "resumen" && error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <p className="text-error">{t("cliente.noPudimosCerrar", { error })}</p>
        <Boton onClick={() => setFase("inicio")}>{t("cliente.volver")}</Boton>
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
          <p className="font-display text-lg font-bold text-foreground">{t("resumen.ahiQuedo")}</p>
          <p className="font-mono text-3xl font-bold text-foreground">
            +{resumen.sprint.xpGanado}{" "}
            <span className="text-base font-medium text-texto-secundario">{t("resumen.experiencia")}</span>
          </p>
        </div>

        <div className="w-full max-w-md rounded-2xl border border-border bg-surface px-6 py-4 shadow-sm">
          <Fila label={t("resumen.aciertos")} valor={`${resumen.sprint.correctos}/${resumen.sprint.total}`} />
          <Fila
            label={t("resumen.precision")}
            valor={resumen.sprint.precision === null ? "—" : `${Math.round(resumen.sprint.precision * 100)}%`}
          />
          <Fila label={t("resumen.experienciaHoy")} valor={`${resumen.xpGanadoHoy}/${resumen.metaXpDiaria}`} />
        </div>

        {errores.length > 0 ? (
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface px-6 py-4 shadow-sm">
            <p className="mb-3 font-display text-sm font-semibold text-foreground">{t("resumen.repasemosEsto")}</p>
            <div className="flex flex-col gap-2.5">
              {errores.map((p, i) => (
                <div key={i} className="flex items-center justify-between font-mono text-sm">
                  <span className="text-texto-secundario">{formatearError(p)}</span>
                  <span className="text-texto-secundario">
                    {t("resumen.era")} <span className="font-semibold text-error">{respuestaCorrecta(p)}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-texto-secundario">{t("resumen.ningunaFallada")} 🎯</p>
        )}

        <BotonesFinPartida onOtraVez={() => setFase("inicio")} volverHref="/numeria" />
      </div>
    );
  }

  return (
    <>
      {boostActivo && (
        <div className="mx-auto mt-6 flex w-full max-w-md items-center justify-center gap-2 rounded-full bg-logro/15 px-4 py-2 text-sm font-medium text-foreground">
          ⚡ {t("cliente.boostActivo")}
        </div>
      )}
      <SubtemaPicker
        titulo={tNumeria("fracciones")}
        subtitulo={t("subtemaPicker.subtitulo")}
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
