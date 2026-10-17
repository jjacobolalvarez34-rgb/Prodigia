import { useId } from "react";
import Svg, { ClipPath, Defs, G, LinearGradient, Path, RadialGradient, Rect, Circle, Stop } from "react-native-svg";
import { ilustracionPaquete, type Ilustracion } from "@/lib/tienda/ilustracionesPaquetes";

// Dibujo propio de cada paquete de la tienda (mismos datos que la web). Con
// `ilustracion` dibuja cualquier otra escena del mismo formato (p. ej. los anuncios).
export default function IlustracionPaquete({ item, ilustracion, tam = 64 }: { item?: string; ilustracion?: Ilustracion; tam?: number }) {
  const il = ilustracion ?? ilustracionPaquete(item ?? "");
  const id = useId().replace(/:/g, "");
  return (
    <Svg width={tam} height={tam} viewBox="0 0 64 64">
      <Defs>
        <LinearGradient id={`f${id}`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={il.fondo[0]} />
          <Stop offset="1" stopColor={il.fondo[1]} />
        </LinearGradient>
        <RadialGradient id={`h${id}`} cx="50%" cy="45%" r="50%">
          <Stop offset="0" stopColor={il.halo} stopOpacity={0.55} />
          <Stop offset="1" stopColor={il.halo} stopOpacity={0} />
        </RadialGradient>
        <ClipPath id={`c${id}`}>
          <Rect width="64" height="64" rx="14" />
        </ClipPath>
      </Defs>
      <G clipPath={`url(#c${id})`}>
        <Rect width="64" height="64" fill={`url(#f${id})`} />
        <Circle cx="32" cy="29" r="30" fill={`url(#h${id})`} />
        {il.formas.map((f, i) => (
          <Path key={i} d={f.d} fill={f.relleno ?? "none"} stroke={f.trazo} strokeWidth={f.ancho} strokeLinecap="round" strokeLinejoin="round" opacity={f.opacidad} />
        ))}
      </G>
      <Rect x="0.75" y="0.75" width="62.5" height="62.5" rx="13.5" fill="none" stroke="#FFFFFF" strokeOpacity={0.18} strokeWidth={1.5} />
    </Svg>
  );
}
