// Mundo Dinamia (Física, mundo 14). Seis modos con niveles 1 a 10 cada uno
// (docs/PLAN_MUNDOS_FISICA_BIOLOGIA.md §2). Electricidad no: es de Circuitia.
//
// Reglas de todo el archivo:
//  1. Cada pregunta arma sus datos y calcula la respuesta de esos mismos datos;
//     nunca hay una respuesta escrita a mano.
//  2. La gravedad siempre está en el enunciado: g = 10 m/s² hasta el nivel 6
//     (cuentas de cabeza) y 9,8 m/s² desde el 7.
//  3. Si la respuesta no es exacta con 1 decimal, el enunciado pide redondear a
//     1 decimal y se acepta ±0,05. Los números se escriben con coma decimal.
//  4. Senos y cosenos que no son exactos se dan en el enunciado
//     (sen 30° = 0,5; cos 30° = sen 60° ≈ 0,87; sen 45° = cos 45° ≈ 0,71).

import { armarOpciones, clamp, conRngSembrado, elegir, elegirPonderado, mezclar, randomInt } from "@/lib/estadistica/util";
import type { DiagramaDinamia, ModoDinamia, ProblemaDinamia, ProblemaDinamiaNumero, ProblemaDinamiaOpciones } from "@/lib/dinamia/tipos";

export { DESCRIPCION_MODO_DINAMIA, MODOS_DINAMIA, NOMBRE_MODO_DINAMIA, SIMBOLO_MODO_DINAMIA } from "@/lib/dinamia/tipos";
export type { DiagramaDinamia, ModoDinamia, ProblemaDinamia, ProblemaDinamiaNumero, ProblemaDinamiaOpciones } from "@/lib/dinamia/tipos";
export { conRngSembrado };

// ---------- Formato ----------

// Número con coma decimal y a lo sumo `dec` decimales, sin ceros de más.
export function f(n: number, dec = 2): string {
  const p = 10 ** dec;
  const r = Math.round(n * p + (n >= 0 ? 1e-9 : -1e-9)) / p;
  if (Object.is(r, -0) || r === 0) return "0";
  return String(r).replace(".", ",");
}

const SEN: Record<number, number> = { 30: 0.5, 45: 0.71, 60: 0.87 };
const COS: Record<number, number> = { 30: 0.87, 45: 0.71, 60: 0.5 };
const DATO_TRIG: Record<number, string> = {
  30: "sen 30° = 0,5 y cos 30° = 0,87",
  45: "sen 45° = cos 45° = 0,71",
  60: "sen 60° = 0,87 y cos 60° = 0,5",
};

function gDe(nivel: number): number {
  return nivel >= 7 ? 9.8 : 10;
}
function textoG(g: number): string {
  return `Usa g = ${f(g)} m/s².`;
}

function exacto1(n: number): boolean {
  return Math.abs(n * 10 - Math.round(n * 10)) < 1e-6;
}

type Params = Record<string, number | string>;

function num(modo: ModoDinamia, tipo: string, enunciado: string, raw: number, opts?: { params?: Params; diagrama?: DiagramaDinamia }): ProblemaDinamiaNumero {
  const limpio = exacto1(raw);
  const respuesta = Math.round(raw * 10 + (raw >= 0 ? 1e-9 : -1e-9)) / 10;
  return {
    modo,
    entrada: "numero",
    enunciado: limpio ? enunciado : `${enunciado} Redondea a 1 decimal.`,
    respuesta,
    tolerancia: limpio ? (Number.isInteger(respuesta) ? 0 : 0.01) : 0.051,
    diagrama: opts?.diagrama,
    detalle: { tipo, params: opts?.params },
  };
}

function opc(modo: ModoDinamia, tipo: string, enunciado: string, correcta: string, distractores: string[], diagrama?: DiagramaDinamia): ProblemaDinamiaOpciones {
  return { modo, entrada: "opciones", enunciado, opciones: armarOpciones(correcta, distractores).slice(0, 4), respuesta: correcta, diagrama, detalle: { tipo } };
}

// Asegura que la correcta quede entre las 4 opciones (armarOpciones mezcla).
function cuatro(p: ProblemaDinamiaOpciones): ProblemaDinamiaOpciones {
  if (p.opciones.includes(p.respuesta)) return p;
  const otras = p.opciones.filter((o) => o !== p.respuesta).slice(0, 3);
  return { ...p, opciones: mezclar([p.respuesta, ...otras]) };
}

function preguntaBanco(modo: ModoDinamia, tipo: string, banco: readonly { q: string; ok: string; no: readonly string[] }[]): ProblemaDinamiaOpciones {
  const b = elegir(banco);
  return cuatro(opc(modo, tipo, b.q, b.ok, mezclar(b.no).slice(0, 3)));
}

// ============================================================
// 1) Cinemática
// ============================================================

