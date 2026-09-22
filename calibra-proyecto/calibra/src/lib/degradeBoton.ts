// Degradé cálido para el botón "primario" de src/components/Boton.tsx.
//
// Antes: `linear-gradient(120deg, colorHex, #FFC53D)` (o
// `var(--primario), var(--logro)` sin colorHex) — un degradé plano de 2
// paradas que SIEMPRE terminaba en el mismo amarillo dorado, sin importar
// el mundo. Resultado: los botones "Continuar"/"Practicar"/"Guardar" de las
// 13 ciudades se veían todos iguales, "morado con amarillo", con pinta de
// plantilla genérica de IA.
//
// Ahora: degradé de 3 paradas, cálido y con varios tonos (inspirado en la
// referencia del usuario: naranja → magenta → violeta), donde el color
// propio del mundo (si lo hay) sigue siendo la primera parada / protagonista
// y las otras dos se derivan mezclándolo hacia rosa y naranja cálidos. Cada
// parada se recalcula para cumplir WCAG AA (≥4.5:1 contra texto blanco) —
// ver degradeBoton.test.ts, que lo verifica para los 13 colores de
// src/lib/mundos.ts y para el degradé por defecto.

interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB {
  const limpio = hex.replace("#", "");
  const completo = limpio.length === 3 ? limpio.split("").map((c) => c + c).join("") : limpio;
  const num = parseInt(completo, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex({ r, g, b }: RGB): string {
  const c = (v: number) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hue2rgb(p: number, q: number, t: number): number {
  let tt = t;
  if (tt < 0) tt += 1;
  if (tt > 1) tt -= 1;
  if (tt < 1 / 6) return p + (q - p) * 6 * tt;
  if (tt < 1 / 2) return q;
  if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
  return p;
}

function hslToRgb({ h, s, l }: HSL): RGB {
  const hn = h / 360;
  const sn = s / 100;
  const ln = l / 100;
  if (sn === 0) {
    const v = ln * 255;
    return { r: v, g: v, b: v };
  }
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  return {
    r: hue2rgb(p, q, hn + 1 / 3) * 255,
    g: hue2rgb(p, q, hn) * 255,
    b: hue2rgb(p, q, hn - 1 / 3) * 255,
  };
}

/** Mezcla lineal de dos colores hex; t=0 → hexA, t=1 → hexB. */
export function mixHex(hexA: string, hexB: string, t: number): string {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  return rgbToHex({
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  });
}

function canalSRGB(v: number): number {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminanciaRelativa(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * canalSRGB(r) + 0.7152 * canalSRGB(g) + 0.0722 * canalSRGB(b);
}

/** Relación de contraste WCAG entre `hex` y blanco puro (#fff). */
export function contrasteConBlanco(hex: string): number {
  const L = luminanciaRelativa(hex);
  return (1 + 0.05) / (L + 0.05);
}

/**
 * Oscurece `hex` en HSL (conservando matiz y saturación, así el color
 * sigue siendo "el mismo" solo que más oscuro) hasta alcanzar `objetivo`
 * de contraste contra blanco. Si ya lo cumple, se devuelve sin cambios.
 */
function asegurarContraste(hex: string, objetivo = 4.5): string {
  const hsl = rgbToHsl(hexToRgb(hex));
  let candidato = hex;
  let guardia = 0;
  while (contrasteConBlanco(candidato) < objetivo && hsl.l > 2 && guardia < 200) {
    hsl.l -= 1;
    candidato = rgbToHex(hslToRgb(hsl));
    guardia++;
  }
  return candidato;
}

// Paradas cálidas fijas hacia las que se mezcla cualquier color de mundo:
// rosa/magenta vívido y naranja vívido — el mismo espíritu cálido de la
// placa de referencia (naranja → magenta → violeta), en vez del amarillo
// plano `#FFC53D` que repetía la misma paleta en todos lados.
const ROSA_CALIDO = "#E23FA6";
const NARANJA_CALIDO = "#FF7A29";

/**
 * Degradé de 3 paradas para un mundo con `colorHex` propio (ej. Calculia
 * índigo, Circuitia ámbar...): el color del mundo es la primera parada
 * (protagonista, identidad de la ciudad intacta); las otras dos se derivan
 * mezclándolo hacia rosa y naranja cálidos. Cada parada se ajusta por
 * separado para cumplir contraste AA contra texto blanco.
 */
export function degradeCalidoMundo(colorHex: string): [string, string, string] {
  return [
    asegurarContraste(colorHex),
    asegurarContraste(mixHex(colorHex, ROSA_CALIDO, 0.5)),
    asegurarContraste(mixHex(colorHex, NARANJA_CALIDO, 0.72)),
  ];
}

// Degradé por defecto (botones "primario" sin colorHex propio: onboarding,
// tienda, social, admin, formularios...). Primera parada = tono de marca
// (`--primario` claro, #6C4CF1 — ya cumple contraste de sobra en ambos
// temas, por eso se fija como literal en vez de `var(--primario)`: así el
// degradé completo es una sola constante calculable/testeable, y el matiz
// no cambia de forma notoria entre claro/oscuro). Igual que en los mundos,
// las otras dos paradas se derivan hacia rosa/naranja cálido.
const PRIMARIO_MARCA = "#6C4CF1";

export const DEGRADE_PRIMARIO_DEFAULT: [string, string, string] = [
  asegurarContraste(PRIMARIO_MARCA),
  asegurarContraste(mixHex(PRIMARIO_MARCA, ROSA_CALIDO, 0.55)),
  asegurarContraste(mixHex(PRIMARIO_MARCA, NARANJA_CALIDO, 0.75)),
];

/** Las 3 paradas del degradé (sin armar el string de CSS todavía). */
export function paradasPrimario(colorHex?: string): [string, string, string] {
  return colorHex ? degradeCalidoMundo(colorHex) : DEGRADE_PRIMARIO_DEFAULT;
}

/** Arma el `linear-gradient(...)` completo para el fondo del botón "primario". */
export function gradientePrimario(colorHex?: string): string {
  const [s1, s2, s3] = paradasPrimario(colorHex);
  return `linear-gradient(120deg, ${s1}, ${s2} 55%, ${s3})`;
}

// Pedido en vivo (2026-09-22): "no me gustó [el degradé] — prefiero el
// mismo diseño de bordes [el recorte de InsigniaCorte], pero con un
// color que no tenga ese degradado". El botón primario (con o sin
// `destacado`) pasa a un color SÓLIDO — la misma primera parada del
// degradé de arriba (el color del mundo, o la marca por defecto, ya
// ajustado a contraste AA contra texto blanco), sin mezclar hacia
// rosa/naranja. `gradientePrimario`/`paradasPrimario` quedan (BorderGlow
// todavía usa 3 tonos para el halo detrás del botón destacado).
export function colorSolidoPrimario(colorHex?: string): string {
  return paradasPrimario(colorHex)[0];
}
