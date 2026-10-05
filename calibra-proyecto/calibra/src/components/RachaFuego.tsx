"use client";

import { motion } from "framer-motion";
import { IconLlama } from "@/components/icons";
import { ARCOIRIS, estelaDe } from "@/lib/recompensas/catalogo";
import { useCosmeticosWeb } from "@/lib/recompensas/cosmeticosWeb";

interface Props {
  racha: number;
}

// Fase AA2: el ícono de racha tenía una base chica (texto con un emoji
// al lado) y crecía apenas con el combo. Ahora el tamaño de reposo ya es
// grande de entrada, y cada combo nuevo pega un salto de escala bien
// exagerado — un "PAM" en cada paso, no un cambio sutil — remontando el
// componente por `key={racha}` para que la animación arranque de cero en
// cada incremento.
const TIERS = [
  { desde: 2, icono: "h-5 w-5", texto: "text-base" },
  { desde: 4, icono: "h-6 w-6", texto: "text-lg" },
  { desde: 6, icono: "h-7 w-7", texto: "text-xl" },
  { desde: 8, icono: "h-8 w-8", texto: "text-2xl" },
];

function tierDe(racha: number) {
  let tier = TIERS[0];
  for (const t of TIERS) {
    if (racha >= t.desde) tier = t;
  }
  return tier;
}

export default function RachaFuego({ racha }: Props) {
  // Estela de racha de la tienda (0248): los colores de la llama.
  const valorEstela = useCosmeticosWeb().estela;
  if (racha < 2) return null;
  const tier = tierDe(racha);
  const estela = valorEstela !== "clasica" ? estelaDe(valorEstela) : null;

  return (
    <motion.div
      key={racha}
      initial={{ scale: 0.4, rotate: -10 }}
      animate={{ scale: [0.4, 1.55, 1], rotate: [-10, 8, 0] }}
      transition={{ duration: 0.45, ease: "backOut" }}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${estela ? "" : "bg-racha/15"}`}
      style={estela ? { background: `color-mix(in oklab, ${estela.base} 18%, transparent)` } : undefined}
    >
      {estela ? (
        <svg viewBox="0 0 24 24" className={tier.icono} aria-hidden="true">
          <defs>
            <linearGradient id="estela-racha" x1="0" y1="1" x2="0" y2="0">
              {(estela.arcoiris ? ARCOIRIS : [estela.base, estela.punta]).map((c, i, arr) => (
                <stop key={c} offset={i / (arr.length - 1)} stopColor={c} />
              ))}
            </linearGradient>
          </defs>
          <path fill="url(#estela-racha)" d="M12 2c1 3-2 4-2 7a2 2 0 0 0 4 0c2 1 3 3 3 5a5 5 0 0 1-10 0c0-4 3-5 3-8 0-1.5.8-3 2-4z" />
        </svg>
      ) : (
        <IconLlama className={`${tier.icono} text-racha`} />
      )}
      <span className={`font-display font-black ${estela ? "" : "text-racha"} ${tier.texto}`} style={estela ? { color: estela.arcoiris ? estela.punta : estela.base } : undefined}>
        {racha}
      </span>
    </motion.div>
  );
}