function cinematica(nivel: number): ProblemaDinamia {
  const n = clamp(nivel, 1, 10);
  const tipo = elegirPonderado(
    [
      ["mru", 1],
      ["kmh", 1],
      ["encuentro", 3],
      ["grafica_xt", 3],
      ["mrua_v", 5],
      ["mrua_d", 5],
      ["frenado", 6],
      ["caida", 7],
      ["vertical", 7],
      ["parabolico", 9],
      ["grafica_vt", 9],
    ] as const,
    n
  );
  const M: ModoDinamia = "cinematica";
  const g = gDe(n);
  switch (tipo) {
    case "mru": {
      const v = randomInt(2, 30);
      const t = randomInt(2, 20);
      const que = elegir(["d", "t", "v"] as const);
      if (que === "d") return num(M, "mru_d", `Un auto va a velocidad constante de ${v} m/s durante ${t} s. ¿Cuántos metros recorre?`, v * t);
      if (que === "t") return num(M, "mru_t", `Una ciclista va a ${v} m/s constantes. ¿Cuántos segundos tarda en recorrer ${v * t} m?`, t);
      return num(M, "mru_v", `Un tren recorre ${v * t} m en ${t} s a velocidad constante. ¿Cuál es su velocidad en m/s?`, v);
    }
    case "kmh": {
      const ms = randomInt(1, 12) * 5;
      const kmh = ms * 3.6;
      if (elegir([true, false])) return num(M, "kmh_ms", `Un auto va a ${f(kmh)} km/h. ¿Cuánto es eso en m/s?`, ms);
      return num(M, "ms_kmh", `Un guepardo corre a ${ms} m/s. ¿Cuánto es eso en km/h?`, kmh);
    }
    case "encuentro": {
      const v1 = randomInt(5, 25);
      const v2 = randomInt(5, 25);
      const t = randomInt(4, 30);
      if (elegir([true, false])) {
        const d = (v1 + v2) * t;
        return num(M, "encuentro", `Dos autos están a ${d} m y van uno hacia el otro, a ${v1} m/s y a ${v2} m/s. ¿A los cuántos segundos se encuentran?`, t);
      }
      const rapido = Math.max(v1, v2) + 2;
      const lento = Math.min(v1, v2);
      const d = (rapido - lento) * t;
      return num(M, "persecucion", `Una moto a ${rapido} m/s persigue a un camión que va a ${lento} m/s y está ${d} m adelante. ¿Cuántos segundos tarda en alcanzarlo?`, t);
    }
    case "grafica_xt": {
      const x0 = randomInt(0, 4) * 10;
      const T = elegir([2, 4, 5, 10]);
      const v = elegir([-4, -2, 2, 3, 4, 5, 6, 8]);
      const x1 = x0 + v * T;
      if (x1 < 0) return cinematica(n);
      return num(M, "grafica_xt", `La gráfica muestra la posición de un móvil con el tiempo. ¿Cuál es su velocidad en m/s? (Si se mueve hacia atrás, es negativa.)`, v, {
        diagrama: { tipo: "grafica", eje: "x-t", puntos: [[0, x0], [T, x1]] },
      });
    }
    case "mrua_v": {
      const v0 = randomInt(0, 20);
      const a = randomInt(1, 6);
      const t = randomInt(2, 12);
      return num(M, "mrua_v", `Un auto sale con ${v0} m/s y acelera a ${a} m/s² durante ${t} s. ¿Qué velocidad tiene al final, en m/s?`, v0 + a * t);
    }
    case "mrua_d": {
      const v0 = randomInt(0, 15);
      const a = elegir([2, 4, 6]);
      const t = randomInt(2, 10);
      return num(M, "mrua_d", `Una moto parte con ${v0} m/s y acelera a ${a} m/s² durante ${t} s. ¿Cuántos metros recorre en ese tiempo?`, v0 * t + 0.5 * a * t * t);
    }
    case "frenado": {
      const a = elegir([2, 4, 5, 8]);
      const t = randomInt(2, 8);
      const v0 = a * t;
      if (elegir([true, false])) return num(M, "frenado_t", `Un auto va a ${v0} m/s y frena con ${a} m/s² de desaceleración. ¿Cuántos segundos tarda en detenerse?`, t);
      return num(M, "frenado_d", `Un auto va a ${v0} m/s y frena con ${a} m/s² de desaceleración. ¿Cuántos metros recorre hasta detenerse?`, (v0 * v0) / (2 * a));
    }
    case "caida": {
      const t = randomInt(1, 5);
      if (elegir([true, false])) return num(M, "caida_h", `Sueltas una piedra desde un puente y tarda ${t} s en llegar al agua. ¿Desde qué altura cayó, en metros? ${textoG(g)}`, 0.5 * g * t * t);
      return num(M, "caida_v", `Una pelota cae libre durante ${t} s. ¿Con qué velocidad llega al piso, en m/s? ${textoG(g)}`, g * t);
    }
    case "vertical": {
      const k = randomInt(1, 4);
      const v0 = g * k;
      const que = elegir(["subida", "altura", "vuelo"] as const);
      if (que === "subida") return num(M, "vertical_t", `Lanzas una pelota hacia arriba a ${f(v0)} m/s. ¿Cuántos segundos tarda en llegar a lo más alto? ${textoG(g)}`, k);
      if (que === "vuelo") return num(M, "vertical_vuelo", `Lanzas una pelota hacia arriba a ${f(v0)} m/s y la atrapas a la misma altura. ¿Cuántos segundos estuvo en el aire? ${textoG(g)}`, 2 * k);
      return num(M, "vertical_h", `Lanzas una pelota hacia arriba a ${f(v0)} m/s. ¿Qué altura máxima alcanza, en metros? ${textoG(g)}`, (v0 * v0) / (2 * g));
    }
    case "parabolico": {
      const ang = elegir([30, 45, 60]);
      const v0 = elegir([10, 20, 30]);
      const gg = 10;
      const vy = v0 * SEN[ang];
      const vx = v0 * COS[ang];
      const T = (2 * vy) / gg;
      const que = elegir(["alcance", "tiempo", "altura"] as const);
      const base = `Lanzas una pelota a ${v0} m/s con un ángulo de ${ang}° sobre el piso (${DATO_TRIG[ang]}). Usa g = 10 m/s².`;
      if (que === "tiempo") return num(M, "parabolico_t", `${base} ¿Cuántos segundos está en el aire?`, T);
      if (que === "altura") return num(M, "parabolico_h", `${base} ¿Qué altura máxima alcanza, en metros?`, (vy * vy) / (2 * gg));
      return num(M, "parabolico_r", `${base} ¿A cuántos metros cae (alcance)?`, vx * T);
    }
    case "grafica_vt": {
      const v = elegir([4, 6, 8, 10]);
      const t1 = elegir([2, 4]);
      const t2 = t1 + elegir([2, 4, 6]);
      const d = 0.5 * v * t1 + v * (t2 - t1);
      return num(M, "grafica_vt", `La gráfica muestra la velocidad de un auto: acelera desde 0 y después sigue a velocidad constante. ¿Cuántos metros recorre en total? (La distancia es el área bajo la gráfica.)`, d, {
        diagrama: { tipo: "grafica", eje: "v-t", puntos: [[0, 0], [t1, v], [t2, v]] },
      });
    }
  }
}

// ============================================================
// 2) Vectores
// ============================================================

const TERNAS = [
  [3, 4, 5],
  [6, 8, 10],
  [5, 12, 13],
  [8, 6, 10],
  [4, 3, 5],
  [9, 12, 15],
] as const;

