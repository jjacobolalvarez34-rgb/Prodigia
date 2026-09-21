"use client";

import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { efectosHabilitados, efectosHabilitadosServerSnapshot, subscribeEfectos } from "@/lib/efectos";

export type MundoFondo = "numeria" | "enigmia" | "geografia" | "quimia" | "anatomia" | "melodia" | "trigonometria" | "historia" | "calculia" | "circuitia" | "estadistica" | "naipia" | "codia";

interface Posicion {
  simbolo: string;
  left: string;
  top: string;
  size: number;
  rotate: number;
  delay: number;
}

// Posiciones fijas (no Math.random durante el render) — cada mundo tiene
// su propio set de símbolos flotando muy tenue de fondo, para que
// cambiar de mundo se sienta como viajar a otro lugar (Fase N2). La
// home de Prodigia (afuera de cualquier mundo) no usa este componente
// a propósito — se queda neutral/editorial, el "lobby".
const SETS: Record<MundoFondo, Posicion[]> = {
  numeria: [
    { simbolo: "+", left: "6%", top: "12%", size: 64, rotate: -8, delay: 0 },
    { simbolo: "÷", left: "88%", top: "18%", size: 48, rotate: 10, delay: 0.4 },
    { simbolo: "×", left: "12%", top: "72%", size: 56, rotate: 6, delay: 0.8 },
    { simbolo: "−", left: "92%", top: "68%", size: 70, rotate: -5, delay: 1.2 },
    { simbolo: "=", left: "50%", top: "6%", size: 40, rotate: 3, delay: 1.6 },
    { simbolo: "7", left: "22%", top: "40%", size: 44, rotate: -12, delay: 0.6 },
  ],
  enigmia: [
    { simbolo: "?", left: "8%", top: "16%", size: 62, rotate: -10, delay: 0 },
    { simbolo: "◆", left: "90%", top: "22%", size: 30, rotate: 15, delay: 0.5 },
    { simbolo: "▲", left: "14%", top: "70%", size: 34, rotate: -6, delay: 1 },
    { simbolo: "●", left: "88%", top: "66%", size: 26, rotate: 0, delay: 1.4 },
    { simbolo: "∴", left: "48%", top: "10%", size: 40, rotate: 5, delay: 0.8 },
  ],
  geografia: [
    { simbolo: "◔", left: "8%", top: "14%", size: 56, rotate: -8, delay: 0 },
    { simbolo: "✦", left: "90%", top: "20%", size: 28, rotate: 12, delay: 0.5 },
    { simbolo: "◐", left: "14%", top: "72%", size: 40, rotate: -4, delay: 1 },
    { simbolo: "✦", left: "86%", top: "64%", size: 20, rotate: 8, delay: 1.3 },
    { simbolo: "◔", left: "50%", top: "8%", size: 30, rotate: 6, delay: 0.7 },
  ],
  // Quimia: matraz, átomo, molécula — motivos flotantes propios, mismo
  // sistema (glifos unicode, no imágenes) que el resto de los mundos.
  quimia: [
    { simbolo: "⚗", left: "8%", top: "14%", size: 54, rotate: -8, delay: 0 },
    { simbolo: "⚛", left: "90%", top: "20%", size: 34, rotate: 12, delay: 0.5 },
    { simbolo: "⬡", left: "14%", top: "72%", size: 36, rotate: -4, delay: 1 },
    { simbolo: "🧪", left: "88%", top: "66%", size: 30, rotate: 8, delay: 1.3 },
    { simbolo: "⚛", left: "50%", top: "8%", size: 26, rotate: 6, delay: 0.7 },
  ],
  // Fase 5 ("Anatomía"): cruz médica, corazón, hueso, cerebro — mismo
  // criterio (glifos/emoji unicode, no imágenes).
  anatomia: [
    { simbolo: "⚕", left: "8%", top: "14%", size: 54, rotate: -8, delay: 0 },
    { simbolo: "♥", left: "90%", top: "20%", size: 34, rotate: 12, delay: 0.5 },
    { simbolo: "🦴", left: "14%", top: "72%", size: 36, rotate: -4, delay: 1 },
    { simbolo: "🧠", left: "88%", top: "66%", size: 30, rotate: 8, delay: 1.3 },
    { simbolo: "♥", left: "50%", top: "8%", size: 22, rotate: 6, delay: 0.7 },
  ],
  // Mundo Melodía (Fase 1): pentagrama, corchea, clave de sol — mismo
  // criterio (glifos unicode, no imágenes).
  melodia: [
    { simbolo: "♪", left: "8%", top: "14%", size: 54, rotate: -8, delay: 0 },
    { simbolo: "𝄞", left: "90%", top: "20%", size: 44, rotate: 4, delay: 0.5 },
    { simbolo: "♫", left: "14%", top: "72%", size: 36, rotate: -4, delay: 1 },
    { simbolo: "♩", left: "88%", top: "66%", size: 30, rotate: 8, delay: 1.3 },
    { simbolo: "♭", left: "50%", top: "8%", size: 26, rotate: 6, delay: 0.7 },
  ],
  // Mundo Trigonometría: triángulo, ángulo, símbolo de grado — mismo
  // criterio (glifos unicode, no imágenes).
  trigonometria: [
    { simbolo: "△", left: "8%", top: "14%", size: 54, rotate: -8, delay: 0 },
    { simbolo: "∠", left: "90%", top: "20%", size: 44, rotate: 4, delay: 0.5 },
    { simbolo: "°", left: "14%", top: "72%", size: 40, rotate: -4, delay: 1 },
    { simbolo: "π", left: "88%", top: "66%", size: 34, rotate: 8, delay: 1.3 },
    { simbolo: "θ", left: "50%", top: "8%", size: 30, rotate: 6, delay: 0.7 },
  ],
  // Mundo Historia: pergamino, columna, reloj de arena — mismo criterio
  // (glifos/emoji unicode, no imágenes).
  historia: [
    { simbolo: "📜", left: "8%", top: "14%", size: 44, rotate: -8, delay: 0 },
    { simbolo: "🏛", left: "90%", top: "20%", size: 40, rotate: 4, delay: 0.5 },
    { simbolo: "⏳", left: "14%", top: "72%", size: 36, rotate: -4, delay: 1 },
    { simbolo: "⚔", left: "88%", top: "66%", size: 32, rotate: 8, delay: 1.3 },
    { simbolo: "🗿", left: "50%", top: "8%", size: 30, rotate: 6, delay: 0.7 },
  ],
  // Mundo Calculia: integral, sumatoria, infinito — mismo criterio
  // (glifos unicode, no imágenes).
  calculia: [
    { simbolo: "∫", left: "8%", top: "14%", size: 60, rotate: -8, delay: 0 },
    { simbolo: "∑", left: "90%", top: "20%", size: 46, rotate: 4, delay: 0.5 },
    { simbolo: "∞", left: "14%", top: "72%", size: 40, rotate: -4, delay: 1 },
    { simbolo: "dx", left: "88%", top: "66%", size: 30, rotate: 8, delay: 1.3 },
    { simbolo: "∂", left: "50%", top: "8%", size: 34, rotate: 6, delay: 0.7 },
  ],
  // Mundo Circuitia: rayo, resistor en zigzag (glifo lo más cercano
  // disponible), corriente — mismo criterio (glifos unicode, no
  // imágenes).
  circuitia: [
    { simbolo: "⚡", left: "8%", top: "14%", size: 54, rotate: -8, delay: 0 },
    { simbolo: "Ω", left: "90%", top: "20%", size: 44, rotate: 4, delay: 0.5 },
    { simbolo: "⏚", left: "14%", top: "72%", size: 36, rotate: -4, delay: 1 },
    { simbolo: "⚡", left: "88%", top: "66%", size: 28, rotate: 8, delay: 1.3 },
    { simbolo: "Ω", left: "50%", top: "8%", size: 30, rotate: 6, delay: 0.7 },
  ],
  // Mundo Estadística: sigma, mu, porcentaje, más-menos — mismo criterio
  // (glifos unicode, no imágenes).
  estadistica: [
    { simbolo: "σ", left: "8%", top: "14%", size: 58, rotate: -8, delay: 0 },
    { simbolo: "μ", left: "90%", top: "20%", size: 46, rotate: 4, delay: 0.5 },
    { simbolo: "%", left: "14%", top: "72%", size: 40, rotate: -4, delay: 1 },
    { simbolo: "±", left: "88%", top: "66%", size: 34, rotate: 8, delay: 1.3 },
    { simbolo: "Σ", left: "50%", top: "8%", size: 32, rotate: 6, delay: 0.7 },
  ],
  // Mundo Naipia (deporte mental de memoria/conteo): palos de la baraja
  // y el +1/−1 del conteo — mismo criterio (glifos unicode, no imágenes).
  naipia: [
    { simbolo: "♠", left: "8%", top: "14%", size: 58, rotate: -8, delay: 0 },
    { simbolo: "♥", left: "90%", top: "20%", size: 44, rotate: 4, delay: 0.5 },
    { simbolo: "+1", left: "14%", top: "72%", size: 36, rotate: -4, delay: 1 },
    { simbolo: "♦", left: "88%", top: "66%", size: 34, rotate: 8, delay: 1.3 },
    { simbolo: "♣", left: "50%", top: "8%", size: 32, rotate: 6, delay: 0.7 },
  ],
  // Mundo Codia: llaves, etiquetas, punto y coma, flecha — mismo criterio
  // (glifos unicode, no imágenes).
  codia: [
    { simbolo: "{ }", left: "8%", top: "14%", size: 54, rotate: -8, delay: 0 },
    { simbolo: "</>", left: "90%", top: "20%", size: 38, rotate: 4, delay: 0.5 },
    { simbolo: ";", left: "14%", top: "72%", size: 44, rotate: -4, delay: 1 },
    { simbolo: "=>", left: "88%", top: "66%", size: 32, rotate: 8, delay: 1.3 },
    { simbolo: "[ ]", left: "50%", top: "8%", size: 34, rotate: 6, delay: 0.7 },
  ],
};

