"use client";

import type { TemaActivo } from "@/lib/temas/temas";
import Adviento from "./Adviento";
import EstrellaFugaz from "./EstrellaFugaz";
import Lamparas from "./Lamparas";
import Ofrenda from "./Ofrenda";
import RetoComunidad from "./RetoComunidad";

// El minievento propio de cada fiesta, jugable en el Inicio (minieventos.ts, 0309).
// Las fiestas sin minievento propio solo muestran su texto (MinieventoInicio).
export default function MinieventoFiesta({ tema }: { tema: TemaActivo }) {
  if (tema.fase !== "evento") return null;
  switch (tema.tema.id) {
    case "muertos":
      return <Ofrenda tema={tema} />;
    case "diwali":
      return <Lamparas />;
    case "viernes_estelar":
      return <EstrellaFugaz desde={tema.hoy.rango.desde} />;
    case "navidad":
      return <Adviento desde={tema.hoy.rango.desde} />;
    case "anio_nuevo":
      return <RetoComunidad />;
    default:
      return null;
  }
}