const MAGNITUDES = [
  { nombre: "la masa de una mochila", tipo: "Escalar" },
  { nombre: "la velocidad de un avión hacia el norte", tipo: "Vectorial" },
  { nombre: "la temperatura de una sopa", tipo: "Escalar" },
  { nombre: "la fuerza con que empujas una puerta", tipo: "Vectorial" },
  { nombre: "el tiempo de una carrera", tipo: "Escalar" },
  { nombre: "el desplazamiento de 3 km al este", tipo: "Vectorial" },
  { nombre: "la energía de una pila", tipo: "Escalar" },
  { nombre: "el peso de una caja", tipo: "Vectorial" },
  { nombre: "el volumen de una botella", tipo: "Escalar" },
  { nombre: "la aceleración de un auto que frena", tipo: "Vectorial" },
] as const;

function vectores(nivel: number): ProblemaDinamia {
  const n = clamp(nivel, 1, 10);
  const M: ModoDinamia = "vectores";
  const tipo = elegirPonderado(
    [
      ["escalar", 1],
      ["colineal", 1],
      ["cuadricula", 3],
      ["componentes", 5],
      ["resta", 7],
      ["angulo", 7],
      ["equilibrante", 9],
      ["escalar_prod", 9],
    ] as const,
    n
  );
  switch (tipo) {
    case "escalar": {
      const m = elegir(MAGNITUDES);
      return opc(M, "escalar_vectorial", `¿${m.nombre[0].toUpperCase()}${m.nombre.slice(1)} es una magnitud escalar o vectorial?`, m.tipo, [m.tipo === "Escalar" ? "Vectorial" : "Escalar"]);
    }
    case "colineal": {
      const a = randomInt(2, 20);
      const b = randomInt(2, 20);
      if (a === b) return vectores(n);
      return num(M, "colineal", `Sobre una caja tiran ${a} N hacia la derecha y ${b} N hacia la izquierda. ¿Cuál es la fuerza resultante, en N? (Hacia la derecha es positivo.)`, a - b);
    }
    case "cuadricula": {
      const [rx, ry, r] = elegir(TERNAS);
      const sx = elegir([1, -1]);
      const sy = elegir([1, -1]);
      const ax = randomInt(-4, 4);
      const ay = randomInt(-4, 4);
      const A = { x: ax, y: ay };
      const B = { x: sx * rx - ax, y: sy * ry - ay };
      if ((A.x === 0 && A.y === 0) || (B.x === 0 && B.y === 0)) return vectores(n);
      return num(M, "suma_modulo", `Suma los vectores A = (${A.x}, ${A.y}) y B = (${B.x}, ${B.y}). ¿Cuánto mide la resultante?`, r, {
        diagrama: { tipo: "vectores", vectores: [{ nombre: "A", ...A }, { nombre: "B", ...B }] },
      });
    }
    case "componentes": {
      const F = randomInt(1, 10) * 10;
      const ang = elegir([30, 45, 60]);
      const eje = elegir(["x", "y"] as const);
      const valor = eje === "x" ? F * COS[ang] : F * SEN[ang];
      return num(M, `componente_${eje}`, `Una fuerza de ${F} N forma ${ang}° con el eje x (${DATO_TRIG[ang]}). ¿Cuánto vale su componente en ${eje}, en N?`, valor);
    }
    case "resta": {
      const [rx, ry, r] = elegir(TERNAS);
      const bx = randomInt(-5, 5);
      const by = randomInt(-5, 5);
      const A = { x: rx + bx, y: ry + by };
      const B = { x: bx, y: by };
      if (B.x === 0 && B.y === 0) return vectores(n);
      return num(M, "resta_modulo", `Con A = (${A.x}, ${A.y}) y B = (${B.x}, ${B.y}), ¿cuánto mide A − B?`, r, {
        diagrama: { tipo: "vectores", vectores: [{ nombre: "A", ...A }, { nombre: "B", ...B }] },
      });
    }
    case "angulo": {
      const ang = elegir([30, 45, 60]);
      const R = elegir([10, 20]);
      const x = R * COS[ang];
      const y = R * SEN[ang];
      return opc(M, "angulo", `Un vector tiene componentes (${f(x)}, ${f(y)}). ¿Qué ángulo forma con el eje x? (${DATO_TRIG[ang]})`, `${ang}°`, ["30°", "45°", "60°", "90°"].filter((o) => o !== `${ang}°`));
    }
    case "equilibrante": {
      const F1 = { x: randomInt(-9, 9), y: randomInt(-9, 9) };
      const F2 = { x: randomInt(-9, 9), y: randomInt(-9, 9) };
      const eje = elegir(["x", "y"] as const);
      const valor = -(F1[eje] + F2[eje]);
      return num(M, "equilibrante", `Sobre un cuerpo actúan F₁ = (${F1.x}, ${F1.y}) N y F₂ = (${F2.x}, ${F2.y}) N. ¿Cuánto vale la componente en ${eje} de la fuerza que lo deja en equilibrio?`, valor, {
        diagrama: { tipo: "vectores", vectores: [{ nombre: "F₁", ...F1 }, { nombre: "F₂", ...F2 }] },
      });
    }
    case "escalar_prod": {
      const A = { x: randomInt(-6, 6), y: randomInt(-6, 6) };
      let B = { x: randomInt(-6, 6), y: randomInt(-6, 6) };
      if (elegir([true, false])) B = { x: -A.y * elegir([1, 2]), y: A.x * elegir([1, 2]) };
      const p = A.x * B.x + A.y * B.y;
      if (elegir([true, false])) return num(M, "producto_escalar", `¿Cuánto vale el producto escalar A · B con A = (${A.x}, ${A.y}) y B = (${B.x}, ${B.y})?`, p);
      return opc(M, "perpendiculares", `¿Son perpendiculares A = (${A.x}, ${A.y}) y B = (${B.x}, ${B.y})?`, p === 0 ? "Sí" : "No", [p === 0 ? "No" : "Sí"]);
    }
  }
}

// ============================================================
// 3) Leyes de Newton
// ============================================================

