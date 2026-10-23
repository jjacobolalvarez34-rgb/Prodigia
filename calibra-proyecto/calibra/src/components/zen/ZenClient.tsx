"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import EsqueletoClickeable from "@/components/anatomia/EsqueletoClickeable";
import Boton from "@/components/Boton";
import MathText from "@/components/MathText";
import MemoriaCartas from "@/components/naipia/MemoriaCartas";
import RepasoErrores from "@/components/practica/RepasoErrores";
import GeografiaMapa from "@/app/[locale]/geografia/GeografiaMapa";
import { Link } from "@/i18n/navigation";
import type { PreguntaMundo } from "@/lib/mundosJugables";
import type { Carta } from "@/lib/practica/naipia";
import type { FallaRepaso } from "@/lib/practica/repaso";
import { reproducirTono } from "@/lib/sonido";
import { createClient } from "@/lib/supabase/client";
import { GRUPOS_NUMERIA, LARGOS_ZEN, nivelDePregunta, nivelSugerido, normalizarConfigZen, opcionesZen, opcionVisible, rangosAritmetica, type ConfigZen } from "@/lib/zen/config";
import { estadisticasZen, formatearDuracion, resultadoDe, type RegistroZen, type ResultadoBarra } from "@/lib/zen/estadisticas";
import { claveZen, esCorrectaZen, fallaZen, generarZen, nombreDificultad, solucionZen, temasZen, type PreguntaZen } from "@/lib/zen/preguntas";
import VisualZen from "./VisualZen";

type Fase = "elegir" | "jugando" | "final";

// «Al2O3» → «Al₂O₃» (formato «quimica» de Quimia).
function subindices(s: string): string {
  return s.replace(/([A-Za-z)\]])(\d+)/g, (_, a: string, n: string) => a + n.replace(/\d/g, (d) => "₀₁₂₃₄₅₆₇₈₉"[Number(d)]));
}

function Texto({ p, texto, className }: { p: PreguntaMundo; texto: string; className?: string }) {
  if (p.formato === "quimica") return <span className={className}>{subindices(texto)}</span>;
  return <MathText texto={texto} className={className} />;
}

const claveGuardado = (mundo: string) => `prodigia:zen:${mundo}`;

