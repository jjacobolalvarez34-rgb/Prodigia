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

// El minievento propio de cada fiesta, jugable en el Inicio (igual que la web, 0309 y 0311).
// `ancho`: el ancho útil de la tarjeta, para los dibujos.
export default function MinieventoFiesta({ tema, ancho }: { tema: TemaActivo; ancho: number }) {
  if (tema.fase !== "evento") return null;
  switch (tema.tema.id) {
    case "muertos":
      return <Ofrenda tema={tema} ancho={ancho} />;
    case "diwali":
      return <Lamparas ancho={ancho} />;
    case "viernes_estelar":
      return <EstrellaFugaz desde={tema.hoy.rango.desde} />;
    case "navidad":
      return <Adviento desde={tema.hoy.rango.desde} ancho={ancho} />;
    case "anio_nuevo":
      return <RetoComunidad />;
    case "anio_nuevo_lunar":
      return <SobresRojos ancho={ancho} />;
    case "amor_amistad":
      return <DuoAmistad />;
    case "carnaval":
      return <Comparsa ancho={ancho} />;
    case "linternas":
      return <NochesLuna tema={tema} ancho={ancho} />;
    case "dia_pi":
      return <DigitosPi />;
    case "holi":
      return <CiudadColores ancho={ancho} />;
    case "pascua":
      return <Huevos tema={tema} ancho={ancho} />;
    case "dia_tierra":
      return <Bosque ancho={ancho} />;
    case "dia_musica":
      return <MelodiaCompleta ancho={ancho} />;
    case "vuelta_clases":
      return <Repaso tema={tema} ancho={ancho} />;
    default:
      return null;
  }
}