const LEYES = [
  { q: "Frenas de golpe el bus y tu cuerpo sigue hacia adelante. ¿Qué ley lo explica?", ok: "Primera ley (inercia)" },
  { q: "Una pelota rodando en el espacio sigue para siempre en línea recta. ¿Qué ley lo explica?", ok: "Primera ley (inercia)" },
  { q: "Sacudes un mantel rápido y los platos se quedan en la mesa. ¿Qué ley lo explica?", ok: "Primera ley (inercia)" },
  { q: "Con la misma fuerza, un carrito vacío acelera más que uno lleno. ¿Qué ley lo explica?", ok: "Segunda ley (F = m · a)" },
  { q: "Pateas más fuerte la pelota y sale con más aceleración. ¿Qué ley lo explica?", ok: "Segunda ley (F = m · a)" },
  { q: "Un cohete empuja gases hacia abajo y los gases lo empujan hacia arriba. ¿Qué ley lo explica?", ok: "Tercera ley (acción y reacción)" },
  { q: "Al remar empujas el agua hacia atrás y el bote avanza. ¿Qué ley lo explica?", ok: "Tercera ley (acción y reacción)" },
  { q: "Disparas un rifle y sientes el golpe en el hombro. ¿Qué ley lo explica?", ok: "Tercera ley (acción y reacción)" },
] as const;
const NOMBRES_LEYES = ["Primera ley (inercia)", "Segunda ley (F = m · a)", "Tercera ley (acción y reacción)", "Ley de gravitación universal"];

const FUERZAS = [
  { q: "Un libro quieto sobre una mesa. ¿Qué fuerzas actúan sobre él?", ok: "Peso y normal", no: ["Solo el peso", "Peso, normal y rozamiento", "Peso y tensión"] },
  { q: "Una lámpara cuelga quieta de un cable. ¿Qué fuerzas actúan sobre ella?", ok: "Peso y tensión", no: ["Solo el peso", "Peso y normal", "Tensión y rozamiento"] },
  { q: "Empujas una caja que se desliza por el piso. ¿Qué fuerzas actúan sobre ella?", ok: "Peso, normal, empuje y rozamiento", no: ["Peso y normal", "Empuje y rozamiento", "Peso, normal y empuje"] },
  { q: "Una pelota en el aire, después de lanzarla (sin contar el aire). ¿Qué fuerzas actúan sobre ella?", ok: "Solo el peso", no: ["Peso y la fuerza del lanzamiento", "Peso y normal", "Ninguna"] },
] as const;

function newton(nivel: number): ProblemaDinamia {
  const n = clamp(nivel, 1, 10);
  const M: ModoDinamia = "newton";
  const g = gDe(n);
  const tipo = elegirPonderado(
    [
      ["ley", 1],
      ["peso", 1],
      ["fma", 3],
      ["neta", 3],
      ["rozamiento", 5],
      ["fuerzas", 5],
      ["plano", 7],
      ["atwood", 7],
      ["bloques", 8],
      ["centripeta", 9],
      ["gravitacion", 9],
    ] as const,
    n
  );
  switch (tipo) {
    case "ley": {
      const l = elegir(LEYES);
      return cuatro(opc(M, "ley", l.q, l.ok, NOMBRES_LEYES.filter((x) => x !== l.ok)));
    }
    case "peso": {
      const m = randomInt(1, 100);
      if (elegir([true, false])) return num(M, "peso", `¿Cuánto pesa, en N, una persona de ${m} kg? ${textoG(g)}`, m * g);
      return num(M, "masa", `Una caja pesa ${f(m * g)} N. ¿Cuál es su masa, en kg? ${textoG(g)}`, m);
    }
    case "fma": {
      const m = randomInt(1, 20);
      const a = randomInt(1, 10);
      const que = elegir(["F", "a", "m"] as const);
      if (que === "F") return num(M, "fma_f", `¿Qué fuerza neta, en N, hace falta para acelerar ${m} kg a ${a} m/s²?`, m * a);
      if (que === "a") return num(M, "fma_a", `Una fuerza neta de ${m * a} N actúa sobre ${m} kg. ¿Qué aceleración produce, en m/s²?`, a);
      return num(M, "fma_m", `Una fuerza neta de ${m * a} N produce una aceleración de ${a} m/s². ¿Cuál es la masa, en kg?`, m);
    }
    case "neta": {
      const m = randomInt(2, 10);
      const a = randomInt(1, 6);
      const roz = randomInt(2, 30);
      return num(M, "neta", `Empujas una caja de ${m} kg con ${m * a + roz} N y el rozamiento la frena con ${roz} N. ¿Qué aceleración tiene, en m/s²?`, a);
    }
    case "rozamiento": {
      const m = randomInt(2, 20);
      const mu = elegir([0.1, 0.2, 0.25, 0.3, 0.4, 0.5]);
      const N = m * g;
      if (elegir([true, false])) return num(M, "roce", `Una caja de ${m} kg se desliza sobre el piso con μ = ${f(mu)}. ¿Cuánto vale la fuerza de rozamiento, en N? ${textoG(g)}`, mu * N);
      const a = randomInt(1, 5);
      const F = m * a + mu * N;
      return num(M, "roce_a", `Arrastras una caja de ${m} kg con ${f(F)} N sobre un piso con μ = ${f(mu)}. ¿Qué aceleración tiene, en m/s²? ${textoG(g)}`, a);
    }
    case "fuerzas":
      return preguntaBanco(M, "fuerzas", FUERZAS);
    case "plano": {
      const ang = elegir([30, 45, 60]);
      if (elegir([true, false]) || n < 8) return num(M, "plano", `Un bloque baja por una rampa sin rozamiento inclinada ${ang}° (${DATO_TRIG[ang]}). ¿Qué aceleración tiene, en m/s²? ${textoG(g)}`, g * SEN[ang]);
      const mu = elegir([0.1, 0.2, 0.3]);
      return num(M, "plano_roce", `Un bloque baja por una rampa de ${ang}° con μ = ${f(mu)} (${DATO_TRIG[ang]}). ¿Qué aceleración tiene, en m/s²? ${textoG(g)}`, g * (SEN[ang] - mu * COS[ang]));
    }
    case "atwood": {
      const m2 = randomInt(1, 6);
      const m1 = m2 + randomInt(1, 6);
      return num(M, "atwood", `Dos masas de ${m1} kg y ${m2} kg cuelgan de una polea, unidas por una cuerda. ¿Con qué aceleración se mueven, en m/s²? ${textoG(g)}`, ((m1 - m2) * g) / (m1 + m2));
    }
    case "bloques": {
      const m1 = randomInt(1, 8);
      const m2 = randomInt(1, 8);
      const a = randomInt(1, 5);
      const F = (m1 + m2) * a;
      if (elegir([true, false])) return num(M, "bloques_a", `Empujas con ${F} N dos bloques juntos de ${m1} kg y ${m2} kg sobre hielo (sin rozamiento). ¿Qué aceleración tienen, en m/s²?`, a);
      return num(M, "bloques_contacto", `Empujas con ${F} N dos bloques juntos de ${m1} kg (adelante, donde empujas) y ${m2} kg sobre hielo. ¿Con qué fuerza, en N, el primero empuja al segundo?`, m2 * a);
    }
    case "centripeta": {
      if (elegir([true, false])) {
        const m = randomInt(1, 10);
        const v = randomInt(2, 10);
        const r = elegir([1, 2, 4, 5]);
        return num(M, "centripeta", `Una piedra de ${m} kg gira atada a una cuerda de ${r} m a ${v} m/s. ¿Qué fuerza hacia el centro hace la cuerda, en N?`, (m * v * v) / r);
      }
      const v = randomInt(2, 10) * 2;
      const mu = elegir([0.4, 0.5, 0.8]);
      const r = (v * v) / (mu * 10);
      return num(M, "curva", `En una curva plana de ${f(r)} m de radio, el rozamiento con μ = ${f(mu)} sostiene al auto. ¿Cuál es la velocidad máxima sin derrapar, en m/s? Usa g = 10 m/s².`, v);
    }
    case "gravitacion": {
      const casos = [
        { q: "Si la distancia entre dos planetas se duplica, la fuerza de gravedad entre ellos…", ok: "Se divide entre 4" },
        { q: "Si la distancia entre dos cuerpos se reduce a la mitad, la fuerza de gravedad…", ok: "Se multiplica por 4" },
        { q: "Si se duplica la masa de uno de los dos cuerpos, la fuerza de gravedad…", ok: "Se duplica" },
        { q: "Si se duplican las dos masas, la fuerza de gravedad…", ok: "Se multiplica por 4" },
        { q: "Si la distancia se triplica, la fuerza de gravedad…", ok: "Se divide entre 9" },
      ];
      const c = elegir(casos);
      return cuatro(opc(M, "gravitacion", c.q, c.ok, ["Se duplica", "Se divide entre 4", "Se multiplica por 4", "Se divide entre 2", "Se divide entre 9", "No cambia"].filter((x) => x !== c.ok)));
    }
  }
}

