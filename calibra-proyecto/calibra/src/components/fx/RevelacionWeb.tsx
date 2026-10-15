"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { reproducirNotaMusical, reproducirTono } from "@/lib/sonido";
import { COLOR_RAREZA } from "@/lib/recompensas/catalogo";
import { DibujoCapsula } from "@/components/recompensas/DibujoCapsula";
import { crearLienzoFx, type LienzoFx } from "./lienzoFx";

// Apertura de una cápsula en la web, la misma escena que la app (mobile/src/ui/fx/
// Revelacion.tsx) — pedido 2026-10-14: «la animación de abrir cápsula no la veo en la
// web». 1) cae y rebota levantando polvo; 2) flota latiendo con rayos tenues; 3) al
// tocarla tiembla cada vez más y se escapa luz del color del premio (cuanto más raro,
// más dura el suspenso); 4) estalla: destello, onda, partículas, las mitades salen
// volando y el premio aparece con rayos girando (los legendarios, con lluvia de
// confeti y doble destello).
//
// 2026-10-15 («se traba un poco»; como Clash Royale / Brawl Stars): el premio se pide
// apenas aparece la cápsula, así al tocarla no hay espera de red; la rareza SUBE por
// colores escalón por escalón con una nota más aguda cada vez; el premio entra girando
// como una carta, y los efectos estampan brillos ya dibujados (lienzoFx).

export interface PremioRevelado {
  color: string;
  nivel: 1 | 2 | 3 | 4;
  contenido: ReactNode;
}

type Fase = "cae" | "espera" | "carga" | "premio" | "error";

// Escalones de rareza que se recorren antes de llegar al color del premio.
const ESCALERA = [COLOR_RAREZA.comun, COLOR_RAREZA.raro, COLOR_RAREZA.epico, COLOR_RAREZA.legendario];
const NOTAS = [523.25, 659.25, 783.99, 1046.5];
const PASO_MS = 420;

