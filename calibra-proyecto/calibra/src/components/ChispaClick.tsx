"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { efectosHabilitados } from "@/lib/efectos";

interface Chispa {
  x: number;
  y: number;
  startTime: number;
  rotBase: number;
}

const DURATION_MS = 480;
const SIZE = 30;

// Fase M3: mismo sistema técnico que ClickSpark de react-bits (canvas +
// partículas por click), pero en vez de líneas radiales simétricas
// dibuja la chispa asimétrica del logo (Logo.tsx: una punta larga tipo
// cometa + una chica de contrapeso a 146°, degradé #A794FF→#FFC53D) —
// una sola chispa por click, no un estallido de copias en círculo.
function dibujarChispa(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, alpha: number, rot: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.scale(scale, scale);
  ctx.globalAlpha = alpha;

  const grad = ctx.createLinearGradient(-SIZE, SIZE, SIZE, -SIZE);
  grad.addColorStop(0, "#A794FF");
  grad.addColorStop(0.5, "#E4CBA0");
  grad.addColorStop(1, "#FFC53D");
  ctx.fillStyle = grad;

  // Punta larga tipo cometa (misma proporción que Logo.tsx, escalada).
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-8, -7.5, -4, -22.5, 0.4, -30);
  ctx.bezierCurveTo(3.3, -20, 5.8, -6.5, 0, 0);
  ctx.closePath();
  ctx.fill();

  // Punta chica de contrapeso, a 146° de la larga.
  ctx.save();
  ctx.rotate((146 * Math.PI) / 180);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(2.5, 3.7, 6.7, 5.4, 9.2, 4.2);
  ctx.bezierCurveTo(6.2, 1.7, 2.5, 0.4, 0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

export default function ChispaClick({ children }: { children: ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chispasRef = useRef<Chispa[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const resizeCanvas = () => {
      const { width, height } = parent.getBoundingClientRect();
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    };
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 100);
    };
    const ro = new ResizeObserver(handleResize);
    ro.observe(parent);
    resizeCanvas();

    return () => {
      ro.disconnect();
      clearTimeout(resizeTimeout);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const draw = (timestamp: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      chispasRef.current = chispasRef.current.filter((chispa) => {
        const elapsed = timestamp - chispa.startTime;
        if (elapsed >= DURATION_MS) return false;

        const progress = elapsed / DURATION_MS;
        const eased = progress * (2 - progress);
        const scale = 0.4 + eased * 0.9;
        const alpha = 1 - progress;

        dibujarChispa(ctx, chispa.x, chispa.y, scale, alpha, chispa.rotBase);
        return true;
      });

      animationId = requestAnimationFrame(draw);
    };
    animationId = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(animationId);
  }, []);

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!efectosHabilitados()) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    chispasRef.current.push({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      startTime: performance.now(),
      rotBase: Math.random() * 40 - 20,
    });
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col" onClick={handleClick}>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 block h-full w-full select-none"
      />
      {children}
    </div>
  );
}
