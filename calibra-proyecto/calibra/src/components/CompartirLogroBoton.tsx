"use client";

import { useState } from "react";

interface Props {
  nombre: string;
  descripcion: string;
  displayName: string | null;
}

const ANCHO = 1200;
const ALTO = 630;

function cssVar(nombre: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const valor = getComputedStyle(document.documentElement).getPropertyValue(nombre).trim();
  return valor || fallback;
}

function dibujarTarjeta(canvas: HTMLCanvasElement, nombre: string, descripcion: string, displayName: string | null) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const fondo = cssVar("--background", "#FAF8F3");
  const superficie = cssVar("--surface", "#FFFFFF");
  const primario = cssVar("--primario", "#6C4CF1");
  const foreground = cssVar("--foreground", "#1A1523");
  const secundario = cssVar("--texto-secundario", "#6B7280");

  ctx.fillStyle = fondo;
  ctx.fillRect(0, 0, ANCHO, ALTO);

  // Tarjeta central con degradé — mismo tratamiento hexagonal-dorado
  // que LogroMedalla.tsx, pero a escala de imagen para compartir.
  ctx.fillStyle = superficie;
  const radio = 32;
  ctx.beginPath();
  ctx.roundRect(60, 60, ANCHO - 120, ALTO - 120, radio);
  ctx.fill();

  // Medalla (círculo con degradé dorado, mismo espíritu que el clip-path hexagonal).
  const cx = ANCHO / 2;
  const medallaY = 190;
  const medallaR = 90;
  const grad = ctx.createLinearGradient(cx - medallaR, medallaY - medallaR, cx + medallaR, medallaY + medallaR);
  grad.addColorStop(0, "#FFE39A");
  grad.addColorStop(0.6, cssVar("--logro", "#F5A623"));
  grad.addColorStop(1, "#C98F1A");
  ctx.beginPath();
  ctx.arc(cx, medallaY, medallaR, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.font = "84px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🏅", cx, medallaY + 6);

  ctx.fillStyle = foreground;
  ctx.font = "bold 52px sans-serif";
  ctx.fillText(nombre, cx, 340);

  ctx.fillStyle = secundario;
  ctx.font = "28px sans-serif";
  // envuelve la descripción en hasta 2 líneas si no entra en una.
  const palabras = descripcion.split(" ");
  let linea = "";
  const lineas: string[] = [];
  for (const palabra of palabras) {
    const prueba = linea ? `${linea} ${palabra}` : palabra;
    if (ctx.measureText(prueba).width > ANCHO - 240 && linea) {
      lineas.push(linea);
      linea = palabra;
    } else {
      linea = prueba;
    }
  }
  if (linea) lineas.push(linea);
  lineas.slice(0, 2).forEach((l, i) => ctx.fillText(l, cx, 390 + i * 38));

  // Pie: marca + nombre de usuario.
  ctx.fillStyle = primario;
  ctx.font = "bold 32px sans-serif";
  ctx.fillText("Prodigia", cx, ALTO - 130);

  if (displayName) {
    ctx.fillStyle = secundario;
    ctx.font = "24px sans-serif";
    ctx.fillText(`Logro de ${displayName}`, cx, ALTO - 90);
  }
}

// Sección 10.3: genera la imagen enteramente en el cliente (canvas),
// sin backend — no hace falta un endpoint nuevo ni renderizar nada
// server-side para esto. Solo se ofrece para logros ya desbloqueados
// (no tendría sentido "compartir" uno bloqueado).
export default function CompartirLogroBoton({ nombre, descripcion, displayName }: Props) {
  const [generando, setGenerando] = useState(false);

  async function compartir() {
    setGenerando(true);
    const canvas = document.createElement("canvas");
    canvas.width = ANCHO;
    canvas.height = ALTO;
    dibujarTarjeta(canvas, nombre, descripcion, displayName);

    canvas.toBlob((blob) => {
      setGenerando(false);
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `prodigia-logro-${nombre.toLowerCase().replace(/\s+/g, "-")}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  return (
    <button
      onClick={compartir}
      disabled={generando}
      className="mt-1 text-[10px] font-medium text-primario hover:underline disabled:opacity-60"
    >
      {generando ? "Generando…" : "Compartir"}
    </button>
  );
}
