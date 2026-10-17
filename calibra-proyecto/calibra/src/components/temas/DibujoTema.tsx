import type { Dibujo } from "@/lib/temas/dibujos";

// Dibuja un dibujo de las festividades (src/lib/temas/dibujos.ts). `color` cambia el
// color de la primera forma (para las partículas de varios colores).
export default function DibujoTema({ dibujo, className, color, style }: { dibujo: Dibujo; className?: string; color?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox={`0 0 ${dibujo.ancho} ${dibujo.alto}`} className={className} style={style} aria-hidden="true">
      {dibujo.formas.map((f, i) => (
        <path
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
    </svg>
  );
}

export { svgDeDibujo } from "@/lib/temas/svg";
