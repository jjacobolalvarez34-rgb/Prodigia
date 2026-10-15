// Cinemática de Prodigia Pro (2026-10-15: «más limpia y con más calidad, es una
// cinemática»). Una sola línea de tiempo, compartida por la web (canvas 2D) y la app
// (Skia): todo lo que se ve es una función del tiempo t en segundos, como un plano de
// cine, así se ve igual en cada aparato y nunca se desfasa.
//
//   0.0 – 1.8  hiperespacio: las estrellas pasan como rayas y aceleran
//   0.3 – 2.0  el logo llega desde el fondo, girando
//   1.8 – 3.3  carga de poder: tres anillos se cierran y chispas entran en espiral
//   3.3        estallido: destello, onda, rayos y partículas
//   3.5 – 5.6  título «PRODIGIA PRO» con un brillo que lo recorre
//
// Las funciones llevan "worklet" para correr en el hilo de la interfaz de la app; en la
// web esa línea no hace nada.

export const CINE = {
  llegaDesde: 0.3,
  llegaHasta: 2.0,
  cargaDesde: 1.8,
  estallido: 3.3,
  tituloDesde: 3.5,
  brilloTitulo: 4.4,
  fin: 5.6,
} as const;

export const COLORES_CINE = { violeta: "#7C5CFF", violetaClaro: "#A794FF", oro: "#FFC53D", cian: "#5DE4FF", arena: "#E4CBA0", fondo: "#03040A" } as const;

// La chispa de 4 puntas del logo (viewBox 24, centro 12,12).
export const CAMINO_CHISPA = "M12 1.5c.6 5 2.4 7.6 9.5 10.5-7.1 2.9-8.9 5.5-9.5 10.5-.6-5-2.4-7.6-9.5-10.5C9.6 9.1 11.4 6.5 12 1.5z";

export function limitar(x: number, a = 0, b = 1): number {
  "worklet";
  return Math.min(b, Math.max(a, x));
}

// Avance 0..1 de un tramo [desde, hasta].
export function tramo(t: number, desde: number, hasta: number): number {
  "worklet";
  return limitar((t - desde) / (hasta - desde));
}

export function salidaCubica(x: number): number {
  "worklet";
  return 1 - (1 - x) * (1 - x) * (1 - x);
}

