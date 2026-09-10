"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Boton from "@/components/Boton";
import {
  ELEMENTOS_CASINO,
  ELEMENTO_CASINO_POR_SIMBOLO,
  FICHAS_CASINO,
  LIMITE_CASINO_DIARIO,
  TOTAL_ELEMENTOS_CASINO,
  multCasino,
  conteoZonaCasino,
  gananciaCasino,
  zonaElementoCasino,
  simbolosZonaCasino,
  colorElementoCasino,
  type ElementoCasino,
  type TipoElemento,
} from "@/lib/trastienda/casino";
import type { ResultadoCasino } from "@/lib/trastienda/tipos";

interface Props {
  puntos: number;
  onPuntos: (n: number) => void;
  onMovimiento: () => void;
}

const TIPOS_PILLS: TipoElemento[] = [
  "alcalino",
  "alcalinoterreo",
  "transicion",
  "post_transicion",
  "metaloides",
  "no_metal",
  "halogeno",
  "gas_noble",
  "lantanido",
  "actinido",
];

const GRUPOS_PILLS = [1, 2, 13, 14, 15, 16, 17, 18];

const PERIODOS_PILLS = [1, 2, 3, 4, 5, 6, 7];

interface PillProps {
  z: string;
  label: string;
  activa: boolean;
  disabled: boolean;
  onToggle: (z: string) => void;
}

