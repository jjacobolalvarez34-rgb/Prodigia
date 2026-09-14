"use client";

import { useTranslations } from "next-intl";
import { FUENTE_NOMBRE_CLASS, ANIMACION_NOMBRE_CLASS, type FuenteNombre, type AnimacionNombre } from "@/types/database";

interface Props {
  nombre: string | null;
  fuente?: FuenteNombre | null;
  animacion?: AnimacionNombre | null;
  className?: string;
}

// Fase 5 (mercado): un solo lugar que sabe traducir profiles.fuente_nombre
// a la clase Tailwind real — usado en perfil, ranking y feed para que la
// tipografía comprada se vea en todos lados sin duplicar el mapeo.
// Fase 10: mismo criterio para profiles.animacion_nombre.
export default function NombreConFuente({ nombre, fuente, animacion, className = "" }: Props) {
  const t = useTranslations("Componentes");
  const claseFuente = FUENTE_NOMBRE_CLASS[fuente ?? "default"] ?? "";
  const claseAnimacion = ANIMACION_NOMBRE_CLASS[animacion ?? "ninguna"] ?? "";
  return <span className={`${claseFuente} ${claseAnimacion} ${className}`}>{nombre ?? t("nombreConFuente.jugador")}</span>;
}
