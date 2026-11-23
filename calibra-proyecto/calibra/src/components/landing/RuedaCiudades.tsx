"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, animate, motion, useMotionValue, useTransform, type AnimationPlaybackControls } from "framer-motion";
import { MUNDOS_LANDING } from "@/lib/mundos";
import { NEON_MUNDO, anguloDesdeCentro, deltaAngulo, destinoConInercia, giroParaIndice, indiceArriba, paso } from "@/lib/landing/rueda";

const N = MUNDOS_LANDING.length;
const RESORTE = { type: "spring", stiffness: 140, damping: 20, mass: 0.9 } as const;
// Giro solo: grados por milisegundo (una ciudad cada 4 s) y la pausa tras tocarla.
const VELOCIDAD_SOLA = 0.006;
const PAUSA_TRAS_TOCAR = 5000;

// La rueda de las 15 ciudades (2026-11-23: «me gustó la ruedita, ¿puede ser
// interactiva?»). Se gira con el dedo o el mouse, con inercia, y frena justo en una
// ciudad; tocar una ciudad la trae arriba; las flechas del teclado también. La ciudad
// de arriba se enciende en su neón y el centro dice qué se estudia ahí. Mientras nadie
// la toca gira sola, despacio y sin parar (2026-11-23: «que gire solita, y que aparezca
// algo que diga que uno la puede girar»): hasta el primer toque se ve el aviso «¡Gírala!»
// y, después de soltarla, vuelve a girar sola a los pocos segundos.
export default function RuedaCiudades() {
  const tHome = useTranslations("Home");
  const t = useTranslations("Presentacion.rueda");
  const giro = useMotionValue(0);
  const contraGiro = useTransform(giro, (g) => -g);
  const [elegida, setElegida] = useState(0);
  const [tocada, setTocada] = useState(false);
  const quietaHasta = useRef(0);
  const animando = useRef(false);
  const caja = useRef<HTMLDivElement>(null);
  const animacion = useRef<AnimationPlaybackControls | null>(null);
  const gesto = useRef<{ angulo: number; t: number; vel: number; recorrido: number; id: number } | null>(null);

  useEffect(() => giro.on("change", (g) => setElegida(indiceArriba(g, N))), [giro]);

  function irA(destino: number) {
    animacion.current?.stop();
    animando.current = true;
    quietaHasta.current = performance.now() + PAUSA_TRAS_TOCAR;
    animacion.current = animate(giro, destino, {
      ...RESORTE,
      onComplete: () => {
        animando.current = false;
        quietaHasta.current = performance.now() + PAUSA_TRAS_TOCAR;
      },
    });
  }

  // Giro continuo mientras nadie la toca.
  useEffect(() => {
    let id = 0;
    let antes = performance.now();
    const cuadro = (ahora: number) => {
      const dt = Math.min(64, ahora - antes);
      antes = ahora;
      if (!gesto.current && !animando.current && ahora > quietaHasta.current) giro.set(giro.get() - dt * VELOCIDAD_SOLA);
      id = requestAnimationFrame(cuadro);
    };
    id = requestAnimationFrame(cuadro);
    return () => cancelAnimationFrame(id);
  }, [giro]);

  function centro() {
    const r = caja.current!.getBoundingClientRect();
    return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
  }

  function alBajar(e: React.PointerEvent) {
    setTocada(true);
    animacion.current?.stop();
    animando.current = false;
    const { cx, cy } = centro();
    gesto.current = { angulo: anguloDesdeCentro(e.clientX, e.clientY, cx, cy), t: performance.now(), vel: 0, recorrido: 0, id: e.pointerId };
  }

  function alMover(e: React.PointerEvent) {
    const g = gesto.current;
    if (!g || g.id !== e.pointerId) return;
    const { cx, cy } = centro();
    const angulo = anguloDesdeCentro(e.clientX, e.clientY, cx, cy);
    const d = deltaAngulo(g.angulo, angulo);
    const ahora = performance.now();
    const dt = Math.max(1, ahora - g.t);
    g.recorrido += Math.abs(d);
    if (g.recorrido > 4) (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    g.vel = 0.7 * g.vel + 0.3 * (d / dt);
    g.angulo = angulo;
    g.t = ahora;
    giro.set(giro.get() + d);
  }

  function alSoltar(e: React.PointerEvent) {
    const g = gesto.current;
    gesto.current = null;
    if (!g) return;
    if (g.recorrido < 4) {
      const indice = Number((e.target as HTMLElement).closest("[data-indice]")?.getAttribute("data-indice"));
      irA(Number.isFinite(indice) ? giroParaIndice(giro.get(), indice, N) : destinoConInercia(giro.get(), 0, N));
      return;
    }
    const quieto = performance.now() - g.t > 90;
    irA(destinoConInercia(giro.get(), quieto ? 0 : g.vel, N));
  }

  function alTeclado(e: React.KeyboardEvent) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    setTocada(true);
    const sig = (elegida + (e.key === "ArrowRight" ? 1 : N - 1)) % N;
    irA(giroParaIndice(giro.get(), sig, N));
  }

  const m = MUNDOS_LANDING[elegida];
  const { neon, glifo } = NEON_MUNDO[m.slug];

  return (
    <div className="relative mx-auto w-full max-w-[480px] select-none">
      <div
        ref={caja}
        role="listbox"
        tabIndex={0}
        aria-label={t("etiqueta")}
        aria-activedescendant={`rueda-${m.slug}`}
        onKeyDown={alTeclado}
        onPointerDown={alBajar}
        onPointerMove={alMover}
        onPointerUp={alSoltar}
        onPointerCancel={() => (gesto.current = null)}
        className="relative aspect-square w-full cursor-grab touch-pan-y outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-primario/60 rounded-full"
      >
        <div className="absolute inset-[7%] rounded-full border border-[#1E2542]" />
        <div className="absolute inset-[23%] rounded-full border border-dashed border-[#1E2542]" />
        <AnimatePresence>
          {!tocada && (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute -right-1 -top-3 z-20 flex flex-col items-center sm:-right-6"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: 1.2, duration: 0.4 }}
            >
              <span className="neon neon-letra-falla font-display text-xl font-bold sm:text-2xl" style={{ ["--n" as string]: "#F2C14E" } as CSSProperties}>
                {t("girala")}
              </span>
              <motion.svg
                viewBox="0 0 60 44"
                className="h-10 w-14"
                animate={{ rotate: [-14, 10, -14] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                style={{ filter: "drop-shadow(0 0 2px #F2C14E) drop-shadow(0 0 7px #F2C14E)" }}
              >
                <path d="M50 6 C 40 30, 20 36, 8 30" fill="none" stroke="#FFF3D2" strokeWidth="3" strokeLinecap="round" />
                <path d="M8 30 L 17 25 M8 30 L 13 39" fill="none" stroke="#FFF3D2" strokeWidth="3" strokeLinecap="round" />
              </motion.svg>
            </motion.div>
          )}
        </AnimatePresence>
        <span aria-hidden="true" className="absolute left-1/2 top-[1%] z-10 h-0 w-0 -translate-x-1/2 border-x-[7px] border-t-[10px] border-x-transparent border-t-white/90" />

        <motion.div className="absolute inset-0" style={{ rotate: giro }}>
          {MUNDOS_LANDING.map((c, i) => {
            const ang = ((i * paso(N) - 90) * Math.PI) / 180;
            const activa = i === elegida;
            const cn = NEON_MUNDO[c.slug].neon;
            return (
              <span
                key={c.slug}
                className="absolute h-[13%] w-[13%] -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${50 + Math.cos(ang) * 43}%`, top: `${50 + Math.sin(ang) * 43}%`, ["--n" as string]: cn } as CSSProperties}
              >
                <motion.button
                  type="button"
                  id={`rueda-${c.slug}`}
                  role="option"
                  aria-selected={activa}
                  aria-label={c.nombre}
                  data-indice={i}
                  tabIndex={-1}
                  style={{ rotate: contraGiro }}
                  className={`flex h-full w-full items-center justify-center rounded-2xl transition-[background,box-shadow,color,opacity] duration-200 ${
                    activa ? "tubo-neon rueda-activa bg-[#0D1126]" : "border border-[#232B47] bg-[#10152A] opacity-60 hover:opacity-100"
                  }`}
                >
                  <c.Icono className={`h-[46%] w-[46%] ${activa ? "" : "text-[#8892B0]"}`} />
                </motion.button>
              </span>
            );
          })}
        </motion.div>

        <div className="pointer-events-none absolute inset-[25%] flex flex-col items-center justify-center text-center">
          <span key={m.slug} className="neon neon-letra font-display text-5xl font-bold leading-none sm:text-6xl" style={{ ["--n" as string]: neon } as CSSProperties}>
            {glifo}
          </span>
          <p className="mt-3 font-display text-xl font-bold text-white sm:text-2xl">{m.nombre}</p>
          <p className="mt-1 line-clamp-3 max-w-[15rem] text-xs leading-snug text-[#8892B0] sm:text-sm">{tHome(`mundos.${m.slug}`)}</p>
        </div>
      </div>
      <p className="mt-2 text-center font-mono text-[11px] text-[#5A6488]">{t("pista")}</p>
    </div>
  );
}
