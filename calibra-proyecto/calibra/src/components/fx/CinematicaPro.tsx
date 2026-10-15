"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { reproducirNotaMusical, reproducirTono } from "@/lib/sonido";
import { anilloEn, CAMINO_CHISPA, CINE, COLORES_CINE as C, crearEstallidoCine, crearEstrellasCine, destelloEn, logoEn, ondaEn, rayosEn, recorrido, tablaRecorrido, tramo } from "@/lib/fx/cinematicaPro";

// Cinemática de Prodigia Pro en la web (2026-10-15), la misma línea de tiempo que la
// app (src/lib/fx/cinematicaPro.ts). Todo el movimiento se dibuja en un canvas en un
// solo bucle, como función del tiempo; los brillos se estampan desde sprites
// dibujados una vez. El título es texto real (nítido) que entra a su hora.

const TAM_SPRITE = 96;

function sprite(color: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = TAM_SPRITE;
  c.height = TAM_SPRITE;
  const g = c.getContext("2d")!;
  const r = TAM_SPRITE / 2;
  const grad = g.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.15, `${color}F0`);
  grad.addColorStop(0.45, `${color}50`);
  grad.addColorStop(1, `${color}00`);
  g.fillStyle = grad;
  g.fillRect(0, 0, TAM_SPRITE, TAM_SPRITE);
  return c;
}

