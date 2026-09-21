"use client";

import { useTranslations } from "next-intl";
import type { Carta } from "@/lib/practica/naipia";
import CartaSVG from "./CartaSVG";

interface Props {
  cartas: Carta[];
  ancho?: number;
}

// Secuencia de cartas en el orden en que "salieron", en filas que
// envuelven según el ancho disponible.
export default function FilaCartas({ cartas, ancho = 40 }: Props) {
  const t = useTranslations("Naipia.cartas");
  if (cartas.length === 0) return null;
  return (
    <div role="group" aria-label={t("filaEtiqueta", { n: cartas.length })} className="flex flex-wrap justify-center gap-1.5">
      {cartas.map((c, i) => (
        <CartaSVG key={`${c.valor}-${c.palo}-${i}`} carta={c} ancho={ancho} />
      ))}
    </div>
  );
}
