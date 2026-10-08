// Formas que se repiten en las escenas (flechas con etiqueta, reglas, bloques).
import { puntaFlecha, r, type ColorDibujo, type Primitiva } from "./primitivas";

export function flecha(x1: number, y1: number, x2: number, y2: number, color: ColorDibujo, etiqueta?: string, ancho = 3): Primitiva[] {
  const largo = Math.hypot(x2 - x1, y2 - y1);
  if (largo < 1) return [];
  const out: Primitiva[] = [
    { t: "linea", x1: r(x1), y1: r(y1), x2: r(x2), y2: r(y2), stroke: color, sw: ancho },
    { t: "camino", d: puntaFlecha(x1, y1, x2, y2, Math.min(10, largo * 0.45), Math.min(6, largo * 0.3)), fill: color },
  ];
  if (etiqueta) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const nx = -dy / largo;
    const ny = dx / largo;
    const lado = ny > 0.3 ? -1 : 1;
    out.push({ t: "texto", x: r(x2 + nx * 10 * lado + dx * 0.08), y: r(y2 + ny * 10 * lado + dy * 0.08 + 4), s: etiqueta, size: 10, fill: color, anchor: dx < -0.5 ? "end" : dx > 0.5 ? "start" : "middle", bold: true });
  }
  return out;
}

// Regla horizontal de x0 a x1 (píxeles) que representa 0..largo (unidades).
export function reglaHorizontal(x0: number, x1: number, y: number, largo: number, paso: number, unidad: string): Primitiva[] {
  const out: Primitiva[] = [{ t: "linea", x1: x0, y1: y, x2: x1, y2: y, stroke: "texto2", sw: 1.5 }];
  for (let v = 0; v <= largo + 1e-9; v += paso) {
    const x = r(x0 + ((x1 - x0) * v) / largo);
    out.push({ t: "linea", x1: x, y1: y, x2: x, y2: y + 5, stroke: "texto2", sw: 1 });
    out.push({ t: "texto", x, y: y + 16, s: `${Math.round(v * 100) / 100}`.replace(".", ","), size: 9, fill: "texto2", anchor: "middle" });
  }
  out.push({ t: "texto", x: x1, y: y - 4, s: unidad, size: 9, fill: "texto2", anchor: "end", bold: true });
  return out;
}

export function bloque(cx: number, cy: number, lado: number, color: ColorDibujo, texto?: string, rot = 0): Primitiva[] {
  const a = (rot * Math.PI) / 180;
  const h = lado / 2;
  const esq = [
    [-h, -h],
    [h, -h],
    [h, h],
    [-h, h],
  ].map(([x, y]) => `${r(cx + x * Math.cos(a) - y * Math.sin(a))} ${r(cy + x * Math.sin(a) + y * Math.cos(a))}`);
  const out: Primitiva[] = [{ t: "camino", d: `M${esq.join(" L")} Z`, fill: color, op: 0.85, stroke: "texto", sw: 1.2 }];
  if (texto) out.push({ t: "texto", x: r(cx), y: r(cy + 4), s: texto, size: 10, fill: "#FFFFFF", anchor: "middle", bold: true });
  return out;
}

export function texto(x: number, y: number, s: string, opciones: { size?: number; fill?: ColorDibujo; anchor?: "start" | "middle" | "end"; bold?: boolean } = {}): Primitiva {
  return { t: "texto", x: r(x), y: r(y), s, size: opciones.size ?? 10, fill: opciones.fill ?? "texto", anchor: opciones.anchor ?? "middle", bold: opciones.bold };
}

// Barra vertical con nombre y valor (energías, presiones…).
export function barra(x: number, base: number, alto: number, maxAlto: number, color: ColorDibujo, nombre: string, valor: string): Primitiva[] {
  const h = Math.max(0, Math.min(maxAlto, alto));
  return [
    { t: "rect", x: r(x - 12), y: r(base - maxAlto), w: 24, h: maxAlto, r: 4, stroke: "borde", sw: 1 },
    { t: "rect", x: r(x - 12), y: r(base - h), w: 24, h: r(h), r: 4, fill: color, op: 0.85 },
    texto(x, base + 12, nombre, { size: 9, fill: "texto2", bold: true }),
    texto(x, base - h - 4, valor, { size: 9, fill: color, bold: true }),
  ];
}
