import type { TemaActivo } from "@/lib/temas/temas";
import Adviento from "./Adviento";
import EstrellaFugaz from "./EstrellaFugaz";
import Lamparas from "./Lamparas";
import Ofrenda from "./Ofrenda";
import RetoComunidad from "./RetoComunidad";

// El minievento propio de cada fiesta, jugable en el Inicio (igual que la web, 0309).
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
    default:
      return null;
  }
}
