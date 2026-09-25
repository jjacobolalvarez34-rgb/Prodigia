"use client";

import type { ReactNode, RefCallback } from "react";
import { useLocale } from "next-intl";
import MathText from "@/components/MathText";
import { COLOR_CALCULIA } from "@/app/[locale]/calculia/colores";
import type { TerminoFuncionCalculia } from "@/lib/calculia/visuales";

export { COLOR_CALCULIA };

// Colores de los visuales: curva en el índigo del mundo, secante/apoyo en
// ámbar (mismo rol que COLOR_ALERTA en otros mundos: "esto es un paso
// intermedio, no el resultado final"), área/resultado en verde de acierto.
export const COLOR_CURVA = COLOR_CALCULIA;
export const COLOR_SECANTE = "#F59E0B";
export const COLOR_TANGENTE_FINAL = "#DC2626";
export const COLOR_AREA = "#16A34A";

// Separador decimal del idioma ("2,5" / "2.5"), mismo patrón que
// src/lib/trigonometria/formato.ts.
export function useNumeroCalculia() {
  const locale = useLocale();
  return (n: number, decimales = 2) => {
    const texto = Math.abs(n).toLocaleString(locale, { maximumFractionDigits: decimales });
    return n < 0 ? `−${texto}` : texto;
  };
}

// Marco común: figura accesible con título opcional, contenido visual
// oculto a lectores de pantalla (aria-hidden) y una alternativa textual
// equivalente en <figcaption> sr-only. Mismo patrón que
// src/components/trigonometria/visuales/comun.tsx.
export function MarcoVisual({
  refCont,
  etiqueta,
  titulo,
  alternativa,
  children,
  controles,
}: {
  refCont: RefCallback<HTMLElement>;
  etiqueta: string;
  titulo?: string;
  alternativa: ReactNode;
  children: ReactNode;
  controles?: ReactNode;
}) {
  return (
    <figure
      ref={refCont}
      role="group"
      aria-label={etiqueta}
      className="flex w-full flex-col gap-3 overflow-x-hidden rounded-2xl border border-border bg-surface p-3 text-foreground"
      style={{ borderTopColor: COLOR_CALCULIA, borderTopWidth: 3 }}
    >
      {titulo && (
        <p className="text-center text-sm font-semibold text-foreground">
          <MathText texto={titulo} />
        </p>
      )}
      <div aria-hidden="true" className="flex min-w-0 flex-col items-stretch gap-3">
        {children}
      </div>
      <figcaption className="sr-only">{alternativa}</figcaption>
      {controles}
    </figure>
  );
}

// Tarjeta con el texto del paso actual (admite $...$).
export function Leyenda({ children, acento = COLOR_CALCULIA }: { children: ReactNode; acento?: string }) {
  return (
    <div
      className="min-h-[3.25rem] rounded-xl border px-3 py-2 text-[13px] leading-snug text-foreground"
      style={{ borderColor: acento, background: `color-mix(in oklab, ${acento} 9%, var(--surface))` }}
    >
      {children}
    </div>
  );
}

// Fórmula centrada y grande (LaTeX SIN los $).
export function Formula({ tex, tamano = "text-base" }: { tex: string; tamano?: string }) {
  return (
    <div className={`overflow-x-auto py-0.5 text-center ${tamano} text-foreground`}>
      <MathText texto={`$${tex.replace(/\$/g, "")}$`} />
    </div>
  );
}

export const transicion = (reducir: boolean, propiedad: string, ms = 450, retardo = 0): string =>
  reducir ? "none" : `${propiedad} ${ms}ms ease-in-out ${retardo}ms`;

// ---------- Escala de ejes cartesianos, compartida por Tangente y Área ----------

export const VISTA_CALCULIA = { ancho: 320, alto: 210, izq: 30, der: 12, arriba: 12, abajo: 24 } as const;

export interface EscalaCalculia {
  px: (x: number) => number;
  py: (y: number) => number;
  ejeXpx: number;
  ejeYpx: number;
}

export function redondear1(n: number): number {
  return Math.round(n * 10) / 10;
}

// Construye la escala (dominio x -> pixeles, dominio y -> pixeles) a partir
// del rango x a dibujar y los valores y de la curva (con margen). Los
// resultados se redondean a 1 decimal: coordenadas de un SVG, no hace falta
// más precisión y evita strings de píxeles ilegibles.
export function escalaCalculia(rangoX: [number, number], valoresY: number[]): EscalaCalculia {
  const { ancho, alto, izq, der, arriba, abajo } = VISTA_CALCULIA;
  const [xMin, xMax] = rangoX;
  let yMin = Math.min(0, ...valoresY);
  let yMax = Math.max(0, ...valoresY);
  if (yMax - yMin < 1e-6) {
    yMin -= 1;
    yMax += 1;
  }
  const margenY = (yMax - yMin) * 0.12;
  yMin -= margenY;
  yMax += margenY;

  const anchoUtil = ancho - izq - der;
  const altoUtil = alto - arriba - abajo;
  const px = (x: number) => redondear1(izq + ((x - xMin) / (xMax - xMin)) * anchoUtil);
  const py = (y: number) => redondear1(arriba + altoUtil - ((y - yMin) / (yMax - yMin)) * altoUtil);
  // El eje y se dibuja en x=0 solo si x=0 está dentro del dominio; si no, se
  // pega al borde para que nunca quede fuera del cuadro.
  const ejeYpx = Math.min(ancho - der, Math.max(izq, px(0)));
  return { px, py, ejeXpx: py(0), ejeYpx };
}

// Notación LaTeX (sin los $) de una suma de términos, para el título /
// leyenda de un visual cuando la lección no da una `formula` propia.
export function formulaFuncion(fn: TerminoFuncionCalculia[]): string {
  const partes = fn.map((t) => {
    const abs = Math.abs(t.c);
    const coef = abs === 1 && t.n !== 0 ? "" : `${abs}`;
    let base: string;
    if (t.tipo === "potencia") {
      base = t.n === 0 ? "1" : t.n === 1 ? "x" : `x^{${t.n}}`;
    } else {
      const bTxt = t.b === 0 ? "" : t.b > 0 ? ` + ${t.b}` : ` - ${Math.abs(t.b)}`;
      const aTxt = t.a === 1 ? "x" : `${t.a}x`;
      base = t.n === 1 ? `(${aTxt}${bTxt})` : `(${aTxt}${bTxt})^{${t.n}}`;
    }
    const cuerpo = t.n === 0 && t.tipo === "potencia" ? `${abs}` : `${coef}${base}`;
    return t.c < 0 ? `-${cuerpo}` : cuerpo;
  });
  return partes
    .map((p, i) => (i === 0 ? p : p.startsWith("-") ? ` - ${p.slice(1)}` : ` + ${p}`))
    .join("");
}