export default function FondoMundo({ mundo }: { mundo: MundoFondo }) {
  const efectos = useSyncExternalStore(subscribeEfectos, efectosHabilitados, efectosHabilitadosServerSnapshot);
  if (!efectos) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden motion-reduce:hidden"
    >
      {SETS[mundo].map((p, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 8 }}
          // Fase Z2: no se quedan flotando a opacidad fija — cada uno
          // aparece y se desvanece de nuevo en su propio ciclo (duración
          // distinta por elemento para que no pulsen todos juntos), a la
          // vez que sube y baja. Sigue siendo puro margen/borde, nunca el
          // centro. Pedido en vivo (2026-09-13: "que se vean un poco
          // más") — subido de 0.06/0.015 a 0.16/0.04 (casi el triple) y
          // el tamaño ×1.18, pero sigue siendo ambiente, no protagonista.
          animate={{ opacity: [0, 0.16, 0.16, 0.04, 0.16], y: [8, -8, 8] }}
          transition={{
            opacity: { duration: 9 + i * 1.5, repeat: Infinity, ease: "easeInOut", delay: p.delay },
            y: { duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: p.delay },
          }}
          className="absolute select-none font-display font-bold text-foreground"
          style={{ left: p.left, top: p.top, fontSize: p.size * 1.18, rotate: `${p.rotate}deg` }}
        >
          {p.simbolo}
        </motion.span>
      ))}
    </div>
  );
}
