"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { MotionConfig } from "framer-motion";
import Logo from "@/components/Logo";
import type { ValorCarta } from "@/lib/practica/naipia";
import { conteoHiLo, conteoVerdadero, porCien, puntosCarta, resultado, valorMano, valoresEstado } from "@/lib/ganaleModelo/blackjack";
import { MESA_VACIA, agregarCarta, barajar, jugadorPide, jugadorPlanta, nuevaMano, type EstadoMesa } from "@/lib/ganaleModelo/mesa";
import { ManoCartas, NEON_NAIPIA, Pano, conSigno, useFrasesModelo } from "./mesa";
import { LetreroNeon } from "@/components/landing/neon";

// Modo presentador (?modo=mesa): se proyecta en la jornada mientras se juega con cartas
// reales. Letra grande para leerse desde el fondo del salón.

const TECLAS: ValorCarta[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "A"];
const BARAJAS = [1, 2, 4, 6, 8];

export default function ModoMesa() {
  const t = useTranslations("GanaleModelo");
  const tm = useTranslations("GanaleModelo.mesa");
  const frases = useFrasesModelo();
  const [historial, setHistorial] = useState<EstadoMesa[]>([MESA_VACIA]);
  const [barajas, setBarajas] = useState(6);
  const [ocultar, setOcultar] = useState(false);
  const [revelado, setRevelado] = useState(false);
  const e = historial[historial.length - 1];

  function aplicar(f: (x: EstadoMesa) => EstadoMesa) {
    setHistorial((h) => {
      const actual = h[h.length - 1];
      const sig = f(actual);
      return sig === actual ? h : [...h, sig].slice(-200);
    });
    setRevelado(false);
  }
  function deshacer() {
    setHistorial((h) => (h.length > 1 ? h.slice(0, -1) : h));
  }

  // Atajos de teclado.
  useEffect(() => {
    function tecla(ev: KeyboardEvent) {
      const destino = ev.target as HTMLElement | null;
      if (destino && (destino.tagName === "SELECT" || destino.tagName === "INPUT")) return;
      if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
      const k = ev.key.toLowerCase();
      let f: ((x: EstadoMesa) => EstadoMesa) | null = null;
      if (k >= "2" && k <= "9") f = (x) => agregarCarta(x, k as ValorCarta);
      else if (k === "0") f = (x) => agregarCarta(x, "10");
      else if (k === "a") f = (x) => agregarCarta(x, "A");
      else if (k === "p") f = jugadorPide;
      else if (k === "l") f = jugadorPlanta;
      else if (k === "n") f = nuevaMano;
      else if (k === "backspace") {
        ev.preventDefault();
        setHistorial((h) => (h.length > 1 ? h.slice(0, -1) : h));
        return;
      }
      if (!f) return;
      ev.preventDefault();
      const accion = f;
      setHistorial((h) => {
        const actual = h[h.length - 1];
        const sig = accion(actual);
        return sig === actual ? h : [...h, sig].slice(-200);
      });
      setRevelado(false);
    }
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, []);

  const decision = e.paso === "decide" ? valoresEstado(valorMano(e.jugador).total, valorMano(e.jugador).suave, puntosCarta(e.crupier[0].valor)) : null;
  const ultimaDecision = e.decisiones[e.decisiones.length - 1];
  const corriente = conteoHiLo(e.vistas);
  const verdadero = conteoVerdadero(corriente, e.vistas.length, barajas);
  const fin = e.paso === "fin" || (e.paso === "crupier" && valorMano(e.jugador).pasado && e.crupier.length >= 2);
  const res = fin ? resultado(e.jugador, e.crupier) : null;
  const tapado = ocultar && !revelado;

  return (
    <MotionConfig reducedMotion="never">
      <div className="noche-prodigia flex min-h-screen flex-col">
        <header className="border-b border-border">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
            <span className="flex items-center gap-3 font-display text-2xl font-bold text-foreground">
              <Logo size={34} colorAro="#7C5CFF" />
              <LetreroNeon texto={t("titulo")} color={NEON_NAIPIA} falla={3} />
            </span>
            <span className="text-lg font-semibold text-texto-secundario">{tm("titulo")}</span>
          </div>
        </header>

        <main className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-6 py-6 lg:grid-cols-[1.25fr_1fr]">
          <div className="flex flex-col gap-5">
            <p className="text-2xl font-semibold text-[#F4B4B4]">{tm(`paso.${e.paso}`)}</p>
            <Pano leyenda={t("pano")}>
              <div className="flex flex-col gap-20 py-3">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xl font-semibold text-[#F5EBCB]">
                    {t("crupier")}
                    {e.crupier.length > 0 && <span className="ml-3 rounded-full bg-black/35 px-3 py-0.5 font-mono text-lg">{frases.totalDe(e.crupier)}</span>}
                  </span>
                  <ManoCartas ancho={96} cartas={e.crupier.length === 1 ? [e.crupier[0], e.crupier[0]] : e.crupier} oculta={e.crupier.length === 1} />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xl font-semibold text-[#F5EBCB]">
                    {tm("jugador")}
                    {e.jugador.length > 0 && <span className="ml-3 rounded-full bg-black/35 px-3 py-0.5 font-mono text-lg">{frases.totalDe(e.jugador)}</span>}
                  </span>
                  <ManoCartas ancho={96} cartas={e.jugador} />
                </div>
              </div>
            </Pano>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
              {TECLAS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => aplicar((x) => agregarCarta(x, v))}
                  className="rounded-xl border border-border bg-surface py-4 font-mono text-3xl font-bold text-foreground hover:border-[#F25C5C]"
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => aplicar(jugadorPide)} disabled={e.paso !== "decide"} className="rounded-full bg-[#B91C1C] px-6 py-3 text-xl font-bold text-white disabled:opacity-40">
                {tm("jugadorPide")}
              </button>
              <button type="button" onClick={() => aplicar(jugadorPlanta)} disabled={e.paso !== "decide"} className="rounded-full border-2 border-[#E9D9A6] px-6 py-3 text-xl font-bold text-[#F5EBCB] disabled:opacity-40">
                {tm("jugadorPlanta")}
              </button>
              <button type="button" onClick={deshacer} className="rounded-full border border-border px-5 py-3 text-lg font-semibold text-foreground">
                {tm("deshacer")}
              </button>
              <button type="button" onClick={() => aplicar(nuevaMano)} className="rounded-full border border-border px-5 py-3 text-lg font-semibold text-foreground">
                {tm("nuevaMano")}
              </button>
            </div>
            <p className="text-sm text-texto-secundario">{tm("atajos")}</p>
          </div>

          <div className="flex flex-col gap-5">
            <section className="flex flex-col items-center gap-3 rounded-3xl border-2 border-[#F25C5C]/60 bg-surface p-6 text-center shadow-[0_0_30px_#F25C5C33]">
              <span className="text-xl font-semibold text-texto-secundario">{tm("dice")}</span>
              {decision ? (
                tapado ? (
                  <>
                    <span className="font-display text-4xl font-bold text-foreground">{tm("oculto")}</span>
                    <button type="button" onClick={() => setRevelado(true)} className="rounded-full bg-[#B91C1C] px-8 py-3 text-2xl font-bold text-white">
                      {tm("revelar")}
                    </button>
                  </>
                ) : (
                  <>
                    <span className="font-display text-6xl font-bold uppercase tracking-wide text-foreground sm:text-7xl">
                      {decision.accion === "pedir" ? t("pedir") : t("plantarse")}
                    </span>
                    <div className="grid w-full grid-cols-2 gap-3 font-mono text-2xl">
                      <div className={`rounded-2xl p-3 ${decision.accion === "plantarse" ? "bg-[#F25C5C]/15 text-foreground" : "text-texto-secundario"}`}>
                        <div className="font-sans text-base">{t("plantarse")}</div>
                        {conSigno(porCien(decision.qPlantarse))}
                      </div>
                      <div className={`rounded-2xl p-3 ${decision.accion === "pedir" ? "bg-[#F25C5C]/15 text-foreground" : "text-texto-secundario"}`}>
                        <div className="font-sans text-base">{t("pedir")}</div>
                        {conSigno(porCien(decision.qPedir))}
                      </div>
                    </div>
                    <span className="text-base text-texto-secundario">{tm("porCien")}</span>
                  </>
                )
              ) : res !== null ? (
                <span className="font-display text-5xl font-bold text-foreground">{tm(`resultado.${res > 0 ? "gana" : res < 0 ? "pierde" : "empata"}`)}</span>
              ) : (
                <span className="font-display text-5xl font-bold text-texto-secundario">—</span>
              )}
              {!decision && ultimaDecision && <p className="text-lg text-foreground">{frases.explicacion(ultimaDecision)}</p>}
              <label className="mt-2 flex items-center gap-3 text-lg text-texto-secundario">
                <input type="checkbox" checked={ocultar} onChange={(ev) => setOcultar(ev.target.checked)} className="h-5 w-5 accent-[#B91C1C]" />
                {tm("ocultar")}
              </label>
            </section>

            <section className="grid grid-cols-2 gap-4 rounded-3xl border border-border bg-surface p-6">
              <div className="flex flex-col">
                <span className="text-lg text-texto-secundario">{tm("corriente")}</span>
                <span className="font-mono text-6xl font-bold text-foreground">{conSigno(corriente)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg text-texto-secundario">{tm("verdadero")}</span>
                <span className="font-mono text-6xl font-bold text-foreground">{conSigno(Math.round(verdadero * 10) / 10)}</span>
              </div>
              <span className="col-span-2 text-base text-texto-secundario">{tm("cartasVistas", { n: e.vistas.length })}</span>
              <label className="flex items-center gap-3 text-lg text-foreground">
                {tm("barajas")}
                <select value={barajas} onChange={(ev) => setBarajas(Number(ev.target.value))} className="rounded-lg border border-border bg-background px-3 py-1.5 text-lg">
                  {BARAJAS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" onClick={() => aplicar(barajar)} className="rounded-full border border-border px-5 py-2 text-lg font-semibold text-foreground">
                {tm("barajar")}
              </button>
            </section>
          </div>
        </main>
      </div>
    </MotionConfig>
  );
}
