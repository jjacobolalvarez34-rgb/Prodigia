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

// El mismo dibujo como texto SVG (para convertirlo en imagen y estamparlo en un canvas).
export function svgDeDibujo(dibujo: Dibujo, color?: string, escala = 2): string {
  const formas = dibujo.formas
    .map((f, i) => {
      const relleno = i === 0 && color && f.relleno ? color : (f.relleno ?? "none");
      const trazo = i === 0 && color && f.trazo && !f.relleno ? color : f.trazo;
      return `<path d="${f.d}" fill="${relleno}"${trazo ? ` stroke="${trazo}" stroke-width="${f.ancho ?? 1}" stroke-linecap="round" stroke-linejoin="round"` : ""}${f.opacidad != null ? ` opacity="${f.opacidad}"` : ""}/>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${dibujo.ancho * escala}" height="${dibujo.alto * escala}" viewBox="0 0 ${dibujo.ancho} ${dibujo.alto}">${formas}</svg>`;
}