function Pill({ z, label, activa, disabled, onToggle }: PillProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(z)}
      disabled={disabled}
      className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-40 ${
        activa
          ? "border-tt-accent bg-tt-accent/20 text-tt-accent"
          : "border-tt-border bg-tt-surface-2 text-tt-text-muted hover:text-tt-text"
      }`}
    >
      {label}
    </button>
  );
}

interface CeldaProps {
  e: ElementoCasino;
  seleccionada: boolean;
  resaltada: boolean;
  barrido: boolean;
  ganadora: boolean;
  deshabilitada: boolean;
  onToggle: (z: string) => void;
}

function Celda({ e, seleccionada, resaltada, barrido, ganadora, deshabilitada, onToggle }: CeldaProps) {
  return (
    <button
      type="button"
      aria-label={`${e.simbolo} — ${e.nombre}`}
      onClick={() => onToggle(zonaElementoCasino(e.simbolo))}
      disabled={deshabilitada}
      className={`flex aspect-square min-w-0 items-center justify-center rounded-[3px] text-[10px] font-bold leading-none transition-all sm:text-[11px] ${
        seleccionada ? "z-10 ring-2 ring-tt-accent" : ""
      } ${barrido ? "animate-pulse ring-2 ring-white/80" : ""} ${ganadora ? "ring-2 ring-white" : ""} ${
        resaltada ? "saturate-150" : "opacity-80"
      } disabled:opacity-60`}
      style={{ background: colorElementoCasino(e.tipo), color: "#0b0712" }}
    >
      {e.simbolo}
    </button>
  );
}

export default function Ruleta({ puntos, onPuntos, onMovimiento }: Props) {
  const t = useTranslations("Tienda.trastienda.ruleta");
  const terrores = useTranslations("Tienda.trastienda.errores");
  const [ficha, setFicha] = useState<number>(100);
  const [zona, setZona] = useState<string | null>(null);
  const [girando, setGirando] = useState(false);
  const [sweep, setSweep] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoCasino | null>(null);
  const [error, setError] = useState<string | null>(null);

  const conteo = zona ? conteoZonaCasino(zona) : 0;
  const mult = zona ? multCasino(conteo) : 0;
  const ganancia = zona ? gananciaCasino(ficha, conteo) : 0;
  const alcanza = puntos >= ficha;
  const bloqueado = resultado != null && resultado.apuestas_hoy >= LIMITE_CASINO_DIARIO;

  const zonaSet = zona ? new Set(simbolosZonaCasino(zona)) : null;

  useEffect(() => {
    if (!girando) return;
    const id = window.setInterval(() => {
      setSweep(ELEMENTOS_CASINO[Math.floor(Math.random() * TOTAL_ELEMENTOS_CASINO)].simbolo);
    }, 110);
    return () => window.clearInterval(id);
  }, [girando]);

  function toggleZona(z: string) {
    setZona((prev) => (prev === z ? null : z));
  }

  async function apostar() {
    if (!zona) return;
    setGirando(true);
    setSweep(null);
    setError(null);
    setResultado(null);
    try {
      const res = await fetch("/api/trastienda/casino", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zona, monto: ficha }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSweep(null);
        setGirando(false);
        setError(data.error ?? terrores("casino"));
        return;
      }
      window.setTimeout(() => {
        setSweep(null);
        setResultado(data as ResultadoCasino);
        setGirando(false);
        onPuntos((data as ResultadoCasino).puntos_total);
        onMovimiento();
      }, 2300);
    } catch {
      setSweep(null);
      setGirando(false);
      setError(terrores("casino"));
    }
  }

  const etiquetaZona = (z: string): string => {
    const elem = /^elemento:(.+)$/.exec(z);
    if (elem) {
      const e = ELEMENTO_CASINO_POR_SIMBOLO.get(elem[1].toUpperCase());
      return e ? `${e.simbolo} — ${e.nombre}` : z;
    }
    const grupo = /^grupo:(\d+)$/.exec(z);
    if (grupo) return t("grupo", { n: grupo[1] });
    if (z === "grupo:transicion") return t("transicion");
    const periodo = /^periodo:(\d+)$/.exec(z);
    if (periodo) return t("periodo", { n: periodo[1] });
    const tipo = /^tipo:(.+)$/.exec(z);
    if (tipo) return t(`tiposNombres.${tipo[1]}`);
    if (z === "paridad:par") return t("par");
    if (z === "paridad:impar") return t("impar");
    return z;
  };

  const premioNombre = (r: ResultadoCasino): string => {
    if (r.premio_tipo && r.premio_tipo !== "item") {
      return t(`premios.${r.premio_tipo}`);
    }
    const item = r.premio_detalle?.item as string | undefined;
    if (item === "boost") return t("premios.boost");
    if (item === "escudo") return t("premios.escudo");
    if (item === "congelamiento") return t("premios.congelamiento");
    return t("premios.nada");
  };

  const rendirCelda = (e: ElementoCasino) => {
    const seleccionada = zona === zonaElementoCasino(e.simbolo);
    const resaltada = !seleccionada && (zonaSet?.has(e.simbolo) ?? false);
    return (
      <Celda
        key={e.simbolo}
        e={e}
        seleccionada={seleccionada}
        resaltada={resaltada}
        barrido={sweep === e.simbolo}
        ganadora={resultado?.elegido === e.simbolo}
        deshabilitada={girando}
        onToggle={toggleZona}
      />
    );
  };

  const filasMain = [1, 2, 3, 4, 5, 6, 7].map((p) =>
    ELEMENTOS_CASINO.filter(
      (e) => e.periodo === p && e.grupo != null && e.tipo !== "lantanido" && e.tipo !== "actinido"
    )
  );
  const fBloque6 = ELEMENTOS_CASINO.filter((e) => e.tipo === "lantanido");
  const fBloque7 = ELEMENTOS_CASINO.filter((e) => e.tipo === "actinido");

  return (
    <div className="rounded-2xl border border-tt-border bg-tt-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold tracking-tight text-tt-text">🎰 {t("titulo")}</h3>
          <p className="mt-1 max-w-md text-sm text-tt-text-muted">{t("descripcion")}</p>
        </div>
        {resultado && !girando && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-tt-accent/60 bg-tt-accent/10 px-3 py-1 text-xs font-semibold text-tt-accent">
            {t("apuestasHoy", { n: resultado.apuestas_hoy })}
          </span>
        )}
      </div>

      {/* Mesa: tabla periódica completa */}
      <div className="mt-4 overflow-x-auto pb-2">
        <div className="space-y-[2px]" style={{ minWidth: "560px" }}>
          {filasMain.map((fila, i) => (
            <div key={i} className="grid gap-[2px]" style={{ gridTemplateColumns: "repeat(18, minmax(0, 1fr))" }}>
              {fila.map((e) => (
                <div key={e.simbolo} style={{ gridColumnStart: e.grupo ?? 1 }}>
                  {rendirCelda(e)}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="mt-2 space-y-[2px]" style={{ minWidth: "480px" }}>
          <div className="grid gap-[2px]" style={{ gridTemplateColumns: "repeat(15, minmax(0, 1fr))" }}>
            {fBloque6.map((e) => rendirCelda(e))}
          </div>
          <div className="grid gap-[2px]" style={{ gridTemplateColumns: "repeat(15, minmax(0, 1fr))" }}>
            {fBloque7.map((e) => rendirCelda(e))}
          </div>
        </div>
      </div>

      {/* Zonas */}
      <div className="mt-3 space-y-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-tt-text-muted">{t("eligeZona")}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <Pill z="paridad:par" label={t("par")} activa={zona === "paridad:par"} disabled={girando} onToggle={toggleZona} />
            <Pill z="paridad:impar" label={t("impar")} activa={zona === "paridad:impar"} disabled={girando} onToggle={toggleZona} />
            <Pill
              z="grupo:transicion"
              label={t("transicion")}
              activa={zona === "grupo:transicion"}
              disabled={girando}
              onToggle={toggleZona}
            />
            {GRUPOS_PILLS.map((g) => (
              <Pill
                key={`grupo:${g}`}
                z={`grupo:${g}`}
                label={t("grupo", { n: g })}
                activa={zona === `grupo:${g}`}
                disabled={girando}
                onToggle={toggleZona}
              />
            ))}
            {PERIODOS_PILLS.map((p) => (
              <Pill
                key={`periodo:${p}`}
                z={`periodo:${p}`}
                label={t("periodo", { n: p })}
                activa={zona === `periodo:${p}`}
                disabled={girando}
                onToggle={toggleZona}
              />
            ))}
            {TIPOS_PILLS.map((tipo) => (
              <Pill
                key={`tipo:${tipo}`}
                z={`tipo:${tipo}`}
                label={t(`tiposNombres.${tipo}`)}
                activa={zona === `tipo:${tipo}`}
                disabled={girando}
                onToggle={toggleZona}
              />
            ))}
          </div>
        </div>

        {/* Resumen de la zona */}
        {zona && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-tt-border bg-tt-surface-2 px-4 py-2.5">
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-bold text-tt-text">{etiquetaZona(zona)}</p>
              <p className="text-xs text-tt-text-muted">
                {t("posibilidades", { n: conteo })} · {t("multiplicador", { mult })}
              </p>
            </div>
            <p className="shrink-0 font-mono text-sm font-bold text-tt-accent">{t("paga", { n: ganancia })}</p>
          </div>
        )}
      </div>

      {bloqueado ? (
        <p className="mt-4 text-sm font-semibold text-tt-danger">{t("limiteDiario")}</p>
      ) : (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {FICHAS_CASINO.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setFicha(m)}
                disabled={girando}
                className={`rounded-full border px-4 py-2 font-mono text-sm font-bold transition-all disabled:opacity-40 ${
                  ficha === m
                    ? "border-tt-accent bg-tt-accent/20 text-tt-accent"
                    : "border-tt-border bg-tt-surface-2 text-tt-text-muted hover:text-tt-text"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <Boton
            onClick={apostar}
            disabled={girando || !zona || !alcanza}
            cargando={girando}
            className="w-full sm:w-auto"
          >
            {girando ? t("girando") : t("girar")}
          </Boton>
        </div>
      )}
      {!zona && !error && <p className="mt-3 text-xs font-medium text-tt-text-muted">{t("mesa")}</p>}
      {error && <p className="mt-3 text-sm font-medium text-tt-danger">{error}</p>}

      {/* Resultado */}
      {resultado && !girando && (
        <div
          className={`mt-4 rounded-xl border px-4 py-3 ${
            resultado.ganaste ? "border-tt-accent/50 bg-tt-accent/10" : "border-tt-border bg-tt-surface-2"
          }`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-tt-text-muted">
            {t("elementoGanador", { simbolo: resultado.elegido, nombre: resultado.elegido_nombre })}
          </p>
          <div className="mt-1 flex flex-col gap-0.5">
            {resultado.ganaste ? (
              <>
                <p className="font-display text-base font-bold text-tt-text">
                  {t("cayoEnTuZona")}{" "}
                  <span className="text-tt-accent">{t("ganoChispas", { n: resultado.chispas_ganadas })}</span>
                </p>
                {resultado.premio_tipo && resultado.premio_tipo !== "chispas" && (
                  <p className="text-sm font-semibold text-tt-accent">
                    {t("premioItem", { item: premioNombre(resultado) })}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="font-display text-base font-bold text-tt-text">{t("noCayo")}</p>
                <p className="text-sm text-tt-text-muted">{t("perdisteMonto", { monto: resultado.monto })}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}