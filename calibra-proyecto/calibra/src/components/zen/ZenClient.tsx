"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import EsqueletoClickeable from "@/components/anatomia/EsqueletoClickeable";
import Boton from "@/components/Boton";
import MathText from "@/components/MathText";
import MemoriaCartas from "@/components/naipia/MemoriaCartas";
import GeografiaMapa from "@/app/[locale]/geografia/GeografiaMapa";
import { Link } from "@/i18n/navigation";
import type { PreguntaMundo } from "@/lib/mundosJugables";
import type { Carta } from "@/lib/practica/naipia";
import { reproducirTono } from "@/lib/sonido";
import { createClient } from "@/lib/supabase/client";
import { esCorrectaZen, generarZen, MEZCLA, nombreDificultad, PREGUNTAS_ZEN, solucionZen, temasZen, type PreguntaZen } from "@/lib/zen/preguntas";
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

// Modo Zen (docs/PLAN_MODO_SIN_RELOJ.md): eliges tema y dificultad y juegas 10
// preguntas sin reloj. Si fallas, puedes intentar otra vez o ver la respuesta; las
// pistas son gratis. No da Chispas ni XP: solo cuenta para la racha. Misma lógica
// que la pantalla Zen de la app (mobile/src/app/zen/[mundo].tsx).
export default function ZenClient({ mundo, nombreMundo, color, niveles, contexto }: { mundo: string; nombreMundo: string; color: string; niveles: Record<string, number>; contexto: unknown }) {
  const t = useTranslations("Zen");
  const temas = temasZen(mundo);
  const [fase, setFase] = useState<Fase>("elegir");
  const [tema, setTema] = useState(temas[0]?.id ?? MEZCLA);
  const [nivel, setNivel] = useState(() => Math.max(1, Math.min(10, niveles[temas[0]?.id ?? ""] ?? 3)));

  const [pregunta, setPregunta] = useState<PreguntaZen | null>(null);
  const [memorizando, setMemorizando] = useState(false);
  const [respuesta, setRespuesta] = useState("");
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [estado, setEstado] = useState<"idle" | "correcto" | "incorrecto">("idle");
  const [casi, setCasi] = useState(false);
  const [reintentoUsado, setReintentoUsado] = useState(false);
  const [ocultas, setOcultas] = useState<Set<string>>(() => new Set());
  const [pista, setPista] = useState<string | null>(null);
  const [resultados, setResultados] = useState<boolean[]>([]);
  const [falladas, setFalladas] = useState<{ enunciado: string; solucion: string; p: PreguntaMundo | null }[]>([]);
  const [racha, setRacha] = useState<number | null>(null);
  const usados = useRef(new Set<string>());

  // Memoria de Enigmia: la lista se ve un rato y se esconde.
  useEffect(() => {
    if (!memorizando || !pregunta || pregunta.tipo !== "mundo" || pregunta.p.memoria?.tipo !== "lista") return;
    const id = setTimeout(() => setMemorizando(false), pregunta.p.memoria.ms);
    return () => clearTimeout(id);
  }, [memorizando, pregunta]);

  function siguiente() {
    const q = generarZen(mundo, tema, nivel, usados.current, contexto);
    if (!q) return;
    usados.current.add(q.tipo === "mundo" ? q.p.clave : q.clave);
    setPregunta(q);
    setMemorizando(q.tipo === "mundo" && !!q.p.memoria);
    setRespuesta("");
    setSeleccion(null);
    setEstado("idle");
    setCasi(false);
    setReintentoUsado(false);
    setOcultas(new Set());
    setPista(null);
  }

  function empezar() {
    usados.current = new Set();
    setResultados([]);
    setFalladas([]);
    setRacha(null);
    setFase("jugando");
    siguiente();
  }

  function cerrar(correcto: boolean) {
    if (!pregunta) return;
    setResultados((r) => [...r, correcto]);
    if (!correcto) setFalladas((f) => [...f, { enunciado: pregunta.tipo === "mapa" ? t("dondeEsta", { pais: pregunta.nombre }) : pregunta.p.enunciado, solucion: solucionZen(pregunta), p: pregunta.tipo === "mundo" ? pregunta.p : null }]);
  }

  function responder(valor: string) {
    if (!pregunta || estado !== "idle" || memorizando || casi) return;
    setSeleccion(valor);
    if (esCorrectaZen(pregunta, valor)) {
      setEstado("correcto");
      reproducirTono("correcto");
      cerrar(true);
      return;
    }
    reproducirTono("error");
    if (!reintentoUsado) {
      setCasi(true);
      setReintentoUsado(true);
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
    if (resultados.length >= PREGUNTAS_ZEN) {
      setFase("final");
      reproducirTono("logro");
      const { data, error } = await createClient().rpc("registrar_partida_zen", { p_mundo: mundo, p_respondidas: resultados.length });
      if (!error) {
        const fila = Array.isArray(data) ? data[0] : data;
        setRacha((fila as { racha?: number } | null)?.racha ?? null);
      }
      return;
    }
    siguiente();
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

  const chip = (activo: boolean) =>
    `rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${activo ? "text-foreground" : "border-border bg-surface text-texto-secundario hover:text-foreground"}`;

  // ---------- Elegir ----------
  if (fase === "elegir") {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
        <header className="flex flex-col gap-1">
          <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color }}>
            ☯ {t("titulo")}
          </p>
          <h1 className="font-display text-3xl font-bold text-foreground">{nombreMundo}</h1>
          <p className="rounded-xl border px-3 py-2 text-sm text-texto-secundario" style={{ borderColor: `color-mix(in oklab, ${color} 45%, transparent)`, background: `color-mix(in oklab, ${color} 7%, var(--surface))` }}>
            {t("explicacion")}
          </p>
        </header>
        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-texto-secundario">{t("tema")}</h2>
          <div className="flex flex-wrap gap-2">
            {[...temas, { id: MEZCLA, nombre: t("mezcla"), simbolo: "✶" }].map((x) => (
              <button
                key={x.id}
                type="button"
                onClick={() => {
                  setTema(x.id);
                  if (niveles[x.id]) setNivel(Math.max(1, Math.min(10, niveles[x.id])));
                }}
                className={chip(tema === x.id)}
                style={tema === x.id ? { borderColor: color, background: `color-mix(in oklab, ${color} 14%, var(--surface))` } : undefined}
                aria-pressed={tema === x.id}
              >
                {x.simbolo} {x.nombre}
              </button>
            ))}
          </div>
        </section>
        <section className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-texto-secundario">{t("dificultad")}</h2>
            <span className="text-sm font-bold" style={{ color }}>
              {t("nivel", { n: nivel })} · {t(`dificultades.${nombreDificultad(nivel)}`)}
            </span>
          </div>
          <input type="range" min={1} max={10} step={1} value={nivel} onChange={(e) => setNivel(Number(e.target.value))} className="w-full" style={{ accentColor: color }} aria-label={t("dificultad")} />
          <div className="flex justify-between text-[11px] text-texto-secundario">
            {(["facil", "media", "dificil", "experto"] as const).map((d) => (
              <span key={d}>{t(`dificultades.${d}`)}</span>
            ))}
          </div>
        </section>
        <Boton colorHex={color} destacado className="w-full py-4" onClick={empezar}>
          ☯ {t("jugar")}
        </Boton>
      </div>
    );
  }

  // ---------- Resumen ----------
  if (fase === "final") {
    const aciertos = resultados.filter(Boolean).length;
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-1 py-4 text-center">
          <p className="font-display text-6xl font-bold" style={{ color }}>
            {aciertos}/{PREGUNTAS_ZEN}
          </p>
          <p className="font-display text-xl font-bold text-foreground">{aciertos === PREGUNTAS_ZEN ? t("perfecto") : aciertos >= 7 ? t("muyBien") : t("sigue")}</p>
          <p className="text-sm text-texto-secundario">
            {t("nivel", { n: nivel })} · {temas.find((x) => x.id === tema)?.nombre ?? t("mezcla")}
            {racha != null ? ` · ${t("racha", { n: racha })} 🔥` : ""}
          </p>
        </motion.div>
        {falladas.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-texto-secundario">{t("repasar")}</h2>
            {falladas.map((f, i) => (
              <div key={i} className="flex flex-col gap-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm">
                {f.p ? <Texto p={f.p} texto={f.enunciado} className="text-texto-secundario" /> : <span className="text-texto-secundario">{f.enunciado}</span>}
                <span className="font-semibold text-correcto">
                  {t("era")} {f.p ? <Texto p={f.p} texto={f.solucion} /> : f.solucion}
                </span>
              </div>
            ))}
          </section>
        )}
        <Boton colorHex={color} destacado className="w-full py-4" onClick={empezar}>
          {t("otraVez")}
        </Boton>
        {nivel < 10 && (
          <Boton
            variante="secundario"
            className="w-full"
            onClick={() => {
              setNivel((n) => Math.min(10, n + 1));
              setFase("elegir");
            }}
          >
            {t("subirNivel", { n: nivel + 1 })}
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
  const numero = Math.min(PREGUNTAS_ZEN, resultados.length + (estado === "idle" ? 1 : 0));
  const bloqueado = estado !== "idle" || memorizando || casi;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => setFase("elegir")} className="text-sm font-semibold text-texto-secundario hover:text-foreground" aria-label={t("salir")}>
          ✕ {t("salir")}
        </button>
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
          ☯ {t("nivel", { n: nivel })}
        </span>
        <span className="font-mono text-sm text-texto-secundario">{t("deDiez", { n: numero, total: PREGUNTAS_ZEN })}</span>
      </div>
      <div className="flex gap-1" aria-hidden="true">
        {Array.from({ length: PREGUNTAS_ZEN }, (_, i) => (
          <span key={i} className="h-1.5 flex-1 rounded-full" style={{ background: i < resultados.length ? (resultados[i] ? "var(--correcto)" : "var(--error)") : "color-mix(in oklab, var(--foreground) 12%, transparent)" }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={pregunta.tipo === "mundo" ? pregunta.p.clave : pregunta.clave}
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

      {pista && estado === "idle" && <p className="text-center text-sm font-semibold text-logro">💡 {pista}</p>}

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
          💡 {t("pista")}
        </button>
      )}

      {estado !== "idle" && (
        <Boton colorHex={color} destacado className="w-full py-4" onClick={avanzar}>
          {resultados.length >= PREGUNTAS_ZEN ? t("verResumen") : t("siguiente")}
        </Boton>
      )}
    </div>
  );
}
