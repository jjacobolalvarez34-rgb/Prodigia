"use client";

import { useTranslations } from "next-intl";
import { gruposDeSistema, type SistemaConteo } from "@/lib/practica/naipia";

interface Props {
  sistema: SistemaConteo;
  colorHex?: string;
}

// Tabla de valores del sistema de conteo, agrupada por valor. Los datos
// salen de TABLA_SISTEMAS (una sola fuente de verdad).
export default function TablaSistema({ sistema, colorHex = "#B91C1C" }: Props) {
  const t = useTranslations("Naipia.tabla");
  const grupos = gruposDeSistema(sistema);
  return (
    <ul aria-label={t("titulo")} className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-texto-secundario">
      {grupos.map((g) => (
        <li key={g.valor} className="flex items-center gap-1.5">
          <span className="rounded-md px-1.5 py-0.5 font-mono font-bold text-white" style={{ background: colorHex }}>
            {g.valor > 0 ? `+${g.valor}` : g.valor}
          </span>
          <span className="font-mono text-foreground">{g.rangos.join(" ")}</span>
        </li>
      ))}
    </ul>
  );
}
