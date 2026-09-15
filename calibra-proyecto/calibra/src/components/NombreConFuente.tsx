"use client";

import { useTranslations } from "next-intl";
import {
  FUENTE_NOMBRE_CLASS,
  ANIMACION_NOMBRE_CLASS,
  ANIMACIONES_PESADAS,
  type FuenteNombre,
  type AnimacionNombre,
} from "@/types/database";
import Shuffle from "@/components/reactbits/Shuffle";
import DecryptedText from "@/components/reactbits/DecryptedText";

interface Props {
  nombre: string | null;
  fuente?: FuenteNombre | null;
  animacion?: AnimacionNombre | null;
  className?: string;
  // Shuffle/decrypted corren GSAP/JS real por instancia — solo se
  // permiten donde hay UN nombre en pantalla (perfil propio, perfil
  // público). Default false a propósito: cualquier lista (ranking, feed,
  // chat de clan) que use este componente sin pasar esto explícito cae
  // a texto plano para esas 2 animaciones, nunca monta 20 instancias de
  // GSAP por accidente.
  permitirEfectosPesados?: boolean;
}

// Fase 5 (mercado): un solo lugar que sabe traducir profiles.fuente_nombre
// a la clase Tailwind real — usado en perfil, ranking y feed para que la
// tipografía comprada se vea en todos lados sin duplicar el mapeo.
// Fase 10: mismo criterio para profiles.animacion_nombre.
export default function NombreConFuente({ nombre, fuente, animacion, className = "", permitirEfectosPesados = false }: Props) {
  const t = useTranslations("Componentes");
  const claseFuente = FUENTE_NOMBRE_CLASS[fuente ?? "default"] ?? "";
  const claseAnimacion = ANIMACION_NOMBRE_CLASS[animacion ?? "ninguna"] ?? "";
  const texto = nombre ?? t("nombreConFuente.jugador");

  if (permitirEfectosPesados && animacion && ANIMACIONES_PESADAS.has(animacion)) {
    if (animacion === "shuffle") {
      return <Shuffle text={texto} className={`${claseFuente} ${className}`} tag="span" />;
    }
    return <DecryptedText text={texto} className={`${claseFuente} ${className}`} animateOn="hover" />;
  }

  // data-text: solo lo usan nombre-anim-glitch/deconstruccion (sus
  // ::before/::after leen content: attr(data-text)) — inofensivo para
  // el resto de las animaciones, así que se manda siempre.
  return (
    <span className={`${claseFuente} ${claseAnimacion} ${className}`} data-text={texto}>
      {texto}
    </span>
  );
}
