"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import Logo from "@/components/Logo";
import { LetreroNeon } from "@/components/landing/neon";
import { MANOS_POR_PARTIDA, decisionModelo, generarMano, jugarCrupier, jugarModelo, porCien, resultado, valorMano, type ManoComun } from "@/lib/ganaleModelo/blackjack";
import {
  acumular,
  aplicarAviso,
  cerrarMano,
  conteoMano,
  idAlAzar,
  ranking,
  resultadosMano,
  type AvisoJugador,
  type EstadoJugadorMano,
  type MarcadorJugador,
} from "@/lib/ganaleModelo/sala";
import { ManoCartas, NEON_NAIPIA, Pano, RETRASOS_CRUPIER, RETRASOS_JUGADOR, conSigno, useFrasesModelo } from "./mesa";
import { useCanalSala } from "./useCanalSala";

// Proyector de la sala en vivo (?modo=sala): reparte la misma mano a todos los celulares,
// muestra en vivo cuántos piden o se plantan, destapa al crupier para todos y lleva el
// ranking de la sala. Nada se guarda: si se recarga, empieza una sala nueva.

type Fase = "espera" | "jugando" | "revelado" | "fin";
interface ManoRecibida {
  id: string;
  n: number;
  mano: ManoComun;
}

const PAUSA_CRUPIER_MS = 800;
const URL_SALA = "prodigia-sandy.vercel.app/es/ganale-al-modelo";

function esAviso(p: Record<string, unknown>): p is AvisoJugador & Record<string, unknown> {
  return typeof p.id === "string" && typeof p.nombre === "string" && typeof p.manoId === "string" && typeof p.nCartas === "number" && typeof p.planto === "boolean";
}