// ============================================================
// 4) Trabajo y energía
// ============================================================

const TIPOS_ENERGIA = [
  { q: "Un auto andando por la ruta tiene sobre todo energía…", ok: "Cinética" },
  { q: "Un libro arriba de un estante tiene energía…", ok: "Potencial gravitatoria" },
  { q: "Un resorte apretado guarda energía…", ok: "Potencial elástica" },
  { q: "Una pila guarda energía…", ok: "Química" },
  { q: "El agua caliente de una tetera tiene más energía…", ok: "Térmica" },
] as const;
const NOMBRES_ENERGIA = ["Cinética", "Potencial gravitatoria", "Potencial elástica", "Química", "Térmica", "Nuclear"];

function energia(nivel: number): ProblemaDinamia {
  const n = clamp(nivel, 1, 10);
  const M: ModoDinamia = "energia";
  const g = gDe(n);
  const tipo = elegirPonderado(
    [
      ["tipo", 1],
      ["ec", 1],
      ["ep", 2],
      ["trabajo", 3],
      ["potencia", 4],
      ["kwh", 4],
      ["caida", 5],
      ["sube", 6],
      ["perdida", 7],
      ["rendimiento", 7],
      ["resorte", 9],
      ["choque", 9],
    ] as const,
    n
  );
  switch (tipo) {
    case "tipo": {
      const t = elegir(TIPOS_ENERGIA);
      return cuatro(opc(M, "tipo_energia", t.q, t.ok, NOMBRES_ENERGIA.filter((x) => x !== t.ok)));
    }
    case "ec": {
      const m = randomInt(1, 10) * 2;
      const v = randomInt(1, 12);
      return num(M, "ec", `¿Cuánta energía cinética, en J, tiene una bici con su ciclista (${m} kg) a ${v} m/s?`, 0.5 * m * v * v);
    }
    case "ep": {
      const m = randomInt(1, 20);
      const h = randomInt(1, 30);
      return num(M, "ep", `Subes una caja de ${m} kg a ${h} m de altura. ¿Cuánta energía potencial gana, en J? ${textoG(g)}`, m * g * h);
    }
    case "trabajo": {
      const F = randomInt(1, 20) * 10;
      const d = randomInt(1, 20);
      const ang = elegir([0, 60, 90, 180]);
      const factor = { 0: 1, 60: 0.5, 90: 0, 180: -1 }[ang]!;
      return num(M, "trabajo", `Una fuerza de ${F} N mueve un objeto ${d} m y forma ${ang}° con el movimiento (cos ${ang}° = ${f(factor)}). ¿Cuánto trabajo hace, en J?`, F * d * factor);
    }
    case "potencia": {
      const P = randomInt(1, 30) * 10;
      const t = randomInt(2, 20);
      return num(M, "potencia", `Un motor hace ${P * t} J de trabajo en ${t} s. ¿Qué potencia tiene, en W?`, P);
    }
    case "kwh": {
      const k = randomInt(1, 9);
      if (elegir([true, false])) return num(M, "kwh_mj", `Una estufa gasta ${k} kWh. ¿Cuántos megajulios (MJ) son? (1 kWh = 3,6 MJ)`, k * 3.6);
      const P = randomInt(1, 20) * 100;
      const h = randomInt(1, 10);
      return num(M, "kwh", `Un aparato de ${P} W está prendido ${h} horas. ¿Cuántos kWh consume?`, (P * h) / 1000);
    }
    case "caida": {
      const [h, v] = elegir([[5, 10], [20, 20], [45, 30], [1.8, 6], [3.2, 8], [80, 40]] as const);
      return num(M, "conservacion_v", `Un niño baja por un tobogán de ${f(h)} m de altura sin rozamiento, partiendo del reposo. ¿Con qué velocidad llega abajo, en m/s? Usa g = 10 m/s².`, v);
    }
    case "sube": {
      const v = randomInt(2, 20);
      return num(M, "conservacion_h", `Una patineta sube una rampa a ${v} m/s, sin rozamiento. ¿Hasta qué altura llega, en metros? Usa g = 10 m/s².`, (v * v) / 20);
    }
    case "perdida": {
      const m = randomInt(1, 10) * 2;
      const h = randomInt(2, 20);
      const v = randomInt(1, Math.floor(Math.sqrt(2 * g * h)) - 1);
      return num(M, "perdida", `Un trineo de ${m} kg baja una colina de ${h} m partiendo del reposo y llega abajo a ${v} m/s. ¿Cuánta energía se convirtió en calor por el rozamiento, en J? ${textoG(g)}`, m * g * h - 0.5 * m * v * v);
    }
    case "rendimiento": {
      const entra = randomInt(2, 20) * 100;
      const pct = elegir([20, 25, 30, 40, 50, 60, 75, 80, 90]);
      return num(M, "rendimiento", `Un motor recibe ${entra} J y entrega ${(entra * pct) / 100} J de trabajo útil. ¿Cuál es su rendimiento, en %?`, pct);
    }
    case "resorte": {
      const k = randomInt(1, 20) * 50;
      const x = elegir([0.1, 0.2, 0.3, 0.4, 0.5]);
      if (elegir([true, false])) return num(M, "hooke", `Un resorte de constante k = ${k} N/m se estira ${f(x)} m. ¿Con qué fuerza tira, en N?`, k * x);
      return num(M, "ep_elastica", `Un resorte de k = ${k} N/m se comprime ${f(x)} m. ¿Cuánta energía guarda, en J?`, 0.5 * k * x * x);
    }
    case "choque": {
      const m1 = randomInt(1, 6);
      const m2 = randomInt(1, 6);
      const v1 = randomInt(2, 10);
      const v2 = elegir([0, 0, -randomInt(1, 5)]);
      const vf = (m1 * v1 + m2 * v2) / (m1 + m2);
      if (elegir([true, false])) return num(M, "choque_plastico", `Un carrito de ${m1} kg a ${v1} m/s choca contra otro de ${m2} kg que va a ${v2} m/s (en sentido contrario si es negativo) y quedan pegados. ¿A qué velocidad siguen, en m/s?`, vf);
      const F = randomInt(1, 20) * 10;
      const t = elegir([0.1, 0.2, 0.5]);
      return num(M, "impulso", `Pateas una pelota con ${F} N durante ${f(t)} s. ¿Qué impulso le das, en N·s?`, F * t);
    }
  }
}

