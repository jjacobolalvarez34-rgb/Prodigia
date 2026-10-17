import { ARCOIRIS, tono } from "@/lib/recompensas/catalogo";

// La llama de la racha (2026-10-17, «se ve muy sencilla»): un solo dibujo para la web
// y la app, en capas como una llama de verdad: lengua exterior (de la base oscura a la
// punta), lengua media más clara, núcleo casi blanco, un brillo en el borde y, cuando
// arde fuerte, brasas que se escapan. Cada estela de la tienda (catalogo.ts ESTELAS)
// sale de sus dos colores, así que todas las skins se ven igual de cuidadas.

export type EstadoLlama = "apagada" | "encendida" | "llamas";

export interface ColoresEstela {
  base: string;
  punta: string;
  arcoiris?: boolean;
}

export interface CapaLlama {
  d: string;
  // Degradé de abajo hacia arriba.
  colores: string[];
}

export interface DibujoLlama {
  capas: CapaLlama[];
  brillo: { d: string; color: string; opacidad: number };
  brasas: { x: number; y: number; r: number; color: string }[];
  // Resplandor detrás de la llama (null si está apagada).
  halo: string | null;
}

// Viewbox 24×24; la base de la llama queda cerca de y=21.5.
export const LLAMA = {
  exterior: "M12 1.6c.9 3.2 3.4 4.9 4.6 7.6.5-.9.6-1.9.5-2.9 2 2 3.2 4.5 3.2 7.2A8.3 8.3 0 0 1 12 21.8a8.3 8.3 0 0 1-8.3-8.3c0-2.9 1.4-5.2 3.4-6.9-.1 1.4.2 2.6.9 3.6C8.3 6.7 9.7 3.7 12 1.6z",
  media: "M12 7.4c.6 2.3 2.6 3.6 3.4 5.6.3-.5.4-1.1.4-1.7 1.1 1.3 1.7 2.9 1.7 4.5A5.5 5.5 0 0 1 12 21.3a5.5 5.5 0 0 1-5.5-5.5c0-1.9.9-3.4 2.1-4.6 0 .9.3 1.7.8 2.3.1-2.4 1.1-4.6 2.6-6.1z",
  nucleo: "M12 12.6c.4 1.4 1.7 2.3 2.1 3.6.1.3.2.7.2 1.1a2.3 2.3 0 0 1-4.6 0c0-1.3.8-2.1 1.4-2.8.1.5.3.9.7 1.1-.2-1-.2-2.1.2-3z",
  brillo: "M7.2 8.4c-1.6 1.5-2.3 3.4-2.1 5.6",
  // Base de la llama: desde aquí se estira y se mece al titilar.
  origen: { x: 12, y: 21.5 },
};

const APAGADA: DibujoLlama = {
  capas: [
    { d: LLAMA.exterior, colores: ["#2E3450", "#4A5270"] },
    { d: LLAMA.media, colores: ["#4A5270", "#6B7391"] },
    { d: LLAMA.nucleo, colores: ["#6B7391", "#8B95B5"] },
  ],
  brillo: { d: LLAMA.brillo, color: "#FFFFFF", opacidad: 0.12 },
  brasas: [],
  halo: null,
};

export function dibujoLlama(estela: ColoresEstela | null | undefined, estado: EstadoLlama = "encendida"): DibujoLlama {
  if (estado === "apagada") return APAGADA;
  const base = estela?.base ?? "#FF6B35";
  const punta = estela?.punta ?? "#FFC53D";
  const exterior = estela?.arcoiris ? [...ARCOIRIS] : [tono(base, -0.3), base, tono(punta, -0.05)];
  const media = estela?.arcoiris ? ["#FDE68A", "#FFFFFF"] : [tono(base, 0.25), punta];
  const nucleo = [tono(punta, 0.88), tono(punta, 0.6)];
  const brasa = estela?.arcoiris ? "#FACC15" : tono(punta, 0.3);
  return {
    capas: [
      { d: LLAMA.exterior, colores: exterior },
      { d: LLAMA.media, colores: media },
      { d: LLAMA.nucleo, colores: nucleo },
    ],
    brillo: { d: LLAMA.brillo, color: tono(punta, 0.8), opacidad: 0.55 },
    brasas:
      estado === "llamas"
        ? [
            { x: 18.4, y: 4.2, r: 0.75, color: brasa },
            { x: 5.6, y: 3.4, r: 0.55, color: brasa },
            { x: 15.6, y: 1.4, r: 0.45, color: brasa },
          ]
        : [],
    halo: estela?.arcoiris ? "#F59E0B" : base,
  };
}

// Titileo en un ciclo (t de 0 a 1): estirón vertical e inclinación desde la base.
// Web (CSS) y app (Reanimated) usan los mismos puntos.
export const TITILEO = [
  { t: 0, escalaY: 1, inclina: 0 },
  { t: 0.25, escalaY: 1.07, inclina: -3 },
  { t: 0.5, escalaY: 0.96, inclina: 2 },
  { t: 0.75, escalaY: 1.04, inclina: -1.5 },
  { t: 1, escalaY: 1, inclina: 0 },
];