export default function ModoSala() {
  const t = useTranslations("GanaleModelo");
  const tm = useTranslations("GanaleModelo.salaMesa");
  const frases = useFrasesModelo();
  const sala = useCanalSala("mesa");
  const [fase, setFase] = useState<Fase>("espera");
  const [actual, setActual] = useState<ManoRecibida | null>(null);
  const [estadoMano, setEstadoMano] = useState<Record<string, EstadoJugadorMano>>({});
  const [marcador, setMarcador] = useState<Record<string, MarcadorJugador>>({});
  const [mostrarPi, setMostrarPi] = useState(false);
  const [crupierVisto, setCrupierVisto] = useState(1);
  const [animando, setAnimando] = useState(false);

  // Lo que mandan los celulares.
  useEffect(() => {
    return sala.escuchar((evento, p) => {
      if (evento === "aviso" && esAviso(p) && actual && p.manoId === actual.id && fase === "jugando") {
        setEstadoMano((e) => aplicarAviso(e, p, actual.mano));
      } else if (evento === "hola") {
        sala.enviar("estado", { mano: actual, revelado: fase !== "jugando" });
      }
    });
  });

  function repartir() {
    const n = (actual?.n ?? 0) + 1;
    const m: ManoRecibida = { id: idAlAzar(), n, mano: generarMano() };
    setActual(m);
    setEstadoMano({});
    setMostrarPi(false);
    setCrupierVisto(1);
    setFase("jugando");
    sala.enviar("mano", { id: m.id, n: m.n, total: MANOS_POR_PARTIDA, mano: m.mano });
  }

  function destapar() {
    if (!actual) return;
    const cerrado = cerrarMano(estadoMano, actual.mano);
    setEstadoMano(cerrado);
    setMarcador((m) => acumular(m, cerrado, actual.mano));
    setFase("revelado");
    setAnimando(true);
    sala.enviar("crupier", { id: actual.id });
  }

  function verRanking() {
    setFase("fin");
    sala.enviar("fin", { ranking: ranking(marcador).slice(0, 100) });
  }

  function nuevaPartida() {
    setActual(null);
    setMarcador({});
    setEstadoMano({});
    setFase("espera");
  }

  useEffect(() => {
    if (fase !== "revelado" || !actual) return;
    const final = jugarCrupier(actual.mano.crupier);
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let n = 2; n <= final.length; n++) timers.push(setTimeout(() => setCrupierVisto(n), PAUSA_CRUPIER_MS * (n - 1)));
    timers.push(setTimeout(() => setAnimando(false), PAUSA_CRUPIER_MS * final.length + 200));
    return () => timers.forEach(clearTimeout);
  }, [fase, actual]);

  const mano = actual?.mano;
  const conteo = mano ? conteoMano(estadoMano, mano) : { jugando: 0, pidieron: 0, plantaron: 0 };
  const totalVotos = Math.max(1, conteo.pidieron + conteo.plantaron + conteo.jugando);
  const crupierFinal = mano ? jugarCrupier(mano.crupier) : [];
  // Con 21 de entrada no hay nada que decidir.
  const pi = mano && valorMano(mano.jugador.slice(0, 2)).total < 21 ? decisionModelo(mano.jugador.slice(0, 2), mano.crupier[0]) : null;
  const modelo = mano ? jugarModelo(mano) : null;
  const resModelo = mano && modelo ? resultado(modelo.cartas, crupierFinal) : 0;
  const resultados = mano && fase !== "jugando" ? resultadosMano(estadoMano, mano) : null;
  const tabla = ranking(marcador);
  const ultimaMano = (actual?.n ?? 0) >= MANOS_POR_PARTIDA;
  const nombres = sala.jugadores.filter((j) => j.nombre).slice(-40);

  return (
    <MotionConfig reducedMotion="never">
      <div className="noche-prodigia flex min-h-screen flex-col">
        <header className="border-b border-border">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-3">
            <span className="flex items-center gap-3 font-display text-3xl font-bold text-foreground">
              <Logo size={36} colorAro="#7C5CFF" />
              <LetreroNeon texto={t("titulo")} color={NEON_NAIPIA} falla={3} />
            </span>
            <span className="flex items-center gap-3 text-xl font-semibold text-foreground">
              <span className="h-3 w-3 rounded-full bg-[#FF5D5D] shadow-[0_0_8px_#FF5D5D]" aria-hidden="true" />
              {tm("titulo")} · {tm("conectados", { n: sala.jugadores.length })}
            </span>
          </div>
        </header>

        <main className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-6 py-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="flex flex-col gap-5">
            {fase === "espera" && (
              <div className="flex flex-1 flex-col items-center justify-center gap-6 rounded-3xl border border-border bg-surface p-8 text-center">
                <p className="text-2xl text-texto-secundario">{tm("entra")}</p>
                <p className="break-all font-mono text-3xl font-bold text-foreground sm:text-4xl">{URL_SALA}</p>
                <p className="font-display text-6xl font-bold text-foreground">{tm("conectados", { n: sala.jugadores.length })}</p>
                <div className="flex max-w-2xl flex-wrap justify-center gap-2">
                  <AnimatePresence>
                    {nombres.map((j) => (
                      <motion.span key={j.id} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="rounded-full border border-[#F25C5C]/50 bg-[#B91C1C]/15 px-3 py-1 text-lg text-foreground">
                        {j.nombre}
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {mano && actual && fase !== "espera" && fase !== "fin" && (
              <>
                <p className="text-2xl font-semibold text-[#F4B4B4]">{t("mano", { n: actual.n, total: MANOS_POR_PARTIDA })}</p>
                <Pano leyenda={t("pano")}>
                  <div className="flex flex-col gap-24 py-4">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl font-semibold text-[#F5EBCB]">
                        {t("crupier")}
                        {fase === "revelado" && <span className="ml-3 rounded-full bg-black/35 px-3 py-0.5 font-mono text-xl">{frases.totalDe(crupierFinal.slice(0, crupierVisto))}</span>}
                      </span>
                      <ManoCartas
                        key={`c-${actual.id}`}
                        ancho={110}
                        retrasos={RETRASOS_CRUPIER}
                        cartas={fase === "revelado" ? crupierFinal.slice(0, Math.max(2, crupierVisto)) : mano.crupier.slice(0, 2)}
                        oculta={fase === "jugando" || crupierVisto < 2}
                      />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl font-semibold text-[#F5EBCB]">
                        {tm("todos")}
                        <span className="ml-3 rounded-full bg-black/35 px-3 py-0.5 font-mono text-xl">{frases.totalDe(mano.jugador.slice(0, 2))}</span>
                      </span>
                      <ManoCartas key={`j-${actual.id}`} ancho={110} retrasos={RETRASOS_JUGADOR} cartas={mano.jugador.slice(0, 2)} />
                    </div>
                  </div>
                </Pano>
              </>
            )}

            {fase === "fin" && (
              <div className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-6">
                <h2 className="font-display text-4xl font-bold text-foreground">{tm("ranking")}</h2>
                <ol className="flex flex-col">
                  {tabla.slice(0, 10).map((r, i) => (
                    <motion.li
                      key={r.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.12 * (9 - i) }}
                      className="flex items-center justify-between gap-4 border-b border-border py-3 text-2xl last:border-0"
                    >
                      <span className="flex items-center gap-4 truncate text-foreground">
                        <span className="w-10 font-mono text-texto-secundario">{i + 1}</span>
                        {r.nombre}
                      </span>
                      <span className="flex items-center gap-6 font-mono">
                        <span className="text-lg text-texto-secundario">π* {r.decisiones ? Math.round((100 * r.coincidencias) / r.decisiones) : 0}%</span>
                        <span className="w-16 text-right font-bold text-foreground">{conSigno(r.fichas)}</span>
                      </span>
                    </motion.li>
                  ))}
                </ol>
                {tabla.length === 0 && <p className="text-xl text-texto-secundario">{tm("sinJugadores")}</p>}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-5">
            {fase === "jugando" && (
              <section className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-6">
                {[
                  { etiqueta: tm("pidieron"), n: conteo.pidieron, color: "#F25C5C", nucleo: "#FFE9E9" },
                  { etiqueta: tm("plantaron"), n: conteo.plantaron, color: "#E9D9A6", nucleo: "#FFF8E6" },
                  { etiqueta: tm("pensando"), n: conteo.jugando, color: "#9B85FF", nucleo: "#F3F0FF" },
                ].map((b) => (
                  <div key={b.etiqueta} className="flex flex-col gap-2">
                    <div className="flex items-baseline justify-between text-2xl">
                      <span className="text-foreground">{b.etiqueta}</span>
                      <span className="font-mono font-bold text-foreground">{b.n}</span>
                    </div>
                    <div className="relative h-4 rounded-full border border-[#252C44] bg-[#121726]">
                      <motion.div
                        className="absolute inset-y-px left-px rounded-full"
                        animate={{ width: `calc(${(100 * b.n) / totalVotos}% - 2px)` }}
                        transition={{ type: "spring", stiffness: 120, damping: 20 }}
                        style={{ background: b.nucleo, boxShadow: `0 0 4px ${b.color}, 0 0 12px ${b.color}` } as CSSProperties}
                      />
                    </div>
                  </div>
                ))}
              </section>
            )}

            {mano && pi && (fase === "jugando" || fase === "revelado") && (
              <section className="flex flex-col items-center gap-3 rounded-3xl border-2 border-[#F25C5C]/60 bg-surface p-6 text-center shadow-[0_0_30px_#F25C5C33]">
                <span className="text-xl font-semibold text-texto-secundario">{tm("piDice")}</span>
                {mostrarPi || fase === "revelado" ? (
                  <>
                    <span className="font-display text-6xl font-bold uppercase tracking-wide text-foreground">{pi.accion === "pedir" ? t("pedir") : t("plantarse")}</span>
                    <span className="font-mono text-xl text-texto-secundario">
                      {t("plantarse")} {conSigno(porCien(pi.qPlantarse))} · {t("pedir")} {conSigno(porCien(pi.qPedir))}
                    </span>
                  </>
                ) : (
                  <button type="button" onClick={() => setMostrarPi(true)} className="rounded-full border-2 border-[#F25C5C] px-8 py-3 text-2xl font-bold text-foreground">
                    {tm("mostrarPi")}
                  </button>
                )}
              </section>
            )}

            {fase === "revelado" && resultados && !animando && mano && modelo && (
              <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3 rounded-3xl border border-border bg-surface p-6">
                {[
                  { etiqueta: tm("ganaron"), n: resultados.ganaron, color: "text-[#7BE0A1]" },
                  { etiqueta: tm("empataron"), n: resultados.empataron, color: "text-[#E9D9A6]" },
                  { etiqueta: tm("perdieron"), n: resultados.perdieron, color: "text-[#F28B8B]" },
                ].map((r) => (
                  <div key={r.etiqueta} className="flex items-baseline justify-between text-2xl">
                    <span className="text-foreground">{r.etiqueta}</span>
                    <span className={`font-mono font-bold ${r.color}`}>{r.n}</span>
                  </div>
                ))}
                <div className="mt-2 flex items-center justify-between gap-4 border-t border-border pt-4">
                  <span className="text-2xl text-foreground">{t("modelo")}</span>
                  <ManoCartas ancho={48} cartas={modelo.cartas} />
                  <span className={`font-mono text-2xl font-bold ${resModelo > 0 ? "text-[#7BE0A1]" : resModelo < 0 ? "text-[#F28B8B]" : "text-[#E9D9A6]"}`}>{conSigno(resModelo)}</span>
                </div>
              </motion.section>
            )}

            {fase === "revelado" && !animando && tabla.length > 0 && (
              <section className="flex flex-col gap-2 rounded-3xl border border-border bg-surface p-6">
                <h2 className="text-xl font-semibold text-texto-secundario">{tm("ranking")}</h2>
                {tabla.slice(0, 5).map((r, i) => (
                  <div key={r.id} className="flex items-center justify-between text-xl">
                    <span className="truncate text-foreground">
                      <span className="mr-3 font-mono text-texto-secundario">{i + 1}</span>
                      {r.nombre}
                    </span>
                    <span className="font-mono font-bold text-foreground">{conSigno(r.fichas)}</span>
                  </div>
                ))}
              </section>
            )}

            <div className="flex flex-wrap gap-3">
              {(fase === "espera" || (fase === "revelado" && !ultimaMano)) && (
                <button type="button" onClick={repartir} disabled={animando} className="rounded-full bg-[#B91C1C] px-8 py-4 text-2xl font-bold text-white shadow-[0_0_0_2px_#F25C5C55,0_0_22px_#F25C5C44] disabled:opacity-40">
                  {tm("repartir", { n: (actual?.n ?? 0) + 1 })}
                </button>
              )}
              {fase === "jugando" && (
                <button type="button" onClick={destapar} className="rounded-full bg-[#B91C1C] px-8 py-4 text-2xl font-bold text-white shadow-[0_0_0_2px_#F25C5C55,0_0_22px_#F25C5C44]">
                  {tm("destapar")}
                </button>
              )}
              {fase === "revelado" && ultimaMano && (
                <button type="button" onClick={verRanking} disabled={animando} className="rounded-full bg-[#B91C1C] px-8 py-4 text-2xl font-bold text-white shadow-[0_0_0_2px_#F25C5C55,0_0_22px_#F25C5C44] disabled:opacity-40">
                  {tm("verRanking")}
                </button>
              )}
              {fase === "fin" && (
                <button type="button" onClick={nuevaPartida} className="rounded-full bg-[#B91C1C] px-8 py-4 text-2xl font-bold text-white shadow-[0_0_0_2px_#F25C5C55,0_0_22px_#F25C5C44]">
                  {tm("nuevaPartida")}
                </button>
              )}
            </div>
            {fase === "jugando" && <p className="text-lg text-texto-secundario">{tm("ayudaDestapar")}</p>}
          </div>
        </main>
      </div>
    </MotionConfig>
  );
}
