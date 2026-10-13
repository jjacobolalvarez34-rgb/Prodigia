"use client";

import { useTranslations } from "next-intl";

// Pedido en vivo (2026-09-15): "al finalizar una práctica no me sale
// cuántas Chispas gané". Desde la economía nueva (0280) las Chispas ya no
// son la Experiencia: el valor es `chispasGanadas` de la ruta finish
// (registrar_xp_diario.chispas_partida). Componente chico y compartido por
// todos los resúmenes de partida.
export default function ChispasGanadasNota({ valor }: { valor: number }) {
  const t = useTranslations("Componentes.chispasGanadas");
  if (valor <= 0) return null;
  return <p className="text-sm font-medium text-primario">{t("texto", { n: valor })}</p>;
}
