"use client";

import type { TemaActivo } from "@/lib/temas/temas";
import Adviento from "./Adviento";
import Bosque from "./Bosque";
import CiudadColores from "./CiudadColores";
import Comparsa from "./Comparsa";
import DigitosPi from "./DigitosPi";
import DuoAmistad from "./DuoAmistad";
import EstrellaFugaz from "./EstrellaFugaz";
import Huevos from "./Huevos";
import Lamparas from "./Lamparas";
import MelodiaCompleta from "./MelodiaCompleta";
import NochesLuna from "./NochesLuna";
import Ofrenda from "./Ofrenda";
import Repaso from "./Repaso";
import RetoComunidad from "./RetoComunidad";
import SobresRojos from "./SobresRojos";

// El minievento propio de cada fiesta, jugable en el Inicio (minieventos.ts, 0309 y 0311).
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
    case "anio_nuevo_lunar":
      return <SobresRojos />;
    case "amor_amistad":
      return <DuoAmistad />;
    case "carnaval":
      return <Comparsa />;
    case "linternas":
      return <NochesLuna tema={tema} />;
    case "dia_pi":
      return <DigitosPi />;
    case "holi":
      return <CiudadColores />;
    case "pascua":
      return <Huevos tema={tema} />;
    case "dia_tierra":
      return <Bosque />;
    case "dia_musica":
      return <MelodiaCompleta />;
    case "vuelta_clases":
      return <Repaso tema={tema} />;
    default:
      return null;
  }
}