export default function RevelacionWeb({
  colores,
  etiqueta,
  titulo,
  textoTocar,
  textoBoton,
  textoError,
  abrir,
  onCerrar,
}: {
  colores: [string, string];
  etiqueta?: string;
  titulo: string;
  textoTocar: string;
  textoBoton: string;
  textoError: string;
  abrir: () => Promise<PremioRevelado>;
  onCerrar: () => void;
}) {
  const reducir = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fxRef = useRef<LienzoFx | null>(null);
  const capsulaRef = useRef<HTMLDivElement>(null);
  const controles = useAnimationControls();
  const [fase, setFase] = useState<Fase>("cae");
  const [abierta, setAbierta] = useState(false);
  const [premio, setPremio] = useState<PremioRevelado | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [colorGlow, setColorGlow] = useState(colores[1]);
  // El premio se pide al aparecer la cápsula: al tocarla ya está.
  const [pedido] = useState(() => abrir());

  const centro = () => {
    const r = capsulaRef.current?.getBoundingClientRect();
    return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2, piso: r.bottom } : { x: window.innerWidth / 2, y: window.innerHeight * 0.42, piso: window.innerHeight * 0.55 };
  };

  useEffect(() => {
    const lista = timers.current;
    if (canvasRef.current) fxRef.current = crearLienzoFx(canvasRef.current);
    // 1) Cae y rebota.
    controles.set({ y: -window.innerHeight * 0.8, rotate: -14 });
    controles.start({ y: 0, rotate: 0, transition: { type: "spring", damping: 11, stiffness: 140, mass: 1.1 } }).then(() => {
      const c = centro();
      fxRef.current?.polvo(c.x, c.piso);
      fxRef.current?.onda(c.x, c.piso, "#C9CEE6", 260, 2);
      fxRef.current?.rayos(`${colores[1]}`.slice(0, 7), c.x, c.y);
      fxRef.current?.halo(colores[0].slice(0, 7), c.x, c.y, 150);
      setFase("espera");
    });
    return () => {
      lista.forEach(clearTimeout);
      fxRef.current?.detener();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function tocar() {
    if (fase !== "espera") return;
    setFase("carga");
    reproducirTono("cuenta");
    fxRef.current?.rayos(null);
    let r: PremioRevelado;
    try {
      r = await pedido;
    } catch {
      setFase("error");
      return;
    }
    const nivel = r.nivel;
    const escalones = [...ESCALERA.slice(0, nivel - 1), r.color];
    const dur = reducir ? 0 : 250 + escalones.length * PASO_MS;
    // 3) Suspenso: tiembla cada vez más y se escapa luz del color del premio.
    const amp = 3 + nivel * 3;
    controles.start({ x: [0, -amp, amp, -amp, amp, 0], rotate: [0, -2, 2, -2, 2, 0], transition: { duration: 0.22, repeat: Infinity } });
    // La luz que se escapa es neutra; el color lo pone cada escalón.
    const fuga = setInterval(() => {
      const c = centro();
      fxRef.current?.fuga(c.x, c.y, "#FFFFFF", 2 + nivel);
    }, 60);
    if (!reducir) {
      escalones.forEach((col, k) => {
        timers.current.push(
          setTimeout(() => {
            const c = centro();
            setColorGlow(col);
            fxRef.current?.halo(col, c.x, c.y, 150 + k * 25);
            fxRef.current?.pulso(1);
            fxRef.current?.onda(c.x, c.y, col, 380, 2);
            reproducirNotaMusical(NOTAS[Math.min(NOTAS.length - 1, k)]);
          }, 250 + k * PASO_MS)
        );
      });
    }
    timers.current.push(
      setTimeout(() => {
        clearInterval(fuga);
        controles.stop();
        controles.set({ x: 0, rotate: 0 });
        // 4) Estalla.
        const c = centro();
        fxRef.current?.destello(nivel >= 3 ? 0.9 : 0.6);
        fxRef.current?.onda(c.x, c.y, r.color, 600 + nivel * 120, 3 + nivel);
        fxRef.current?.explosion(c.x, c.y, [r.color, colores[0], colores[1], "#FFFFFF"], nivel);
        fxRef.current?.halo(r.color, c.x, c.y, 160 + nivel * 30);
        fxRef.current?.rayos(r.color, c.x, c.y);
        if (nivel === 4) {
          fxRef.current?.lluvia([r.color, "#FFFFFF", colores[0], colores[1]], 120);
          timers.current.push(setTimeout(() => fxRef.current?.destello(0.7), 260));
        }
        reproducirTono("nivel_cuenta");
        setAbierta(true);
        setPremio(r);
        timers.current.push(setTimeout(() => setFase("premio"), 380));
      }, dur)
    );
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-[#05070D]/95" role="dialog" aria-modal="true" aria-label={titulo}>
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />
      <div className="relative flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
        {fase !== "premio" && (
          <div>
            {etiqueta && (
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: colores[1] }}>
                {etiqueta}
              </p>
            )}
            <p className="font-display text-2xl font-bold text-white">{fase === "error" ? textoError : fase === "espera" ? textoTocar : titulo}</p>
          </div>
        )}

        {fase !== "premio" && (
          <motion.div ref={capsulaRef} animate={controles} className="relative">
            <motion.button
              type="button"
              onClick={tocar}
              disabled={fase !== "espera"}
              aria-label={textoTocar}
              className="cursor-pointer rounded-full outline-none focus-visible:ring-4 focus-visible:ring-white/40"
              animate={fase === "espera" ? { y: [0, -8, 0], scale: [1, 1.04, 1] } : { y: 0, scale: 1 }}
              transition={{ duration: 1.6, repeat: fase === "espera" ? Infinity : 0, ease: "easeInOut" }}
            >
              <span className="relative block" style={{ filter: fase === "carga" ? `drop-shadow(0 0 22px ${colorGlow})` : undefined, transition: "filter 160ms ease-out" }}>
                <DibujoCapsula colores={colores} abierta={abierta} tam={130} />
              </span>
            </motion.button>
          </motion.div>
        )}

        {fase === "premio" && premio && (
          <motion.div
            initial={{ scale: 0.55, opacity: 0, rotateY: 100 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            transition={{ type: "spring", damping: 13, stiffness: 120 }}
            style={{ transformPerspective: 900 }}
            className="flex flex-col items-center gap-5"
          >
            {premio.contenido}
            <button type="button" onClick={onCerrar} className="w-64 max-w-full rounded-full bg-logro px-6 py-3 font-display font-bold text-[#2A1A00]">
              {textoBoton}
            </button>
          </motion.div>
        )}

        {fase === "error" && (
          <button type="button" onClick={onCerrar} className="rounded-full border border-white/30 px-6 py-3 font-display font-bold text-white">
            {textoBoton}
          </button>
        )}
      </div>
    </div>
  );
}