export default function CinematicaPro({ onTerminar, subtitulo }: { onTerminar: () => void; subtitulo?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const terminar = useRef(onTerminar);
  useEffect(() => {
    terminar.current = onTerminar;
  }, [onTerminar]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const estrellas = crearEstrellasCine(window.innerWidth < 640 ? 120 : 190);
    const tabla = tablaRecorrido();
    const estallido = crearEstallidoCine();
    const sprites: Record<string, HTMLCanvasElement> = { [C.oro]: sprite(C.oro), [C.cian]: sprite(C.cian), [C.violetaClaro]: sprite(C.violetaClaro), [C.violeta]: sprite(C.violeta), "#FFFFFF": sprite("#FFFFFF") };
    const chispa = new Path2D(CAMINO_CHISPA);
    const relleno = ctx.createLinearGradient(0, 0, 24, 24);
    relleno.addColorStop(0, C.violetaClaro);
    relleno.addColorStop(0.5, C.arena);
    relleno.addColorStop(1, C.oro);
    let rayos: CanvasGradient | null = null;
    let largoRayos = 0;
    let vivo = true;
    let terminado = false;
    const inicio = performance.now();

    const ajustar = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rayos = null;
    };
    ajustar();
    window.addEventListener("resize", ajustar);

    // Sonido: una nota por anillo y el golpe del estallido.
    const timers = [0, 1, 2].map((i) => setTimeout(() => reproducirNotaMusical([523.25, 659.25, 783.99][i]), (CINE.cargaDesde + i * 0.38) * 1000));
    timers.push(setTimeout(() => reproducirTono("nivel_cuenta"), CINE.estallido * 1000));

    const cuadro = (ahora: number) => {
      if (!vivo) return;
      const t = (ahora - inicio) / 1000;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const cx = w / 2;
      const cy = h * 0.46;
      const m = Math.min(w, h);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.fillStyle = C.fondo;
      ctx.fillRect(0, 0, w, h);

      // Hiperespacio.
      const D = recorrido(tabla, t);
      const R = Math.max(w, h) * 0.2;
      const largo = 0.015 + 0.03 * Math.min(3, Math.max(0, (recorrido(tabla, t + 0.02) - D) / 0.02));
      ctx.lineCap = "round";
      for (const e of estrellas) {
        let z = (e.z - D * 0.32) % 1;
        if (z <= 0) z += 1;
        const d = 0.04 + z * 0.96;
        const d2 = Math.min(1, d + largo);
        const x1 = cx + (e.x / d) * R;
        const y1 = cy + (e.y / d) * R;
        const x2 = cx + (e.x / d2) * R;
        const y2 = cy + (e.y / d2) * R;
        const cerca = 1 - d;
        ctx.globalAlpha = Math.min(1, 0.15 + cerca * cerca * 1.1) * Math.min(1, t * 2);
        ctx.strokeStyle = e.tono < 0.12 ? C.cian : e.tono < 0.24 ? C.violetaClaro : "#FFFFFF";
        ctx.lineWidth = 0.6 + cerca * 2.2;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      }

      ctx.globalCompositeOperation = "lighter";
      // Rayos detrás del título.
      const op = rayosEn(t);
      if (op > 0.01) {
        const lr = Math.max(w, h) * 0.75;
        if (!rayos || largoRayos !== lr) {
          rayos = ctx.createRadialGradient(0, 0, 0, 0, 0, lr);
          rayos.addColorStop(0, `${C.oro}70`);
          rayos.addColorStop(0.35, `${C.violeta}26`);
          rayos.addColorStop(1, `${C.violeta}00`);
          largoRayos = lr;
        }
        const L = logoEn(t);
        ctx.save();
        ctx.translate(cx + L.x * m, cy + L.y * m);
        ctx.rotate(t * 0.25);
        ctx.globalAlpha = op;
        ctx.fillStyle = rayos;
        ctx.beginPath();
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2;
          const ancho = i % 2 ? 0.05 : 0.11;
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a - ancho) * lr, Math.sin(a - ancho) * lr);
          ctx.lineTo(Math.cos(a + ancho) * lr, Math.sin(a + ancho) * lr);
          ctx.closePath();
        }
        ctx.fill();
        ctx.restore();
      }

      // Logo con su brillo.
      const L = logoEn(t);
      const lx = cx + L.x * m;
      const ly = cy + L.y * m;
      const tam = m * 0.3 * L.escala;
      if (L.opacidad > 0.01) {
        const rg = tam * (1.1 + L.brillo * 0.9);
        ctx.globalAlpha = L.opacidad * Math.min(1, 0.35 + L.brillo * 0.5);
        ctx.drawImage(sprites[C.violeta], lx - rg, ly - rg, rg * 2, rg * 2);
        ctx.globalAlpha = L.opacidad * Math.min(1, L.brillo * 0.55);
        ctx.drawImage(sprites[C.oro], lx - rg * 0.7, ly - rg * 0.7, rg * 1.4, rg * 1.4);
      }

      // Anillos de energía.
      for (let i = 0; i < 3; i++) {
        const a = anilloEn(t, i);
        if (a.opacidad <= 0) continue;
        const col = [C.oro, C.cian, C.violetaClaro][i];
        const r = m * 0.6 * a.radio + tam * 0.35;
        ctx.strokeStyle = col;
        ctx.globalAlpha = a.opacidad * 0.22;
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.arc(lx, ly, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = a.opacidad;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // Chispas que entran en espiral durante la carga.
      for (let k = 0; k < 40; k++) {
        const desde = CINE.cargaDesde + (k / 40) * 1.1;
        const p = tramo(t, desde, desde + 0.55);
        if (p <= 0 || p >= 1) continue;
        const rr = m * 0.5 * Math.pow(1 - p, 1.4);
        const ang = k * 2.39996 + p * 4.5;
        const sx = lx + Math.cos(ang) * rr;
        const sy = ly + Math.sin(ang) * rr;
        const col = [C.oro, C.cian, C.violetaClaro][k % 3];
        const s = 10 + (1 - p) * 8;
        ctx.globalAlpha = Math.sin(p * Math.PI);
        ctx.drawImage(sprites[col], sx - s, sy - s, s * 2, s * 2);
      }

      // Estallido: partículas y onda.
      const tb = t - CINE.estallido;
      if (tb > 0) {
        for (const p of estallido) {
          if (tb > p.vida) continue;
          const dist = (p.v * (1 - Math.exp(-2.4 * tb))) / 2.4;
          const px = lx + Math.cos(p.a) * dist;
          const py = ly + Math.sin(p.a) * dist + 60 * tb * tb;
          const alfa = 1 - tb / p.vida;
          const s = p.tam * 4;
          ctx.globalAlpha = alfa;
          ctx.drawImage(sprites[p.color], px - s, py - s, s * 2, s * 2);
        }
        const o = ondaEn(t);
        if (o > 0 && o < 1) {
          const r = m * 0.08 + o * Math.max(w, h) * 0.75;
          ctx.strokeStyle = "#FFFFFF";
          ctx.globalAlpha = (1 - o) * 0.25;
          ctx.lineWidth = 30 * (1 - o) + 4;
          ctx.beginPath();
          ctx.arc(lx, ly, r, 0, Math.PI * 2);
          ctx.stroke();
          ctx.strokeStyle = C.oro;
          ctx.globalAlpha = 1 - o;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // El logo encima de todo.
      if (L.opacidad > 0.01) {
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = L.opacidad;
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(L.giro);
        ctx.scale(tam / 24, tam / 24);
        ctx.translate(-12, -12);
        ctx.fillStyle = relleno;
        ctx.fill(chispa);
        // Filo de luz: el logo no se pierde dentro de su propio brillo.
        ctx.strokeStyle = "rgba(255,255,255,0.7)";
        ctx.lineWidth = 0.45;
        ctx.stroke(chispa);
        ctx.restore();
      }

      // Destello.
      const f = destelloEn(t);
      if (f > 0.01) {
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = f * 0.92;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, w, h);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      if (t >= CINE.fin + 0.6 && !terminado) {
        terminado = true;
        terminar.current();
      }
      requestAnimationFrame(cuadro);
    };
    requestAnimationFrame(cuadro);
    return () => {
      vivo = false;
      timers.forEach(clearTimeout);
      window.removeEventListener("resize", ajustar);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[120] cursor-pointer select-none" onClick={() => terminar.current()} role="presentation">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-[58%] flex flex-col items-center gap-3 px-4 text-center">
        <motion.p
          className="font-display text-5xl font-black tracking-[0.18em] text-white sm:text-7xl"
          initial={{ opacity: 0, y: 24, letterSpacing: "0.5em", filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, letterSpacing: "0.18em", filter: "blur(0px)" }}
          transition={{ delay: CINE.tituloDesde, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ textShadow: `0 0 30px ${C.violeta}` }}
        >
          PRODIGIA
        </motion.p>
        <motion.span
          className="rounded-2xl border-2 border-[#05060F] px-6 py-1.5 font-display text-3xl font-black tracking-[0.3em] text-[#1A1206] shadow-[4px_4px_0_0_#05060F] sm:text-4xl"
          style={{ backgroundImage: `linear-gradient(110deg, ${C.oro} 0%, ${C.oro} 40%, #FFF6D8 50%, ${C.oro} 60%, ${C.oro} 100%)`, backgroundSize: "250% 100%" }}
          initial={{ opacity: 0, scale: 0.4, backgroundPosition: "100% 0%" }}
          animate={{ opacity: 1, scale: 1, backgroundPosition: ["100% 0%", "100% 0%", "-50% 0%"] }}
          transition={{ opacity: { delay: CINE.tituloDesde + 0.35, duration: 0.2 }, scale: { delay: CINE.tituloDesde + 0.35, type: "spring", damping: 10, stiffness: 180 }, backgroundPosition: { delay: CINE.tituloDesde + 0.35, duration: CINE.brilloTitulo - CINE.tituloDesde + 0.6, times: [0, 0.6, 1] } }}
        >
          PRO
        </motion.span>
        {subtitulo && (
          <motion.p className="mt-2 text-sm text-white/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: CINE.brilloTitulo, duration: 0.5 }}>
            {subtitulo}
          </motion.p>
        )}
      </div>
    </div>
  );
}
