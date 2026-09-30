"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { IDS_POR_CONTINENTE, type Continente } from "@/lib/practica/geografia";
import { PROYECCION_POR_CONTINENTE } from "@/lib/geografia/proyeccion";

const GEO_URL = "/data/countries-110m.json";
export const COLOR_GEOGRAFIA = "#1E7A8C";

const ZOOM_MIN = 1;
const ZOOM_MAX = 8;

interface Props {
  continente: Continente;
  objetivoId: string;
  seleccionId: string | null;
  respondido: boolean;
  onClickPais: (id: string) => void;
}

function BotonZoom({ onClick, etiqueta, children }: { onClick: () => void; etiqueta: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={etiqueta}
      title={etiqueta}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface/90 text-lg font-bold text-foreground shadow-sm backdrop-blur transition-colors hover:border-foreground/30"
    >
      {children}
    </button>
  );
}

// Mapa real con react-simple-maps + el topojson de world-atlas (Fase LL)
// — nada de fronteras dibujadas a mano. Se filtra a solo los países del
// continente activo: el resto del mundo directamente no se renderiza
// (en vez de mostrarlo apagado), lo que da el efecto de "regiones
// resaltadas" sobre un lienzo limpio.
//
// Zoom y arrastre (pedido del usuario, 2026-09-29: "poder hacer zoom dentro
// del recuadro y moverlo arrastrando, para poder clickear los países
// pequeños"): rueda del mouse, pellizco en pantallas táctiles o los botones
// + / − / reiniciar. Arrastrar mueve el mapa; un clic sin arrastrar sigue
// eligiendo el país (d3-zoom descarta el clic cuando hubo arrastre). El zoom se
// conserva entre preguntas (los países chicos suelen estar en la misma zona);
// el botón de reiniciar vuelve al encuadre del continente.
export default function GeografiaMapa({ continente, objetivoId, seleccionId, respondido, onClickPais }: Props) {
  const t = useTranslations("Geografia.mapa");
  const ids = IDS_POR_CONTINENTE[continente];
  const proyeccion = PROYECCION_POR_CONTINENTE[continente];
  const [posicion, setPosicion] = useState<{ centro: [number, number]; zoom: number }>({ centro: proyeccion.center, zoom: 1 });
  // Si cambia el continente (misma instancia reutilizada), vuelve al encuadre nuevo.
  const [continenteMostrado, setContinenteMostrado] = useState(continente);
  if (continenteMostrado !== continente) {
    setContinenteMostrado(continente);
    setPosicion({ centro: proyeccion.center, zoom: 1 });
  }

  const cambiarZoom = (factor: number) =>
    setPosicion((p) => ({ ...p, zoom: Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, p.zoom * factor)) }));
  // Los bordes se afinan al acercar, para que los países chicos no queden tapados por su contorno.
  const trazo = 0.75 / posicion.zoom;

  return (
    <div className="relative overflow-hidden rounded-xl">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={proyeccion}
        width={480}
        height={420}
        style={{ width: "100%", height: "auto", cursor: "grab", touchAction: "none" }}
      >
        <ZoomableGroup
          center={posicion.centro}
          zoom={posicion.zoom}
          minZoom={ZOOM_MIN}
          maxZoom={ZOOM_MAX}
          onMoveEnd={({ coordinates, zoom }) => setPosicion({ centro: coordinates, zoom })}
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
                          strokeWidth: trazo,
                          outline: "none",
                          cursor: respondido ? "default" : "pointer",
                          transition: "fill .2s ease",
                        },
                        hover: {
                          fill: respondido ? fillDefault : `color-mix(in oklab, ${COLOR_GEOGRAFIA} 45%, var(--surface))`,
                          stroke: "var(--background)",
                          strokeWidth: trazo,
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
        </ZoomableGroup>
      </ComposableMap>

      <div className="absolute right-2 top-2 flex flex-col gap-1.5">
        <BotonZoom onClick={() => cambiarZoom(1.6)} etiqueta={t("acercar")}>
          +
        </BotonZoom>
        <BotonZoom onClick={() => cambiarZoom(1 / 1.6)} etiqueta={t("alejar")}>
          −
        </BotonZoom>
        <BotonZoom onClick={() => setPosicion({ centro: proyeccion.center, zoom: 1 })} etiqueta={t("reiniciar")}>
          ⟲
        </BotonZoom>
      </div>
      <p className="pointer-events-none absolute bottom-1.5 left-0 right-0 text-center text-[11px] text-texto-secundario">{t("ayuda")}</p>
    </div>
  );
}