function leerGuardado(mundo: string): unknown {
  try {
    const raw = window.localStorage.getItem(claveGuardado(mundo));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function guardar(mundo: string, config: ConfigZen) {
  try {
    window.localStorage.setItem(claveGuardado(mundo), JSON.stringify(config));
  } catch {
    // Sin almacenamiento (modo privado): la próxima vez arranca con lo de siempre.
  }
}

const COLOR_BARRA: Record<ResultadoBarra, string> = { primero: "var(--correcto)", segundo: "var(--logro)", fallada: "var(--error)" };

// Modo Zen (docs/PLAN_MODO_SIN_RELOJ.md): eliges temas, dificultad, largo y las
// opciones del mundo, y juegas sin reloj. Si fallas, puedes intentar otra vez o ver
// la respuesta; las pistas son gratis. No da Chispas ni XP: solo cuenta para la
// racha. Al final, estadísticas de la sesión y el repaso de cada pregunta fallada.
// Misma lógica que la pantalla Zen de la app (mobile/src/app/zen/[mundo].tsx).
export default function ZenClient({ mundo, nombreMundo, color, niveles, contexto }: { mundo: string; nombreMundo: string; color: string; niveles: Record<string, number>; contexto: unknown }) {
  const t = useTranslations("Zen");
  const locale = useLocale();
  const decimal = (1.5).toLocaleString(locale).includes(",") ? "," : ".";
  const temas = temasZen(mundo);
  const opciones = opcionesZen(mundo);
  const [fase, setFase] = useState<Fase>("elegir");
  const [config, setConfig] = useState<ConfigZen>(() => normalizarConfigZen(mundo, null, niveles[temas[0]?.id ?? ""] ?? 3));
  const [subiendo, setSubiendo] = useState(false);
  const cargado = useRef(false);

  const [pregunta, setPregunta] = useState<PreguntaZen | null>(null);
  const [memorizando, setMemorizando] = useState(false);
  const [respuesta, setRespuesta] = useState("");
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [estado, setEstado] = useState<"idle" | "correcto" | "incorrecto">("idle");
  const [casi, setCasi] = useState(false);
  const [ocultas, setOcultas] = useState<Set<string>>(() => new Set());
  const [pista, setPista] = useState<string | null>(null);
  const [registros, setRegistros] = useState<RegistroZen[]>([]);
  const [fallos, setFallos] = useState<FallaRepaso[]>([]);
  const [racha, setRacha] = useState<number | null>(null);
  const usados = useRef(new Set<string>());
  const intentos = useRef<string[]>([]);
  const inicio = useRef(0);

  // La última configuración de este mundo (se guarda en el navegador).
  useEffect(() => {
    const guardada = leerGuardado(mundo);
    if (guardada) {
      const c = normalizarConfigZen(mundo, guardada, niveles[temas[0]?.id ?? ""] ?? 3);
      setConfig(c);
      setSubiendo(c.nivelMax > c.nivelMin);
    }
    cargado.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al entrar al mundo
  }, [mundo]);

  useEffect(() => {
    if (cargado.current) guardar(mundo, config);
  }, [mundo, config]);

  // Memoria de Enigmia: la lista se ve un rato y se esconde.
  useEffect(() => {
    if (!memorizando || !pregunta || pregunta.tipo !== "mundo" || pregunta.p.memoria?.tipo !== "lista") return;
    const id = setTimeout(() => setMemorizando(false), pregunta.p.memoria.ms);
    return () => clearTimeout(id);
  }, [memorizando, pregunta]);

  // El tiempo de cada respuesta cuenta desde que la pregunta queda a la vista.
  useEffect(() => {
    if (pregunta && !memorizando) inicio.current = performance.now();
  }, [pregunta, memorizando]);

  const nivelActual = nivelDePregunta(config, registros.length);
  const sugerido = nivelSugerido(config.temas, niveles);

  function siguiente(indice: number) {
    const q = generarZen(mundo, config, indice, usados.current, contexto);
    if (!q) return;
    usados.current.add(claveZen(q));
    intentos.current = [];
    setPregunta(q);
    setMemorizando(q.tipo === "mundo" && !!q.p.memoria);
    setRespuesta("");
    setSeleccion(null);
    setEstado("idle");
    setCasi(false);
    setOcultas(new Set());
    setPista(null);
  }

  function empezar() {
    usados.current = new Set();
    setRegistros([]);
    setFallos([]);
    setRacha(null);
    setFase("jugando");
    siguiente(0);
  }

  function cerrar(correcto: boolean) {
    if (!pregunta) return;
    const ms = Math.max(0, Math.round(performance.now() - inicio.current));
    setRegistros((r) => [...r, { correcto, ms, intentos: [...intentos.current], pista: pista != null, nivel: nivelActual }]);
    if (!correcto) setFallos((f) => [...f, fallaZen(pregunta, intentos.current, (pais) => t("dondeEsta", { pais }))]);
  }

  function responder(valor: string) {
    if (!pregunta || estado !== "idle" || memorizando || casi) return;
    setSeleccion(valor);
    intentos.current.push(valor);
    if (esCorrectaZen(pregunta, valor)) {
      setEstado("correcto");
      reproducirTono("correcto");
      cerrar(true);
      return;
    }
    reproducirTono("error");
    if (intentos.current.length < 2) {
      setCasi(true);
      setOcultas((o) => new Set(o).add(valor));
      return;
    }
    verRespuesta();
  }

  function verRespuesta() {
    setCasi(false);
    setEstado("incorrecto");
    cerrar(false);
  }

  async function avanzar() {
    if (registros.length >= config.preguntas) {
      setFase("final");
      reproducirTono("logro");
      const { data, error } = await createClient().rpc("registrar_partida_zen", { p_mundo: mundo, p_respondidas: registros.length });
      if (!error) {
        const fila = Array.isArray(data) ? data[0] : data;
        setRacha((fila as { racha?: number } | null)?.racha ?? null);
      }
      return;
    }
    siguiente(registros.length);
  }

  function darPista() {
    if (!pregunta || pista || pregunta.tipo !== "mundo") return;
    const e = pregunta.p.entrada;
    if (e.tipo === "opciones") {
      const malas = e.opciones.filter((o) => o !== e.respuesta && !ocultas.has(o)).sort(() => Math.random() - 0.5).slice(0, 2);
      setOcultas((o) => new Set([...o, ...malas]));
      setPista(t("pistaOpciones"));
    } else if (e.tipo === "numero") {
      const s = String(e.respuesta).replace(".", ",");
      setPista(t("pistaNumero", { inicio: s.startsWith("-") ? s.slice(0, 2) : s[0], cifras: s.replace("-", "").replace(",", "").length }));
    } else setPista(t("pistaMirar"));
  }

  const cambiar = (parcial: Partial<ConfigZen>) => setConfig((c) => ({ ...c, ...parcial }));
  const nombreTema = (id: string, nombre: string) => (mundo === "numeria" && t.has(`subtemas.${id.split(":")[1]}`) ? t(`subtemas.${id.split(":")[1]}`) : nombre);
  const resumenTemas = () => {
    if (config.temas.length === temas.length && temas.length > 1) return t("todosLosTemas");
    if (config.temas.length > 2) return t("temasN", { n: config.temas.length });
    return config.temas.map((id) => nombreTema(id, temas.find((x) => x.id === id)?.nombre ?? id)).join(", ");
  };
  const textoNiveles = config.nivelMax > config.nivelMin ? t("niveles", { min: config.nivelMin, max: config.nivelMax }) : t("nivel", { n: config.nivelMin });

  const tinte = (pct: number) => `color-mix(in oklab, ${color} ${pct}%, var(--surface))`;
  const chip = (activo: boolean) =>
    `rounded-xl border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${activo ? "text-foreground" : "border-border bg-surface text-texto-secundario hover:text-foreground"}`;
  const estiloChip = (activo: boolean) => (activo ? { borderColor: color, background: tinte(14) } : undefined);
  const tituloSeccion = "text-xs font-bold uppercase tracking-wider text-texto-secundario";
  const tarjeta = "flex flex-col gap-3 rounded-2xl border border-border bg-surface/80 p-4";

  // ---------- Elegir ----------
  if (fase === "elegir") {
    const alternarTema = (id: string) => {
      const ya = config.temas.includes(id);
      if (ya && config.temas.length === 1) return; // siempre queda al menos uno
      cambiar({ temas: ya ? config.temas.filter((x) => x !== id) : [...config.temas, id] });
    };
    const alternarGrupo = (grupo: string) => {
      const ids = temas.filter((x) => x.grupo === grupo).map((x) => x.id);
      const todos = ids.every((id) => config.temas.includes(id));
      const resto = config.temas.filter((x) => !ids.includes(x));
      if (todos && resto.length === 0) return;
      cambiar({ temas: todos ? resto : [...resto, ...ids] });
    };
    const botonTema = (x: { id: string; nombre: string; simbolo: string }) => {
      const activo = config.temas.includes(x.id);
      return (
        <button key={x.id} type="button" onClick={() => alternarTema(x.id)} className={chip(activo)} style={estiloChip(activo)} aria-pressed={activo}>
          <span className="mr-1.5 font-mono text-xs" style={activo ? { color } : undefined} aria-hidden="true">
            {x.simbolo}
          </span>
          {nombreTema(x.id, x.nombre)}
        </button>
      );
    };
    const tocarNivel = (n: number) => {
      if (!subiendo) return cambiar({ nivelMin: n, nivelMax: n });
      if (n <= config.nivelMin) return cambiar({ nivelMin: n });
      if (n >= config.nivelMax) return cambiar({ nivelMax: n });
      return n - config.nivelMin <= config.nivelMax - n ? cambiar({ nivelMin: n }) : cambiar({ nivelMax: n });
    };
    const visibles = opciones.filter((o) => opcionVisible(o, config.temas));
    const rangos = mundo === "numeria" ? rangosAritmetica(config) : [];

    return (
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
        <header className="flex flex-col gap-1">
          <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color }}>
            ☯ {t("titulo")}
          </p>
          <h1 className="font-display text-3xl font-bold text-foreground">{nombreMundo}</h1>
          <p className="rounded-xl border px-3 py-2 text-sm text-texto-secundario" style={{ borderColor: `color-mix(in oklab, ${color} 45%, transparent)`, background: tinte(7) }}>
            {t("explicacion")}
          </p>
        </header>

        {/* Temas */}
        <section className={tarjeta} aria-labelledby="zen-temas">
          <div className="flex items-baseline justify-between gap-2">
            <h2 id="zen-temas" className={tituloSeccion}>
              {t("tema")}
            </h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="font-mono text-texto-secundario">{t("elegidos", { n: config.temas.length, total: temas.length })}</span>
              {config.temas.length < temas.length && (
                <button type="button" onClick={() => cambiar({ temas: temas.map((x) => x.id) })} className="font-semibold underline underline-offset-4" style={{ color }}>
                  {t("todos")}
                </button>
              )}
            </div>
          </div>
          <p className="-mt-1 text-xs text-texto-secundario">{t("temasAyuda")}</p>
          {mundo === "numeria" ? (
            <div className="flex flex-col gap-3">
              {GRUPOS_NUMERIA.map((g) => {
                const ids = temas.filter((x) => x.grupo === g.id);
                const todos = ids.every((x) => config.temas.includes(x.id));
                return (
                  <div key={g.id} className="flex flex-col gap-1.5">
                    <button type="button" onClick={() => alternarGrupo(g.id)} className="flex w-fit items-center gap-2 text-left text-sm font-bold text-foreground hover:underline" aria-pressed={todos}>
                      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1 font-mono text-xs" style={{ background: tinte(todos ? 24 : 10), color }} aria-hidden="true">
                        {g.simbolo}
                      </span>
                      {t.has(`grupos.${g.id}`) ? t(`grupos.${g.id}`) : g.nombre}
                    </button>
                    <div className="flex flex-wrap gap-2">{ids.map(botonTema)}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">{temas.map(botonTema)}</div>
          )}
        </section>

        {/* Opciones del mundo */}
        {visibles.length > 0 && (
          <section className={tarjeta} aria-labelledby="zen-opciones">
            <h2 id="zen-opciones" className={tituloSeccion}>
              {t("opcionesDe", { mundo: nombreMundo })}
            </h2>
            {visibles.map((o) =>
              o.tipo === "interruptor" ? (
                <button
                  key={o.id}
                  type="button"
                  role="switch"
                  aria-checked={config.opciones[o.id] === true}
                  onClick={() => cambiar({ opciones: { ...config.opciones, [o.id]: config.opciones[o.id] !== true } })}
                  className="flex items-center gap-3 rounded-xl px-1 py-1 text-left focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-foreground">{t.has(`opciones.${o.id}.nombre`) ? t(`opciones.${o.id}.nombre`) : o.nombre}</span>
                    <span className="block font-mono text-xs text-texto-secundario">{t.has(`opciones.${o.id}.detalle`) ? t(`opciones.${o.id}.detalle`) : o.detalle}</span>
                  </span>
                  <span className="relative h-6 w-11 shrink-0 rounded-full transition-colors" style={{ background: config.opciones[o.id] === true ? color : "color-mix(in oklab, var(--foreground) 18%, transparent)" }} aria-hidden="true">
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${config.opciones[o.id] === true ? "left-[22px]" : "left-0.5"}`} />
                  </span>
                </button>
              ) : (
                <div key={o.id} className="flex flex-col gap-2">
                  <p className="text-sm font-semibold text-foreground">{t.has(`opciones.${o.id}.nombre`) ? t(`opciones.${o.id}.nombre`) : o.nombre}</p>
                  <div className="flex flex-wrap gap-2" role="radiogroup">
                    {o.valores.map((v) => {
                      const activo = config.opciones[o.id] === v.id;
                      const clave = `opciones.${o.id}.valores.${v.id || "todos"}`;
                      return (
                        <button key={v.id} type="button" role="radio" aria-checked={activo} onClick={() => cambiar({ opciones: { ...config.opciones, [o.id]: v.id } })} className={chip(activo)} style={estiloChip(activo)}>
                          {t.has(clave) ? t(clave) : v.nombre}
                        </button>
                      );
                    })}
                  </div>
                  {config.opciones[o.id] !== "" && t.has(`opciones.${o.id}.ayuda.${config.opciones[o.id]}`) && <p className="text-xs text-texto-secundario">{t(`opciones.${o.id}.ayuda.${config.opciones[o.id]}`)}</p>}
                </div>
              )
            )}
          </section>
        )}

        {/* Dificultad */}
        <section className={tarjeta} aria-labelledby="zen-dificultad">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="zen-dificultad" className={tituloSeccion}>
              {t("dificultad")}
            </h2>
            <div className="flex rounded-full border border-border bg-surface-2 p-0.5 text-xs font-semibold" role="radiogroup">
              {([false, true] as const).map((s) => (
                <button
                  key={String(s)}
                  type="button"
                  role="radio"
                  aria-checked={subiendo === s}
                  onClick={() => {
                    setSubiendo(s);
                    if (!s) cambiar({ nivelMax: config.nivelMin });
                    else if (config.nivelMax === config.nivelMin) cambiar(config.nivelMin >= 10 ? { nivelMin: 8 } : { nivelMax: Math.min(10, config.nivelMin + 3) });
                  }}
                  className={`rounded-full px-3 py-1 transition-colors ${subiendo === s ? "text-foreground" : "text-texto-secundario"}`}
                  style={subiendo === s ? { background: tinte(22) } : undefined}
                >
                  {s ? t("modoNivel.rango") : t("modoNivel.fijo")}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-display text-lg font-bold" style={{ color }}>
              {subiendo && config.nivelMax > config.nivelMin ? t("desdeHasta", { min: config.nivelMin, max: config.nivelMax }) : t("nivel", { n: config.nivelMin })}
            </span>
            <span className="text-xs font-semibold text-texto-secundario">
              {subiendo && config.nivelMax > config.nivelMin
                ? `${t(`dificultades.${nombreDificultad(config.nivelMin)}`)} → ${t(`dificultades.${nombreDificultad(config.nivelMax)}`)}`
                : t(`dificultades.${nombreDificultad(config.nivelMin)}`)}
            </span>
          </div>
          <div className="grid grid-cols-10 gap-1" role="group" aria-label={t("dificultad")}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
              const dentro = n >= config.nivelMin && n <= config.nivelMax;
              const borde = n === config.nivelMin || n === config.nivelMax;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => tocarNivel(n)}
                  aria-pressed={dentro}
                  aria-label={t("nivel", { n })}
                  className="flex aspect-[4/5] items-center justify-center rounded-lg border font-mono text-sm font-bold transition-all hover:scale-105"
                  style={{
                    borderColor: borde ? color : dentro ? `color-mix(in oklab, ${color} 55%, transparent)` : "var(--border)",
                    background: dentro ? tinte(10 + n * 4) : "var(--surface)",
                    color: dentro ? "var(--foreground)" : "var(--texto-secundario)",
                    transform: borde ? "scale(1.06)" : undefined,
                  }}
                >
                  {n}
                </button>
              );
            })}
          </div>
          <div className="flex justify-between text-[11px] text-texto-secundario">
            {(["facil", "media", "dificil", "experto"] as const).map((d) => (
              <span key={d}>{t(`dificultades.${d}`)}</span>
            ))}
          </div>
          {subiendo && <p className="text-xs text-texto-secundario">{config.nivelMax > config.nivelMin ? t("rangoTexto", { min: config.nivelMin, max: config.nivelMax }) : t("rangoElegir")}</p>}
          {sugerido != null && (sugerido !== config.nivelMin || config.nivelMax !== config.nivelMin) && !subiendo && (
            <button type="button" onClick={() => cambiar({ nivelMin: sugerido, nivelMax: sugerido })} className="w-fit text-xs font-semibold underline underline-offset-4" style={{ color }}>
              {t("usarMiNivel", { n: sugerido })}
            </button>
          )}
          {rangos.length > 0 && (
            <div className="rounded-xl bg-surface-2 px-3 py-2.5">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-texto-secundario">{t("numerosTitulo")}</p>
              <ul className="flex flex-col gap-1">
                {rangos.map((r) => (
                  <li key={r.op} className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-texto-secundario">{nombreTema(`aritmetica:${r.op}`, r.op)}</span>
                    <span className="font-mono font-semibold text-foreground">
                      {r.desde}
                      {r.hasta && (
                        <>
                          <span className="px-1.5 text-texto-secundario" aria-hidden="true">
                            →
                          </span>
                          {r.hasta}
                        </>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Largo */}
        <section className={tarjeta} aria-labelledby="zen-largo">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 id="zen-largo" className={tituloSeccion}>
                {t("preguntas")}
              </h2>
              <p className="text-xs text-texto-secundario">{t("preguntasAyuda")}</p>
            </div>
            <div className="flex gap-1.5" role="radiogroup">
              {LARGOS_ZEN.map((n) => (
                <button key={n} type="button" role="radio" aria-checked={config.preguntas === n} onClick={() => cambiar({ preguntas: n })} className={`${chip(config.preguntas === n)} min-w-11 font-mono`} style={estiloChip(config.preguntas === n)}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        </section>

        <Boton colorHex={color} destacado className="w-full py-4" onClick={empezar}>
          ☯ {t("jugar")}
        </Boton>
        <p className="-mt-2 text-center text-xs text-texto-secundario">{t("recordamos")}</p>
      </div>
    );
  }

  // ---------- Resumen ----------
  if (fase === "final") {
    const e = estadisticasZen(registros);
    const total = registros.length;
    const maxMs = Math.max(1, ...registros.map((r) => r.ms));
    const dur = (ms: number) => formatearDuracion(ms, decimal);
    const tiles: { etiqueta: string; valor: string; nota?: string }[] = [
      { etiqueta: t("stats.precision"), valor: `${e.precision}%`, nota: t("deTotal", { n: e.aciertos, total }) },
      { etiqueta: t("stats.alPrimero"), valor: String(e.alPrimero), nota: e.alSegundo > 0 ? t("alSegundoN", { n: e.alSegundo }) : t("deTotal", { n: e.alPrimero, total }) },
      { etiqueta: t("stats.rachaMax"), valor: String(e.rachaMax), nota: t("seguidas", { n: e.rachaMax }) },
      { etiqueta: t("stats.promedio"), valor: dur(e.promedioMs), nota: t("tiempoTotal", { t: dur(e.totalMs) }) },
      { etiqueta: t("stats.masRapida"), valor: e.masRapida != null ? dur(registros[e.masRapida].ms) : "—", nota: e.masRapida != null ? t("enPregunta", { n: e.masRapida + 1 }) : undefined },
      { etiqueta: t("stats.masLenta"), valor: e.masLenta != null ? dur(registros[e.masLenta].ms) : "—", nota: e.masLenta != null ? t("enPregunta", { n: e.masLenta + 1 }) : undefined },
    ];
    const subir = config.nivelMax < 10;

    return (
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-1 py-3 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color }}>
            ☯ {t("tuSesion")}
          </p>
          <p className="font-display text-6xl font-bold" style={{ color }}>
            {e.aciertos}/{total}
          </p>
          <p className="font-display text-xl font-bold text-foreground">{e.aciertos === total ? t("perfecto") : e.precision >= 70 ? t("muyBien") : t("sigue")}</p>
          <p className="text-sm text-texto-secundario">
            {textoNiveles} · {resumenTemas()}
            {racha != null ? ` · ${t("racha", { n: racha })}` : ""}
          </p>
        </motion.div>

        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label={t("tuSesion")}>
          {tiles.map((x) => (
            <div key={x.etiqueta} className="flex flex-col gap-0.5 rounded-2xl border border-border bg-surface px-3 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-texto-secundario">{x.etiqueta}</p>
              <p className="font-display text-2xl font-bold tabular-nums text-foreground">{x.valor}</p>
              {x.nota && <p className="text-xs text-texto-secundario">{x.nota}</p>}
            </div>
          ))}
        </motion.section>

        {/* Ritmo: una barra por pregunta, alto = tiempo, color = cómo salió */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="flex flex-col gap-3 rounded-2xl border border-border bg-surface px-4 py-4" aria-labelledby="zen-ritmo">
          <div className="flex items-baseline justify-between gap-2">
            <h2 id="zen-ritmo" className="font-display text-sm font-semibold text-foreground">
              {t("ritmo")}
            </h2>
            <span className="text-xs text-texto-secundario">{t("pistasUsadas", { n: e.pistas })}</span>
          </div>
          <div className="relative flex h-28 items-end gap-1" role="img" aria-label={t("ritmoAyuda")}>
            <div className="pointer-events-none absolute inset-x-0 border-t border-dashed border-texto-secundario/50" style={{ bottom: `${(e.promedioMs / maxMs) * 100}%` }} aria-hidden="true" />
            {registros.map((r, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(6, (r.ms / maxMs) * 100)}%` }}
                transition={{ delay: 0.2 + i * 0.03, duration: 0.35 }}
                className="flex-1 rounded-t-md"
                style={{ background: COLOR_BARRA[resultadoDe(r)], opacity: 0.85 }}
                title={`${i + 1}: ${dur(r.ms)}`}
              />
            ))}
          </div>
          <div className="-mt-2 flex gap-1" aria-hidden="true">
            {registros.map((_, i) => (
              <span key={i} className="flex-1 text-center font-mono text-[10px] text-texto-secundario">
                {i + 1}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-texto-secundario">
            {(["primero", "segundo", "fallada"] as const).map((k) => (
              <span key={k} className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: COLOR_BARRA[k] }} aria-hidden="true" />
                {t(`leyenda.${k}`)}
              </span>
            ))}
            <span className="inline-flex items-center gap-1.5">
              <span className="w-4 border-t border-dashed border-texto-secundario" aria-hidden="true" />
              {t("promedioLinea", { t: dur(e.promedioMs) })}
            </span>
          </div>
        </motion.section>

        {fallos.length > 0 ? (
          <RepasoErrores fallos={fallos} colorHex={color} className="max-w-none" />
        ) : (
          <p className="rounded-2xl border border-correcto/40 bg-correcto/10 px-4 py-3 text-center text-sm font-semibold text-correcto">{t("sinErrores")}</p>
        )}

        <Boton colorHex={color} destacado className="w-full py-4" onClick={empezar}>
          {t("otraVez")}
        </Boton>
        {subir && (
          <Boton
            variante="secundario"
            className="w-full"
            onClick={() => {
              cambiar({ nivelMin: Math.min(10, config.nivelMin + 1), nivelMax: Math.min(10, config.nivelMax + 1) });
              setFase("elegir");
            }}
          >
            {config.nivelMax > config.nivelMin ? t("subirRango", { min: config.nivelMin + 1, max: config.nivelMax + 1 }) : t("subirNivel", { n: config.nivelMin + 1 })}
          </Boton>
        )}
        <Boton variante="secundario" className="w-full" onClick={() => setFase("elegir")}>
          {t("cambiar")}
        </Boton>
        <Link href={`/${mundo}`} className="text-center text-sm font-semibold text-texto-secundario underline underline-offset-4 hover:text-foreground">
          {t("contrarreloj")}
        </Link>
      </div>
    );
  }

  // ---------- Jugando ----------
  if (!pregunta) return null;
  const p = pregunta.tipo === "mundo" ? pregunta.p : null;
  const numero = Math.min(config.preguntas, registros.length + (estado === "idle" ? 1 : 0));
  const bloqueado = estado !== "idle" || memorizando || casi;
  const nivelVisible = estado === "idle" ? nivelActual : (registros[registros.length - 1]?.nivel ?? nivelActual);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => setFase("elegir")} className="text-sm font-semibold text-texto-secundario hover:text-foreground" aria-label={t("salir")}>
          ✕ {t("salir")}
        </button>
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
          ☯ {t("nivel", { n: nivelVisible })}
        </span>
        <span className="font-mono text-sm text-texto-secundario">{t("deDiez", { n: numero, total: config.preguntas })}</span>
      </div>
      <div className="flex gap-1" aria-hidden="true">
        {Array.from({ length: config.preguntas }, (_, i) => (
          <span key={i} className="h-1.5 flex-1 rounded-full" style={{ background: i < registros.length ? COLOR_BARRA[resultadoDe(registros[i])] : "color-mix(in oklab, var(--foreground) 12%, transparent)" }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={claveZen(pregunta)}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          className="flex flex-col gap-4 rounded-2xl border-2 bg-surface p-5"
          style={{ borderColor: estado === "correcto" ? "var(--correcto)" : estado === "incorrecto" ? "var(--error)" : `color-mix(in oklab, ${color} 40%, transparent)` }}
        >
          {p && memorizando && p.memoria?.tipo === "lista" && (
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
                {t("memoriza")}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {p.memoria.items.map((x, i) => (
                  <span key={i} className="rounded-lg border-2 px-3 py-1.5 font-display text-lg font-bold" style={{ borderColor: color, color }}>
                    {x}
                  </span>
                ))}
              </div>
            </div>
          )}
          {p && memorizando && p.memoria?.tipo === "cartas" && <MemoriaCartas cartas={p.memoria.cartas as Carta[]} msPorCarta={p.memoria.msPorCarta} colorHex={color} onTerminar={() => setMemorizando(false)} />}

          {p && !memorizando && (
            <>
              {(p.visuales ?? []).map((v, i) => (
                <VisualZen key={i} visual={v} color={color} />
              ))}
              <p className="text-center font-display text-xl font-bold text-foreground">
                <Texto p={p} texto={p.enunciado} />
              </p>
              {p.entrada.tipo === "esqueleto" && <EsqueletoClickeable objetivoHueso={p.entrada.objetivo} respondido={estado !== "idle"} seleccion={seleccion} onClickHueso={responder} />}
            </>
          )}
          {pregunta.tipo === "mapa" && (
            <>
              <p className="text-center font-display text-xl font-bold text-foreground">{t("toca", { pais: pregunta.nombre })}</p>
              <GeografiaMapa continente={pregunta.continente} objetivoId={pregunta.id} seleccionId={seleccion} respondido={estado !== "idle"} onClickPais={responder} />
            </>
          )}

          {estado === "incorrecto" && (
            <p className="text-center font-semibold text-correcto">
              {t("era")} {p ? <Texto p={p} texto={solucionZen(pregunta)} /> : solucionZen(pregunta)}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {pista && estado === "idle" && <p className="text-center text-sm font-semibold text-logro">{pista}</p>}

      {casi && (
        <div className="flex flex-col gap-2">
          <p className="text-center font-semibold text-foreground">{t("casi")}</p>
          <div className="flex gap-2">
            <Boton
              colorHex={color}
              className="flex-1"
              onClick={() => {
                setCasi(false);
                setSeleccion(null);
                setRespuesta("");
              }}
            >
              {t("reintentar")}
            </Boton>
            <Boton variante="secundario" className="flex-1" onClick={verRespuesta}>
              {t("verRespuesta")}
            </Boton>
          </div>
        </div>
      )}

      {p && !memorizando && !casi && p.entrada.tipo === "opciones" && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {p.entrada.opciones.map((op) => {
            const e = p.entrada as { respuesta: string };
            const oculta = ocultas.has(op);
            const esOk = estado !== "idle" && op === e.respuesta;
            const esMal = estado !== "idle" && op === seleccion && op !== e.respuesta;
            return (
              <button
                key={op}
                type="button"
                disabled={bloqueado || oculta}
                onClick={() => responder(op)}
                className={`rounded-xl border-2 px-4 py-3 text-base font-semibold transition-all ${oculta ? "opacity-30" : "hover:scale-[1.01]"} ${esOk ? "border-correcto bg-correcto/15" : esMal ? "border-error bg-error/15" : "border-border bg-surface"}`}
              >
                <Texto p={p} texto={op} />
              </button>
            );
          })}
        </div>
      )}

      {p && !memorizando && !casi && p.entrada.tipo === "numero" && estado === "idle" && (
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (respuesta.trim()) responder(respuesta.trim());
          }}
        >
          <input
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            inputMode="decimal"
            autoFocus
            className="min-w-0 flex-1 rounded-xl border-2 border-border bg-surface px-4 py-3 text-center font-mono text-2xl text-foreground focus:outline-none"
            style={{ borderColor: color }}
            aria-label={t("respuesta")}
          />
          <Boton colorHex={color} type="submit">
            {t("responder")}
          </Boton>
        </form>
      )}

      {estado === "idle" && !memorizando && !casi && pregunta.tipo === "mundo" && !pista && (
        <button type="button" onClick={darPista} className="mx-auto rounded-full border border-logro/50 bg-logro/10 px-4 py-1.5 text-sm font-semibold text-logro">
          {t("pista")}
        </button>
      )}

      {estado !== "idle" && (
        <Boton colorHex={color} destacado className="w-full py-4" onClick={avanzar}>
          {registros.length >= config.preguntas ? t("verResumen") : t("siguiente")}
        </Boton>
      )}
    </div>
  );
}