// ============================================================
// 5) Termodinámica
// ============================================================

const SUSTANCIAS = [
  { nombre: "agua", c: 4200 },
  { nombre: "aluminio", c: 900 },
  { nombre: "hierro", c: 450 },
  { nombre: "cobre", c: 390 },
] as const;

const CONCEPTOS_TERMO = [
  { q: "¿Qué mide un termómetro?", ok: "La temperatura", no: ["El calor", "La energía total", "La presión"] },
  { q: "Pones una cuchara fría en sopa caliente. ¿Hacia dónde pasa el calor?", ok: "De la sopa a la cuchara", no: ["De la cuchara a la sopa", "No pasa calor", "En los dos sentidos por igual"] },
  { q: "Mientras el hielo se derrite a 0 °C, su temperatura…", ok: "Se queda igual", no: ["Sube", "Baja", "Sube y baja"] },
  { q: "¿Cuál es la temperatura más baja posible?", ok: "0 K (−273 °C)", no: ["0 °C", "−100 °C", "No hay límite"] },
  { q: "Un gas se calienta en un recipiente rígido. Su presión…", ok: "Aumenta", no: ["Disminuye", "No cambia", "Se vuelve cero"] },
] as const;

function termo(nivel: number): ProblemaDinamia {
  const n = clamp(nivel, 1, 10);
  const M: ModoDinamia = "termo";
  const tipo = elegirPonderado(
    [
      ["kelvin", 1],
      ["fahrenheit", 1],
      ["concepto", 2],
      ["calor", 3],
      ["mezcla", 4],
      ["latente", 5],
      ["dilatacion", 7],
      ["boyle", 7],
      ["charles", 8],
      ["ideal", 8],
      ["primera", 9],
      ["maquina", 9],
    ] as const,
    n
  );
  switch (tipo) {
    case "kelvin": {
      const c = randomInt(-50, 120);
      if (elegir([true, false])) return num(M, "c_k", `El agua de una olla está a ${c} °C. ¿Cuántos kelvin son? (Suma 273.)`, c + 273);
      return num(M, "k_c", `Un gas está a ${c + 273} K. ¿Cuántos grados Celsius son? (Resta 273.)`, c);
    }
    case "fahrenheit": {
      const c = randomInt(-8, 20) * 5;
      if (elegir([true, false])) return num(M, "c_f", `Hace ${c} °C. ¿Cuántos °F son? (°F = °C · 9/5 + 32)`, (c * 9) / 5 + 32);
      return num(M, "f_c", `El termómetro marca ${(c * 9) / 5 + 32} °F. ¿Cuántos °C son? (°C = (°F − 32) · 5/9)`, c);
    }
    case "concepto":
      return preguntaBanco(M, "concepto", CONCEPTOS_TERMO);
    case "calor": {
      const s = elegir(SUSTANCIAS);
      const m = elegir([0.5, 1, 2, 3, 4, 5]);
      const dT = randomInt(1, 8) * 10;
      return num(M, "calor", `¿Cuántos kJ hacen falta para calentar ${f(m)} kg de ${s.nombre} ${dT} °C? (c = ${s.c} J/(kg·°C); 1 kJ = 1000 J)`, (m * s.c * dT) / 1000);
    }
    case "mezcla": {
      const m1 = randomInt(1, 5);
      const m2 = randomInt(1, 5);
      const T1 = randomInt(1, 9) * 10;
      const T2 = randomInt(1, 9) * 10;
      if (T1 === T2) return termo(n);
      return num(M, "mezcla", `Mezclas ${m1} kg de agua a ${T1} °C con ${m2} kg de agua a ${T2} °C. ¿A qué temperatura queda la mezcla, en °C? (Sin pérdidas.)`, (m1 * T1 + m2 * T2) / (m1 + m2));
    }
    case "latente": {
      const m = elegir([0.5, 1, 2, 3, 4]);
      if (elegir([true, false])) return num(M, "fusion", `¿Cuántos kJ hacen falta para derretir ${f(m)} kg de hielo a 0 °C? (Calor latente de fusión = 334 kJ/kg)`, m * 334);
      return num(M, "vaporizacion", `¿Cuántos kJ hacen falta para evaporar ${f(m)} kg de agua a 100 °C? (Calor latente de vaporización = 2260 kJ/kg)`, m * 2260);
    }
    case "dilatacion": {
      const L = randomInt(1, 10) * 10;
      const dT = randomInt(1, 5) * 10;
      return num(M, "dilatacion", `Un riel de acero de ${L} m se calienta ${dT} °C. ¿Cuántos milímetros se alarga? (α = 0,000012 por °C; ΔL = α · L · ΔT; 1 m = 1000 mm)`, 0.000012 * L * dT * 1000);
    }
    case "boyle": {
      const P1 = randomInt(1, 4);
      const V1 = randomInt(2, 12) * 2;
      const k = elegir([2, 4]);
      if (elegir([true, false])) return num(M, "boyle", `Un gas ocupa ${V1} L a ${P1} atm. Si la temperatura no cambia y la presión sube a ${P1 * k} atm, ¿qué volumen ocupa, en L?`, V1 / k);
      return num(M, "boyle_p", `Un gas ocupa ${V1} L a ${P1} atm. Si la temperatura no cambia y se expande a ${V1 * k} L, ¿qué presión tiene, en atm?`, P1 / k);
    }
    case "charles": {
      const T1c = elegir([27, 0, 77, 127]);
      const T1 = T1c + 273;
      const T2 = T1 * elegir([2, 1.5]);
      const V1 = randomInt(1, 10) * 2;
      return num(M, "charles", `Un globo tiene ${V1} L a ${T1c} °C. Si la presión no cambia y se calienta hasta ${f(T2 - 273)} °C, ¿qué volumen tiene, en L? (Usa kelvin: K = °C + 273.)`, (V1 * T2) / T1);
    }
    case "ideal": {
      const nmol = randomInt(1, 5);
      const T = elegir([273, 300, 400]);
      const V = randomInt(2, 20) * 2;
      return num(M, "gas_ideal", `${nmol} mol de un gas ideal están a ${T} K en un recipiente de ${V} L. ¿Qué presión tienen, en atm? (P · V = n · R · T con R = 0,082 atm·L/(mol·K))`, (nmol * 0.082 * T) / V);
    }
    case "primera": {
      const Q = randomInt(1, 20) * 100;
      const W = randomInt(-5, 15) * 100;
      return num(M, "primera_ley", `Un gas recibe ${Q} J de calor y hace ${W} J de trabajo sobre el exterior (si es negativo, recibe trabajo). ¿Cuánto cambia su energía interna, en J? (ΔU = Q − W)`, Q - W);
    }
    case "maquina": {
      if (elegir([true, false])) {
        const Qc = randomInt(2, 20) * 100;
        const pct = elegir([10, 20, 25, 30, 40]);
        return num(M, "rendimiento_termico", `Una máquina térmica toma ${Qc} J del foco caliente y hace ${(Qc * pct) / 100} J de trabajo. ¿Cuál es su rendimiento, en %?`, pct);
      }
      const [Tc, Tf] = elegir([[600, 300], [500, 300], [400, 300], [800, 200], [1000, 250]] as const);
      return num(M, "carnot", `¿Cuál es el rendimiento máximo (de Carnot), en %, de una máquina que trabaja entre ${Tc} K y ${Tf} K? (η = 1 − Tfría / Tcaliente)`, (1 - Tf / Tc) * 100);
    }
  }
}

