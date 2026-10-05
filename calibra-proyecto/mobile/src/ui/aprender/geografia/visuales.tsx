import { useWindowDimensions } from "react-native";
import Svg, { Circle, G, Path, Text as SvgText } from "react-native-svg";
import type { VisualGeografiaMapa } from "@/lib/geografia/visuales";
import { resolverPaisesResaltados } from "@/lib/geografia/visualesDatos";
import { ALTO_MAPA, ANCHO_MAPA, mapaDe } from "~/lib/geografia";
import { FG, FONDO, GAparece, Marco, mezcla, SUPERFICIE } from "../comun";
import { useReproductor } from "../reproductor";

// Mapa de las lecciones de Geografía (components/geografia/visuales/Mapa.tsx): el
// continente con la misma proyección del juego y los países de la lección que se
// van resaltando de a uno, con su nombre.
const COLOR_GEOGRAFIA = "#1E7A8C";

export function Mapa({ visual }: { visual: VisualGeografiaMapa }) {
  const { width } = useWindowDimensions();
  const paises = resolverPaisesResaltados(visual.paisesIds).slice(0, 4);
  const r = useReproductor({ total: paises.length, ms: 1400, estatico: visual.estatico, inicio: paises.length > 0 ? 1 : 0 });
  if (paises.length === 0) return null;
  const mapa = mapaDe(visual.continente);
  const revelados = paises.slice(0, Math.max(1, r.paso));
  const ids = new Set(revelados.map((p) => p.id));
  const ancho = Math.min(384, width - 64);
  return (
    <Marco acento={COLOR_GEOGRAFIA} titulo={visual.titulo} r={r}>
      <Svg width={ancho} height={(ancho * ALTO_MAPA) / ANCHO_MAPA} viewBox={`0 0 ${ANCHO_MAPA} ${ALTO_MAPA}`} style={{ alignSelf: "center" }}>
        {mapa.formas.map((f) => (
          <Path key={f.id} d={f.d} fill={ids.has(f.id) ? COLOR_GEOGRAFIA : mezcla(COLOR_GEOGRAFIA, 22)} stroke={FONDO} strokeWidth={0.75} />
        ))}
        {paises.map((p, i) => {
          const punto = mapa.proyeccion([p.lon, p.lat]);
          if (!punto) return null;
          return (
            <GAparece key={p.id} visible={i < Math.max(1, r.paso)} ms={300}>
              <G x={punto[0]} y={punto[1]}>
                <Circle r={4} fill={SUPERFICIE} stroke={COLOR_GEOGRAFIA} strokeWidth={2} />
                <SvgText textAnchor="middle" y={-10} fontSize={11} fontWeight="700" stroke={FONDO} strokeWidth={4} strokeLinejoin="round" fill={FG}>
                  {p.nombre}
                </SvgText>
                <SvgText textAnchor="middle" y={-10} fontSize={11} fontWeight="700" fill={FG}>
                  {p.nombre}
                </SvgText>
              </G>
            </GAparece>
          );
        })}
      </Svg>
    </Marco>
  );
}
