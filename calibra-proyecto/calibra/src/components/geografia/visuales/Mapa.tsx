"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import type { VisualGeografiaMapa } from "@/lib/geografia/visuales";
import { IDS_POR_CONTINENTE } from "@/lib/practica/geografia";
import { PROYECCION_POR_CONTINENTE } from "@/lib/geografia/proyeccion";
import { resolverPaisesResaltados } from "@/lib/geografia/visualesDatos";
import { COLOR_GEOGRAFIA } from "@/app/[locale]/geografia/GeografiaMapa";
import ControlesReproductor from "@/components/aprender/ControlesReproductor";
import { useReproductor } from "@/components/aprender/useReproductor";
import MathText from "@/components/MathText";

const GEO_URL = "/data/countries-110m.json";

function subscribeNoop() {
  return () => {};
}
function esCliente() {
  return true;
}
function esClienteEnServer() {
  return false;
}

interface Props {
  visual: VisualGeografiaMapa;
}

// Visual "geografia.mapa": mapa real (mismo react-simple-maps + topojson
// que /geografia/practica, recortado con el mismo PROYECCION_POR_CONTINENTE)
// que va revelando, uno a la vez, los países de `visual.paisesIds` — cada
// país revelado se resalta y muestra su NOMBRE superpuesto (pedido
// explícito del usuario: "un mapa animado que muestra el nombre encima
// del país"). Las coordenadas y el nombre salen de
// resolverPaisesResaltados() (src/lib/geografia/visualesDatos.ts) — el
// componente no inventa ningún dato geográfico.
export default function Mapa({ visual }: Props) {
  const t = useTranslations("Geografia.visuales.mapa");
  const paises = resolverPaisesResaltados(visual.paisesIds).slice(0, 4);
  const { alVer, ...r } = useReproductor({ total: paises.length, ms: 1400, estatico: visual.estatico, inicio: paises.length > 0 ? 1 : 0 });
  // Los <Marker> de react-simple-maps calculan su posición con
  // trigonometría de la proyección (Math.tan/Math.log) — Node y el
  // navegador no siempre redondean el último bit igual en esas funciones
  // trascendentales, así que renderizarlos ya en el HTML del servidor
  // produce un mismatch de hidratación real (confirmado en un preview con
  // Playwright: mismo país, mismo `translate(...)`, difiere solo en el
  // 14º decimal — invisible a ojo, pero React lo marca). Las
  // `<Geography>` de este mismo mapa ya evitan el problema porque
  // `Geographies` trae el topojson con fetch async (nunca durante SSR);
  // acá se aplica el mismo criterio a mano: los `<Marker>` solo se montan
  // después de la hidratación en el cliente. useSyncExternalStore (no un
  // useEffect+setState, que dispara el lint react-hooks/set-state-in-effect
  // y un render en cascada) es el mismo patrón ya usado en el proyecto
  // para esto — ver ThemeToggle.tsx/RetoClient.tsx.
  const montado = useSyncExternalStore(subscribeNoop, esCliente, esClienteEnServer);

  if (paises.length === 0) return null;

  const idsContinente = IDS_POR_CONTINENTE[visual.continente];
  const proyeccion = PROYECCION_POR_CONTINENTE[visual.continente];
  const revelados = paises.slice(0, Math.max(1, r.paso));
  const idsRevelados = new Set(revelados.map((p) => p.id));

  const alternativa = <p>{paises.map((p) => p.nombre).join(", ")}</p>;

  return (
    <figure
      ref={alVer}
      role="group"
      aria-label={visual.titulo ?? t("etiqueta")}
      className="flex w-full flex-col gap-3 overflow-x-hidden rounded-2xl border border-border bg-surface p-3 text-foreground"
      style={{ borderTopColor: COLOR_GEOGRAFIA, borderTopWidth: 3 }}
    >
      {visual.titulo && (
        <p className="text-center text-sm font-semibold text-foreground">
          <MathText texto={visual.titulo} />
        </p>
      )}
      <div aria-hidden="true" className="mx-auto w-full max-w-sm">
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
                .filter((geo) => idsContinente.has(String(geo.id)))
                .map((geo) => {
                  const id = String(geo.id);
                  const resaltado = idsRevelados.has(id);
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      style={{
                        default: {
                          fill: resaltado
                            ? COLOR_GEOGRAFIA
                            : `color-mix(in oklab, ${COLOR_GEOGRAFIA} 12%, var(--surface))`,
                          stroke: "var(--background)",
                          strokeWidth: 0.75,
                          outline: "none",
                          transition: "fill .4s ease",
                        },
                        hover: {
                          fill: resaltado
                            ? COLOR_GEOGRAFIA
                            : `color-mix(in oklab, ${COLOR_GEOGRAFIA} 12%, var(--surface))`,
                          stroke: "var(--background)",
                          strokeWidth: 0.75,
                          outline: "none",
                        },
                        pressed: { fill: COLOR_GEOGRAFIA, outline: "none" },
                      }}
                    />
                  );
                })
            }
          </Geographies>
          {montado && revelados.map((p) => (
            <Marker key={p.id} coordinates={[p.lon, p.lat]}>
              <motion.g
                initial={visual.estatico ? undefined : { opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <circle r={4} fill="var(--background)" stroke={COLOR_GEOGRAFIA} strokeWidth={2} />
                <text
                  textAnchor="middle"
                  y={-10}
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    fill: "var(--foreground)",
                    paintOrder: "stroke",
                    stroke: "var(--background)",
                    strokeWidth: 4,
                    strokeLinejoin: "round",
                  }}
                >
                  {p.nombre}
                </text>
                <title>{p.nombre}</title>
              </motion.g>
            </Marker>
          ))}
        </ComposableMap>
      </div>
      <figcaption className="sr-only">{alternativa}</figcaption>
      <ControlesReproductor r={r} color={COLOR_GEOGRAFIA} />
    </figure>
  );
}
