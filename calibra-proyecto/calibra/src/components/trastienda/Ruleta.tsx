"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Boton from "@/components/Boton";
import RuletaElementalWheel from "@/components/trastienda/RuletaElementalWheel";
import {
  ELEMENTOS_CASINO,
  ELEMENTO_CASINO_POR_SIMBOLO,
  FICHAS_CASINO,
  LIMITE_CASINO_DIARIO,
  MAX_ZONAS_CASINO,
  conteoZonaCasino,
  multCasino,
  gananciaCasino,
  zonaElementoCasino,
  simbolosZonaCasino,
  colorElementoCasino,
  type ElementoCasino,
  type TipoElemento,
} from "@/lib/trastienda/casino";
import type { ResultadoCasinoMulti } from "@/lib/trastienda/tipos";

interface Props {
  puntos: number;
  onPuntos: (n: number) => void;
  onMovimiento: () => void;
}

const DURACION_GIRO_MS = 2200;

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
  ganadora: boolean;
  deshabilitada: boolean;
  onToggle: (z: string) => void;
}

function Celda({ e, seleccionada, resaltada, ganadora, deshabilitada, onToggle }: CeldaProps) {
  return (
    <button
      type="button"
      aria-label={`${e.simbolo} — ${e.nombre}`}
      onClick={() => onToggle(zonaElementoCasino(e.simbolo))}
      disabled={deshabilitada}
      className={`flex aspect-square min-w-0 items-center justify-center rounded-[3px] text-[10px] font-bold leading-none transition-all sm:text-[11px] ${
        seleccionada ? "z-10 ring-2 ring-tt-accent" : ""
      } ${ganadora ? "ring-2 ring-white" : ""} ${
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
  const [apuestas, setApuestas] = useState<Map<string, number>>(new Map());
  const [girando, setGirando] = useState(false);
  const [elegidoActual, setElegidoActual] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoCasinoMulti | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalApostado = [...apuestas.values()].reduce((a, b) => a + b, 0);
  const alcanza = puntos >= totalApostado;
  const bloqueado = resultado != null && resultado.apuestas_hoy >= LIMITE_CASINO_DIARIO;

  const zonasResaltadas = new Set<string>();
  for (const z of apuestas.keys()) {
    for (const simbolo of simbolosZonaCasino(z)) zonasResaltadas.add(simbolo);
  }

  function toggleZona(z: string) {
    setApuestas((prev) => {
      const next = new Map(prev);
      if (next.has(z)) {
        next.delete(z);
        setError(null);
        return next;
      }
      if (next.size >= MAX_ZONAS_CASINO) {
        setError(t("maxZonasAlcanzado", { max: MAX_ZONAS_CASINO }));
        return prev;
      }
      setError(null);
      next.set(z, ficha);
      return next;
    });
  }

  async function apostar() {
    if (apuestas.size === 0) return;
    setGirando(true);
    setElegidoActual(null);
    setError(null);
    setResultado(null);
    try {
      const cuerpo = {
        apuestas: [...apuestas.entries()].map(([zona, monto]) => ({ zona, monto })),
      };
      const res = await fetch("/api/trastienda/casino-multi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpo),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setGirando(false);
        setError(data.error ?? terrores("casino"));
        return;
      }
      const r = data as ResultadoCasinoMulti;
      setElegidoActual(r.elegido);
      window.setTimeout(() => {
        setResultado(r);
        setGirando(false);
        setApuestas(new Map());
        onPuntos(r.puntos_total);
        onMovimiento();
      }, DURACION_GIRO_MS);
    } catch {
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

  const premioNombre = (r: ResultadoCasinoMulti): string => {
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
    const propioZ = zonaElementoCasino(e.simbolo);
    const seleccionada = apuestas.has(propioZ);
    const resaltada = !seleccionada && zonasResaltadas.has(e.simbolo);
    return (
      <Celda
        key={e.simbolo}
        e={e}
        seleccionada={seleccionada}
        resaltada={resaltada}
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

      <RuletaElementalWheel girando={girando} elegido={elegidoActual} duracionMs={DURACION_GIRO_MS} />

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
            <Pill z="paridad:par" label={t("par")} activa={apuestas.has("paridad:par")} disabled={girando} onToggle={toggleZona} />
            <Pill z="paridad:impar" label={t("impar")} activa={apuestas.has("paridad:impar")} disabled={girando} onToggle={toggleZona} />
            <Pill
              z="grupo:transicion"
              label={t("transicion")}
              activa={apuestas.has("grupo:transicion")}
              disabled={girando}
              onToggle={toggleZona}
            />
            {GRUPOS_PILLS.map((g) => (
              <Pill
                key={`grupo:${g}`}
                z={`grupo:${g}`}
                label={t("grupo", { n: g })}
                activa={apuestas.has(`grupo:${g}`)}
                disabled={girando}
                onToggle={toggleZona}
              />
            ))}
            {PERIODOS_PILLS.map((p) => (
              <Pill
                key={`periodo:${p}`}
                z={`periodo:${p}`}
                label={t("periodo", { n: p })}
                activa={apuestas.has(`periodo:${p}`)}
                disabled={girando}
                onToggle={toggleZona}
              />
            ))}
            {TIPOS_PILLS.map((tipo) => (
              <Pill
                key={`tipo:${tipo}`}
                z={`tipo:${tipo}`}
                label={t(`tiposNombres.${tipo}`)}
                activa={apuestas.has(`tipo:${tipo}`)}
                disabled={girando}
                onToggle={toggleZona}
              />
            ))}
          </div>
        </div>

        {/* Zonas en juego (multi-apuesta) */}
        <div className="rounded-xl border border-tt-border bg-tt-surface-2 px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-tt-text-muted">
              {t("zonasEnJuego", { n: apuestas.size, max: MAX_ZONAS_CASINO })}
            </p>
            {totalApostado > 0 && (
              <p className="font-mono text-xs font-bold text-tt-accent">{t("totalEnJuego", { n: totalApostado })}</p>
            )}
          </div>
          {apuestas.size === 0 ? (
            <p className="mt-1.5 text-xs text-tt-text-muted">{t("sinZonasElegidas")}</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-1.5">
              {[...apuestas.entries()].map(([z, monto]) => {
                const conteo = conteoZonaCasino(z);
                const mult = multCasino(conteo);
                const ganancia = gananciaCasino(monto, conteo);
                return (
                  <li
                    key={z}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-tt-surface px-3 py-1.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-display text-sm font-bold text-tt-text">{etiquetaZona(z)}</p>
                      <p className="text-[11px] text-tt-text-muted">
                        {t("posibilidades", { n: conteo })} · {t("multiplicador", { mult })} ·{" "}
                        <span className="font-mono">{monto}</span>
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <p className="font-mono text-sm font-bold text-tt-accent">{t("paga", { n: ganancia })}</p>
                      <button
                        type="button"
                        onClick={() => toggleZona(z)}
                        disabled={girando}
                        className="rounded-full border border-tt-border px-2 py-0.5 text-[10px] font-semibold text-tt-text-muted transition-colors hover:text-tt-danger disabled:opacity-40"
                      >
                        {t("quitarZona")}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
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
            disabled={girando || apuestas.size === 0 || !alcanza}
            cargando={girando}
            className="w-full sm:w-auto"
          >
            {girando ? t("girando") : t("girar")}
          </Boton>
        </div>
      )}
      {error && <p className="mt-3 text-sm font-medium text-tt-danger">{error}</p>}

      {/* Resultado */}
      {resultado && !girando && (
        <div
          className={`mt-4 rounded-xl border px-4 py-3 ${
            resultado.apuestas.some((a) => a.ganaste) ? "border-tt-accent/50 bg-tt-accent/10" : "border-tt-border bg-tt-surface-2"
          }`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-tt-text-muted">
            {t("elementoGanador", { simbolo: resultado.elegido, nombre: resultado.elegido_nombre })}
          </p>
          <ul className="mt-2 flex flex-col gap-1">
            {resultado.apuestas.map((a, i) => (
              <li key={`${a.zona}-${i}`} className="flex items-center justify-between gap-2 text-sm">
                <span className={a.ganaste ? "font-semibold text-tt-text" : "text-tt-text-muted"}>
                  {etiquetaZona(a.zona)} — {a.ganaste ? t("ganasteEsta") : t("perdisteEsta")}
                </span>
                <span className={`font-mono font-bold ${a.ganaste ? "text-tt-accent" : "text-tt-text-muted"}`}>
                  {a.ganaste ? t("ganoChispas", { n: a.chispas_ganadas }) : `-${a.monto}`}
                </span>
              </li>
            ))}
          </ul>
          {resultado.premio_tipo && resultado.premio_tipo !== "chispas" && (
            <p className="mt-2 text-sm font-semibold text-tt-accent">
              {t("premioItem", { item: premioNombre(resultado) })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
