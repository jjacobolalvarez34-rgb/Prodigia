"use client";

import { useTranslations } from "next-intl";

// Pedido en vivo (2026-09-15): "al finalizar una práctica no me sale
// cuántas chispas gané, o en las rankeds tampoco". La Experiencia
// ganada YA es exactamente la misma cifra que se suma a
// profiles.puntos_total (acreditar_chispas, 0070, acredita p_monto =
// el XP ganado directo a puntos_total — son el mismo número, no dos
// cálculos distintos) — el hueco real era que ningún resumen lo decía
// con la palabra "Chispas", solo "Experiencia". Componente chico y
// compartido para no reinventar la traducción en cada uno de los 13
// resúmenes que lo usan.
export default function ChispasGanadasNota({ valor }: { valor: number }) {
  const t = useTranslations("Componentes.chispasGanadas");
  if (valor <= 0) return null;
  return <p className="text-sm font-medium text-primario">{t("texto", { n: valor })}</p>;
}