// ============================================================
// 6) Fluidos
// ============================================================

const MATERIALES = [
  { nombre: "un bloque de madera de pino", rho: 500 },
  { nombre: "un trozo de corcho", rho: 240 },
  { nombre: "un cubo de hielo", rho: 920 },
  { nombre: "una tuerca de hierro", rho: 7870 },
  { nombre: "una lata de aluminio maciza", rho: 2700 },
  { nombre: "una piedra de granito", rho: 2750 },
  { nombre: "una vela de parafina", rho: 900 },
] as const;
const LIQUIDOS = [
  { nombre: "agua", rho: 1000 },
  { nombre: "agua de mar", rho: 1030 },
  { nombre: "aceite", rho: 920 },
  { nombre: "alcohol", rho: 790 },
  { nombre: "mercurio", rho: 13600 },
] as const;

function fluidos(nivel: number): ProblemaDinamia {
  const n = clamp(nivel, 1, 10);
  const M: ModoDinamia = "fluidos";
  const tipo = elegirPonderado(
    [
      ["densidad", 1],
      ["flota", 1],
      ["presion", 3],
      ["hidrostatica", 3],
      ["prensa", 5],
      ["absoluta", 6],
      ["empuje", 7],
      ["aparente", 7],
      ["sumergida", 8],
      ["continuidad", 9],
      ["torricelli", 9],
      ["bernoulli", 9],
    ] as const,
    n
  );
  switch (tipo) {
    case "densidad": {
      const V = elegir([0.5, 1, 2, 4, 5]);
      const rho = elegir([500, 800, 1000, 2700, 7800]);
      return num(M, "densidad", `Un objeto de ${f(V * rho)} kg ocupa ${f(V)} m³. ¿Cuál es su densidad, en kg/m³?`, rho);
    }
    case "flota": {
      const o = elegir(MATERIALES);
      const l = elegir(LIQUIDOS.filter((x) => Math.abs(x.rho - o.rho) > 30));
      return opc(M, "flota", `Pones ${o.nombre} (${o.rho} kg/m³) en ${l.nombre} (${l.rho} kg/m³). ¿Qué pasa?`, o.rho < l.rho ? "Flota" : "Se hunde", [o.rho < l.rho ? "Se hunde" : "Flota"]);
    }
    case "presion": {
      const A = elegir([0.01, 0.02, 0.05, 0.1, 0.5, 2]);
      const P = randomInt(1, 20) * 100;
      return num(M, "presion", `Una caja apoya ${f(P * A)} N sobre ${f(A)} m². ¿Qué presión hace, en Pa (N/m²)?`, P);
    }
    case "hidrostatica": {
      const h = randomInt(1, 40);
      return num(M, "hidrostatica", `¿Cuánta presión hace el agua a ${h} m de profundidad, en kPa? (ρ = 1000 kg/m³; P = ρ · g · h; usa g = 10 m/s²; 1 kPa = 1000 Pa)`, h * 10);
    }
    case "prensa": {
      const A1 = elegir([0.01, 0.02, 0.05]);
      const k = elegir([5, 10, 20, 50]);
      const F1 = randomInt(1, 20) * 10;
      return num(M, "prensa", `En una prensa hidráulica empujas con ${F1} N el pistón chico de ${f(A1)} m². El grande mide ${f(A1 * k)} m². ¿Qué fuerza hace el grande, en N?`, F1 * k);
    }
    case "absoluta": {
      const h = randomInt(1, 30);
      return num(M, "absoluta", `Buceas a ${h} m de profundidad en agua dulce. ¿Cuál es la presión absoluta, en kPa? (Atmosférica = 101 kPa; el agua suma 10 kPa por metro.)`, 101 + 10 * h);
    }
    case "empuje": {
      const V = elegir([0.001, 0.002, 0.005, 0.01, 0.02]);
      const l = elegir(LIQUIDOS.filter((x) => x.rho < 2000));
      return num(M, "empuje", `Un objeto de ${f(V * 1000)} L (${f(V, 3)} m³) está totalmente sumergido en ${l.nombre} (${l.rho} kg/m³). ¿Qué empuje recibe, en N? (E = ρ · g · V; usa g = 10 m/s²)`, l.rho * 10 * V);
    }
    case "aparente": {
      const V = elegir([0.001, 0.002, 0.005]);
      const rho = elegir([2700, 7800, 8900]);
      const P = rho * 10 * V;
      return num(M, "peso_aparente", `Una pieza metálica pesa ${f(P)} N en el aire y ocupa ${f(V * 1000)} L. ¿Cuánto pesa sumergida en agua, en N? (El agua empuja 10 N por cada litro sumergido.)`, P - 10 * V * 1000);
    }
    case "sumergida": {
      const o = elegir(MATERIALES.filter((x) => x.rho < 1000));
      return num(M, "sumergida", `${o.nombre[0].toUpperCase()}${o.nombre.slice(1)} (${o.rho} kg/m³) flota en agua (1000 kg/m³). ¿Qué porcentaje de su volumen queda bajo el agua?`, (o.rho / 1000) * 100);
    }
    case "continuidad": {
      const v1 = randomInt(1, 6);
      const k = elegir([2, 3, 4]);
      if (elegir([true, false])) return num(M, "continuidad", `El agua va a ${v1} m/s por un caño. Más adelante el caño se angosta a 1/${k} del área. ¿A qué velocidad va ahí, en m/s?`, v1 * k);
      const A = elegir([0.01, 0.02, 0.05]);
      return num(M, "caudal", `Por un caño de ${f(A)} m² el agua va a ${v1} m/s. ¿Qué caudal lleva, en litros por segundo? (Q = A · v; 1 m³ = 1000 L)`, A * v1 * 1000);
    }
    case "torricelli": {
      const [h, v] = elegir([[5, 10], [1.8, 6], [3.2, 8], [0.8, 4], [20, 20], [0.2, 2]] as const);
      return num(M, "torricelli", `Un tanque abierto tiene un agujero ${f(h)} m por debajo de la superficie del agua. ¿A qué velocidad sale el chorro, en m/s? (v = √(2 · g · h); usa g = 10 m/s²)`, v);
    }
    case "bernoulli":
      return preguntaBanco(M, "bernoulli", [
        { q: "El agua pasa por un caño que se angosta. ¿Dónde es menor la presión?", ok: "En la parte angosta", no: ["En la parte ancha", "Es igual en todo el caño", "Depende del color del agua"] },
        { q: "Soplas entre dos hojas de papel que cuelgan juntas. ¿Qué pasa?", ok: "Se juntan", no: ["Se separan", "No se mueven", "Caen al piso"] },
        { q: "¿Por qué el aire empuja hacia arriba el ala de un avión?", ok: "Arriba del ala el aire va más rápido y la presión es menor", no: ["Arriba del ala la presión es mayor", "El ala es más liviana que el aire", "El motor empuja el ala hacia arriba"] },
      ]);
  }
}

