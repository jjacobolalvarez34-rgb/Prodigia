import Svg, { Path } from "react-native-svg";
import type { Dibujo } from "@/lib/temas/dibujos";

// Dibuja un dibujo de las festividades (src/lib/temas/dibujos.ts, igual que la web).
// `color` cambia el color de la primera forma.
export default function DibujoTema({ dibujo, ancho, color }: { dibujo: Dibujo; ancho: number; color?: string }) {
  const alto = (ancho * dibujo.alto) / dibujo.ancho;
  return (
    <Svg width={ancho} height={alto} viewBox={`0 0 ${dibujo.ancho} ${dibujo.alto}`}>
      {dibujo.formas.map((f, i) => (
        <Path
          key={i}
          d={f.d}
          fill={i === 0 && color && f.relleno ? color : (f.relleno ?? "none")}
          stroke={i === 0 && color && f.trazo && !f.relleno ? color : f.trazo}
          strokeWidth={f.ancho}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={f.opacidad}
        />
      ))}
    </Svg>
  );
}
