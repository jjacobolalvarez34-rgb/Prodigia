"use client";

import { useLocale } from "next-intl";
import type { ReactNode } from "react";
import type { TecladoResuelto } from "@/lib/melodia/visualesDatos";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import TecladoSvg from "./TecladoSvg";
import { BotonEscuchar, MarcoVisual, COLOR_MELODIA } from "./comun";

interface Props {
  datos: TecladoResuelto | null;
  etiqueta: string;
  titulo?: string;
  estatico?: boolean;
  alternativa: (idioma: "es" | "en") => string;
  nota?: string;
  nombres?: "resaltadas" | "todas" | "ninguna";
  grupos?: boolean;
  semitonosNaturales?: boolean;
  saltos?: boolean;
  cifrado?: boolean;
  escuchar?: boolean;
  // Acordes: las notas suenan juntas.
  juntas?: boolean;
  // Contenido extra bajo el teclado (chips del acorde, leyenda...); recibe
  // cuántas notas se ven.
  extra?: (visibles: number, idioma: "es" | "en") => ReactNode;
}

// Núcleo compartido de melodia.teclado / melodia.escala / melodia.acorde:
// reproductor de pasos (una nota por paso) + teclado + botón "Escuchar"
// opcional (solo por gesto del usuario).
export default function TecladoBase({ datos, etiqueta, titulo, estatico, alternativa, nota, nombres = "resaltadas", grupos, semitonosNaturales, saltos, cifrado, escuchar, juntas, extra }: Props) {
  const idioma = useLocale() === "en" ? "en" : "es";
  const total = datos?.notas.length ?? 0;
  const { alVer, ...r } = useReproductor({ total, ms: 1000, estatico, inicio: total > 0 ? 1 : 0 });
  if (!datos) return null;

  return (
    <MarcoVisual
      refCont={alVer}
      etiqueta={titulo ?? etiqueta}
      titulo={titulo}
      alternativa={<p>{alternativa(idioma)}</p>}
      nota={nota}
      controles={
        <>
          <ControlesReproductor r={r} color={COLOR_MELODIA} />
          {escuchar && <BotonEscuchar notas={datos.notas} juntas={juntas} />}
        </>
      }
    >
      <TecladoSvg
        geometria={datos.geometria}
        notas={datos.notas}
        etiquetas={datos.etiquetas}
        cifrados={datos.cifrados}
        cifrado={cifrado}
        visibles={r.paso}
        nombres={nombres}
        grupos={grupos}
        semitonosNaturales={semitonosNaturales}
        saltos={saltos}
        idioma={idioma}
        color={COLOR_MELODIA}
      />
      {extra?.(r.paso, idioma)}
    </MarcoVisual>
  );
}
