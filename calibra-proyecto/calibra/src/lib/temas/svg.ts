import type { Dibujo } from "./dibujos";

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
