// Rueda de ciudades de la presentación (RuedaCiudades.tsx): la matemática pura para
// girarla con el dedo, soltarla y que se detenga en una ciudad. El ángulo 0 es arriba
// (donde está la marca), y la ciudad i está en i * paso + giro.

export function paso(n: number): number {
  return 360 / n;
}

function modulo(a: number, n: number): number {
  return ((a % n) + n) % n;
}

// Qué ciudad queda arriba con este giro.
export function indiceArriba(giro: number, n: number): number {
  return modulo(Math.round(-giro / paso(n)), n);
}

// El giro múltiplo del paso más cercano (para frenar justo en una ciudad).
export function ajustar(giro: number, n: number): number {
  const p = paso(n);
  return Math.round(giro / p) * p;
}

// El giro que pone la ciudad i arriba dando la vuelta más corta desde el giro actual.
export function giroParaIndice(giroActual: number, i: number, n: number): number {
  const deseado = -i * paso(n);
  const diferencia = modulo(deseado - giroActual + 180, 360) - 180;
  return ajustar(giroActual + diferencia, n);
}

// Ángulo (en grados, 0 = arriba, sentido horario) de un punto respecto al centro.
export function anguloDesdeCentro(x: number, y: number, cx: number, cy: number): number {
  return (Math.atan2(x - cx, -(y - cy)) * 180) / Math.PI;
}

// Diferencia de ángulo entre dos lecturas, sin el salto de 180 a -180.
export function deltaAngulo(anterior: number, actual: number): number {
  return modulo(actual - anterior + 180, 360) - 180;
}

// Al soltar: adónde llega la rueda con la inercia del gesto (grados por milisegundo),
// ya ajustada a una ciudad. La inercia se limita a una vuelta y media.
export function destinoConInercia(giro: number, velocidad: number, n: number): number {
  const extra = Math.max(-540, Math.min(540, velocidad * 320));
  return ajustar(giro + extra, n);
}

// Color neón y glifo de cada ciudad: los mismos de la app (mobile/src/tema.ts).
export const NEON_MUNDO: Record<string, { neon: string; glifo: string }> = {
  numeria: { neon: "#9B85FF", glifo: "÷" },
  enigmia: { neon: "#2FD89B", glifo: "?" },
  geografia: { neon: "#3FC1D6", glifo: "◎" },
  quimia: { neon: "#E36BF2", glifo: "⚛" },
  anatomia: { neon: "#E0607E", glifo: "♥" },
  melodia: { neon: "#F2C14E", glifo: "♪" },
  trigonometria: { neon: "#A8E84A", glifo: "θ" },
  historia: { neon: "#E08A5C", glifo: "Ⅻ" },
  calculia: { neon: "#8A83FF", glifo: "∫" },
  circuitia: { neon: "#FFC247", glifo: "Ω" },
  estadistica: { neon: "#2DD4BF", glifo: "σ" },
  naipia: { neon: "#F25C5C", glifo: "♠" },
  codia: { neon: "#4FE0F5", glifo: "</>" },
  dinamia: { neon: "#60A5FA", glifo: "⇀" },
  vitalia: { neon: "#4ADE80", glifo: "✿" },
};

// Orden de encendido de las letras de un letrero: determinista (igual en el servidor
// y en el cliente) pero sin ir de izquierda a derecha, como un letrero real.
export function ordenEncendido(cantidad: number, semilla = 7): number[] {
  let s = semilla;
  const azar = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const orden = Array.from({ length: cantidad }, (_, i) => i);
  for (let i = cantidad - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [orden[i], orden[j]] = [orden[j], orden[i]];
  }
  const retraso = new Array<number>(cantidad);
  orden.forEach((letra, k) => {
    retraso[letra] = k;
  });
  return retraso;
}
