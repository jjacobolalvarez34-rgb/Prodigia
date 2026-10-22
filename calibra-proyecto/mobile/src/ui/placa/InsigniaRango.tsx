import { memo } from "react";
import { View } from "react-native";
import Svg, { Circle, Line, Path, Polygon, Rect } from "react-native-svg";
import { indiceDivision, piezasInsigniaTorres, type Pieza } from "@/lib/rangos/insigniaTorres";
import { rangoDeElo } from "~/lib/placa";

// Insignia de rango «Torres» (2026-10-12): la ciudad que crece con tu rango y
// enciende pisos con cada división. La geometría es compartida con la web
// (@/lib/rangos/insigniaTorres); acá solo se dibuja. Sin brillo ni animación.

interface Props {
  elo: number;
  tam?: number;
  // Un rango dado (con todo encendido), sin ELO: el anuncio de temporada.
  slug?: string;
}

function dibujar(p: Pieza, i: number) {
  switch (p.t) {
    case "path":
      return <Path key={i} d={p.d} fill={p.fill ?? "none"} stroke={p.stroke} strokeWidth={p.ancho} opacity={p.opacidad} />;
    case "rect":
      return <Rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} fill={p.fill} />;
    case "circle":
      return <Circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill={p.fill} opacity={p.opacidad} />;
    case "polygon":
      return <Polygon key={i} points={p.puntos} fill={p.fill} />;
    case "line":
      return <Line key={i} x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} stroke={p.stroke} strokeWidth={p.ancho} />;
  }
}

function InsigniaRango({ elo, tam = 46, slug }: Props) {
  const piezas = slug ? piezasInsigniaTorres(slug, 2) : piezasInsigniaTorres(rangoDeElo(elo).slug, indiceDivision(elo));
  return (
    <View style={{ width: tam, height: tam }} accessibilityRole="image" accessibilityLabel={`Rango ${rangoDeElo(elo).nombre}`}>
      <Svg width={tam} height={tam} viewBox="0 0 100 100">
        {piezas.map(dibujar)}
      </Svg>
    </View>
  );
}

export default memo(InsigniaRango);
