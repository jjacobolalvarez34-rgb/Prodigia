"use client";

import MathText from "@/components/MathText";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { obtenerHoraServidor } from "@/lib/practica/horaServidor";
import { generarProblemaPotencia, TIPOS_POTENCIA, type ProblemaPotencia, type TipoPotencia } from "@/lib/practica/potencias";
import type { Achievement } from "@/types/database";
import BotonesFinPartida from "@/components/BotonesFinPartida";
import LogroBanner from "@/components/LogroBanner";
import ApuestaResultado from "@/components/ApuestaResultado";
import NivelMundoSubio, { type NivelMundoInfo } from "@/components/NivelMundoSubio";
import NivelCuentaSubio, { type NivelCuentaInfo } from "@/components/NivelCuentaSubio";
import ChispasGanadasNota from "@/components/ChispasGanadasNota";

import EnunciadoSprintRunner from "@/components/EnunciadoSprintRunner";
import SubtemaPicker from "@/components/practica/SubtemaPicker";
import Boton from "@/components/Boton";
import { estadoResumenPartida } from "@/lib/practica/resumenPartida";

// Mismo valor que TOTAL_PROBLEMAS en EnunciadoSprintRunner.tsx (archivo
// separado que no lo exporta).
const OBJETIVO_SPRINT = 10;

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
  nivelCuenta?: NivelCuentaInfo | null;

}

interface Props {
  nivelPorTipo: Record<TipoPotencia, number>;
  escudosExtra: number;
  hielosDisponibles: number;
  tiemposExtraDisponibles: number;
  boostActivo: boolean;
}

export default function PotenciaPracticaClient({ nivelPorTipo, escudosExtra, hielosDisponibles, tiemposExtraDisponibles, boostActivo }: Props) {
  const t = useTranslations("Practica");
  const tPotencias = useTranslations("Potencias.tipos");
  const tNumeria = useTranslations("Numeria.temas");
  const NOMBRES: Record<TipoPotencia, string> = {
    potencia: tPotencias("potencia"),
    raiz: tPotencias("raiz"),
    notacion: tPotencias("notacion"),
  };
  const [fase, setFase] = useState<Fase>("inicio");
  const [seleccion, setSeleccion] = useState<TipoPotencia[]>([...TIPOS_POTENCIA]);
  const [startedAtIso, setStartedAtIso] = useState("");
  const [startedAtPerf, setStartedAtPerf] = useState(0);
  const [resumen, setResumen] = useState<FinishResponse | null>(null);
  const [errores, setErrores] = useState<ProblemaPotencia[]>([]);
  const [error, setError] = useState<string | null>(null);

  function toggle(tipo: TipoPotencia) {
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
        setError(data.error ?? t("cliente.noSePudoCerrar"));
      } else {
        setError(null);
        setResumen(data as FinishResponse);
      }
    } catch {
      setError(t("cliente.errorDeRed"));
    }
    setFase("resumen");
  }

  if (fase === "sprint") {
    return (
      <EnunciadoSprintRunner
        generar={generarProblemaPotencia}
        startedAt={startedAtPerf}
        nivelPorTipoInicial={nivelPorTipo}
        seleccion={seleccion}
        escudosExtra={escudosExtra}
        hielosIniciales={hielosDisponibles}
        tiemposExtraIniciales={tiemposExtraDisponibles}
        apiPath="/api/attempts"
        problemTypeDe={(tipo) => `potencias_${tipo}`}
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
    const estadoResumen = estadoResumenPartida(resumen.sprint.total, resumen.sprint.correctos, errores.length, OBJETIVO_SPRINT);
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-20">
        <LogroBanner logros={resumen.logrosNuevos} />
        <NivelMundoSubio nivelMundo={resumen.nivelMundo} />
        <NivelCuentaSubio nivelCuenta={resumen.nivelCuenta} />

        <ApuestaResultado apuesta={resumen.apuesta ?? null} />
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="font-display text-lg font-bold text-foreground">{t("resumen.ahiQuedo")}</p>
          <p className="font-mono text-3xl font-bold text-foreground">
            +{resumen.sprint.xpGanado}{" "}
            <span className="text-base font-medium text-texto-secundario">{t("resumen.experiencia")}</span>
          </p>
          <ChispasGanadasNota valor={resumen.sprint.xpGanado} />
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
                  <span className="text-texto-secundario"><MathText texto={p.enunciado} /></span>
                  <span className="text-texto-secundario">
                    {t("resumen.era")} <span className="font-semibold text-error">{p.respuesta}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : estadoResumen === "sinRespuestas" ? (
          <p className="text-sm text-texto-secundario">{t("resumen.sinRespuestas")}</p>
        ) : estadoResumen === "incompletaSinErrores" ? (
          <p className="text-sm text-texto-secundario">{t("resumen.incompletaSinErrores")}</p>
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
        titulo={tNumeria("potencias")}
        subtitulo={t("subtemaPicker.subtitulo")}
        tipos={TIPOS_POTENCIA}
        nombres={NOMBRES}
        nivelPorTipo={nivelPorTipo}
        seleccion={seleccion}
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