export function entradaSalida(x: number): number {
  "worklet";
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

// Velocidad del hiperespacio: arranca, acelera, frena en la carga y casi se detiene al estallar.
export function velocidadEstrellas(t: number): number {
  "worklet";
  if (t < 1.4) return 0.25 + 2.6 * entradaSalida(tramo(t, 0, 1.4));
  if (t < CINE.estallido) return 2.85 - 2.2 * entradaSalida(tramo(t, 1.4, CINE.estallido));
  return 0.65 * (1 - tramo(t, CINE.estallido, CINE.estallido + 0.6)) + 0.12;
}

// Distancia recorrida hasta t (integral de la velocidad), tabulada cada 10 ms.
export function tablaRecorrido(): number[] {
  const paso = 0.01;
  const tabla = [0];
  for (let i = 1; i <= Math.ceil((CINE.fin + 2) / paso); i++) tabla.push(tabla[i - 1] + velocidadEstrellas(i * paso) * paso);
  return tabla;
}

export function recorrido(tabla: number[], t: number): number {
  "worklet";
  const x = Math.max(0, t) / 0.01;
  const i = Math.floor(x);
  if (i >= tabla.length - 1) return tabla[tabla.length - 1] + (x - (tabla.length - 1)) * 0.01 * velocidadEstrellas(t);
  return tabla[i] + (tabla[i + 1] - tabla[i]) * (x - i);
}

export interface EstrellaCine {
  x: number;
  y: number;
  z: number;
  tono: number;
}

// Campo de estrellas fijo (semilla): dirección desde el centro y profundidad inicial.
export function crearEstrellasCine(cantidad = 170): EstrellaCine[] {
  let s = 20261015;
  const azar = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  return Array.from({ length: cantidad }, () => {
    const a = azar() * Math.PI * 2;
    const r = 0.08 + azar() * 0.95;
    return { x: Math.cos(a) * r, y: Math.sin(a) * r, z: azar(), tono: azar() };
  });
}

// Posición del logo: llega desde el fondo (escala chica, abajo a la izquierda) en una
// curva suave, tiembla en la carga y, después del estallido, sube para dejarle lugar al título.
export function logoEn(t: number): { x: number; y: number; escala: number; giro: number; brillo: number; opacidad: number } {
  "worklet";
  const llegada = salidaCubica(tramo(t, CINE.llegaDesde, CINE.llegaHasta));
  const carga = tramo(t, CINE.cargaDesde, CINE.estallido);
  const despues = salidaCubica(tramo(t, CINE.estallido + 0.15, CINE.tituloDesde + 0.6));
  const temblor = carga * carga * 3;
  const x = -0.55 * (1 - llegada) + Math.sin(t * 61) * temblor * 0.004;
  const y = 0.35 * (1 - llegada) * (1 - llegada) + Math.cos(t * 53) * temblor * 0.004 - 0.17 * despues;
  const escala = (0.06 + 0.94 * llegada) * (1 + 0.12 * carga) * (1 - 0.32 * despues);
  const giro = (1 - llegada) * -2.4 + Math.sin(t * 1.3) * 0.04;
  const brillo = 0.25 + 0.75 * carga + 0.6 * (t >= CINE.estallido ? 1 - tramo(t, CINE.estallido, CINE.estallido + 1.2) : 0);
  return { x, y, escala, giro, brillo, opacidad: limitar(llegada * 4) };
}

// Los tres anillos de energía: radio relativo (1 = lejos, 0 = sobre el logo) y opacidad.
export function anilloEn(t: number, i: number): { radio: number; opacidad: number } {
  "worklet";
  const desde = CINE.cargaDesde + i * 0.38;
  const p = tramo(t, desde, desde + 0.95);
  if (p <= 0 || p >= 1) return { radio: 1, opacidad: 0 };
  return { radio: 1 - p * p, opacidad: Math.sin(p * Math.PI) };
}

// Destello del estallido (0..1).
export function destelloEn(t: number): number {
  "worklet";
  if (t < CINE.estallido) return 0;
  const p = t - CINE.estallido;
  return p < 0.08 ? p / 0.08 : Math.max(0, 1 - (p - 0.08) / 0.55);
}

// Onda del estallido: avance 0..1.
export function ondaEn(t: number): number {
  "worklet";
  return tramo(t, CINE.estallido, CINE.estallido + 0.9);
}

// Rayos detrás del título.
export function rayosEn(t: number): number {
  "worklet";
  return 0.85 * salidaCubica(tramo(t, CINE.estallido, CINE.estallido + 0.5)) - 0.35 * tramo(t, CINE.estallido + 0.8, CINE.fin);
}

// La app dibuja en el hilo de la interfaz: en vez de llamar estas funciones desde ahí,
// recibe la línea de tiempo ya muestreada cada 10 ms (solo números) e interpola.
export interface CinematicaMuestreada {
  paso: number;
  logoX: number[];
  logoY: number[];
  logoEscala: number[];
  logoGiro: number[];
  logoBrillo: number[];
  logoOpacidad: number[];
  anilloRadio: number[][];
  anilloOpacidad: number[][];
  destello: number[];
  onda: number[];
  rayos: number[];
  recorrido: number[];
}

export function muestrearCinematica(paso = 0.01): CinematicaMuestreada {
  const tabla = tablaRecorrido();
  const n = Math.ceil((CINE.fin + 1) / paso) + 1;
  const m: CinematicaMuestreada = { paso, logoX: [], logoY: [], logoEscala: [], logoGiro: [], logoBrillo: [], logoOpacidad: [], anilloRadio: [[], [], []], anilloOpacidad: [[], [], []], destello: [], onda: [], rayos: [], recorrido: [] };
  for (let i = 0; i < n; i++) {
    const t = i * paso;
    const l = logoEn(t);
    m.logoX.push(l.x);
    m.logoY.push(l.y);
    m.logoEscala.push(l.escala);
    m.logoGiro.push(l.giro);
    m.logoBrillo.push(l.brillo);
    m.logoOpacidad.push(l.opacidad);
    for (let k = 0; k < 3; k++) {
      const a = anilloEn(t, k);
      m.anilloRadio[k].push(a.radio);
      m.anilloOpacidad[k].push(a.opacidad);
    }
    m.destello.push(destelloEn(t));
    m.onda.push(ondaEn(t));
    m.rayos.push(Math.max(0, rayosEn(t)));
    m.recorrido.push(recorrido(tabla, t));
  }
  return m;
}

// Partículas del estallido, siempre las mismas (semilla): ángulo, velocidad (px/s),
// tamaño, vida (s) y color.
export function crearEstallidoCine(cantidad = 120): { a: number; v: number; tam: number; vida: number; color: string }[] {
  let s = 77;
  const azar = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const colores = [COLORES_CINE.oro, COLORES_CINE.cian, COLORES_CINE.violetaClaro, "#FFFFFF"];
  return Array.from({ length: cantidad }, (_, i) => ({ a: azar() * Math.PI * 2, v: 260 + azar() * 620, tam: 2 + azar() * 4.5, vida: 1.1 + azar() * 1.1, color: colores[i % colores.length] }));
}