// ============================================================

export function generarProblemaDinamia(modo: ModoDinamia, nivel: number): ProblemaDinamia {
  if (modo === "cinematica") return cinematica(nivel);
  if (modo === "vectores") return vectores(nivel);
  if (modo === "newton") return newton(nivel);
  if (modo === "energia") return energia(nivel);
  if (modo === "termo") return termo(nivel);
  return fluidos(nivel);
}

export function claveDinamia(p: ProblemaDinamia): string {
  return `${p.enunciado}|${p.respuesta}|${p.diagrama ? JSON.stringify(p.diagrama) : ""}`;
}

// ---------- Reto diario (opción múltiple, sin dibujos) ----------

export interface PreguntaDinamiaReto {
  mundo: "dinamia";
  enunciado: string;
  opciones: string[];
  respuesta: string;
}

function opcionesNumericas(r: number): string[] {
  const paso = Number.isInteger(r) ? Math.max(1, Math.round(Math.abs(r) * 0.2)) : Math.max(0.1, Math.round(Math.abs(r) * 2) / 10);
  const vistos = new Set([f(r, 1)]);
  const otras: string[] = [];
  for (const k of mezclar([-3, -2, -1, 1, 2, 3])) {
    const v = r + k * paso;
    if (r >= 0 && v < 0) continue;
    const s = f(v, 1);
    if (vistos.has(s)) continue;
    vistos.add(s);
    otras.push(s);
    if (otras.length === 3) break;
  }
  return mezclar([f(r, 1), ...otras]);
}

export function preguntaDinamia(rng: () => number): PreguntaDinamiaReto {
  return conRngSembrado(rng, () => {
    let p = generarProblemaDinamia(elegir(["cinematica", "vectores", "newton", "energia", "termo", "fluidos"] as const), randomInt(2, 7));
    while (p.diagrama) p = generarProblemaDinamia(elegir(["newton", "energia", "termo", "fluidos"] as const), randomInt(2, 7));
    if (p.entrada === "opciones") return { mundo: "dinamia" as const, enunciado: p.enunciado, opciones: p.opciones, respuesta: p.respuesta };
    return { mundo: "dinamia" as const, enunciado: p.enunciado.replace(" Redondea a 1 decimal.", ""), opciones: opcionesNumericas(p.respuesta), respuesta: f(p.respuesta, 1) };
  });
}
