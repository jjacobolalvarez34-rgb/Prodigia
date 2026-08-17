"use client";

import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { IDS_POR_CONTINENTE, type Continente } from "@/lib/practica/geografia";

const GEO_URL = "/data/countries-110m.json";
export const COLOR_GEOGRAFIA = "#1E7A8C";

// Centro y zoom por continente — cada uno necesita su propio encuadre
// para que el mapa se vea recortado a ese continente, no al mundo.
const PROYECCION_POR_CONTINENTE: Record<Continente, { scale: number; center: [number, number] }> = {
  america: { scale: 220, center: [-75, 5] },
  europa: { scale: 480, center: [15, 55] },
  africa: { scale: 330, center: [18, 2] },
  // Asia + Oceanía es la región más ancha de las cuatro (de Turquía a
  // Nueva Zelanda) — el zoom queda más chico a propósito para que
  // entre todo el rango; algunos extremos (este de Rusia, NZ) quedan
  // más cerca del borde del mapa que en los otros continentes.
  asia_oceania: { scale: 155, center: [95, 15] },
};

interface Props {
  continente: Continente;
  objetivoId: string;
  seleccionId: string | null;
  respondido: boolean;
  onClickPais: (id: string) => void;
}

// Mapa real con react-simple-maps + el topojson de world-atlas (Fase LL)
// — nada de fronteras dibujadas a mano. Se filtra a solo los países del
// continente activo: el resto del mundo directamente no se renderiza
// (en vez de mostrarlo apagado), lo que da el efecto de "regiones
// resaltadas" sobre un lienzo limpio.
export default function GeografiaMapa({ continente, objetivoId, seleccionId, respondido, onClickPais }: Props) {
  const ids = IDS_POR_CONTINENTE[continente];
  const proyeccion = PROYECCION_POR_CONTINENTE[continente];

  return (
    <ComposableMap
      projection="geoMercator"
      projectionConfig={proyeccion}
      width={480}
      height={420}
      style={{ width: "100%", height: "auto" }}
    >
      <Geographies geography={GEO_URL}>
        {({ geographies }) =>
          geographies
            .filter((geo) => ids.has(String(geo.id)))
            .map((geo) => {
              const id = String(geo.id);
              const esObjetivo = respondido && id === objetivoId;
              const esSeleccionIncorrecta = respondido && id === seleccionId && id !== objetivoId;

              let fillDefault = "color-mix(in oklab, " + COLOR_GEOGRAFIA + " 22%, var(--surface))";
              if (esObjetivo) fillDefault = "var(--correcto)";
              else if (esSeleccionIncorrecta) fillDefault = "var(--error)";

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => !respondido && onClickPais(id)}
                  style={{
                    default: {
                      fill: fillDefault,
                      stroke: "var(--background)",
                      strokeWidth: 0.75,
                      outline: "none",
                      cursor: respondido ? "default" : "pointer",
                      transition: "fill .2s ease",
                    },
                    hover: {
                      fill: respondido ? fillDefault : `color-mix(in oklab, ${COLOR_GEOGRAFIA} 45%, var(--surface))`,
                      stroke: "var(--background)",
                      strokeWidth: 0.75,
                      outline: "none",
                      cursor: respondido ? "default" : "pointer",
                    },
                    pressed: { fill: COLOR_GEOGRAFIA, outline: "none" },
                  }}
                />
              );
            })
        }
      </Geographies>
    </ComposableMap>
  );
}
