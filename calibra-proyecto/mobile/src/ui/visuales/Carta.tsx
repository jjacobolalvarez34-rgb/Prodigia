import Svg, { Circle, Defs, G, Path, Pattern, Rect, Text as SvgText } from "react-native-svg";
import { fuente } from "~/tema";

// Naipe de Naipia (port de components/naipia/CartaSVG.tsx): valor en la esquina y el
// palo dibujado (no el carácter ♠, que depende de la fuente del teléfono).
const ANCHO_VB = 60;
const ALTO_VB = 84;
const ROJO = "#C62828";
const NEGRO = "#111827";

function Palo({ palo }: { palo: string }) {
  if (palo === "corazones") return <Path d="M12 21.5C5 15.5 2 11.8 2 8.2A5 5 0 0 1 12 6.3 5 5 0 0 1 22 8.2c0 3.6-3 7.3-10 13.3z" />;
  if (palo === "diamantes") return <Path d="M12 2l9 10-9 10-9-10z" />;
  if (palo === "picas") return <Path d="M12 2C12 2 3 9 3 14a4.5 4.5 0 0 0 8 2.7c-.3 2.3-1 3.9-3 5.3h8c-2-1.4-2.7-3-3-5.3a4.5 4.5 0 0 0 8-2.7C21 9 12 2 12 2z" />;
  return (
    <G>
      <Circle cx="12" cy="7.2" r="4.4" />
      <Circle cx="6.6" cy="14" r="4.4" />
      <Circle cx="17.4" cy="14" r="4.4" />
      <Path d="M12 11.5v5c0 2.8-1.4 4.4-3.5 5.5h7c-2.1-1.1-3.5-2.7-3.5-5.5z" />
    </G>
  );
}

export default function Carta({ valor, palo, tam = 54 }: { valor: string; palo: string; tam?: number }) {
  const c = palo === "corazones" || palo === "diamantes" ? ROJO : NEGRO;
  return (
    <Svg width={tam} height={(tam * ALTO_VB) / ANCHO_VB} viewBox={`0 0 ${ANCHO_VB} ${ALTO_VB}`}>
      <Rect x={1} y={1} width={ANCHO_VB - 2} height={ALTO_VB - 2} rx={6} fill="#FFFFFF" stroke="#D1D5DB" strokeWidth={1.5} />
      <SvgText x={7} y={17} fontSize={valor === "10" ? 13 : 15} fontFamily={fuente.cuerpoBold} fill={c}>
        {valor}
      </SvgText>
      <G fill={c} transform="translate(5.5 21) scale(0.42)">
        <Palo palo={palo} />
      </G>
      <G fill={c} transform={`translate(${30 - 18} ${46 - 18}) scale(1.5)`}>
        <Palo palo={palo} />
      </G>
    </Svg>
  );
}

export function Dorso({ tam = 54, acento = "#B91C1C" }: { tam?: number; acento?: string }) {
  return (
    <Svg width={tam} height={(tam * ALTO_VB) / ANCHO_VB} viewBox={`0 0 ${ANCHO_VB} ${ALTO_VB}`}>
      <Defs>
        <Pattern id="dorsoNaipia" width={8} height={8} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <Rect width={8} height={8} fill={acento} />
          <Path d="M0 4H8M4 0V8" stroke="#FFFFFF" strokeOpacity={0.28} strokeWidth={0.9} />
        </Pattern>
      </Defs>
      <Rect x={1} y={1} width={ANCHO_VB - 2} height={ALTO_VB - 2} rx={6} fill="#FFFFFF" stroke="#D1D5DB" strokeWidth={1.5} />
      <Rect x={5} y={5} width={ANCHO_VB - 10} height={ALTO_VB - 10} rx={3} fill="url(#dorsoNaipia)" stroke={acento} strokeWidth={1} />
      <Path d="M30 30l9 12-9 12-9-12z" fill="#FFFFFF" fillOpacity={0.92} stroke={acento} strokeWidth={1.2} />
    </Svg>
  );
}
